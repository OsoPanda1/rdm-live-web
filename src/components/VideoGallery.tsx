import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";

// Videos not yet available — use empty strings as placeholder
const heroVideo = "";
const ctaVideo = "";
const leyendaVideo = "";

import minaImg from "@/assets/mina-acosta.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import penasImg from "@/assets/penas-cargadas.webp";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoSrc: string;
  duration: string;
  category: string;
}

const videos: Video[] = [
  {
    id: "1",
    title: "Real del Monte — Pueblo Mágico",
    description: "Vuelo cinematográfico por las calles y paisajes del pueblo minero",
    thumbnail: heroImg,
    videoSrc: heroVideo,
    duration: "2:30",
    category: "Introducción"
  },
  {
    id: "2",
    title: "RDM Digital — Innovación Turística 2026",
    description: "Presentación oficial de la plataforma digital de Real del Monte",
    thumbnail: callesImg,
    videoSrc: ctaVideo,
    duration: "1:15",
    category: "Tecnología"
  },
  {
    id: "3",
    title: "Leyendas de la Mina",
    description: "Relatos y misterios de los túneles que guardan 460 años de historia",
    thumbnail: minaImg,
    videoSrc: leyendaVideo,
    duration: "4:20",
    category: "Historia"
  },
  {
    id: "4",
    title: "Tour por la Mina de Acosta",
    description: "Descenso a 460 metros bajo tierra con guía especializado",
    thumbnail: minaImg,
    videoSrc: heroVideo,
    duration: "5:45",
    category: "Aventura"
  },
  {
    id: "5",
    title: "Panteón Inglés al Atardecer",
    description: "El cementerio anglicano más alto del mundo bañado en luz dorada",
    thumbnail: panteonImg,
    videoSrc: heroVideo,
    duration: "3:15",
    category: "Historia"
  },
  {
    id: "6",
    title: "Peñas Cargadas — Senderismo",
    description: "Recorrido por las formaciones rocosas más impresionantes de la sierra",
    thumbnail: penasImg,
    videoSrc: heroVideo,
    duration: "4:00",
    category: "Naturaleza"
  },
];

export const VideoCard = ({ video, onClick }: { video: Video; onClick: () => void }) => {
  return (
    <motion.div
      className="group cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mb-3 aspect-video overflow-hidden rounded-2xl">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30" />

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/90 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="ml-1 h-6 w-6 text-white" fill="white" />
          </motion.div>
        </div>

        <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {video.duration}
        </div>

        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {video.category}
        </div>

        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </div>
      </div>

      <h3 className="mb-1 font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-amber-500">
        {video.title}
      </h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
    </motion.div>
  );
};

export const VideoPlayer = ({ video, onClose }: { video: Video; onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor de video: ${video.title}`}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={video.videoSrc}
          poster={video.thumbnail}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
          onTimeUpdate={(e) => {
            const vid = e.target as HTMLVideoElement;
            if (!Number.isFinite(vid.duration) || vid.duration <= 0) {
              setProgress(0);
              return;
            }
            setProgress((vid.currentTime / vid.duration) * 100);
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 opacity-100 md:opacity-0 md:hover:opacity-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Cerrar reproductor"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="absolute left-4 top-4 pr-16">
            <h3 className="font-serif text-xl text-white">{video.title}</h3>
            <p className="text-sm text-white/70">{video.description}</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mb-4 h-1 w-full cursor-pointer rounded-full bg-white/20">
              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) videoRef.current.pause();
                    else videoRef.current.play();
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 transition-colors hover:bg-amber-600"
                aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
              >
                {isPlaying ? <Pause className="h-5 w-5 text-white" fill="white" /> : <Play className="ml-0.5 h-5 w-5 text-white" fill="white" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label={isMuted ? "Activar sonido" : "Silenciar video"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const VideoGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <>
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-amber-500">
              🎬 Videos Reales
            </span>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-5xl">
              Galería Audiovisual
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Videos reales filmados en Real del Monte — experimenta la magia del Pueblo Mágico
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoCard
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoGallery;
