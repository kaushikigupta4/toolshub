import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Menu, X, FileIcon } from 'lucide-react';
import { categories } from '../../config/tools';

const Navbar: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(title);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveCategory(null);
  }, [location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
            <FileIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">
              ToolsHub<span className="text-indigo-600">.io</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {categories.map((category) => (
            <div 
              key={category.title}
              className="relative"
              onMouseEnter={() => handleMouseEnter(category.title)}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                  activeCategory === category.title ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {category.title.split(' ')[0]} Tools
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeCategory === category.title ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeCategory === category.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 p-2 overflow-hidden"
                  >
                    <div className="grid gap-1">
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.id}
                          to={`/tool/${tool.id}`}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-50 group`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`} style={{ backgroundColor: `var(--${tool.color}-600, #4f46e5)` }}>
                            <tool.icon size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{tool.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold overflow-hidden text-ellipsis whitespace-nowrap w-40">{tool.description}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              {categories.map((category) => (
                <div key={category.title} className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{category.title}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.id}
                        to={`/tool/${tool.id}`}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl active:scale-95 transition-transform"
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md`} style={{ backgroundColor: `var(--${tool.color}-600, #4f46e5)` }}>
                            <tool.icon size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{tool.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{tool.description}</span>
                          </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
