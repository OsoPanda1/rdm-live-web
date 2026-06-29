import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

/**
 * AmbientAudio — control de sonido ambiental inmersivo.
 * Arranca silenciado (las políticas de autoplay de los navegadores lo exigen)
 * y respeta prefers-reduced-motion / la preferencia guardada del visitante.
 */
const AmbientAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio("/audio/rdm-intro.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "none";
    audioRef.current = audio;

    const onPref = async (e: Event) => {
      const want = (e as CustomEvent).detail as boolean;
      if (want) {
        try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
      } else {
        audio.pause();
        setPlaying(false);
      }
    };
    window.addEventListener("rdm:sound", onPref as EventListener);

    return () => {
      window.removeEventListener("rdm:sound", onPref as EventListener);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      localStorage.setItem("rdm_sound", "0");
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
      localStorage.setItem("rdm_sound", "1");
    } catch {
      setPlaying(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      aria-label={playing ? "Silenciar sonido ambiental" : "Activar sonido ambiental de Real del Monte"}
      title={playing ? "Silenciar ambiente" : "Sonido inmersivo"}
      className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full glass border border-[hsl(var(--gold))]/25 text-[hsl(var(--gold))] shadow-lg transition-all hover:scale-105 hover:border-[hsl(var(--gold))]/60"
    >
      {playing ? (
        <span className="relative flex items-center justify-center">
          <Volume2 className="h-5 w-5" />
          <span className="absolute -inset-2 rounded-full border border-[hsl(var(--gold))]/30 animate-ping" />
        </span>
      ) : (
        <VolumeX className="h-5 w-5 opacity-70" />
      )}
    </motion.button>
  );
};

export default AmbientAudio;
