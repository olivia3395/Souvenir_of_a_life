import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function MuseumAmbience() {
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const footstepsRef = useRef<HTMLAudioElement | null>(null);
  const paperRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio objects
    // 1. Quiet museum air/ambience
    ambienceRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-museum-gallery-ambience-561.mp3');
    ambienceRef.current.loop = true;
    ambienceRef.current.volume = 0.05; // Very light

    // 2. Distant footsteps echoing (looping with a long interval or just a long track)
    footstepsRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-slow-footsteps-on-concrete-610.mp3');
    footstepsRef.current.loop = true;
    footstepsRef.current.volume = 0.02; // Extremely light

    // 3. Paper rustling (occasional)
    paperRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-paper-rustle-turning-page-2374.mp3');
    paperRef.current.volume = 0.03;

    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      ambienceRef.current?.pause();
      footstepsRef.current?.pause();
      paperRef.current?.pause();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (hasInteracted && !isMuted) {
      ambienceRef.current?.play().catch(() => {});
      footstepsRef.current?.play().catch(() => {});
      
      // Random paper rustling
      const paperInterval = setInterval(() => {
        if (Math.random() > 0.7 && !isMuted) {
          paperRef.current?.play().catch(() => {});
        }
      }, 15000);
      
      return () => clearInterval(paperInterval);
    } else {
      ambienceRef.current?.pause();
      footstepsRef.current?.pause();
      paperRef.current?.pause();
    }
  }, [hasInteracted, isMuted]);

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="flex items-center gap-2 text-[var(--color-museum-muted)] hover:text-[var(--color-museum-accent)] transition-all duration-500 text-[10px] uppercase tracking-[0.3em] ml-4 border-l border-[var(--color-museum-header-border)] pl-8"
      title={isMuted ? "Unmute Ambience" : "Mute Ambience"}
    >
      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isMuted ? 'Muted' : 'Live'}</span>
    </button>
  );
}
