import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Loader2, FileText as FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/common/Navbar';

const Home = lazy(() => import('./components/features/Home'));
const ToolContainer = lazy(() => import('./components/tools/ToolContainer'));

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#FAFBFF]">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />

      {/* Main Content with Route Transitions */}
      <main className="relative z-10 pt-16">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        }>
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/" element={
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Home />
                </motion.div>
              } />
              <Route path="/tool/:toolId" element={
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                  <ToolContainer />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 grayscale opacity-70">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center">
              <FileIcon size={12} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ToolsHub.io v1.0</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Github</a>
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            © 2024 DocuShift Infrastructure. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
