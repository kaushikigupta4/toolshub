import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function UploadBox({ onFileSelect, selectedFiles, onClear, allowMultiple, accept }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (allowMultiple) {
        validateAndSelect(Array.from(files));
      } else {
        validateAndSelect([files[0]]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelect(Array.from(files));
    }
  };

  const validateAndSelect = (files: File[]) => {
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return validExtensions.includes(ext);
    });

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    } else {
      alert(`Please upload ${validExtensions.join(' or ')} files.`);
    }
  };

  const fileList = Array.isArray(selectedFiles) ? selectedFiles : (selectedFiles ? [selectedFiles] : []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {fileList.length === 0 ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative group overflow-hidden frosted-card p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
              isDragging 
                ? "border-indigo-400 bg-white/60 scale-102 shadow-2xl shadow-indigo-100" 
                : "hover:border-indigo-300 hover:bg-white/50"
            )}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept}
              multiple={allowMultiple}
              className="hidden"
            />
            
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-inner",
              isDragging ? "bg-indigo-600 text-white scale-110" : "bg-indigo-50 text-indigo-600"
            )}>
              <Upload size={32} />
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-slate-800">
              Drop your {allowMultiple ? 'PDFs' : 'files'} here
            </h3>
            <p className="text-slate-500 text-center max-w-sm mb-8">
              or click to browse from your computer
            </p>
            
            <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
              {allowMultiple ? 'Select PDFs' : 'Select Files'}
            </button>
            
            <div className="mt-8 flex gap-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {validExtensions.map(ext => (
                <span key={ext} className="px-3 py-1 bg-white/40 rounded-full border border-white/60">.{ext.toUpperCase()}</span>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {fileList.map((f, i) => (
              <motion.div
                key={`${f.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="frosted-card p-4 flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate text-sm">{f.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {(f.size / (1024 * 1024)).toFixed(2)} MB • {f.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
                {allowMultiple && (
                  <button
                    onClick={() => onClear(i)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </motion.div>
            ))}
            {!allowMultiple && (
              <div className="flex justify-center">
                 <button
                  onClick={() => onClear(0)}
                  className="mt-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                >
                  Change File
                </button>
              </div>
            )}
            {allowMultiple && (
               <div className="flex justify-between items-center px-2">
                 <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                  >
                    + Add More
                  </button>
                  <button
                    onClick={() => onClear(-1)}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                  >
                    Clear All
                  </button>
               </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  validateAndSelect(Array.from(files));
                }
              }}
              accept={accept}
              multiple={allowMultiple}
              className="hidden"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
