import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { allTools, Tool } from '../../config/tools';
import { ArrowLeft } from 'lucide-react';

// Components
import Navbar from '../common/Navbar';
import SEOBox from '../common/SEOBox';

// Features
import PDFTools from '../features/PDFTools';
import TextTools from '../features/TextTools';
import ImageTools from '../features/ImageTools';
import UtilityTools from '../features/UtilityTools';

export default function ToolContainer() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const tool = allTools.find(t => t.id === toolId) as Tool | undefined;
  
  const [adobeConfigured, setAdobeConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Check Adobe on load
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setAdobeConfigured(data.adobeConfigured))
      .catch(() => setAdobeConfigured(false));
  }, [toolId]);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tool not found</h2>
          <Link to="/" className="text-indigo-600 font-bold hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const isTextTool = tool.isText;
  const isImageTool = (tool as any).isImage;
  const isUtilityTool = tool.isUtility;
  const isPDFTool = !isTextTool && !isImageTool && !isUtilityTool;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tool.name}</h1>
            <p className="text-slate-400 font-medium text-sm">{tool.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-3xl ${
          tool.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
          tool.color === 'blue' ? 'bg-blue-50 text-blue-600' :
          tool.color === 'violet' ? 'bg-violet-50 text-violet-600' :
          tool.color === 'purple' ? 'bg-purple-50 text-purple-600' :
          tool.color === 'fuchsia' ? 'bg-fuchsia-50 text-fuchsia-600' :
          tool.color === 'sky' ? 'bg-sky-50 text-sky-600' :
          tool.color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
          tool.color === 'rose' ? 'bg-rose-50 text-rose-600' :
          tool.color === 'amber' ? 'bg-amber-50 text-amber-600' :
          tool.color === 'slate' ? 'bg-slate-50 text-slate-600' :
          'bg-emerald-50 text-emerald-600'
        }`}>
          <tool.icon size={32} />
        </div>
      </div>
    </div>

    <div className="space-y-12">
        {isPDFTool ? (
          <PDFTools tool={tool} adobeConfigured={adobeConfigured} />
        ) : isTextTool ? (
          <TextTools initialTool={tool.id} />
        ) : isImageTool ? (
          <ImageTools tool={tool.id} />
        ) : (
          <UtilityTools tool={tool.id} />
        )}

        {/* Global SEO Content Section */}
        {tool && <SEOBox toolId={tool.id} />}
      </div>
    </div>
  );
}
