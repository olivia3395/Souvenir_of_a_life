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
  const [isKeyMissing, setIsKeyMissing] = useState(false);

  const fetchSouvenir = async () => {
    setLoading(true);
    setError(null);
    setIsKeyMissing(false);
    try {
      const result = await generateSouvenir(mood, reflection || '', genLanguage || language);
      setSouvenir(result);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_MISSING' || err.message.includes('API key not valid')) {
        setIsKeyMissing(true);
      }
      setError(err.message || 'Failed to generate souvenir. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mood) {
      navigate('/entry', { replace: true });
      return;
    }

    fetchSouvenir();
  }, [mood, reflection, navigate, genLanguage, language]);

  const handleSelectKey = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        // After selecting, try again
        fetchSouvenir();
      } else {
        alert(language === 'en' 
          ? "Please configure your GEMINI_API_KEY in the Secrets panel." 
          : "请在 Secrets 面板中配置您的 GEMINI_API_KEY。");
      }
    } catch (err) {
      console.error("Failed to open key selection:", err);
    }
  };

  const handleSave = async () => {
    if (!souvenir || !auth.currentUser) return;
    setSaving(true);
    try {
      let finalSouvenir = { ...souvenir };

      await addDoc(collection(db, 'souvenirs'), {
        userId: auth.currentUser.uid,
        ...finalSouvenir,
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
            <div className="absolute inset-0 border-[1px] border-[var(--color-museum-border)] rounded-sm animate-[spin_10s_linear_infinite]" />
            {/* Inner rotating ring */}
            <div className="absolute inset-4 border-[1px] border-[var(--color-museum-accent)]/10 rounded-sm animate-[spin_15s_linear_infinite_reverse]" />
            {/* Center pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[var(--color-museum-accent)] rounded-full animate-ping opacity-75" />
              <div className="absolute w-1 h-1 bg-[var(--color-museum-accent)] rounded-full" />
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            <h2 className="font-serif text-xl tracking-[0.4em] uppercase text-[var(--color-museum-text)]/80 animate-pulse">
              {language === 'en' ? 'Materializing...' : '正在具象化...'}
            </h2>
            <div className="h-px w-8 bg-[var(--color-museum-accent)]/30 mx-auto" />
            <p className="font-serif italic text-[var(--color-museum-muted)] text-sm tracking-widest">
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
        <div className="museum-card max-w-lg mx-auto shadow-2xl relative overflow-hidden bg-[#2a2421]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900/20 to-transparent" />
          
          <h2 className="font-serif text-3xl font-light text-[var(--color-museum-text)] mb-6 tracking-wide">
            {language === 'en' ? 'A timeline fracture occurred' : '时间线发生了断裂'}
          </h2>
          <div className="h-px w-12 bg-[var(--color-museum-border)] mx-auto mb-6" />
          <p className="text-[var(--color-museum-muted)] font-serif italic mb-12 text-lg leading-relaxed">
            {isKeyMissing 
              ? (language === 'en' 
                  ? 'The museum curator needs a special key to access the archives. Please provide a Gemini API key.' 
                  : '博物馆馆长需要一把特殊的钥匙来访问档案。请提供 Gemini API 密钥。')
              : (error || (language === 'en' ? 'The souvenir could not be retrieved from the void.' : '无法从虚空中找回这件纪念品。'))}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isKeyMissing && (
              <button 
                onClick={handleSelectKey}
                className="museum-button px-8 py-4 bg-[var(--color-museum-accent)]/10 text-[var(--color-museum-text)] border-[var(--color-museum-accent)]/30"
              >
                {language === 'en' ? 'Provide API Key' : '提供 API 密钥'}
              </button>
            )}
            
            <button 
              onClick={() => navigate('/entry')} 
              className="museum-button px-8 py-4 bg-transparent text-[var(--color-museum-text)] border-[var(--color-museum-border)]"
            >
              <ArrowLeft className="w-4 h-4 mr-3" /> {language === 'en' ? 'Return to Present' : '返回现在'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-corridor py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* The Display Case */}
        <div className="relative">
          {/* Spotlight from above */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-museum-accent)]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="bg-[#1c1816] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Glass reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-20" />
            
            <div className="p-8 md:p-20 relative z-10">
              <div className="text-center space-y-10 mb-20">
                <p className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-museum-accent)] font-medium">
                  {souvenir.place}
                </p>
                <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight tracking-[0.1em] text-[var(--color-museum-text)]">
                  {souvenir.title}
                </h1>
                <div className="h-px w-16 bg-[var(--color-museum-accent)]/30 mx-auto" />
                <p className="font-serif italic text-xl md:text-3xl text-[var(--color-museum-muted)]/80 max-w-3xl mx-auto">
                  {souvenir.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 max-w-5xl mx-auto">
                <div className="lg:col-span-8 space-y-12">
                  <div className="prose prose-invert prose-p:font-serif prose-p:leading-[2] prose-p:text-[var(--color-museum-text)]/90 prose-p:text-xl">
                    {(souvenir.narrative || '').split('\n').map((paragraph, i) => (
                      <p key={i} className={paragraph.trim() ? 'mb-8' : ''}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                  <div className="bg-black/20 p-8 border border-white/5 space-y-8">
                    <div>
                      <h3 className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-museum-accent)] mb-6">
                        {language === 'en' ? 'Archival Context' : '档案背景'}
                      </h3>
                      <p className="font-serif italic text-[var(--color-museum-muted)] leading-relaxed text-lg">
                        {souvenir.interpretation}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <h3 className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-museum-accent)] mb-6">
                        {language === 'en' ? 'Mood Signatures' : '情绪签名'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(souvenir.moodTags || []).map((tag, i) => (
                          <span key={i} className="text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-[var(--color-museum-muted)] bg-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 flex justify-center lg:justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      className={`museum-button px-10 py-5 gap-4 ${
                        saved 
                          ? 'bg-emerald-900/5 text-emerald-400/70 border-emerald-900/20' 
                          : 'bg-transparent text-[var(--color-museum-text)] hover:shadow-[0_0_40px_rgba(197,168,122,0.1)]'
                      }`}
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : saved ? (
                        <>
                          <BookmarkCheck className="w-5 h-5" />
                          <span>{language === 'en' ? 'Archived' : '已归档'}</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-5 h-5" />
                          <span>{language === 'en' ? 'Archive Souvenir' : '归档纪念品'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
