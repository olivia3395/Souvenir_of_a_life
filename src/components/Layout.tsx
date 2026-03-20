import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, Archive, Compass, Globe } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-museum-bg)] text-[var(--color-museum-text)] flex flex-col selection:bg-white/20 selection:text-white">
      <header className="border-b border-[var(--color-museum-border)]/50 bg-[var(--color-museum-bg)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to={user ? "/entry" : "/"} className="font-serif italic text-xl md:text-2xl tracking-wide hover:text-[var(--color-museum-muted)] transition-colors">
            {language === 'en' ? 'Souvenirs of a Life Not Yet Lived' : '未曾经历的人生纪念品'}
          </Link>
          
          <div className="flex items-center gap-8">
            {user && (
              <nav className="flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-medium">
                <Link 
                  to="/entry" 
                  className={`flex items-center gap-2 transition-colors ${location.pathname === '/entry' ? 'text-white' : 'text-[var(--color-museum-muted)] hover:text-white'}`}
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Today' : '今日'}</span>
                </Link>
                <Link 
                  to="/museum" 
                  className={`flex items-center gap-2 transition-colors ${location.pathname.startsWith('/museum') ? 'text-white' : 'text-[var(--color-museum-muted)] hover:text-white'}`}
                >
                  <Archive className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'en' ? 'My Museum' : '我的博物馆'}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-[var(--color-museum-muted)] hover:text-white transition-colors ml-4"
                  title={language === 'en' ? 'Log Out' : '登出'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </nav>
            )}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-[var(--color-museum-muted)] hover:text-white transition-colors text-xs uppercase tracking-[0.2em] ml-4 border-l border-[var(--color-museum-border)] pl-8"
              title={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'EN' : '中文'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      
      <footer className="py-8 text-center text-xs text-[var(--color-museum-muted)] font-serif italic border-t border-[var(--color-museum-border)]/30">
        <p>{language === 'en' ? 'Some lives are never fully lived. They still leave things behind.' : '有些人生未曾被完整度过，但它们依然留下了痕迹。'}</p>
      </footer>
    </div>
  );
}
