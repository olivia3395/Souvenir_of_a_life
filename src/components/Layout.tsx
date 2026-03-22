import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, Archive, Compass, Globe } from 'lucide-react';
import { MuseumAmbience } from './MuseumAmbience';
import { motion } from 'motion/react';

export function Layout() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-museum-bg)] text-[var(--color-museum-text)] flex flex-col selection:bg-[var(--color-museum-accent)]/20 selection:text-[var(--color-museum-text)]">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-[var(--color-museum-header-border)] bg-[var(--color-museum-bg)]/90 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to={user ? "/entry" : "/"} className="font-serif italic text-lg md:text-xl tracking-[0.1em] hover:text-[var(--color-museum-accent)] transition-all duration-500">
            {language === 'en' ? 'Souvenirs of a Life Not Yet Lived' : '未曾经历的人生纪念品'}
          </Link>
          
          <div className="flex items-center gap-8">
            {user && (
              <nav className="flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] font-medium">
                <Link 
                  to="/entry" 
                  className={`flex items-center gap-2 transition-all duration-500 ${location.pathname === '/entry' ? 'text-[var(--color-museum-accent)]' : 'text-[var(--color-museum-muted)] hover:text-[var(--color-museum-text)]'}`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Today' : '今日'}</span>
                </Link>
                <Link 
                  to="/museum" 
                  className={`flex items-center gap-2 transition-all duration-500 ${location.pathname.startsWith('/museum') ? 'text-[var(--color-museum-accent)]' : 'text-[var(--color-museum-muted)] hover:text-[var(--color-museum-text)]'}`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Archive' : '档案库'}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-[var(--color-museum-muted)] hover:text-red-400/70 transition-all duration-500 ml-4"
                  title={language === 'en' ? 'Log Out' : '登出'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </nav>
            )}
            <div className="flex items-center">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-[var(--color-museum-muted)] hover:text-[var(--color-museum-accent)] transition-all duration-500 text-[10px] uppercase tracking-[0.3em] ml-4 border-l border-[var(--color-museum-header-border)] pl-8"
                title={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'EN' : 'ZH'}</span>
              </button>
              <MuseumAmbience />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      
      <footer className="py-12 text-center text-[10px] tracking-[0.2em] uppercase text-[var(--color-museum-muted)]/40 font-serif italic border-t border-[var(--color-museum-header-border)]">
        <div className="max-w-2xl mx-auto px-6 space-y-4">
          <p>{language === 'en' ? 'Some lives are never fully lived. They still leave things behind.' : '有些人生未曾被完整度过，但它们依然留下了痕迹。'}</p>
          <div className="h-px w-8 bg-[var(--color-museum-border)] mx-auto" />
          <p className="not-italic opacity-60">© {new Date().getFullYear()} {language === 'en' ? 'The Parallel Archive' : '平行档案库'}</p>
        </div>
      </footer>
    </div>
  );
}
