import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { generateSouvenir, GeneratedSouvenir } from '../lib/gemini';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

export function Reveal() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { mood, reflection, language: genLanguage } = location.state || {};

  const [souvenir, setSouvenir] = useState<GeneratedSouvenir | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mood) {
      navigate('/entry', { replace: true });
      return;
    }

    const fetchSouvenir = async () => {
      try {
        const result = await generateSouvenir(mood, reflection || '', genLanguage || language);
        setSouvenir(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to generate souvenir. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSouvenir();
  }, [mood, reflection, navigate, genLanguage, language]);

  const handleSave = async () => {
    if (!souvenir || !auth.currentUser) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'souvenirs'), {
        userId: auth.currentUser.uid,
        ...souvenir,
        createdAt: serverTimestamp(),
        isFavorited: false,
      });
      setSaved(true);
      setTimeout(() => navigate('/museum'), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'souvenirs');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center space-y-12 max-w-md mx-auto relative">
          {/* Atmospheric glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-museum-accent)]/5 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative w-32 h-32 mx-auto">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-[1px] border-[var(--color-museum-border)] rounded-full animate-[spin_8s_linear_infinite]" />
            {/* Inner rotating ring */}
            <div className="absolute inset-4 border-[1px] border-[var(--color-museum-muted)]/20 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
            {/* Center pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[var(--color-museum-accent)] rounded-full animate-ping opacity-75" />
              <div className="absolute w-1.5 h-1.5 bg-[var(--color-museum-accent)] rounded-full" />
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            <h2 className="font-serif text-2xl tracking-[0.2em] uppercase text-[var(--color-museum-text)]/90 animate-pulse">
              {language === 'en' ? 'Materializing...' : '正在具象化...'}
            </h2>
            <div className="h-px w-12 bg-[var(--color-museum-border)] mx-auto" />
            <p className="font-serif italic text-[var(--color-museum-muted)] text-base tracking-wide">
              {language === 'en' ? 'Reaching into parallel timelines' : '正在触及平行时间线'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !souvenir) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="p-12 max-w-lg mx-auto bg-[var(--color-museum-card)] rounded-3xl border border-[var(--color-museum-border)] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900/30 to-transparent" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-900/5 rounded-full blur-3xl" />
          
          <h2 className="font-serif text-3xl font-light text-[var(--color-museum-text)] mb-6 tracking-wide">
            {language === 'en' ? 'A timeline fracture occurred' : '时间线发生了断裂'}
          </h2>
          <div className="h-px w-16 bg-[var(--color-museum-border)] mx-auto mb-6" />
          <p className="text-[var(--color-museum-muted)] font-serif italic mb-12 text-lg leading-relaxed">
            {error || (language === 'en' ? 'The souvenir could not be retrieved from the void.' : '无法从虚空中找回这件纪念品。')}
          </p>
          <button 
            onClick={() => navigate('/entry')} 
            className="inline-flex items-center justify-center gap-3 px-8 py-4 font-medium tracking-widest text-xs uppercase border border-[var(--color-museum-border)] hover:bg-white hover:text-black rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> {language === 'en' ? 'Return to Present' : '返回现在'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full">
      <div className="w-full bg-[var(--color-museum-card)] border border-[var(--color-museum-border)] rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-museum-border)] to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-museum-border)] to-transparent opacity-50" />
          
          <div className="text-center space-y-8 mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-museum-muted)] font-medium">
              {souvenir.place}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-light leading-tight tracking-wide">
              {souvenir.title}
            </h1>
            <div className="h-px w-24 bg-[var(--color-museum-border)] mx-auto" />
            <p className="font-serif italic text-xl md:text-2xl text-[var(--color-museum-muted)]">
              {souvenir.subtitle}
            </p>
          </div>

          {souvenir.imageUrl && (
            <div className="mb-16 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-[var(--color-museum-border)] shadow-2xl relative">
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
              <img 
                src={souvenir.imageUrl} 
                alt={souvenir.title} 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="space-y-12 max-w-3xl mx-auto">
            <div className="prose prose-invert prose-p:font-serif prose-p:leading-loose prose-p:text-[var(--color-museum-text)]/90 prose-p:text-lg">
              {(souvenir.narrative || '').split('\n').map((paragraph, i) => (
                <p key={i} className={paragraph.trim() ? 'mb-6' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="border-t border-[var(--color-museum-border)] pt-12 mt-12 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-museum-card)] border border-[var(--color-museum-border)] rotate-45" />
              <h3 className="text-xs tracking-[0.2em] uppercase text-[var(--color-museum-muted)] mb-6 text-center">
                {language === 'en' ? 'Why it found you now' : '为什么它现在找到了你'}
              </h3>
              <p className="font-serif italic text-[var(--color-museum-muted)] leading-loose text-lg text-center max-w-2xl mx-auto">
                {souvenir.interpretation}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-8">
              {(souvenir.moodTags || []).map((tag, i) => (
                <span key={i} className="text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-[var(--color-museum-border)] text-[var(--color-museum-muted)] bg-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-20 flex justify-center">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`group relative inline-flex items-center justify-center gap-4 px-10 py-5 font-medium tracking-[0.2em] text-xs uppercase rounded-full overflow-hidden transition-all duration-500 ${
                saved 
                  ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/30' 
                  : 'bg-white text-black hover:bg-gray-100 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <>
                  <BookmarkCheck className="w-5 h-5" />
                  <span>{language === 'en' ? 'Saved to Museum' : '已保存至博物馆'}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5" />
                  <span>{language === 'en' ? 'Save to Museum' : '保存至博物馆'}</span>
                </>
              )}
            </button>
          </div>
        </div>
    </div>
  );
}
