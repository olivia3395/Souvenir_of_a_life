import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Landing() {
  const { user, signIn, signInGuest, signInWithEmail, signUpWithEmail } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/entry" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
      navigate('/entry');
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInGuest();
      navigate('/entry');
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/entry');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden bg-[#0a0908]">
      {/* 1. The Vignette - Very light darker edges */}
      <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
      <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.3)_100%)]" />

      {/* 2. Central Spotlight - "展厅光区" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-[var(--color-museum-accent)]/[0.04] rounded-full blur-[150px] pointer-events-none z-0" />
      
      {/* 3. Architecture Lines - Wall boundaries (extremely faint) */}
      <div className="absolute top-24 left-0 w-full h-px bg-white/[0.015] pointer-events-none" />
      <div className="absolute bottom-24 left-0 w-full h-px bg-white/[0.015] pointer-events-none" />
      <div className="absolute top-0 left-48 w-px h-full bg-white/[0.01] pointer-events-none" />
      <div className="absolute top-0 right-48 w-px h-full bg-white/[0.01] pointer-events-none" />

      {/* 4. Atmospheric Details - Faint archival text and reflections */}
      <div className="absolute top-32 left-56 text-[7px] tracking-[0.6em] uppercase text-white/[0.03] font-mono pointer-events-none select-none">
        ARCHIVE_REF_001 / TIMELINE_SYNC_ACTIVE
      </div>
      <div className="absolute bottom-32 right-56 text-[7px] tracking-[0.6em] uppercase text-white/[0.03] font-mono pointer-events-none select-none">
        SECTION_B / EXHIBIT_LIT_2026
      </div>
      
      {/* Glass Reflection Effect (extremely subtle) */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.015] bg-gradient-to-tr from-transparent via-white to-transparent rotate-12 translate-x-1/3" />

      <div className="max-w-3xl w-full text-center relative z-10">
        <div className="mb-8 inline-block">
          <div className="text-[10px] tracking-[0.5em] uppercase text-[var(--color-museum-accent)] mb-4 font-medium">
            {language === 'en' ? 'Established in Parallel' : '建立于平行时空'}
          </div>
          <div className="h-px w-12 bg-[var(--color-museum-accent)]/30 mx-auto" />
        </div>

        <h1 className="font-serif text-6xl md:text-8xl font-light tracking-wide leading-tight mb-12 text-[var(--color-museum-text)]">
          {language === 'en' ? (
            <>
              Souvenirs of a Life<br />
              <span className="italic text-[var(--color-museum-muted)] opacity-80">Not Yet Lived</span>
            </>
          ) : (
            <span className="text-5xl md:text-7xl block tracking-[0.2em]">未曾经历的人生纪念品</span>
          )}
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-museum-muted)] font-serif leading-loose mb-16 max-w-2xl mx-auto italic">
          {language === 'en' 
            ? 'A quiet archive of the paths you didn\'t take. Reflect on your journey, and receive a keepsake from a faraway version of yourself.'
            : '一座关于你未曾选择的道路的静谧档案。回望你的旅程，并从那个遥远的自己手中，收到一份纪念。'}
        </p>

        {!showEmailForm ? (
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleGuestSignIn}
              className="museum-button px-12 py-6 text-[11px] tracking-[0.4em] bg-[var(--color-museum-accent)]/10 text-[var(--color-museum-text)] hover:shadow-[0_0_50px_rgba(197,168,122,0.1)] border-[var(--color-museum-accent)]/30 w-full max-w-sm"
            >
              <span className="relative z-10">{language === 'en' ? 'Enter as Guest' : '以访客身份进入'}</span>
            </button>

            <div className="flex gap-8 mt-4">
              <button
                onClick={handleGoogleSignIn}
                className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)] hover:text-[var(--color-museum-text)] transition-colors"
              >
                {language === 'en' ? 'Google Login' : 'Google 登录'}
              </button>
              
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)] hover:text-[var(--color-museum-text)] transition-colors"
              >
                {language === 'en' ? 'Email Login' : '邮箱登录'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="max-w-sm mx-auto flex flex-col gap-6 bg-white/[0.02] p-8 border border-white/[0.05] rounded-2xl backdrop-blur-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)] mb-4">
              {isSignUp 
                ? (language === 'en' ? 'Create Archive Access' : '创建档案访问权限')
                : (language === 'en' ? 'Verify Archive Access' : '验证档案访问权限')}
            </div>

            {error && <div className="text-red-400 text-[10px] tracking-wider mb-2">{error}</div>}

            {isSignUp && (
              <input
                type="text"
                placeholder={language === 'en' ? 'NAME' : '姓名'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-transparent border-b border-[var(--color-museum-border)] py-3 text-sm focus:outline-none focus:border-[var(--color-museum-accent)] transition-colors text-[var(--color-museum-text)]"
              />
            )}
            
            <input
              type="email"
              placeholder={language === 'en' ? 'EMAIL' : '邮箱'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-b border-[var(--color-museum-border)] py-3 text-sm focus:outline-none focus:border-[var(--color-museum-accent)] transition-colors text-[var(--color-museum-text)]"
            />
            
            <input
              type="password"
              placeholder={language === 'en' ? 'PASSWORD' : '密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent border-b border-[var(--color-museum-border)] py-3 text-sm focus:outline-none focus:border-[var(--color-museum-accent)] transition-colors text-[var(--color-museum-text)]"
            />

            <button
              type="submit"
              disabled={loading}
              className="museum-button py-4 text-[10px] tracking-[0.3em] bg-[var(--color-museum-accent)]/10 text-[var(--color-museum-text)] border-[var(--color-museum-accent)]/30 mt-4"
            >
              {loading 
                ? (language === 'en' ? 'PROCESSING...' : '处理中...')
                : (isSignUp 
                    ? (language === 'en' ? 'CREATE ACCOUNT' : '创建账户') 
                    : (language === 'en' ? 'SIGN IN' : '登录'))}
            </button>

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-museum-muted)] hover:text-[var(--color-museum-text)]"
              >
                {isSignUp 
                  ? (language === 'en' ? 'Already have access?' : '已有访问权限？') 
                  : (language === 'en' ? 'Request new access?' : '申请新访问权限？')}
              </button>
              
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-museum-muted)] hover:text-[var(--color-museum-text)]"
              >
                {language === 'en' ? 'Back' : '返回'}
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-20 flex items-center justify-center gap-4 text-[9px] tracking-[0.3em] uppercase text-[var(--color-museum-muted)]/40">
          <div className="h-px w-8 bg-[var(--color-museum-border)]" />
          <span>{language === 'en' ? 'Traveler\'s Log' : '旅行日志'}</span>
          <div className="h-px w-8 bg-[var(--color-museum-border)]" />
        </div>
      </div>
    </div>
  );
}
