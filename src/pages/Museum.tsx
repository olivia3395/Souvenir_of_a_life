import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, Archive, Compass, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

interface SavedSouvenir {
  id: string;
  title: string;
  place: string;
  subtitle: string;
  narrative?: string;
  moodTags: string[];
  createdAt: any;
  themeRoom?: string;
  archiveNumber?: string;
  objectType?: string;
}

const EXHIBIT_TYPES = ['ticket', 'postcard', 'archive-card', 'envelope'];

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

  const getExhibitStyle = (index: number) => {
    const type = EXHIBIT_TYPES[index % EXHIBIT_TYPES.length];
    switch (type) {
      case 'ticket': return 'exhibit-ticket';
      case 'postcard': return 'exhibit-postcard';
      case 'archive-card': return 'exhibit-archive-card';
      case 'envelope': return 'exhibit-envelope-small';
      default: return 'museum-card';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-museum-accent)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* The Walk */}
      <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <header className="min-h-[60vh] flex flex-col items-center justify-center text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[var(--color-museum-accent)]/60">
              {language === 'en' ? 'Private Exhibition' : '私人展馆'}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.1em] text-[var(--color-museum-text)]">
              {language === 'en' ? 'The Archive' : '情绪档案馆'}
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-museum-accent)]/50 to-transparent mx-auto" />
            <p className="text-[var(--color-museum-muted)] font-serif italic text-xl md:text-2xl tracking-wide max-w-2xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'A quiet corridor of lives you haven\'t lived. Step closer to examine the fragments.' 
                : '一条寂静的长廊，陈列着你未曾经历的人生。走近些，凝视这些碎片。'}
            </p>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50"
          >
            <div className="w-px h-16 bg-gradient-to-b from-[var(--color-museum-accent)] to-transparent" />
          </motion.div>
        </header>

        {souvenirs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-center py-32"
          >
            <Archive className="w-12 h-12 text-[var(--color-museum-muted)]/20 mx-auto mb-8" />
            <p className="text-[var(--color-museum-muted)] font-serif italic text-xl mb-12">
              {language === 'en' ? 'The corridor is empty. No artifacts have been collected yet.' : '长廊空无一物。尚未收集任何展品。'}
            </p>
            <Link to="/entry" className="museum-button">
              {language === 'en' ? 'Begin Your Journey' : '开启旅程'}
            </Link>
          </motion.div>
        ) : (
          <div className="relative mt-32 pb-32">
            {/* Center Path Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-museum-accent)]/0 via-[var(--color-museum-accent)]/20 to-[var(--color-museum-accent)]/0 hidden md:block -translate-x-1/2" />

            {souvenirs.map((souvenir, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={souvenir.id}
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-10%", once: true }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col md:flex-row items-center gap-16 md:gap-32 py-32 md:py-48 group ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Center Node on the path */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[var(--color-museum-accent)]/30 bg-[#0c0a09] z-10 hidden md:block group-hover:bg-[var(--color-museum-accent)] group-hover:border-[var(--color-museum-accent)] transition-all duration-700 group-hover:shadow-[0_0_20px_rgba(197,168,122,0.6)] group-hover:scale-150" />

                  {/* Metadata / Text Side */}
                  <div className={`flex-1 w-full flex flex-col ${isEven ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} items-center text-center`}>
                    <div className={`space-y-8 max-w-md transition-all duration-1000 opacity-40 group-hover:opacity-100 ${isEven ? 'md:-translate-x-8 group-hover:translate-x-0' : 'md:translate-x-8 group-hover:translate-x-0'}`}>
                      <div className={`flex flex-col gap-3 ${isEven ? 'md:items-end' : 'md:items-start'} items-center`}>
                        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--color-museum-accent)]">
                          {souvenir.archiveNumber || `SYS.${index + 101}`}
                        </span>
                        <span className="px-3 py-1 border border-white/10 text-[9px] tracking-widest uppercase text-[var(--color-museum-muted)] rounded-sm bg-white/5">
                          {souvenir.themeRoom || 'Unassigned'}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-4xl md:text-5xl text-[var(--color-museum-text)] font-light leading-tight">
                        {souvenir.title}
                      </h3>
                      
                      <p className="font-serif italic text-[var(--color-museum-muted)]/80 text-xl leading-relaxed">
                        {souvenir.subtitle}
                      </p>

                      <div className="pt-8">
                        <Link 
                          to={`/museum/${souvenir.id}`}
                          className="inline-flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)] hover:text-[var(--color-museum-accent)] transition-colors group/link"
                        >
                          {language === 'en' ? 'Examine Artifact' : '观察展品'}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-2" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Exhibit Object Side */}
                  <div className="flex-1 w-full flex justify-center relative">
                    {/* Ambient Spotlight that follows the item */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-museum-accent)/0.15_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                    
                    <Link 
                      to={`/museum/${souvenir.id}`}
                      className={`relative z-10 block w-full max-w-sm ${getExhibitStyle(index)} transition-all duration-1000 group-hover:scale-105 group-hover:-translate-y-4 shadow-2xl group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] cursor-pointer`}
                    >
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-[9px] tracking-[0.2em] uppercase opacity-50">
                          <span>{souvenir.objectType || souvenir.place}</span>
                        </div>
                        <h4 className="font-serif text-2xl text-[#1c1816] leading-tight">
                          {souvenir.title}
                        </h4>
                        <div className="h-px w-12 bg-black/10" />
                        <p className="font-serif italic text-[#1c1816]/60 text-sm line-clamp-4 leading-relaxed">
                          {souvenir.narrative || souvenir.subtitle}
                        </p>
                      </div>
                      
                      {/* Glass reflection overlay for the object */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {souvenirs.length > 0 && (
          <footer className="pt-32 pb-32 text-center relative z-10">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-museum-border)] to-transparent mx-auto mb-12" />
            <p className="text-[var(--color-museum-muted)]/40 text-[10px] tracking-[0.5em] uppercase mb-12">
              {language === 'en' ? 'End of Corridor' : '长廊尽头'}
            </p>
            <Link to="/entry" className="museum-button">
              <Compass className="w-4 h-4 mr-3" />
              {language === 'en' ? 'Return to Entrance' : '返回入口'}
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}
