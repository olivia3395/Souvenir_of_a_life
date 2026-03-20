import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { GeneratedSouvenir } from '../lib/gemini';
import { useLanguage } from '../contexts/LanguageContext';

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
    <div className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
      <div>
        <Link 
          to="/museum" 
          className="inline-flex items-center gap-2 text-sm text-[var(--color-museum-muted)] hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> {language === 'en' ? 'Back to Museum' : '返回博物馆'}
        </Link>

        <div className="bg-[var(--color-museum-card)] border border-[var(--color-museum-border)] rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-museum-border)] to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-museum-border)] to-transparent opacity-50" />
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4">
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--color-museum-muted)] font-medium">
              {souvenir.place}
            </span>
            {souvenir.createdAt?.toDate && (
              <span className="flex items-center gap-2 text-xs tracking-widest uppercase text-[var(--color-museum-muted)]/70">
                <Calendar className="w-3 h-3" />
                {format(souvenir.createdAt.toDate(), 'MMMM d, yyyy')}
              </span>
            )}
          </div>

          <div className="text-center space-y-8 mb-16">
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
              {souvenir.narrative.split('\n').map((paragraph, i) => (
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
              {souvenir.moodTags.map((tag, i) => (
                <span key={i} className="text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-[var(--color-museum-border)] text-[var(--color-museum-muted)] bg-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-[var(--color-museum-border)] flex justify-center md:justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs tracking-widest uppercase flex items-center gap-2 text-[var(--color-museum-muted)] hover:text-red-400 transition-colors px-4 py-2 rounded-full hover:bg-red-400/10"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              {language === 'en' ? 'Discard Souvenir' : '丢弃纪念品'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
