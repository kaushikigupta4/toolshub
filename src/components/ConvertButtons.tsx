import React from 'react';
import { ArrowRight, Loader2, FileCheck, Layers, Scissors, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ConvertButtons({ file, onConvert, isConverting, isSuccess, disabled, selectedTool }) {
  if (!file) return null;

  const toolConfig: Record<string, { label: string; icon: any }> = {
    pdfToWord: { label: 'Convert to Word', icon: ArrowRight },
    wordToPdf: { label: 'Convert to PDF', icon: ArrowRight },
    merge: { label: 'Merge PDFs', icon: Layers },
    split: { label: 'Split PDF', icon: Scissors },
    compress: { label: 'Compress PDF', icon: Minimize2 },
    jpgToPdf: { label: 'Convert to PDF', icon: ArrowRight },
    pdfToImg: { label: 'Convert to JPG', icon: ArrowRight },
  };

  const currentTool = toolConfig[selectedTool] || { label: 'Convert', icon: ArrowRight };
  const ToolIcon = currentTool.icon;

  return (
    <div className="flex flex-col items-center mt-8 relative z-20">
      <motion.button
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        disabled={isConverting || isSuccess || disabled}
        onClick={onConvert}
        className={`
          flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
          ${isSuccess 
            ? 'bg-emerald-500 text-white cursor-default' 
            : isConverting 
              ? 'bg-indigo-400 text-white cursor-not-allowed'
              : disabled
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
          }
        `}
      >
        {isConverting ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            Processing...
          </>
        ) : isSuccess ? (
          <>
            <FileCheck size={24} />
            Conversion Complete!
          </>
        ) : (
          <>
            {currentTool.label}
            <ToolIcon size={24} />
          </>
        )}
      </motion.button>
      
      {isConverting && (
        <p className="mt-4 text-sm text-slate-500 animate-pulse font-bold tracking-tight">
          Processing with Adobe PDF Services...
        </p>
      )}
    </div>
  );
}
