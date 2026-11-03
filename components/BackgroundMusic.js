'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Por defecto SIEMPRE activado, a menos que el usuario expresamente lo haya muteado ('true')
    const savedMute = localStorage.getItem('ul_music_muted');
    const userWantsMute = savedMute === 'true';
    setIsMuted(userWantsMute);

    const playAudio = async () => {
      if (!audioRef.current) return;
      try {
        audioRef.current.volume = 0.35;
        audioRef.current.muted = userWantsMute;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        // En navegadores que bloquean autoplay con sonido, se reproduce con la primera interacción del usuario
        const unlock = async () => {
          if (!audioRef.current) return;
          try {
            audioRef.current.volume = 0.35;
            audioRef.current.muted = localStorage.getItem('ul_music_muted') === 'true';
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (e) {
            console.warn('Autoplay unlock error:', e);
          }
        };

        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('pointerdown', unlock, { once: true });
      }
    };

    playAudio();
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (!isPlaying) {
      audioRef.current.volume = 0.35;
      audioRef.current.muted = false;
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
        autoPlay
        playsInline
        preload="auto"
      />

      {/* Botón flotante estilo FIFA 15 */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleSound}
          title={isMuted || !isPlaying ? 'Activar música' : 'Silenciar música'}
          className={`flex items-center gap-2 px-3.5 py-2 border text-xs font-bold font-outfit uppercase tracking-wider backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer ${
            isMuted || !isPlaying
              ? 'bg-black/85 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              : 'bg-black/90 border-[var(--color-gold)] text-[var(--color-gold)] shadow-[0_0_15px_rgba(246,197,65,0.4)]'
          }`}
        >
          <Music size={14} className={isPlaying && !isMuted ? 'animate-pulse text-[var(--color-gold)]' : ''} />
          {isMuted || !isPlaying ? (
            <>
              <VolumeX size={16} />
              <span className="hidden sm:inline">Música Off</span>
            </>
          ) : (
            <>
              <Volume2 size={16} />
              <span className="hidden sm:inline font-black">FIFA Soundtrack</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

