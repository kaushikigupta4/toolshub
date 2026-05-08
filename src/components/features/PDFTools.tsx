import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { AlertCircle, Download, CheckCircle2, Loader2, X } from 'lucide-react';
import { Tool } from '../../config/tools';
import UploadBox from '../common/UploadBox';
import ConvertButtons from '../common/ConvertButtons';
import Preview from '../tools/Preview';

interface PDFToolsProps {
  tool: Tool;
  adobeConfigured: boolean | null;
}

export default function PDFTools({ tool, adobeConfigured }: PDFToolsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('result.pdf');
  const [pageRanges, setPageRanges] = useState('');
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [watermarkText, setWatermarkText] = useState('DRAFT');
  const [pageNumberFormat, setPageNumberFormat] = useState('Page {n} of {t}');
  const [compressionLevel, setCompressionLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  useEffect(() => {
    setFiles([]);
    setIsSuccess(false);
    setError(null);
    setDownloadUrl(null);
    setTotalPages(null);
  }, [tool.id]);

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (tool.id === 'merge') {
      setFiles(prev => [...prev, ...selectedFiles]);
    } else {
      setFiles(selectedFiles);
      
      const selectedFile = selectedFiles[0];
      if (tool.id === 'split' && selectedFile) {
        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const count = pdfDoc.getPageCount();
          setTotalPages(count);
          setPageRanges(`1-${count}`);
        } catch (e) {
          setError('Failed to read PDF. Ensure it is valid and unencrypted.');
          setFiles([]);
          return;
        }
      }
    }
  };

  const handleClear = (index: number) => {
    if (index === -1) setFiles([]);
    else if (tool.id === 'merge') setFiles(prev => prev.filter((_, i) => i !== index));
    else setFiles([]);
    
    setTotalPages(null);
    setPageRanges('');
    setError(null);
    setIsSuccess(false);
    setDownloadUrl(null);
  };

  const handleReset = () => {
    handleClear(-1);
    setWatermarkText('DRAFT');
    setPageNumberFormat('Page {n} of {t}');
    setCompressionLevel('MEDIUM');
  };

  const processClientSide = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setError(null);

    try {
      if (tool.id === 'pdfWatermark') {
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const diagonal = Math.sqrt(width ** 2 + height ** 2);
          const angleRad = Math.atan2(height, width);
          const angleDeg = angleRad * (180 / Math.PI);
          const textWidthAtSize1 = font.widthOfTextAtSize(watermarkText, 1);
          const fontSize = (diagonal * 0.75) / textWidthAtSize1;
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = font.heightAtSize(fontSize);
          const x = (width / 2) - (0.5 * (textWidth * Math.cos(angleRad) - textHeight * Math.sin(angleRad)));
          const y = (height / 2) - (0.5 * (textWidth * Math.sin(angleRad) + textHeight * Math.cos(angleRad)));

          page.drawText(watermarkText, {
            x, y, size: fontSize, font, color: rgb(0.7, 0.7, 0.7), opacity: 0.3, rotate: degrees(angleDeg),
          });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setResultFileName(`watermarked_${file.name}`);
        setIsSuccess(true);
      } else if (tool.id === 'pdfPageNumbers') {
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const total = pages.length;

        pages.forEach((page, i) => {
          const { width } = page.getSize();
          const text = pageNumberFormat.replace('{n}', (i + 1).toString()).replace('{t}', total.toString());
          const textWidth = font.widthOfTextAtSize(text, 10);
          page.drawText(text, {
            x: width / 2 - textWidth / 2, y: 25, size: 10, font, color: rgb(0, 0, 0),
          });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setResultFileName(`numbered_${file.name}`);
        setIsSuccess(true);
      } else if (tool.id === 'excelToPdf') {
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let page = pdfDoc.addPage();
        let { width, height } = page.getSize();
        let y = height - 50;

        data.forEach((row, rowIndex) => {
          if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
          }
          let x = 50;
          row.forEach((cell, cellIndex) => {
            if (cell !== undefined && cell !== null) {
              const text = String(cell);
              page.drawText(text, { x, y, size: 10, font });
            }
            x += 100;
          });
          y -= 20;
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setResultFileName(file.name.replace(/\.[^/.]+$/, "") + ".pdf");
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Client-side processing failed');
    } finally {
      setIsConverting(false);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    if (tool.id === 'merge' && files.length < 2) {
      setError('Please select at least two PDF files.');
      return;
    }
    
    setIsConverting(true);
    setError(null);
    setIsSuccess(false);

    if (['pdfWatermark', 'pdfPageNumbers', 'excelToPdf'].includes(tool.id)) {
      await processClientSide();
      return;
    }

    try {
      const formData = new FormData();
      const endpoint = tool.id === 'split' ? '/api/split' : '/api/process';

      if (tool.id === 'split') {
        formData.append('file', files[0]);
        formData.append('ranges', pageRanges);
      } else {
        files.forEach(f => formData.append('files', f));
        formData.append('tool', tool.id);
        if (tool.id === 'compress') {
          formData.append('compressionLevel', compressionLevel);
        }
      }

      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Processing failed' }));
        throw new Error(errorData.error || 'Processing failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsSuccess(true);
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `result.${tool.outExt || 'pdf'}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) fileName = decodeURIComponent(match[1]);
      }
      setResultFileName(fileName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-end">
        {(files.length > 0 || isSuccess || error) && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <X size={14} /> Reset Tool
          </button>
        )}
      </div>

      <UploadBox 
        onFileSelect={handleFileSelect}
        selectedFiles={files}
        onClear={handleClear}
        allowMultiple={tool.id === 'merge'}
        accept={tool.accept || '.pdf'}
      />

      {tool.id === 'split' && files.length > 0 && totalPages !== null && (
        <div className="frosted-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800">Split Settings</h4>
            <span className="text-xs font-black text-indigo-600">{totalPages} Pages Total</span>
          </div>
          <input 
            type="text" value={pageRanges} onChange={e => setPageRanges(e.target.value)} 
            className="w-full bg-white border border-slate-100 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}

      {tool.id === 'pdfWatermark' && files.length > 0 && (
        <div className="frosted-card p-6">
          <h4 className="font-bold text-slate-800 mb-4">Watermark Text</h4>
          <input 
            type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} 
            className="w-full bg-white border border-slate-100 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. CONFIDENTIAL"
          />
        </div>
      )}

      {tool.id === 'pdfPageNumbers' && files.length > 0 && (
        <div className="frosted-card p-6">
          <h4 className="font-bold text-slate-800 mb-4">Page Number Format</h4>
          <input 
            type="text" value={pageNumberFormat} onChange={e => setPageNumberFormat(e.target.value)} 
            className="w-full bg-white border border-slate-100 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. Page {n} of {t}"
          />
          <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{'{n}'} for current page, {'{t}'} for total</p>
        </div>
      )}

      {tool.id === 'compress' && files.length > 0 && (
        <div className="frosted-card p-6">
          <h4 className="font-bold text-slate-800 mb-4">Compression Level</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'LOW', label: 'Low', desc: 'Best Quality' },
              { id: 'MEDIUM', label: 'Medium', desc: 'Balanced' },
              { id: 'HIGH', label: 'Extreme', desc: 'Smallest Size' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => setCompressionLevel(level.id as any)}
                className={`p-4 rounded-2xl border-2 transition-all text-center group ${
                  compressionLevel === level.id 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                  compressionLevel === level.id ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {level.label}
                </div>
                <div className={`text-[9px] font-bold ${
                  compressionLevel === level.id ? 'text-indigo-400' : 'text-slate-300'
                }`}>
                  {level.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex gap-3">
            <AlertCircle className="shrink-0" size={18} />
            <div className="flex-1">
              <p>{error}</p>
              {error.includes('already highly optimized') && (
                <p className="text-[10px] opacity-70 mt-1 font-bold uppercase tracking-widest leading-relaxed">
                  Tip: This usually happens when the PDF is already as small as it can be without losing significant quality.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <ConvertButtons 
          file={files[0]} onConvert={handleProcess} isConverting={isConverting} isSuccess={isSuccess}
          disabled={adobeConfigured === false}
          selectedTool={tool.id}
        />
      )}

      {isSuccess && downloadUrl && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-2 rounded-full">
            <CheckCircle2 size={20} /> File Processed!
          </div>
          <a href={downloadUrl} download={resultFileName} className="group flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
            <Download size={20} /> Download File
          </a>
        </div>
      )}

      {files.length > 0 && tool.id !== 'merge' && <Preview file={files[0]} />}
    </div>
  );
}
