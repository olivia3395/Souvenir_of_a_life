import React from 'react';

export function MuseumBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[var(--color-museum-bg)]">
      {/* 1. Base Layer: Dark warm radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#6b5446_0%,_#4a3b32_100%)] opacity-90" />

      {/* 2. Middle Layer: Subtle grain / paper noise */}
      <div 
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* 3. Upper Layer: Vertical shadows (Exhibition corridor feeling) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(58,46,39,0.7)_0%,_transparent_20%,_transparent_80%,_rgba(58,46,39,0.7)_100%)]" />

      {/* 4. Architectural Cues */}
      {/* Wall texture / subtle vertical lines */}
      <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(to_right,_transparent,_transparent_100px,_rgba(255,255,255,1)_100px,_rgba(255,255,255,1)_101px)]" />
      
      {/* Floor / Wall boundary line (Plinth tone) */}
      <div className="absolute bottom-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8c735e] to-transparent opacity-60" />
      
      {/* Room segmentation in the distance */}
      <div className="absolute top-0 bottom-[20%] left-[15%] w-px bg-gradient-to-b from-transparent via-[#7a6250] to-transparent opacity-50" />
      <div className="absolute top-0 bottom-[20%] right-[15%] w-px bg-gradient-to-b from-transparent via-[#7a6250] to-transparent opacity-50" />

      {/* 5. Premium Details */}
      {/* Warm spotlighting in key sections (Center top) */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[70vw] h-[60vh] bg-[radial-gradient(ellipse_at_top,_rgba(212,184,140,0.25)_0%,_transparent_70%)] blur-3xl" />

      {/* Hint of dark wood / walnut warmth on the floor */}
      <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-[#3a2e27] to-[#4a3b32]" />
      
      {/* Subtle glass reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.06)] to-transparent opacity-50 transform -skew-x-12 scale-150 pointer-events-none" />
    </div>
  );
}
