import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, Archive, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface SavedSouvenir {
  id: string;
  title: string;
  place: string;
  subtitle: string;
  moodTags: string[];
  createdAt: any;
  imageUrl?: string;
}

export function Museum() {
  const [souvenirs, setSouvenirs] = useState<SavedSouvenir[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'souvenirs'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedSouvenir[];
      setSouvenirs(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'souvenirs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-museum-muted)]" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
      <div className="mb-20 text-center space-y-6">
        <h1 className="font-serif text-5xl md:text-6xl font-light tracking-wide">
          {language === 'en' ? 'My Museum' : '我的博物馆'}
        </h1>
        <div className="h-px w-16 bg-[var(--color-museum-border)] mx-auto" />
        <p className="text-[var(--color-museum-muted)] font-serif italic text-xl md:text-2xl">
          {language === 'en' ? 'A collection of lives you almost lived.' : '那些你几乎要度过的人生合集。'}
        </p>
      </div>

      {souvenirs.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-[var(--color-museum-border)] rounded-3xl bg-[var(--color-museum-card)]/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-museum-border)]/5 to-transparent pointer-events-none" />
          <Archive className="w-16 h-16 text-[var(--color-museum-muted)]/30 mx-auto mb-8" />
          <h2 className="font-serif text-3xl mb-4 tracking-wide">
            {language === 'en' ? 'Your museum is empty' : '你的博物馆空空如也'}
          </h2>
          <p className="text-[var(--color-museum-muted)] font-serif italic mb-12 text-lg">
            {language === 'en' ? 'Return to the entrance to collect your first souvenir.' : '返回入口，收集你的第一件纪念品。'}
          </p>
          <Link 
            to="/entry" 
            className="inline-flex items-center justify-center px-10 py-5 font-medium tracking-[0.2em] text-xs uppercase bg-white text-black rounded-full transition-all duration-500 hover:scale-105 hover:bg-gray-100 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            {language === 'en' ? 'Find a Souvenir' : '寻找纪念品'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {souvenirs.map((souvenir, index) => (
            <div key={souvenir.id} className="group h-full">
              <Link 
                to={`/museum/${souvenir.id}`}
                className="block h-full bg-[var(--color-museum-card)] border border-[var(--color-museum-border)] rounded-2xl p-8 hover:border-[var(--color-museum-muted)] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-museum-border)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {souvenir.imageUrl && (
                  <div className="w-full h-48 mb-8 rounded-xl overflow-hidden border border-[var(--color-museum-border)] relative">
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none z-10" />
                    <img 
                      src={souvenir.imageUrl} 
                      alt={souvenir.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-museum-muted)] font-medium">
                    {souvenir.place}
                  </span>
                  {souvenir.createdAt?.toDate && (
                    <span className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[var(--color-museum-muted)]/70">
                      <Calendar className="w-3 h-3" />
                      {format(souvenir.createdAt.toDate(), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                
                <h3 className="font-serif text-3xl mb-4 group-hover:text-white transition-colors leading-tight">
                  {souvenir.title}
                </h3>
                
                <p className="font-serif italic text-[var(--color-museum-muted)] text-base line-clamp-2 mb-8 leading-relaxed">
                  {souvenir.subtitle}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-[var(--color-museum-border)]">
                  {souvenir.moodTags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full border border-[var(--color-museum-border)] text-[var(--color-museum-muted)] bg-white/5">
                      {tag}
                    </span>
                  ))}
                  {souvenir.moodTags.length > 3 && (
                    <span className="text-[10px] px-2 py-1.5 text-[var(--color-museum-muted)] flex items-center">
                      +{souvenir.moodTags.length - 3}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
