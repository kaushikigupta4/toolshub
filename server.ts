import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { PDFDocument } from 'pdf-lib';
import { 
  PDFServices, 
  ServicePrincipalCredentials, 
  SDKError, 
  ServiceApiError, 
  ServiceUsageError 
} from '@adobe/pdfservices-node-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Multer setup for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  // Lazy Adobe Client Initialization
  let pdfServices: PDFServices | null = null;

  function getAdobeClient() {
    if (!pdfServices) {
      const clientId = process.env.ADOBE_CLIENT_ID;
      const clientSecret = process.env.ADOBE_CLIENT_SECRET;

      console.log('[Adobe] Initializing Adobe Client...');
      if (!clientId || !clientSecret) {
        throw new Error('Adobe PDF Services credentials are not configured in environment variables.');
      }

      const credentials = new ServicePrincipalCredentials({
        clientId,
        clientSecret,
      });

      pdfServices = new PDFServices({ credentials });
    }
    return pdfServices;
  }

  // Create input asset helper
  async function createInputAsset(client: any, file: Express.Multer.File) {
    if (!file.buffer || file.buffer.length === 0) {
      throw new Error(`File buffer is empty for ${file.originalname}`);
    }

    const inputStream = Readable.from(file.buffer);
    
    let mimeType = 'application/pdf';
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';

    console.log(`[Adobe] Uploading asset: ${file.originalname} (Mime: ${mimeType}, Size: ${file.buffer.length} bytes)`);

    return await client.upload({
      readStream: inputStream,
      mimeType,
    });
  }

  // Polling helper
  async function pollJobCompletion(client: any, pollingURL: string) {
    let status = 'in-progress';
    let retryInterval = 1;

    while (status === 'in-progress') {
      const statusResponse = await client.getJobStatus({ pollingURL });
      status = statusResponse.status;
      retryInterval = statusResponse.retryInterval || 1;

      if (status === 'in-progress') {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, retryInterval * 1000));
      }
    }
    console.log(`\n[Adobe] Job finished with status: ${status}`);

    if (status === 'failed') {
      throw new Error('Adobe PDF Services job failed.');
    }

    return status;
  }

  // API Routes
  app.post('/api/split', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const ranges = req.body.ranges; // e.g., "1-3, 5, 7-9"

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!ranges) {
        return res.status(400).json({ error: 'Page ranges required' });
      }

      console.log(`[pdf-lib] Splitting PDF: ${file.originalname} with ranges: ${ranges}`);
      const pdfDoc = await PDFDocument.load(file.buffer);
      const newPdf = await PDFDocument.create();
      const totalPages = pdfDoc.getPageCount();

      const pageIndices: number[] = [];
      const parts = ranges.split(',').map((s: string) => s.trim());
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map((n: string) => parseInt(n));
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) {
              pageIndices.push(i - 1);
            }
          }
        } else {
          const pageNum = parseInt(part);
          if (pageNum >= 1 && pageNum <= totalPages) {
            pageIndices.push(pageNum - 1);
          }
        }
      }

      const uniqueIndices = Array.from(new Set(pageIndices)).sort((a, b) => a - b);

      if (uniqueIndices.length === 0) {
        return res.status(400).json({ error: 'No valid pages selected' });
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, uniqueIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="split_${encodeURIComponent(file.originalname)}"`);
      res.send(Buffer.from(pdfBytes));
      console.log('[pdf-lib] Split success');

    } catch (error: any) {
      console.error('[pdf-lib] Split error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/process', upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const tool = (req.body.tool || 'convert').trim();
      
      if (!files || files.length === 0) {
        console.error('[Adobe] No files uploaded.');
        return res.status(400).json({ error: 'No files uploaded' });
      }

      console.log(`[Adobe] Received ${files.length} file(s). Tool: "${tool}"`);
      files.forEach((f, i) => console.log(`[Adobe] File ${i}: ${f.originalname} (${f.size} bytes)`));

      const {
        CreatePDFJob,
        CreatePDFResult,
        ExportPDFJob,
        ExportPDFResult,
        CombinePDFJob,
        CombinePDFResult,
        CombinePDFParams,
        SplitPDFJob,
        SplitPDFResult,
        SplitPDFParams,
        CompressPDFJob,
        CompressPDFResult,
        CompressPDFParams,
        CompressionLevel,
        ExportPDFTargetFormat,
        ExportPDFParams,
        ExportPDFToImagesJob,
        ExportPDFToImagesResult,
        ExportPDFToImagesParams,
        ExportPDFToImagesTargetFormat,
        ExportPDFToImagesOutputType,
      } = await import('@adobe/pdfservices-node-sdk');

      const client = getAdobeClient();
      let resultAsset;
      let outputMimeType: string = 'application/pdf';
      let outputFileName: string = 'result.pdf';

      console.log(`[Adobe] Executing tool: ${tool} with ${files.length} files`);

      if (tool === 'merge') {
        const inputAssets = await Promise.all(files.map(file => createInputAsset(client, file)));
        const params = new CombinePDFParams();
        inputAssets.forEach(asset => params.addAsset(asset));
        const job = new CombinePDFJob({ params });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: CombinePDFResult });
        resultAsset = response.result?.asset;
        outputFileName = 'merged.pdf';
        outputMimeType = 'application/pdf';
      } 
      else if (tool === 'split') {
        const inputAsset = await createInputAsset(client, files[0]);
        const params = new SplitPDFParams({ pageCount: 1 });
        const job = new SplitPDFJob({ inputAsset, params });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: SplitPDFResult });
        resultAsset = response.result?.assets?.[0];
        outputFileName = files[0].originalname.replace(/\.pdf$/i, '_part1.pdf');
        outputMimeType = 'application/pdf';
      }
      else if (tool === 'compress') {
        const inputAsset = await createInputAsset(client, files[0]);
        const requestedLevel = req.body.compressionLevel || 'MEDIUM';
        const compressionLevel = CompressionLevel[requestedLevel as keyof typeof CompressionLevel] || CompressionLevel.MEDIUM;
        
        console.log(`[Adobe] Compressing PDF with level: ${requestedLevel}`);
        const params = new CompressPDFParams({ compressionLevel });
        const job = new CompressPDFJob({ inputAsset, params });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: CompressPDFResult });
        resultAsset = response.result?.asset;
        outputFileName = files[0].originalname.replace(/\.pdf$/i, '_compressed.pdf');
        outputMimeType = 'application/pdf';
      }
      else if (tool === 'pdfToWord') {
        const inputAsset = await createInputAsset(client, files[0]);
        const params = new ExportPDFParams({ targetFormat: ExportPDFTargetFormat.DOCX });
        const job = new ExportPDFJob({ inputAsset, params });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: ExportPDFResult });
        resultAsset = response.result?.asset;
        outputMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        outputFileName = files[0].originalname.replace(/\.pdf$/i, '.docx');
      }
      else if (tool === 'pdfToExcel') {
        const inputAsset = await createInputAsset(client, files[0]);
        const params = new ExportPDFParams({ targetFormat: ExportPDFTargetFormat.XLSX });
        const job = new ExportPDFJob({ inputAsset, params });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: ExportPDFResult });
        resultAsset = response.result?.asset;
        outputMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        outputFileName = files[0].originalname.replace(/\.pdf$/i, '.xlsx');
      }
      else if (tool === 'wordToPdf') {
        const inputAsset = await createInputAsset(client, files[0]);
        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: CreatePDFResult });
        resultAsset = response.result?.asset;
        outputFileName = files[0].originalname.replace(/\.docx$/i, '.pdf');
        outputMimeType = 'application/pdf';
      }
      else if (tool === 'jpgToPdf') {
        const inputAsset = await createInputAsset(client, files[0]);
        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: CreatePDFResult });
        resultAsset = response.result?.asset;
        outputFileName = files[0].originalname.replace(/\.(jpg|jpeg|png)$/i, '.pdf');
        outputMimeType = 'application/pdf';
      }
      else if (tool === 'pdfToImg') {
        const inputAsset = await createInputAsset(client, files[0]);
        const params = new ExportPDFToImagesParams({ 
          targetFormat: ExportPDFToImagesTargetFormat.JPEG,
          outputType: ExportPDFToImagesOutputType.LIST_OF_PAGE_IMAGES
        });
        const job = new ExportPDFToImagesJob({ inputAsset, params });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: ExportPDFToImagesResult });
        resultAsset = response.result?.assets?.[0];
        outputMimeType = 'image/jpeg';
        outputFileName = files[0].originalname.replace(/\.pdf$/i, '.jpg');
      }
      else {
        // Default conversion
        const inputAsset = await createInputAsset(client, files[0]);
        const job = new CreatePDFJob({ inputAsset });
        const pollingURL = await client.submit({ job });
        await pollJobCompletion(client, pollingURL);
        const response = await client.getJobResult({ pollingURL, resultType: CreatePDFResult });
        resultAsset = response.result?.asset;
        outputFileName = files[0].originalname.replace(/\.[a-z0-9]+$/i, '.pdf');
        outputMimeType = 'application/pdf';
      }

      if (!resultAsset) {
        throw new Error('Processing failed: No result asset returned.');
      }

      console.log('[Adobe] Job succeeded. Downloading result...');
      const resultStream = await client.getContent({ asset: resultAsset });

      res.setHeader('Content-Type', outputMimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outputFileName)}"`);

      // Use pipeline to safely stream the response
      await pipeline(
        resultStream.readStream,
        res
      );

      console.log('[Adobe] Success: File sent to client.');

    } catch (error: any) {
      console.error('[Adobe] Processing error:', error);
      
      if (res.headersSent) {
        console.error('[Adobe] Headers already sent. Ending response.');
        return res.end();
      }

      let message = error.message || 'An error occurred during processing.';
      let statusCode = 500;

      // Handle specific Adobe Service Errors
      if (error instanceof ServiceApiError) {
        statusCode = 400;
        // Check for specific error codes like PDF_ALREADY_COMPRESSED
        const errorCode = (error as any)._errorCode || (error as any).errorCode;
        if (errorCode === 'PDF_ALREADY_COMPRESSED') {
          message = 'This PDF is already highly optimized and cannot be compressed any further.';
        }
      } else if (error instanceof SDKError || error instanceof ServiceUsageError) {
        statusCode = 400;
      }

      res.status(statusCode).json({ error: message });
    }
  });

  // Old endpoint mapping
  app.post('/api/convert', upload.single('file'), async (req, res) => {
    req.files = req.file ? [req.file] : [];
    return app._router.handle(req, res, () => {});
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      adobeConfigured: !!(process.env.ADOBE_CLIENT_ID && process.env.ADOBE_CLIENT_SECRET) 
    });
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Global] Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite
if (process.env.NODE_ENV !== 'production') {
  const { default: react } = await import('@vitejs/plugin-react');
  const { default: tailwindcss } = await import('@tailwindcss/vite');

  const vite = await createViteServer({
    configFile: false,   // ← never touch vite.config.ts
    root: process.cwd(),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    },
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);

} else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
