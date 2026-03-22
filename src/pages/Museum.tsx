import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Loader2, Archive, Calendar, Compass, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

interface SavedSouvenir {
  id: string;
  title: string;
  place: string;
  subtitle: string;
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

  const groupedSouvenirs = souvenirs.reduce((acc, souvenir) => {
    const room = souvenir.themeRoom || 'Lives Not Yet Begun';
    if (!acc[room]) {
      acc[room] = [];
    }
    acc[room].push(souvenir);
    return acc;
  }, {} as Record<string, SavedSouvenir[]>);

  const roomNames = Object.keys(groupedSouvenirs);

  const getExhibitStyle = (index: number) => {
    const type = EXHIBIT_TYPES[index % EXHIBIT_TYPES.length];
    switch (type) {
      case 'ticket': return 'exhibit-ticket max-w-sm';
      case 'postcard': return 'exhibit-postcard max-w-md';
      case 'archive-card': return 'exhibit-archive-card max-w-lg';
      case 'envelope': return 'exhibit-envelope-small max-w-sm';
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
    <div className="gallery-corridor">
      <div className="gallery-wall">
        <header className="text-center mb-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-serif text-5xl md:text-7xl font-light tracking-[0.2em] text-[var(--color-museum-text)] mb-6">
              {language === 'en' ? 'The Archive' : '档案库'}
            </h1>
            <div className="h-px w-12 bg-[var(--color-museum-accent)]/30 mx-auto mb-6" />
            <p className="text-[var(--color-museum-muted)] font-serif italic text-lg tracking-widest">
              {language === 'en' ? 'A walk through the lives you haven\'t lived.' : '漫步于你未曾经历的人生。'}
            </p>
          </motion.div>
        </header>

        {souvenirs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-center py-20"
          >
            <Archive className="w-12 h-12 text-[var(--color-museum-muted)]/20 mx-auto mb-6" />
            <p className="text-[var(--color-museum-muted)] font-serif italic">
              {language === 'en' ? 'The corridor is quiet. No artifacts yet.' : '长廊寂静无声。尚无展品。'}
            </p>
            <Link to="/entry" className="museum-button mt-12">
              {language === 'en' ? 'Begin Your Journey' : '开启旅程'}
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-64">
            {roomNames.map((roomName, roomIndex) => (
              <div key={roomName} className="relative">
                {/* Room Header */}
                <div className="sticky top-24 z-20 mb-32 text-center">
                  <div className="inline-block bg-transparent backdrop-blur-md px-8 py-4 border border-white/5 shadow-2xl">
                    <h2 className="font-serif text-2xl md:text-3xl text-[var(--color-museum-accent)] mb-2">
                      {roomName}
                    </h2>
                    <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-[var(--color-museum-muted)]/60">
                      {language === 'en' ? `Gallery ${roomIndex + 1}` : `展厅 ${roomIndex + 1}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-[40vh]">
                  {groupedSouvenirs[roomName].map((souvenir, index) => (
                    <motion.div 
                      key={souvenir.id}
                      initial={{ opacity: 0, y: 100, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ margin: "-20%", once: false }}
                      transition={{ duration: 1.5, delay: index === 0 ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] }}
                      className="exhibit-item-container relative flex flex-col items-center px-6"
                    >
                      {/* Spotlight effect */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 2, delay: index === 0 ? 0.6 : 0.4 }}
                        className="spotlight breathing-light" 
                      />

                      {/* Curator Label Above */}
                      <div className="mb-8 flex flex-col items-center gap-1">
                        <span className="curator-label">
                          {language === 'en' ? 'Accession' : '馆藏编号'}
                        </span>
                        <span className="accession-number">
                          {souvenir.archiveNumber || `${new Date(souvenir.createdAt?.toDate() || Date.now()).getFullYear()}.${index + 101}.${souvenir.id.slice(-4).toUpperCase()}`}
                        </span>
                      </div>

                      {/* The Exhibit Item */}
                      <Link 
                        to={`/museum/${souvenir.id}`}
                        className={`group relative z-10 block w-full ${getExhibitStyle(index)} glass-display transition-all duration-700 hover:scale-[1.02]`}
                      >
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase opacity-60">
                              <span>{souvenir.objectType || souvenir.place}</span>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {souvenir.createdAt?.toDate && format(souvenir.createdAt.toDate(), 'MMM yyyy')}
                              </div>
                            </div>
                            
                            <h3 className="font-serif text-3xl text-[#1c1816] leading-tight">
                              {souvenir.title}
                            </h3>
                            
                            <p className="font-serif italic text-[#1c1816]/60 text-sm line-clamp-2">
                              {souvenir.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Approach indicator */}
                        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                          <ArrowRight className="w-6 h-6 text-[var(--color-museum-accent)]" />
                        </div>
                      </Link>

                      {/* Exhibit Label Tag */}
                      <div className="exhibit-label-tag text-center">
                        <div className="mb-1 opacity-40">ITEM NO. {souvenirs.length - index}</div>
                        <div className="font-serif italic text-xs text-[var(--color-museum-text)]">
                          {language === 'en' ? 'Acquired from parallel timeline' : '获取自平行时间线'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="pt-64 pb-32 text-center">
          <div className="h-px w-24 bg-[var(--color-museum-border)] mx-auto mb-12" />
          <p className="text-[var(--color-museum-muted)]/40 text-[10px] tracking-[0.5em] uppercase">
            {language === 'en' ? 'End of Corridor' : '长廊尽头'}
          </p>
          <Link to="/entry" className="museum-button mt-12">
            <Compass className="w-4 h-4 mr-3" />
            {language === 'en' ? 'Return to Entrance' : '返回入口'}
          </Link>
        </footer>
      </div>
    </div>
  );
}
