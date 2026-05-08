import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, 
  RefreshCcw, 
  Check, 
  Download, 
  QrCode, 
  Lock, 
  Binary, 
  Link as LinkIcon,
  Shield,
  Zap,
  RotateCcw,
  FileType,
  Sparkles,
  Code,
  Minimize2,
  Parentheses,
  AlignJustify,
  FileJson
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import beautify from 'js-beautify';
import Papa from 'papaparse';

interface UtilityToolsProps {
  tool: string;
}

export default function UtilityTools({ tool }: UtilityToolsProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Password Gen State
  const [passLength, setPassLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  // Regex State
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexMatches, setRegexMatches] = useState<RegExpMatchArray[]>([]);

  const generatePassword = () => {
    const length = Math.max(1, Math.min(128, passLength || 16));
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lower;
    if (includeUpper) chars += upper;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;
    
    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(array[i] % chars.length);
    }
    setOutput(result);
  };

  useEffect(() => {
    if (tool === 'passGen') {
      generatePassword();
    } else {
      setInput('');
      setOutput('');
    }
  }, [tool, passLength, includeUpper, includeNumbers, includeSymbols]);

  const getStrength = () => {
    if (!output) return { label: 'None', color: 'bg-slate-200', width: '0%' };
    let score = 0;
    if (output.length > 10) score++;
    if (output.length > 15) score++;
    if (includeUpper) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getStrength();

  const handleReset = () => {
    setInput('');
    setOutput('');
    setPassLength(16);
    setIncludeUpper(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setRegexPattern('');
    setRegexFlags('g');
    setRegexMatches([]);
    if (tool === 'passGen') {
      setTimeout(generatePassword, 0);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBase64 = (mode: 'encode' | 'decode') => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (e) {
      setOutput('Error: Invalid input for ' + mode);
    }
  };

  const handleUrl = (mode: 'encode' | 'decode') => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e) {
      setOutput('Error: Invalid input for ' + mode);
    }
  };

  const downloadQRCode = () => {
    const svg = document.querySelector('#qr-code-svg svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qrcode.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleJson = (mode: 'beautify' | 'minify') => {
    try {
      const parsed = JSON.parse(input);
      if (mode === 'beautify') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (e) {
      setOutput('Error: Invalid JSON input');
    }
  };

  const handleJwt = () => {
    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error();
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      setOutput(JSON.stringify({ header, payload }, null, 2));
    } catch (e) {
      setOutput('Error: Invalid JWT format');
    }
  };

  const handleRegex = () => {
    try {
      if (!regexPattern) return;
      const re = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(input.matchAll(re));
      setRegexMatches(matches);
      setOutput(`Found ${matches.length} matches`);
    } catch (e) {
      setOutput('Error: Invalid Regex pattern');
      setRegexMatches([]);
    }
  };

  const handleCodeFormat = () => {
    try {
      if (!input) return;
      
      // Try to determine if it's HTML, CSS or JS
      const trimmed = input.trim();
      let result = '';
      
      if (trimmed.startsWith('<')) {
        result = beautify.html(input, { indent_size: 2, wrap_line_length: 80 });
      } else if (trimmed.includes('{') && (trimmed.includes(':') || trimmed.includes('@'))) {
        // Very basic CSS/SCSS detection
        result = beautify.css(input, { indent_size: 2 });
      } else {
        result = beautify.js(input, { indent_size: 2, space_in_empty_paren: true });
      }
      
      setOutput(result);
    } catch (e) {
      setOutput('Error: Could not format code. Make sure it is valid syntax.');
    }
  };

  const handleBracesFixer = () => {
    try {
      const stack: { char: string, index: number }[] = [];
      const open = ['{', '[', '('];
      const close = ['}', ']', ')'];
      const map: { [key: string]: string } = { '}': '{', ']': '[', ')': '(' };
      const reverseMap: { [key: string]: string } = { '{': '}', '[': ']', '(': ')' };
      
      let segments: { text: string, type: 'original' | 'added' | 'mismatch' }[] = [];
      let lastIndex = 0;

      for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (open.includes(char)) {
          stack.push({ char, index: i });
        } else if (close.includes(char)) {
          if (stack.length === 0) {
            // Unexpected closing
            segments.push({ text: input.substring(lastIndex, i), type: 'original' });
            segments.push({ text: char, type: 'mismatch' });
            lastIndex = i + 1;
          } else {
            const last = stack.pop()!;
            if (last.char !== map[char]) {
              // Mismatched closing
              segments.push({ text: input.substring(lastIndex, i), type: 'original' });
              segments.push({ text: char, type: 'mismatch' });
              lastIndex = i + 1;
            }
          }
        }
      }

      segments.push({ text: input.substring(lastIndex), type: 'original' });

      // Add missing closers at the end
      let addedText = '';
      while (stack.length > 0) {
        const last = stack.pop()!;
        addedText += reverseMap[last.char];
      }

      if (addedText) {
        segments.push({ text: addedText, type: 'added' });
      }

      // Convert segments to a special string format for rendering or just use a new state
      const outputText = segments.map(s => {
        if (s.type === 'added') return `«${s.text}»`;
        if (s.type === 'mismatch') return `‼${s.text}‼`;
        return s.text;
      }).join('');

      setOutput(outputText);
    } catch (e) {
      setOutput('Error: Analysis failed.');
    }
  };

  const handlePythonFixer = () => {
    try {
      const lines = input.split('\n');
      let currentIndent = 0;
      const indentSize = 4;
      const formatted = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        // Keywords that MUST align with the block parent
        const isBlockContinue = /^(else|elif|except|finally):?/.test(trimmed);
        
        if (isBlockContinue) {
          currentIndent = Math.max(0, currentIndent - 1);
        }

        const result = ' '.repeat(currentIndent * indentSize) + trimmed;

        // Keywords that increase indentation for the next line
        if (trimmed.endsWith(':')) {
          currentIndent++;
        }

        return result;
      }).join('\n');

      setOutput(formatted);
    } catch (e) {
      setOutput('Error: Python indentation fix failed.');
    }
  };

  const handleCsvToJson = () => {
    try {
      if (!input) return;
      Papa.parse(input, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setOutput(JSON.stringify(results.data, null, 2));
        },
        error: (err) => {
          setOutput('Error: CSV parsing failed - ' + err.message);
        }
      });
    } catch (e) {
      setOutput('Error: CSV to JSON conversion failed.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Tool Sidebar / Settings Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Configuration</h3>
              <p className="text-[10px] font-bold text-slate-400">Customize your tool output</p>
            </div>
          </div>
          {(input || output || regexPattern) && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
        
        {tool === 'passGen' && (
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 relative overflow-hidden">
              <div className="text-2xl md:text-3xl font-mono font-black text-slate-800 break-all px-8 text-center select-all z-10">
                {output}
              </div>
              
              <div className="flex gap-4 mt-10 z-10">
                <button 
                  onClick={generatePassword}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-500 shadow-sm"
                  title="Generate New"
                >
                  <RotateCcw size={20} />
                </button>
                <button 
                  onClick={() => copyToClipboard(output)}
                  className="flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Password'}
                </button>
              </div>

              {/* Strength Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: strength.width }}
                  className={`h-full transition-colors duration-500 ${strength.color}`}
                />
              </div>
              <div className="absolute bottom-3 right-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                Strength: <span className={strength.label === 'Strong' ? 'text-emerald-500' : strength.label === 'Medium' ? 'text-amber-500' : 'text-red-500'}>{strength.label}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                  <span>Password Length</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="4" 
                      max="128" 
                      value={passLength}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setPassLength(val);
                      }}
                      className="w-12 bg-white border border-slate-200 rounded px-1 py-0.5 text-center text-indigo-600 font-black focus:border-indigo-400 outline-none"
                    />
                  </div>
                </div>
                <input 
                  type="range" min="8" max="64" value={Math.min(64, Math.max(8, passLength))} 
                  onChange={(e) => setPassLength(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upper', label: 'ABC', val: includeUpper, set: setIncludeUpper },
                  { id: 'nums', label: '123', val: includeNumbers, set: setIncludeNumbers },
                  { id: 'syms', label: '!?#', val: includeSymbols, set: setIncludeSymbols },
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => opt.set(!opt.val)}
                    className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                      opt.val ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    {opt.label}
                    <div className={`w-1 h-1 rounded-full ${opt.val ? 'bg-indigo-600' : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tool === 'qrGen' && (
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text or Link</label>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://google.com"
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-200 shadow-inner"
              />
            </div>

            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <AnimatePresence mode="wait">
                {input ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50"
                    id="qr-code-svg"
                  >
                    <QRCodeSVG 
                      value={input} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4 opacity-30">
                    <QrCode size={64} className="mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest">Enter data to generate</p>
                  </div>
                )}
              </AnimatePresence>
              
              {input && (
                <div className="flex flex-col items-center gap-4 mt-8">
                  <button 
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
                  >
                    <Download size={14} /> Download PNG
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Live Preview • Real-time Sync
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shared Text Area for Dev & Utility Tools */}
        {['base64', 'urlEnc', 'jsonFormat', 'regexTester', 'jwtDecoder', 'codeFormatter', 'bracesFixer', 'pythonFixer', 'csvToJson'].includes(tool) && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                  {tool === 'jsonFormat' ? 'JSON Input' : 
                   tool === 'regexTester' ? 'Test String' : 
                   tool === 'jwtDecoder' ? 'JWT Token' : 
                   tool === 'codeFormatter' ? 'Code Snippet' : 
                   tool === 'bracesFixer' ? 'Code to Check' :
                   tool === 'pythonFixer' ? 'Python Code' : 
                   tool === 'csvToJson' ? 'CSV Data' : 'Input'}
                </label>
                {input && (
                  <button onClick={() => { setInput(''); setOutput(''); }} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-500 transition-colors">Clear</button>
                )}
              </div>

              {tool === 'regexTester' && (
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">RegEx Pattern</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">/</span>
                      <input 
                        type="text" value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)}
                        placeholder="[a-z]+"
                        className="w-full bg-slate-50 border border-slate-100 pl-8 pr-12 py-3 rounded-xl text-sm font-mono text-slate-700 outline-none focus:border-indigo-200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">/</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Flags</label>
                    <input 
                      type="text" value={regexFlags} onChange={(e) => setRegexFlags(e.target.value)}
                      placeholder="g"
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-mono text-slate-700 outline-none focus:border-indigo-200"
                    />
                  </div>
                </div>
              )}

              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  tool === 'jsonFormat' ? '{"key": "value"}' : 
                  tool === 'jwtDecoder' ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : 
                  'Paste your content here...'
                }
                className={`w-full ${tool === 'regexTester' ? 'h-32' : 'h-40'} bg-slate-50 border border-slate-100 p-6 rounded-3xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-200 shadow-inner resize-none overflow-y-auto custom-scrollbar ${['jsonFormat', 'jwtDecoder', 'codeFormatter'].includes(tool) ? 'font-mono' : ''}`}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              {tool === 'jsonFormat' && (
                <>
                  <button onClick={() => handleJson('beautify')} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                    <Zap size={14} /> Beautify
                  </button>
                  <button onClick={() => handleJson('minify')} className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all">
                    <Minimize2 size={14} className="rotate-90" /> Minify
                  </button>
                </>
              )}
              {tool === 'regexTester' && (
                <button onClick={handleRegex} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  <Sparkles size={14} /> Test Pattern
                </button>
              )}
              {tool === 'jwtDecoder' && (
                <button onClick={handleJwt} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  <Shield size={14} /> Decode JWT
                </button>
              )}
              {tool === 'codeFormatter' && (
                <button onClick={handleCodeFormat} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  <Code size={14} /> Format Snippet
                </button>
              )}
              {tool === 'bracesFixer' && (
                <button onClick={handleBracesFixer} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  <Parentheses size={14} /> Fix Braces
                </button>
              )}
              {tool === 'pythonFixer' && (
                <button onClick={handlePythonFixer} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  <AlignJustify size={14} /> Align Python
                </button>
              )}
              {tool === 'csvToJson' && (
                <button onClick={handleCsvToJson} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                  <FileJson size={14} /> Convert to JSON
                </button>
              )}
              {tool === 'base64' && (
                <>
                  <button onClick={() => handleBase64('encode')} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                    <Binary size={14} /> Encode
                  </button>
                  <button onClick={() => handleBase64('decode')} className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all">
                    <RefreshCcw size={14} /> Decode
                  </button>
                </>
              )}
              {tool === 'urlEnc' && (
                <>
                  <button onClick={() => handleUrl('encode')} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
                    <LinkIcon size={14} /> Encode
                  </button>
                  <button onClick={() => handleUrl('decode')} className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all">
                    <RefreshCcw size={14} /> Decode
                  </button>
                </>
              )}
            </div>

            {tool === 'regexTester' && regexMatches.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matches ({regexMatches.length})</label>
                <div className="flex flex-wrap gap-2">
                  {regexMatches.slice(0, 20).map((m, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-mono font-bold border border-indigo-100">
                      {m[0]}
                    </span>
                  ))}
                  {regexMatches.length > 20 && <span className="text-[10px] text-slate-400 pt-1">...and {regexMatches.length - 20} more</span>}
                </div>
              </div>
            )}

            <AnimatePresence>
              {output && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {tool === 'regexTester' ? 'Test Result' : 
                       tool === 'jwtDecoder' ? 'Decoded Data' : 'Output Result'}
                    </label>
                    <button 
                      onClick={() => copyToClipboard(output)}
                      className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${copied ? 'text-emerald-500' : 'text-indigo-600 hover:text-indigo-700'}`}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy Result'}
                    </button>
                  </div>
                  <div className="w-full min-h-[100px] max-h-80 bg-indigo-50/30 border border-indigo-100 p-6 rounded-3xl text-sm font-mono text-slate-700 overflow-y-auto custom-scrollbar break-all whitespace-pre">
                    {tool === 'bracesFixer' ? (
                      output.split(/(«[^»]+»|‼[^‼]+‼)/g).map((part, i) => {
                        if (part.startsWith('«') && part.endsWith('»')) {
                          return <span key={i} className="bg-emerald-100 text-emerald-700 px-1 rounded border border-emerald-200 font-black animate-pulse" title="Automatically added">{part.slice(1, -1)}</span>;
                        }
                        if (part.startsWith('‼') && part.endsWith('‼')) {
                          return <span key={i} className="bg-red-100 text-red-600 px-1 rounded border border-red-200 line-through decoration-red-400" title="Mismatched or extra">{part.slice(1, -1)}</span>;
                        }
                        return part;
                      })
                    ) : output}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Info Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">Local Processing</h4>
            <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
              These utilities run entirely in your browser. No data is sent to any server. Completely private.
            </p>
          </div>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Instant Results</h4>
            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
              Real-time generation and copy-ready outputs for maximum productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
