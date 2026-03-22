import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Landing() {
  const { user, signInGuest } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/entry" replace />;
  }

  const handleEnter = async () => {
    setLoading(true);
    try {
      await signInGuest();
      navigate('/entry');
    } catch (error) {
      // Error is handled in context (alerts for missing config)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="max-w-3xl w-full text-center relative z-10">
        <div className="mb-8 inline-block">
          <div className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-museum-accent)] mb-4 font-medium">
            {language === 'en' ? 'Established in Parallel' : '建立于平行时空'}
          </div>
          <div className="h-px w-12 bg-[var(--color-museum-accent)]/30 mx-auto" />
        </div>

        <h1 className="font-serif text-6xl md:text-8xl font-light tracking-wide leading-tight mb-12 text-[var(--color-museum-text)]">
          {language === 'en' ? (
            <>
              Souvenirs of a Life<br />
              <span className="italic text-[var(--color-museum-muted)] opacity-80">Not Yet Lived</span>
            </>
          ) : (
            <span className="text-5xl md:text-7xl block tracking-[0.2em]">未曾经历的人生纪念品</span>
          )}
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-museum-muted)] font-serif leading-loose mb-16 max-w-2xl mx-auto italic">
          {language === 'en' 
            ? 'A quiet archive of the paths you didn\'t take. Reflect on your journey, and receive a keepsake from a faraway version of yourself.'
            : '一座关于你未曾选择的道路的静谧档案。回望你的旅程，并从那个遥远的自己手中，收到一份纪念。'}
        </p>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleEnter}
            disabled={loading}
            className="museum-button px-12 py-6 text-[11px] tracking-[0.4em] bg-[var(--color-museum-accent)]/10 text-[var(--color-museum-text)] hover:shadow-[0_0_50px_rgba(197,168,122,0.1)] border-[var(--color-museum-accent)]/30 w-full max-w-sm"
          >
            <span className="relative z-10">
              {loading 
                ? (language === 'en' ? 'ENTERING...' : '进入中...') 
                : (language === 'en' ? 'ENTER THE ARCHIVE' : '进入档案库')}
            </span>
          </button>
        </div>
        
        <div className="mt-20 flex items-center justify-center gap-4 text-[9px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)]/40">
          <div className="h-px w-8 bg-[var(--color-museum-border)]" />
          <span>{language === 'en' ? 'Traveler\'s Log' : '旅行日志'}</span>
          <div className="h-px w-8 bg-[var(--color-museum-border)]" />
        </div>
      </div>
    </div>
  );
}
