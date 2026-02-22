/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  Type as TypeIcon,
  Info,
  PenTool
} from 'lucide-react';
import { translateTextStream, TranslationResult } from './services/geminiService';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi', 
  'Dutch', 'Turkish', 'Vietnamese', 'Thai', 'Greek', 'Swedish'
];

const TONES = [
  { id: 'Neutral', label: 'Neutral', desc: 'Balanced and clear' },
  { id: 'Creative', label: 'Creative', desc: 'Poetic and descriptive' },
  { id: 'Formal', label: 'Formal', desc: 'Professional and serious' },
  { id: 'Academic', label: 'Academic', desc: 'Technical and precise' },
  { id: 'Casual', label: 'Casual', desc: 'Friendly and conversational' },
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [tone, setTone] = useState('Neutral');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<(TranslationResult & { translatorNotes?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(words / 200); // Avg 200 wpm
    return { words, readingTime };
  }, [inputText]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      let fullText = '';
      const stream = translateTextStream(inputText, {
        targetLanguage,
        tone,
        context
      });
      
      for await (const chunk of stream) {
        fullText += chunk;
        setResult(prev => ({
          translatedText: fullText,
          detectedLanguage: prev?.detectedLanguage || 'Detecting...',
          translatorNotes: prev?.translatorNotes
        }));
      }
    } catch (err) {
      setError('The manuscript could not be processed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setContext('');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#2D3047] selection:text-white">
      {/* Editorial Header */}
      <header className="border-b border-[#1A1A1A]/5 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2D3047] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#2D3047]/10">
              <PenTool size={22} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight leading-none">Author's Linguist</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1 font-medium">Literary Translation Studio</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-medium uppercase tracking-wider opacity-50">
            <span className="flex items-center gap-1.5"><BookOpen size={14} /> Manuscripts</span>
            <span className="flex items-center gap-1.5"><TypeIcon size={14} /> Typography</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-7 space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-serif italic opacity-60">Source Manuscript</h2>
                <div className="flex items-center gap-4 text-[10px] font-mono opacity-40 uppercase tracking-widest">
                  <span>{metrics.words} Words</span>
                  <span>~{metrics.readingTime} Min Read</span>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your chapter, poem, or prose here..."
                  className="w-full h-[400px] p-8 bg-white border border-[#1A1A1A]/10 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-[#2D3047]/5 focus:border-[#2D3047] transition-all resize-none text-lg leading-relaxed font-serif"
                />
                <button 
                  onClick={handleClear}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  title="Clear manuscript"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-widest font-bold opacity-40 px-1">Target Language</label>
                <div className="relative">
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#1A1A1A]/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#2D3047]/5 cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <ArrowRightLeft size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-widest font-bold opacity-40 px-1">Literary Tone</label>
                <div className="relative">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#1A1A1A]/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#2D3047]/5 cursor-pointer"
                  >
                    {TONES.map(t => (
                      <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>
                    ))}
                  </select>
                  <Sparkles size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <label className="text-[11px] uppercase tracking-widest font-bold opacity-40 px-1 flex items-center gap-2">
                Contextual Notes <Info size={12} />
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., 'Protagonist is a 19th-century detective', 'Maintain the rhyme scheme'"
                className="w-full bg-white border border-[#1A1A1A]/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#2D3047]/5"
              />
            </motion.section>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-[#2D3047] text-white py-5 rounded-2xl font-serif text-lg font-bold flex items-center justify-center gap-3 hover:bg-[#1A1D2E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#2D3047]/20 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Refining Translation...</span>
                </>
              ) : (
                <>
                  <Languages size={24} />
                  <span>Translate Manuscript</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output & Notes */}
          <div className="lg:col-span-5 space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-serif italic opacity-60">Translated Work</h2>
                {result && (
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                )}
              </div>

              <div className="relative flex-1 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {!result && !isLoading && !error ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#1A1A1A]/5 rounded-[2rem] bg-white/30"
                    >
                      <PenTool size={48} className="opacity-5 mb-6" />
                      <h3 className="text-lg font-serif italic opacity-30 mb-2">Ready for translation</h3>
                      <p className="text-xs opacity-20 max-w-[240px] leading-relaxed">
                        Your translated manuscript will appear here with literary precision.
                      </p>
                    </motion.div>
                  ) : isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-[2rem] z-10"
                    >
                      <div className="relative">
                        <Loader2 size={48} className="animate-spin text-[#2D3047]" />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-[#2D3047]/10 rounded-full blur-xl"
                        />
                      </div>
                      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-[#2D3047] opacity-60">Analyzing Nuance</p>
                    </motion.div>
                  ) : error ? (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 bg-red-50 border border-red-100 text-red-600 rounded-[2rem] font-serif italic"
                    >
                      {error}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full flex flex-col gap-6"
                    >
                      <div className="flex-1 p-8 bg-white border border-[#1A1A1A]/10 rounded-[2rem] shadow-sm text-lg leading-relaxed font-serif overflow-auto">
                        {result.translatedText}
                      </div>

                      {result.translatorNotes && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="p-6 bg-[#2D3047]/5 border border-[#2D3047]/10 rounded-2xl"
                        >
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">
                            <Info size={12} /> Translator's Notes
                          </div>
                          <p className="text-xs leading-relaxed opacity-70 italic font-serif">
                            {result.translatorNotes}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1A1A1A]/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 opacity-40">
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest">About Linguist</h4>
            <p className="text-xs leading-relaxed font-serif italic">
              A specialized studio designed for authors to bridge language gaps without losing the soul of their writing.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest">Technology</h4>
            <p className="text-xs leading-relaxed">
              Powered by Gemini 3 Flash. Optimized for creative prose, poetry, and technical manuscripts.
            </p>
          </div>
          <div className="flex flex-col justify-end items-end gap-2 text-[10px] font-mono uppercase tracking-widest">
            <div>© 2026 Author's Linguist Studio</div>
            <div className="flex gap-4">
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Privacy</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
