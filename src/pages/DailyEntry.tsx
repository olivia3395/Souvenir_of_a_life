import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

const MOODS_EN = [
  'restless', 'lonely', 'hopeful', 'nostalgic', 
  'tender', 'overwhelmed', 'almost-brave', 'numb'
];

const MOODS_ZH = [
  '焦躁不安', '孤独', '充满希望', '怀旧', 
  '温柔', '不知所措', '差一点就勇敢', '麻木'
];

export function DailyEntry() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  const moods = language === 'en' ? MOODS_EN : MOODS_ZH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMoodIndex === null) return;

    setIsGenerating(true);
    try {
      navigate('/reveal', { 
        state: { 
          mood: MOODS_EN[selectedMoodIndex], 
          reflection,
          language
        } 
      });
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full">
      <div className="w-full space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-[var(--color-museum-text)]">
            {language === 'en' ? 'How do you feel today?' : '你今天感觉如何？'}
          </h1>
          <div className="h-px w-12 bg-[var(--color-museum-accent)]/30 mx-auto" />
          <p className="text-[var(--color-museum-muted)] font-serif italic text-lg md:text-xl">
            {language === 'en' ? 'Select a mood that resonates with you right now.' : '选择一个与你此刻共鸣的情绪。'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
          >
            {moods.map((mood, index) => (
              <motion.button
                key={mood}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 + (index * 0.05) }}
                onClick={() => setSelectedMoodIndex(index)}
                className={`px-8 py-4 rounded-full text-[10px] tracking-[0.3em] uppercase transition-all duration-700 border ${
                  selectedMoodIndex === index 
                    ? 'bg-[var(--color-museum-accent)] text-[var(--color-museum-bg)] border-[var(--color-museum-accent)] shadow-[0_0_30px_rgba(197,168,122,0.15)] scale-105' 
                    : 'bg-transparent text-[var(--color-museum-muted)] border-[var(--color-museum-btn-border)] hover:border-[var(--color-museum-accent)]/40 hover:text-[var(--color-museum-text)] hover:bg-[var(--color-museum-btn-hover)]'
                }`}
              >
                {mood}
              </motion.button>
            ))}
          </motion.div>

          {/* Exhibit Stand */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="exhibit-stand max-w-2xl mx-auto w-full relative"
          >
            {/* Spotlight illumination effect */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3, delay: 1.5 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-museum-accent)/0.05_0%,transparent_70%)] pointer-events-none -z-10"
            />

            <div className="text-center">
              <span className="museum-label">
                {language === 'en' ? 'Exhibit No. 042' : '展品编号 042'}
              </span>
            </div>

            <div className="envelope-container">
              <AnimatePresence mode="wait">
                {!isEnvelopeOpen ? (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="envelope-body cursor-pointer group"
                    onClick={() => setIsEnvelopeOpen(true)}
                  >
                    <div className="envelope-crease" />
                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                      <Mail className="w-8 h-8 text-[#1c1816]/30" />
                      <h2 className="font-serif text-2xl md:text-3xl text-[#1c1816]/70 italic">
                        {language === 'en' ? 'A note never sent' : '未寄出的信'}
                      </h2>
                      
                      <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#1c1816]/40 group-hover:text-[#1c1816]/60 transition-colors">
                        <span>{language === 'en' ? 'Open Exhibit' : '打开展品'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="envelope-body !p-0"
                  >
                    <div className="p-8 md:p-12 space-y-6">
                      <label htmlFor="reflection" className="block text-center font-serif text-[#1c1816]/60 italic text-lg md:text-xl">
                        {language === 'en' 
                          ? 'Unfold your thoughts...' 
                          : '展开你的思绪...'}
                      </label>
                      <textarea
                        id="reflection"
                        autoFocus
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder={language === 'en' ? 'Write a short reflection...' : '写下一段简短的感悟...'}
                        className="w-full bg-transparent border-none p-0 text-lg md:text-xl font-serif text-[#1c1816]/80 placeholder:text-[#1c1816]/20 focus:outline-none focus:ring-0 transition-all resize-none h-48 leading-relaxed"
                      />
                      
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setIsEnvelopeOpen(false)}
                          className="text-[9px] tracking-[0.2em] uppercase text-[#1c1816]/40 hover:text-[#1c1816]/60 transition-colors"
                        >
                          {language === 'en' ? 'Fold Note' : '折叠信件'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={selectedMoodIndex === null || isGenerating}
              className="museum-button px-12 py-5 bg-transparent text-[var(--color-museum-text)] disabled:opacity-20 disabled:hover:scale-100 hover:shadow-[0_0_40px_rgba(197,168,122,0.1)] border-[var(--color-museum-accent)]/30"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="relative z-10">{language === 'en' ? 'Find My Souvenir' : '寻找我的纪念品'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
