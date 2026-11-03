'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Restaurar preferencia previa de mute si existe
    const savedMute = localStorage.getItem('ul_music_muted');
    if (savedMute !== null) {
      setIsMuted(savedMute === 'true');
    }

    // Intentar reproducir automáticamente tras interacción del usuario con la página
    const attemptAutoPlay = () => {
      if (audioRef.current && !hasInteracted) {
        setHasInteracted(true);
        audioRef.current.volume = 0.35; // Volumen de fondo agradable (estilo menú FIFA)
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Si el navegador bloquea autoplay, se reproducirá al dar clic en el botón
        });
      }
    };

    window.addEventListener('click', attemptAutoPlay, { once: true });
    window.addEventListener('keydown', attemptAutoPlay, { once: true });
    window.addEventListener('touchstart', attemptAutoPlay, { once: true });

    return () => {
      window.removeEventListener('click', attemptAutoPlay);
      window.removeEventListener('keydown', attemptAutoPlay);
      window.removeEventListener('touchstart', attemptAutoPlay);
    };
  }, [hasInteracted]);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (!isPlaying) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
        localStorage.setItem('ul_music_muted', 'false');
      }).catch(console.error);
      return;
    }

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    localStorage.setItem('ul_music_muted', String(nextMuted));
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/bg-music.mp3"
        loop
        preload="auto"
      />

      {/* Botón flotante estilo FIFA 15 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleSound}
          title={isMuted || !isPlaying ? 'Activar música' : 'Silenciar música'}
          className={`flex items-center gap-2 px-3 py-2 border text-xs font-bold font-outfit uppercase tracking-wider backdrop-blur-md transition-all shadow-xl active:scale-95 ${
            isMuted || !isPlaying
              ? 'bg-black/80 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              : 'bg-black/90 border-[var(--color-gold)] text-[var(--color-gold)] shadow-[0_0_15px_rgba(246,197,65,0.3)] animate-pulse'
          }`}
        >
          <Music size={14} className={isPlaying && !isMuted ? 'animate-bounce' : ''} />
          {isMuted || !isPlaying ? (
            <>
              <VolumeX size={16} />
              <span className="hidden sm:inline">Música Off</span>
            </>
          ) : (
            <>
              <Volume2 size={16} />
              <span className="hidden sm:inline">FIFA Soundtrack</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

