
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toolSEOData } from '../config/seoContent';
import { allTools } from '../config/tools';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';

interface SEOBoxProps {
  toolId: string;
}

const SEOBox: React.FC<SEOBoxProps> = ({ toolId }) => {
  const content = toolSEOData[toolId];
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  if (!content) return null;

  // Get 3 related tools
  const relatedTools = allTools
    .filter(t => t.id !== toolId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": content.h1,
    "description": content.metaDescription,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": content.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.metaDescription} />
        <meta name="keywords" content={content.keywords.join(', ')} />
        <link rel="canonical" href={`https://toolshub.io/${toolId}`} />
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
        {content.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 space-y-16 border-t border-slate-100 pt-20 pb-10"
      >
        {/* Main Content Area */}
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              <CheckCircle2 size={12} /> Detailed Guide
            </div>
            <div 
              className="prose prose-slate prose-indigo max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-li:text-slate-600
                prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: content.longContent }}
            />
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Why ToolsHub.io?</h3>
              <ul className="space-y-4">
                {[
                  '100% Free to use',
                  'No registration required',
                  'Bank-level encryption',
                  'Instant processing',
                  'Mobile optimized'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-black uppercase text-xs tracking-widest mb-2 opacity-80">Pro Tools</h3>
                <p className="text-sm font-bold mb-4">Unlock batch processing and advanced API access.</p>
                <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                  Coming Soon
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
            </div>
          </div>
        </div>

        {/* FAQ Area */}
        {content.faqs.length > 0 && (
          <div className="space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
              <HelpCircle size={12} /> Frequently Asked Questions
            </div>
            <div className="space-y-4">
              {content.faqs.map((faq, i) => (
                <div key={i} className="group border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-indigo-100 transition-all">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="text-sm font-black text-slate-800">{faq.question}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 text-sm text-slate-500 font-medium border-t border-slate-50 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 w-fit">
            <ArrowRight size={12} /> Boost Your Workflow
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedTools.map((tool, i) => (
              <Link 
                key={i} 
                to={`/tool/${tool.id}`}
                className="group p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-600 transition-all shadow-sm flex flex-col justify-between h-full"
              >
                <div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `var(--${tool.color}-600, #4f46e5)` }}
                  >
                    <tool.icon size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{tool.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SEOBox;
