import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ImageIcon, 
  Upload, 
  Download, 
  RefreshCcw, 
  RotateCw, 
  Maximize, 
  Minimize2, 
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crop as CropIcon
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageToolsProps {
  tool: string;
}

export default function ImageTools({ tool }: ImageToolsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [compressLevel, setCompressLevel] = useState(0.7);
  const [resizeWidth, setResizeWidth] = useState(1920);
  const [resizeHeight, setResizeHeight] = useState(1080);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const [targetFormat, setTargetFormat] = useState('png');
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  // Crop State
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectRatios = [
    { label: 'Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state when tool changes
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setError(null);
    setRotation(0);
  }, [tool]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, WebP).');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResultUrl(null);
      setError(null);

      // Auto-set dimensions for resizing
      const img = new Image();
      img.onload = () => {
        setResizeWidth(img.width);
        setResizeHeight(img.height);
        setOriginalAspectRatio(img.width / img.height);
      };
      img.src = URL.createObjectURL(selected);
    }
  };

  const handleWidthChange = (width: number) => {
    setResizeWidth(width);
    if (lockAspectRatio) {
      setResizeHeight(Math.round(width / originalAspectRatio));
    }
  };

  const handleHeightChange = (height: number) => {
    setResizeHeight(height);
    if (lockAspectRatio) {
      setResizeWidth(Math.round(height * originalAspectRatio));
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      ));
    }
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          newAspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    } else {
      setCrop(undefined);
    }
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      if (tool === 'imgCompress') {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: compressLevel
        };
        const compressedFile = await imageCompression(file, options);
        setResultUrl(URL.createObjectURL(compressedFile));
        setResultFileName(`compressed_${file.name}`);
      } 
      else if (tool === 'imgResize' || tool === 'imgConvert' || tool === 'imgEdit') {
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = preview!;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        if (tool === 'imgEdit' && completedCrop) {
          // 1. Create a temporary canvas for rotation if needed
          const imageCanvas = document.createElement('canvas');
          const imageCtx = imageCanvas.getContext('2d');
          if (!imageCtx) throw new Error('Could not get image context');

          const isVertical = rotation === 90 || rotation === 270;
          imageCanvas.width = isVertical ? img.height : img.width;
          imageCanvas.height = isVertical ? img.width : img.height;

          imageCtx.translate(imageCanvas.width / 2, imageCanvas.height / 2);
          imageCtx.rotate((rotation * Math.PI) / 180);
          imageCtx.drawImage(img, -img.width / 2, -img.height / 2);

          // 2. Now crop from the rotated image canvas
          const scaleX = imageCanvas.width / imgRef.current!.width;
          const scaleY = imageCanvas.height / imgRef.current!.height;

          canvas.width = completedCrop.width * scaleX;
          canvas.height = completedCrop.height * scaleY;

          ctx.drawImage(
            imageCanvas,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } else {
          // Resize or Convert logic
          if (rotation === 90 || rotation === 270) {
            canvas.width = tool === 'imgResize' ? resizeHeight : img.height;
            canvas.height = tool === 'imgResize' ? resizeWidth : img.width;
          } else {
            canvas.width = tool === 'imgResize' ? resizeWidth : img.width;
            canvas.height = tool === 'imgResize' ? resizeHeight : img.height;
          }

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          
          let drawWidth = tool === 'imgResize' ? resizeWidth : img.width;
          let drawHeight = tool === 'imgResize' ? resizeHeight : img.height;
          
          ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
        
        const mimeType = `image/${tool === 'imgConvert' ? targetFormat : 'jpeg'}`;
        const quality = 0.9;
        
        canvas.toBlob((blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
            const ext = tool === 'imgConvert' ? targetFormat : 'jpg';
            setResultFileName(`processed_${file.name.split('.')[0]}.${ext}`);
          }
        }, mimeType, quality);
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setRotation(0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 mt-8 pb-12">
      <div className="flex justify-end mb-6">
        {file && (
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <RefreshCcw size={12} className={isProcessing ? 'animate-spin' : ''} /> Reset Tool
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Upload & Settings Section */}
        <div className="space-y-6">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="frosted-card p-12 border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Click to upload an image</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest">JPG, PNG, or WebP</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="frosted-card p-4 relative group overflow-hidden flex justify-center">
                {tool === 'imgEdit' ? (
                  <div className="relative w-full max-h-[500px] flex justify-center overflow-auto bg-slate-900/5 rounded-xl p-4">
                    <ReactCrop
                      crop={crop}
                      onChange={c => setCrop(c)}
                      onComplete={c => setCompletedCrop(c)}
                      aspect={aspect}
                      className="max-w-full"
                    >
                      <img 
                        ref={imgRef}
                        src={preview!} 
                        onLoad={onImageLoad}
                        style={{ transform: `rotate(${rotation}deg)` }}
                        className="max-w-full max-h-[400px] object-contain transition-transform duration-300"
                        alt="Crop source"
                      />
                    </ReactCrop>
                  </div>
                ) : (
                  <div 
                    className="w-full h-64 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden relative"
                  >
                    <img 
                      src={preview!} 
                      className="max-w-full max-h-full object-contain transition-all duration-300" 
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        aspectRatio: tool === 'imgResize' ? `${resizeWidth}/${resizeHeight}` : 'auto'
                      }}
                      alt="Original" 
                    />
                    {tool === 'imgResize' && (
                      <div className="absolute inset-0 border-2 border-indigo-400/30 pointer-events-none flex items-center justify-center">
                         <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg">
                           {resizeWidth} × {resizeHeight}
                         </span>
                      </div>
                    )}
                  </div>
                )}
                <button 
                  onClick={handleClear}
                  className="absolute top-6 right-6 p-2 bg-white/80 text-slate-400 hover:text-red-500 rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-6 left-6 px-3 py-1 bg-white/80 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-full shadow-sm backdrop-blur z-10">
                  {tool === 'imgEdit' ? 'Crop Area' : 'Original Image'}
                </div>
              </div>

              {/* Tool Specific Settings */}
              <div className="frosted-card p-6 space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Settings</h3>
                
                {tool === 'imgCompress' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>Compression Level</span>
                      <span className="text-indigo-600">{(compressLevel * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="1" step="0.05"
                      value={compressLevel}
                      onChange={(e) => setCompressLevel(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                )}

                {tool === 'imgResize' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensions</label>
                      <button 
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${lockAspectRatio ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                      >
                        {lockAspectRatio ? 'Locked Aspect Ratio' : 'Free Resize'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Width (px)</label>
                        <input 
                          type="number" 
                          value={resizeWidth} 
                          onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Height (px)</label>
                        <input 
                          type="number" 
                          value={resizeHeight} 
                          onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {tool === 'imgConvert' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['png', 'jpg', 'webp'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setTargetFormat(fmt)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${targetFormat === fmt ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tool === 'imgEdit' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aspect Ratio</label>
                      <div className="flex flex-wrap gap-2">
                        {aspectRatios.map((ratio) => (
                          <button
                            key={ratio.label}
                            onClick={() => handleAspectChange(ratio.value)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                              aspect === ratio.value 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                            }`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rotation</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setRotation(prev => (prev + 90) % 360)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all font-bold text-xs"
                        >
                          <RotateCw size={14} /> +90°
                        </button>
                        <button
                          onClick={() => {
                            setRotation(0);
                            setCrop(undefined);
                            setAspect(undefined);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all font-bold text-xs"
                        >
                          <RefreshCcw size={14} /> Reset
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
                        <CropIcon size={12} /> Pro Tip
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Drag the corners of the box to crop. Rotate the image first if needed.
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={processImage}
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Maximize size={18} />
                      <span>Process Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Section */}
        <div className="space-y-6">
          <div className="frosted-card p-4 min-h-[400px] flex flex-col items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Optimizing Assets</p>
              </div>
            ) : resultUrl ? (
              <div className="w-full space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="relative group w-full">
                  <img 
                    src={resultUrl} 
                    className="w-full h-80 object-contain rounded-lg bg-white shadow-2xl" 
                    alt="Processed result" 
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1">
                      <CheckCircle2 size={10} /> Processed
                    </span>
                  </div>
                </div>
                
                <div className="w-full p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Download size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{resultFileName}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ready for download</p>
                    </div>
                  </div>
                  <a 
                    href={resultUrl} 
                    download={resultFileName}
                    className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest"
                  >
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs opacity-40">
                <ImageIcon size={64} strokeWidth={1} />
                <p className="text-sm font-medium text-slate-500">Your processed image will appear here</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <div className="text-xs">
                <p className="font-bold">Error Occurred</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
