import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { categories } from '../config/tools';
import { Zap, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>ToolsHub.io - Free Online PDF, Image, and Developer Tools</title>
        <meta name="description" content="Ultimate all-in-one hub for digital utilities. Merge PDF, compress images, format JSON, and more. Fast, secure, and 100% free online tools for everyone." />
        <meta name="keywords" content="pdf tools, image optimizer, json formatter, developer tools, free online utilities, merge pdf, compress pdf" />
        <link rel="canonical" href="https://toolshub.io/" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
              All-in-One Free Tools for <br/>
              <span className="text-indigo-600 italic">PDFs, Images & Developers</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
              Professional-grade tools for documents, data, and development. Built for speed, security, and simplicity. 100% free with no registration required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="space-y-16">
          {categories.map((category, catIdx) => (
            <div key={category.title} className="space-y-8">
              <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{category.title}</h3>
                  <p className="text-sm text-slate-400 font-medium">{category.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {category.tools.map((tool, toolIdx) => (
                  <Link
                    key={tool.id}
                    to={`/tool/${tool.id}`}
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
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
                      tool.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                      tool.color === 'violet' ? 'bg-violet-50 text-violet-600' :
                      tool.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      <tool.icon size={24} strokeWidth={2} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 group-hover:text-indigo-600 transition-colors">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      {tool.description}
                    </p>
                    <div className="mt-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                      Open Tool <ArrowRight size={10} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Trust Section */}
      <section className="bg-slate-50 py-24 px-6 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy First</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Files are processed and immediately purged. We never store your data.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Speed</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Powered by cloud-native infrastructure for near-instant processing.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">High Fidelity</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Maintain layout, fonts, and formatting with industry-standard engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-24 px-6 bg-white border-t border-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">
                <CheckCircle2 size={12} /> The ToolsHub.io Standard
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">
                Why professionals choose <br/>
                <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">ToolsHub.io</span> for their daily tasks.
              </h2>
              <div className="prose prose-slate prose-indigo">
                <p className="text-lg text-slate-600 font-medium">
                  In a digital-first world, having the right utility at the right time isn't just convenient—it's essential for professional productivity.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest italic">Privacy & Security</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">We employ bank-level encryption during transit. Files are processed in volatile memory and purged instantly. Your data never touches permanent storage.</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest italic">Performance First</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Our cloud-native API integration ensures sub-second responses. Scale your document workflows without waiting for local processing bottlenecks.</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest italic">100% Free Access</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">We believe professional tools should be accessible. No credit cards, no nested subscriptions—just pure functional utility for every user.</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest italic">Developer Driven</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Built by developers, for developers. Our utilities handle complex JSON, Regex, and JWT debugging with the precision your code requires.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <Zap className="text-indigo-600/5 w-32 h-32 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
                </div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 italic">Extensive Tool Categories</h3>
                  <div className="space-y-6">
                    {[
                      { name: 'Document Management', desc: 'Enterprise-grade PDF merging, splitting, and high-fidelity compression.' },
                      { name: 'Developer Utilities', desc: 'Secure JSON beautification, JWT inspection, and pattern testing.' },
                      { name: 'Image Optimization', desc: 'Modern WebP and PNG compression to speed up your website load times.' },
                      { name: 'Text Automation', desc: 'Automated formatting, case conversion, and text cleaning for content creators.' }
                    ].map((cat, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-1.5 h-auto bg-indigo-600 rounded-full opacity-20" />
                        <div>
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">{cat.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{cat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[40px] text-center bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none italic">Constantly Evolving</p>
                <p className="text-xs font-bold text-slate-500">New digital utilities added every week based on user feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
