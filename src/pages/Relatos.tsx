import { RDMLayout } from "@/components/rdm/RDMLayout";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Ghost, Heart, Moon, Star, TreePine, Scroll, Play, X } from "lucide-react";
import { SEOMeta } from "@/components/SEOMeta";
import panteonImg from "@/assets/panteon-ingles.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import minaImg from "@/assets/mina-acosta.webp";
const leyendaVideo = "";

const legends = [
  {
    title: "El Minero Sin Cabeza",
    category: "Leyenda Minera",
    icon: Ghost,
    image: minaImg,
    story: `En las profundidades de la Mina de Acosta, los trabajadores nocturnos juraban ver la figura de un minero sin cabeza, paseándose por los túneles con su lámpara de carburo. Se dice que era un inglés que murió en un derrumbe en 1890, y que aparece para advertir a los mineros de peligros inminentes.

Los ancianos del pueblo cuentan que antes de cualquier accidente grave, varios trabajadores han reportado ver la figura fantasmal iluminando las galerías oscuras. Algunos incluso afirman que el espíritu les ha salvado la vida al hacerles retroceder justo antes de un derrumbe.`,
    location: "Mina de Acosta",
    theme: "from-red-500/20 to-orange-500/20"
  },
  {
    title: "La Novia del Panteón",
    category: "Romance Trágico",
    icon: Heart,
    image: panteonImg,
    story: `En el Panteón Inglés descansa Elizabeth Browning, una joven cornish que murió de tristeza tras la muerte de su prometido, un minero mexicano llamado José María. La leyenda dice que cada noche de luna llena, se puede ver a Elizabeth caminando entre las tumbas con su vestido de novia blanco, esperando la llegada de su amado.

Los visitantes nocturnos han reportado escuchar sus suspiros entre los pinos, y algunos aseguran haber visto una figura femenina de pie junto a la tumba con una rosa en las manos. Los lugareños dicen que si pides un deseo frente a su lápida con respeto, Elizabeth lo hará realidad.`,
    location: "Panteón Inglés",
    theme: "from-pink-500/20 to-rose-500/20"
  },
  {
    title: "Las Peñas que Cargan",
    category: "Mito Natural",
    icon: TreePine,
    image: penasImg,
    story: `Las imponentes Peñas Cargadas no son solo formaciones rocosas. Según la tradición otomí, eran guardianes espirituales que sostenían el cielo. Cuando los dioses vieron la codicia de los españoles por la plata, decidieron retirar su protección, pero las peñas se negaron a abandonar su puesto.

Como castigo, fueron condenadas a permanecer en equilibrio precario por toda la eternidad, recordando a los humanos que la naturaleza siempre prevalece sobre la ambición. Hasta hoy, los ancianos otomíes realizan ofrendas en la base de las peñas para honrar a estos guardianes caídos.`,
    location: "Peñas Cargadas",
    theme: "from-green-500/20 to-emerald-500/20"
  },
  {
    title: "El Túnel del Tiempo",
    category: "Misterio",
    icon: Moon,
    image: minaImg,
    story: `En una de las galerías menos transitadas de la Mina Dificultad, existe lo que los mineros llaman "El Túnel del Tiempo". Quienes se adentran demasiado profundo en esta sección han reportado experimentar visiones del pasado: mineros del siglo XIX trabajando, fiestas cornish, e incluso conversaciones en inglés antiguo.

Un geólogo de la UNAM que estudió el fenómeno descubrió anomalías electromagnéticas en la zona, pero no pudo explicar las visiones. Los lugareños prefieren no hablar mucho del lugar, pues creen que "el tiempo está delgado" en ese punto y se pueden cruzar mundos.`,
    location: "Mina Dificultad",
    theme: "from-purple-500/20 to-indigo-500/20"
  }
];

const shortStories = [
  {
    title: "El Último Pastelero Cornish",
    excerpt: "Don William Hosking era el último pastelero de pura sangre cornish en Real del Monte. Su receta secreta del paste tradicional...",
    readTime: "5 min"
  },
  {
    title: "La Boda de la Montaña",
    excerpt: "En 1885, la boda entre Sarah Jenkins y Miguel Ángel Hernández unió a dos familias y dos culturas en una celebración que duró tres días...",
    readTime: "8 min"
  },
  {
    title: "El Rescate de San Cayetano",
    excerpt: "Cuando la mina se inundó en 1920, fue un perro llamado San Cayetano quien guió a los rescatistas hasta los sobrevivientes atrapados...",
    readTime: "6 min"
  },
  {
    title: "La Maldición de la Veta Madre",
    excerpt: "La veta de plata más rica del distrito trajo fortuna y desgracia por igual. Esta es la historia de los hombres que la encontraron...",
    readTime: "10 min"
  }
];

const RelatosPage = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initEcho = useCallback(() => {
    const video = videoRef.current;
    if (!video || audioCtxRef.current) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(video);
    sourceRef.current = source;

    // Echo chain: delay -> feedback gain -> delay (loop), mixed with dry signal
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.35;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.25;

    // Dry path
    source.connect(ctx.destination);

    // Wet path with feedback loop
    source.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay); // feedback loop
    delay.connect(wetGain);
    wetGain.connect(ctx.destination);
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
        sourceRef.current = null;
      }
    };
  }, []);

  return (
    <RDMLayout>
      <SEOMeta title="Relatos y Leyendas" description="Leyendas, misterios y relatos de tradición oral de Real del Monte, Pueblo Mágico." />
      <div className="min-h-screen bg-background">
        
        {/* Video Modal */}
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowVideo(false)}
          >
            <div className="relative w-full max-w-3xl mx-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <video
                ref={videoRef}
                src={leyendaVideo}
                controls
                autoPlay
                onPlay={initEcho}
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>
        )}
        
        {/* Hero */}
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${panteonImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/50" />
          <div className="absolute inset-0 flex items-end pb-20">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
                  <Ghost className="w-4 h-4" />
                  Misterio y Tradición Oral
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
                  Relatos y Leyendas
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                  Historias que se cuentan al calor de la chimenea, entre la neblina de la montaña, 
                  transmitidas de generación en generación.
                </p>
                
                {/* Video Button */}
                <motion.button
                  onClick={() => setShowVideo(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-electric to-gold text-navy font-semibold shadow-lg hover:shadow-electric/30 transition-all"
                >
                  <Play className="w-5 h-5" />
                  <span>Ver Leyenda en Video</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Legends */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Leyendas del Pueblo
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Historias que dan vida a las piedras, las minas y las noches de Real del Monte
              </p>
            </motion.div>

            <div className="space-y-12">
              {legends.map((legend, index) => (
                <motion.article
                  key={legend.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="grid lg:grid-cols-2 gap-8 items-center"
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="relative rounded-2xl overflow-hidden shadow-elevated group">
                      <img 
                        src={legend.image}
                        alt={legend.title}
                        loading="lazy" className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${legend.theme} to-transparent opacity-60`} />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
                          <legend.icon className="w-3.5 h-3.5" />
                          {legend.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-3">
                      {legend.category}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {legend.title}
                    </h3>
                    <div className="prose prose-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {legend.story}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Short Stories Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Relatos Cortos
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Pequeñas historias que revelan el alma de Real del Monte
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shortStories.map((story, index) => (
                <motion.div
                  key={story.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Scroll className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {story.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lectura: {story.readTime}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Storytelling CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-terracotta to-gold p-8 md:p-12 text-center"
            >
              <div className="relative z-10">
                <Star className="w-12 h-12 text-white mx-auto mb-4" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                  ¿Tienes una historia que contar?
                </h2>
                <p className="text-white/90 max-w-xl mx-auto mb-6">
                  Real del Monte está lleno de historias esperando ser contadas. Si conoces una leyenda, 
                  un relato familiar o una experiencia paranormal, compártela con nosotros.
                </p>
                <button className="px-8 py-3 rounded-xl bg-white text-terracotta font-semibold hover:bg-white/90 transition-colors">
                  Compartir mi historia
                </button>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </RDMLayout>
  );
};

export default RelatosPage;
