import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

  const moods = language === 'en' ? MOODS_EN : MOODS_ZH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMoodIndex === null) return;

    setIsGenerating(true);
    try {
      // Pass the English mood to the generator for consistency, 
      // but we will also pass the language preference.
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
        <div className="text-center space-y-6">
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide">
            {language === 'en' ? 'How do you feel today?' : '你今天感觉如何？'}
          </h1>
          <div className="h-px w-16 bg-[var(--color-museum-border)] mx-auto" />
          <p className="text-[var(--color-museum-muted)] font-serif italic text-lg md:text-xl">
            {language === 'en' ? 'Select a mood that resonates with you right now.' : '选择一个与你此刻共鸣的情绪。'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {moods.map((mood, index) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMoodIndex(index)}
                className={`px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-all duration-500 border ${
                  selectedMoodIndex === index 
                    ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-105' 
                    : 'bg-transparent text-[var(--color-museum-muted)] border-[var(--color-museum-border)] hover:border-white/30 hover:text-white hover:bg-white/5'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          <div className="space-y-6 max-w-2xl mx-auto relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-transparent via-[var(--color-museum-card)] to-transparent opacity-50 pointer-events-none blur-xl" />
            <label htmlFor="reflection" className="block text-center font-serif text-[var(--color-museum-muted)] italic text-lg md:text-xl relative z-10">
              {language === 'en' 
                ? 'What kind of life have you been standing just outside of? (Optional)' 
                : '你一直徘徊在怎样的人生门外？ (可选)'}
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={language === 'en' ? 'Write a short reflection...' : '写下一段简短的感悟...'}
              className="w-full bg-[var(--color-museum-card)] border border-[var(--color-museum-border)] rounded-2xl p-6 text-base md:text-lg font-serif text-[var(--color-museum-text)] placeholder:text-[var(--color-museum-muted)]/30 focus:outline-none focus:border-[var(--color-museum-muted)] focus:ring-1 focus:ring-[var(--color-museum-muted)] transition-all resize-none h-40 relative z-10 shadow-inner"
            />
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={selectedMoodIndex === null || isGenerating}
              className="group relative inline-flex items-center justify-center px-10 py-5 font-medium tracking-[0.2em] text-xs uppercase bg-white text-black rounded-full overflow-hidden transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
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
