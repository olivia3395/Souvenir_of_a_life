import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Landing() {
  const { user, signIn } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/entry" replace />;
  }

  const handleSignIn = async () => {
    try {
      await signIn();
      navigate('/entry');
    } catch (error) {
      // Error is handled in context
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Atmospheric background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--color-museum-border)]/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full text-center relative z-10">
        <h1 className="font-serif text-6xl md:text-8xl font-light tracking-wide leading-tight mb-12">
          {language === 'en' ? (
            <>
              Souvenirs of a Life<br />
              <span className="italic text-[var(--color-museum-muted)]">Not Yet Lived</span>
            </>
          ) : (
            <span className="text-5xl md:text-7xl block tracking-widest">未曾经历的人生纪念品</span>
          )}
        </h1>
        
        <div className="h-px w-24 bg-[var(--color-museum-border)] mx-auto mb-12" />
        
        <p className="text-xl md:text-2xl text-[var(--color-museum-muted)] font-serif leading-loose mb-16 max-w-2xl mx-auto">
          {language === 'en' 
            ? 'A personal digital museum of unlived lives. Return over time, reflect on your current mood, and receive a beautifully crafted keepsake from a parallel life you have not lived yet.'
            : '一座关于未曾经历的人生的个人数字博物馆。随着时间的推移，记录你此刻的心境，并从你未曾经历的平行人生中，获得一份精美的纪念品。'}
        </p>

        <button
          onClick={handleSignIn}
          className="group relative inline-flex items-center justify-center px-10 py-5 font-medium tracking-[0.2em] text-xs uppercase bg-white text-black rounded-full overflow-hidden transition-all duration-500 hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10">{language === 'en' ? 'Open Your Museum' : '开启你的博物馆'}</span>
          <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        </button>
      </div>
    </div>
  );
}
