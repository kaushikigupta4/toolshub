import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Trash2, AlignLeft, CaseUpper, CaseLower, Type, Eraser, Sparkles, Code, Minimize2 } from 'lucide-react';

interface TextToolsProps {
  initialTool?: string;
}

export default function TextTools({ initialTool }: TextToolsProps) {
  const [text, setText] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const stats = {
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    chars: text.length,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    lines: text.split('\n').filter(l => l.trim().length > 0).length
  };

  const handleReset = () => {
    setText('');
    setLastAction(null);
  };

  const handleCaseChange = (type: 'upper' | 'lower' | 'title') => {
    let newText = '';
    if (type === 'upper') newText = text.toUpperCase();
    else if (type === 'lower') newText = text.toLowerCase();
    else if (type === 'title') {
      newText = text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    setText(newText);
    showFlash('Case Converted');
  };

  const removeExtraSpaces = () => {
    setText(text.replace(/\s+/g, ' ').trim());
    showFlash('Extra Spaces Removed');
  };

  const removeLineBreaks = () => {
    setText(text.replace(/\n+/g, ' ').trim());
    showFlash('Line Breaks Removed');
  };

  const cleanText = () => {
    // Normalizes smart quotes, removes non-standard whitespace, trims
    let cleaned = text
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    setText(cleaned);
    showFlash('Text Cleaned');
  };

  const removeFormat = () => {
    // For plain text, "remove format" usually means stripping everything but simple characters or normalization
    // In this context, we'll strip HTML-like tags if present
    setText(text.replace(/<[^>]*>?/gm, ''));
    showFlash('Format Removed');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    showFlash('Copied to Clipboard');
  };

  const showFlash = (msg: string) => {
    setLastAction(msg);
    setTimeout(() => setLastAction(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 mt-12 pb-24">
      <div className="flex justify-end mb-6">
        {text && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Eraser size={12} /> Reset Text
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative frosted-card p-1">
             <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-80 bg-white/40 backdrop-blur-sm rounded-xl p-6 outline-none resize-none text-slate-800 font-medium placeholder:text-slate-400 focus:bg-white/60 transition-all border border-transparent focus:border-indigo-200"
            />
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button 
                onClick={() => setText('')}
                className="p-2 bg-white/80 text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition-all"
                title="Clear Text"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-100 transition-all"
                title="Copy Text"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ToolButton icon={<CaseUpper size={18} />} label="UPPERCASE" onClick={() => handleCaseChange('upper')} />
            <ToolButton icon={<CaseLower size={18} />} label="lowercase" onClick={() => handleCaseChange('lower')} />
            <ToolButton icon={<Type size={18} />} label="Title Case" onClick={() => handleCaseChange('title')} />
            <ToolButton icon={<AlignLeft size={18} />} label="Clean Spaces" onClick={removeExtraSpaces} />
            <ToolButton icon={<Minimize2 size={18} />} label="One Line" onClick={removeLineBreaks} />
            <ToolButton icon={<Sparkles size={18} />} label="Deep Clean" onClick={cleanText} />
            <ToolButton icon={<Code size={18} />} label="Clear HTML" onClick={removeFormat} />
          </div>
        </div>

        {/* Stats & Feedback */}
        <div className="space-y-6">
          <div className="frosted-card p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Text Statistics</h3>
            <div className="space-y-4">
              <StatItem label="Words" value={stats.words} />
              <StatItem label="Characters" value={stats.chars} />
              <StatItem label="Sentences" value={stats.sentences} />
              <StatItem label="Lines" value={stats.lines} />
            </div>
          </div>

          <div className="relative h-12 overflow-hidden">
            {lastAction && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 text-xs tracking-widest uppercase"
              >
                {lastAction}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-white/60 hover:bg-white border border-slate-200 hover:border-indigo-200 rounded-xl transition-all group shrink-0"
    >
      <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
        {icon}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">
        {label}
      </span>
    </button>
  );
}

function StatItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-100 pb-2">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-xl font-black text-slate-800 font-mono tracking-tighter">{value}</span>
    </div>
  );
}
