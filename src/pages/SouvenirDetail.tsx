import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { GeneratedSouvenir } from '../lib/gemini';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

interface SavedSouvenir extends GeneratedSouvenir {
  id: string;
  createdAt: any;
  isFavorited: boolean;
}

export function SouvenirDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [souvenir, setSouvenir] = useState<SavedSouvenir | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const fetchSouvenir = async () => {
      try {
        const docRef = doc(db, 'souvenirs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().userId === auth.currentUser?.uid) {
          setSouvenir({ id: docSnap.id, ...docSnap.data() } as SavedSouvenir);
        } else {
          navigate('/museum', { replace: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `souvenirs/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSouvenir();
  }, [id, navigate]);

  const handleDelete = async () => {
    const confirmMessage = language === 'en' 
      ? 'Are you sure you want to discard this souvenir?' 
      : '你确定要丢弃这件纪念品吗？';
      
    if (!id || !window.confirm(confirmMessage)) return;
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'souvenirs', id));
      navigate('/museum', { replace: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `souvenirs/${id}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-museum-muted)]" />
      </div>
    );
  }

  if (!souvenir) return null;

  return (
    <div className="gallery-corridor py-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link 
          to="/museum" 
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)] hover:text-[var(--color-museum-accent)] transition-colors mb-16 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          {language === 'en' ? 'Back to Archive' : '返回档案库'}
        </Link>

        {/* The Display Case */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Spotlight from above */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--color-museum-accent)]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="bg-[#1c1816] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Glass reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-20" />
            
            <div className="p-8 md:p-20 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--color-museum-accent)] font-medium mb-2">
                    {souvenir.place}
                  </span>
                  <div className="h-px w-12 bg-[var(--color-museum-accent)]/30" />
                </div>
                
                {souvenir.createdAt?.toDate && (
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)]/60">
                    <Calendar className="w-3 h-3" />
                    {format(souvenir.createdAt.toDate(), 'MMMM d, yyyy')}
                  </div>
                )}
              </div>

              <div className="text-center space-y-10 mb-20">
                <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight tracking-[0.1em] text-[var(--color-museum-text)]">
                  {souvenir.title}
                </h1>
                <p className="font-serif italic text-xl md:text-3xl text-[var(--color-museum-muted)]/80 max-w-3xl mx-auto">
                  {souvenir.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 max-w-5xl mx-auto">
                <div className="lg:col-span-8 space-y-12">
                  <div className="prose prose-invert prose-p:font-serif prose-p:leading-[2] prose-p:text-[var(--color-museum-text)]/90 prose-p:text-xl">
                    {souvenir.narrative.split('\n').map((paragraph, i) => (
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
                        {souvenir.moodTags.map((tag, i) => (
                          <span key={i} className="text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/10 text-[var(--color-museum-muted)] bg-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 flex justify-center lg:justify-end">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-[9px] tracking-[0.3em] uppercase flex items-center gap-3 text-[var(--color-museum-muted)]/40 hover:text-red-400 transition-all duration-500 hover:tracking-[0.5em]"
                    >
                      {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      {language === 'en' ? 'Deaccession Artifact' : '撤除展品'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-32 text-center">
          <Link to="/museum" className="museum-button">
            {language === 'en' ? 'Return to Corridor' : '返回长廊'}
          </Link>
        </div>
      </div>
    </div>
  );
}
