/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { DailyEntry } from './pages/DailyEntry';
import { Reveal } from './pages/Reveal';
import { Museum } from './pages/Museum';
import { SouvenirDetail } from './pages/SouvenirDetail';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-museum-bg)] text-[var(--color-museum-text)] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-serif text-red-400 mb-4">Something went wrong / 发生了一些错误</h1>
          <p className="text-[var(--color-museum-muted)] mb-8 max-w-md">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-6 py-2 border border-[var(--color-museum-border)] rounded-full hover:bg-white hover:text-black transition-colors"
          >
            Return Home / 返回首页
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/entry" element={<DailyEntry />} />
                  <Route path="/reveal" element={<Reveal />} />
                  <Route path="/museum" element={<Museum />} />
                  <Route path="/museum/:id" element={<SouvenirDetail />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
