import React, { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { FileText, Eye, Loader2, FileCheck, AlertCircle } from 'lucide-react';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Preview({ file }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const renderTaskRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!file) return;

    const isPDF = file.name.endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);

    if (!isPDF && !isImage) return;

    let isCancelled = false;
    let imageUrl = '';

    const renderPreview = async () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Cancel any ongoing tasks
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy();
        loadingTaskRef.current = null;
      }

      setLoading(true);
      setError(false);
      
      try {
        if (isPDF) {
          const arrayBuffer = await file.arrayBuffer();
          if (isCancelled) return;

          loadingTaskRef.current = pdfjs.getDocument({ data: arrayBuffer });
          const pdf = await loadingTaskRef.current.promise;
          if (isCancelled) return;

          const page = await pdf.getPage(1);
          if (isCancelled) return;
          
          const viewport = page.getViewport({ scale: 0.8 });
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          context.clearRect(0, 0, canvas.width, canvas.height);

          renderTaskRef.current = page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          } as any);
          
          await renderTaskRef.current.promise;
        } else if (isImage) {
          imageUrl = URL.createObjectURL(file);
          const img = new Image();
          img.src = imageUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          if (isCancelled) return;

          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, width, height);
        }
      } catch (err: any) {
        if (isCancelled || (err && err.name === 'RenderingCancelledException')) return;
        console.error('Document preview error:', err);
        setError(true);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    renderPreview();

    return () => {
      isCancelled = true;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (loadingTaskRef.current) {
        loadingTaskRef.current.destroy();
      }
    };
  }, [file]);

  if (!file) return null;

  const isSupported = /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

  return (
    <div className="relative z-10 mt-12 w-full max-w-4xl mx-auto px-6">
      <div className="flex items-center gap-2 mb-6 text-slate-600 font-bold tracking-tight">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Eye size={16} />
        </div>
        <span>Document Preview</span>
      </div>
      
      <div className="frosted-card p-4 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
        {error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-red-50 rounded-full text-red-500">
              <AlertCircle size={48} />
            </div>
            <h3 className="font-bold text-slate-800">Preview Unavailable</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              We couldn't generate a preview for this file. It might be corrupted or in an unsupported format, but you can still try to process it.
            </p>
          </div>
        ) : isSupported ? (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-10 rounded-xl">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            )}
            <canvas 
              key={`${file.name}-${file.lastModified}-${file.size}`}
              ref={canvasRef} 
              className="pdf-canvas max-w-full h-auto shadow-2xl rounded-lg" 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600/30">
              <FileCheck size={40} />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Word Document Selected</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              We'll convert this to a high-fidelity PDF first to generate a perfect preview. PDF documents are previewed instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
