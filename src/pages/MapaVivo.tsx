import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Navigation, Layers, Search, X, MapPin, Clock, Zap, Star } from "lucide-react";
import BrumaHeader from "@/components/BrumaHeader";
import FloatingParticles from "@/components/FloatingParticles";
import RealitoBubble from "@/components/RealitoBubble";

import aerialImg from "@/assets/aerial-realmont.jpg";

interface POI {
  id: string; name: string; description: string;
  x: number; y: number;
  category: "historia" | "gastronomia" | "arquitectura" | "naturaleza" | "comercio";
  rating?: number; time?: string; energy?: string;
}

const allPois: POI[] = [
  { id: "1", name: "Mina de Acosta", description: "Desciende 400 metros al corazón de la montaña. La experiencia más emblemática del pueblo.", x: 35, y: 40, category: "historia", rating: 4.9, time: "2h", energy: "Alta" },
  { id: "2", name: "Panteón Inglés", description: "El único cementerio en México con tumbas que miran hacia Cornwall, Inglaterra.", x: 62, y: 28, category: "historia", rating: 4.8, time: "1h", energy: "Baja" },
  { id: "3", name: "Pastes El Portal", description: "Los pastes más antiguos del pueblo. Receta familiar de 4 generaciones.", x: 48, y: 55, category: "gastronomia", rating: 4.8, time: "30min", energy: "Baja" },
  { id: "4", name: "Parroquia de la Asunción", description: "Cantera labrada del siglo XVIII que desafía la niebla desde lo alto.", x: 45, y: 45, category: "arquitectura", rating: 4.7, time: "45min", energy: "Baja" },
  { id: "5", name: "Peña del Cuervo", description: "El mirador más alto. Vista panorámica de 360° sobre el valle.", x: 78, y: 35, category: "naturaleza", rating: 4.6, time: "2.5h", energy: "Alta" },
  { id: "6", name: "Museo de Medicina", description: "Historia de la salud en un pueblo donde la altitud dictaba las reglas.", x: 28, y: 60, category: "historia", rating: 4.3, time: "1h", energy: "Baja" },
  { id: "7", name: "Platería La Veta", description: "Joyería artesanal en plata con diseños inspirados en la herencia minera.", x: 52, y: 50, category: "comercio", rating: 4.5, time: "30min", energy: "Baja" },
  { id: "8", name: "Hotel Mina Real", description: "Boutique hotel en antigua casona minera con vista panorámica.", x: 40, y: 48, category: "comercio", rating: 4.9, time: "—", energy: "Baja" },
  { id: "9", name: "Cascada Estanzuela", description: "Sendero entre oyameles que lleva a una cascada cristalina.", x: 85, y: 60, category: "naturaleza", rating: 4.5, time: "3h", energy: "Alta" },
  { id: "10", name: "Centro Cultural", description: "Exposiciones temporales, talleres y eventos culturales.", x: 43, y: 42, category: "arquitectura", rating: 4.2, time: "1.5h", energy: "Baja" },
];

const categoryInfo: Record<string, { color: string; label: string }> = {
  historia: { color: "hsl(43, 80%, 55%)", label: "Historia" },
  gastronomia: { color: "hsl(25, 55%, 45%)", label: "Gastronomía" },
  arquitectura: { color: "hsl(210, 100%, 55%)", label: "Arquitectura" },
  naturaleza: { color: "hsl(145, 35%, 45%)", label: "Naturaleza" },
  comercio: { color: "hsl(43, 70%, 70%)", label: "Comercio" },
};

const MapaVivo = () => {
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealPoints = useRef<Array<{ x: number; y: number; r: number }>>([]);
  const [fogCleared, setFogCleared] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const x = ((pos.coords.longitude - (-98.68)) / ((-98.64) - (-98.68))) * 100;
        const y = ((20.15 - pos.coords.latitude) / (20.15 - 20.12)) * 100;
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) setUserLocation({ x, y });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const drawFog = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "hsla(220, 30%, 6%, 0.85)";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.globalCompositeOperation = "destination-out";
    for (const p of revealPoints.current) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.7, "rgba(0,0,0,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }, []);

  useEffect(() => { if (!fogCleared) drawFog(); }, [fogCleared, drawFog]);

  const clearFog = useCallback(() => {
    setFogCleared(true);
  }, []);

  const handleMove = (clientX: number, clientY: number) => {
    if (fogCleared || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    revealPoints.current.push({ x: clientX - rect.left, y: clientY - rect.top, r: 160 });
    if (revealPoints.current.length > 15) setFogCleared(true);
    drawFog();
  };

  const filtered = allPois.filter(p => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <FloatingParticles />
      <BrumaHeader />

      <div className="pt-20 flex flex-col h-screen">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-3 glass-nav">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-xs tracking-wider uppercase hidden sm:inline">Inicio</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-display text-lg text-gradient-gold">Mapa Vivo</h1>
          <div className="flex-1" />

          {/* Search */}
          <div className="glass rounded-full flex items-center gap-2 px-4 py-2 max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar lugar..."
              className="bg-transparent font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}><X className="w-3 h-3 text-muted-foreground" /></button>
            )}
          </div>

          {/* User location button */}
          <button
            onClick={() => {
              if (userLocation) setSelectedPOI(null);
            }}
            className="glass rounded-full p-2 text-electric hover:text-electric-light transition-colors"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 px-6 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[10px] tracking-wider uppercase transition-all ${
              !activeCategory ? "btn-premium !px-4 !py-1.5 !text-[10px]" : "glass text-muted-foreground hover:text-gold"
            }`}
          >
            <Layers className="w-3 h-3" /> Todos
          </button>
          {Object.entries(categoryInfo).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[10px] tracking-wider uppercase transition-all ${
                activeCategory === key ? "glass border-gold/40 text-gold" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
              {info.label}
            </button>
          ))}
        </div>

        {/* Map area */}
        <div className="flex-1 relative mx-4 mb-4 rounded-xl overflow-hidden glass-card">
          <div
            ref={containerRef}
            className="relative w-full h-full cursor-crosshair"
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          >
            <img src={aerialImg} alt="Mapa aéreo de Real del Monte" className="w-full h-full object-cover" />

            {/* Fog canvas */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${fogCleared ? "opacity-0 pointer-events-none" : ""}`}
            />

            {/* POI Markers */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${fogCleared ? "opacity-100" : "opacity-0"}`}>
              {filtered.map((poi) => (
                <button
                  key={poi.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
                  style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
                  onClick={() => setSelectedPOI(selectedPOI?.id === poi.id ? null : poi)}
                >
                  <div
                    className={`w-4 h-4 rounded-full pulse-gold transition-transform ${selectedPOI?.id === poi.id ? "scale-150" : "group-hover:scale-125"}`}
                    style={{ backgroundColor: categoryInfo[poi.category]?.color }}
                  />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-body text-[9px] text-foreground/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass rounded px-1.5 py-0.5">
                    {poi.name}
                  </span>
                </button>
              ))}

              {userLocation && (
                <div
                  className="absolute w-5 h-5 rounded-full bg-electric pulse-electric transform -translate-x-1/2 -translate-y-1/2 z-20 border-2 border-background"
                  style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-body text-[9px] text-electric whitespace-nowrap font-medium">Tú estás aquí</span>
                </div>
              )}
            </div>

            {/* Fog instruction */}
            {!fogCleared && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
                  className="font-display text-xl md:text-3xl text-gold/50 italic text-center px-4">
                  Desliza para limpiar la niebla<br />
                  <span className="text-sm text-platinum/30 not-italic font-body">y descubrir los secretos del pueblo</span>
                </motion.p>
                <button
                  onClick={clearFog}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto rounded-full border border-gold/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70 backdrop-blur-md hover:border-gold/60 hover:text-gold transition-all"
                >
                  Saltar niebla
                </button>
              </div>
            )}
          </div>

          {/* Selected POI panel */}
          {selectedPOI && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 w-72 glass rounded-xl p-5 z-30"
            >
              <button onClick={() => setSelectedPOI(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryInfo[selectedPOI.category]?.color }} />
                <span className="font-body text-[9px] tracking-[0.2em] uppercase" style={{ color: categoryInfo[selectedPOI.category]?.color }}>
                  {categoryInfo[selectedPOI.category]?.label}
                </span>
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{selectedPOI.name}</h3>
              <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3">{selectedPOI.description}</p>
              <div className="flex items-center gap-4 text-muted-foreground">
                {selectedPOI.rating && (
                  <span className="flex items-center gap-1 font-body text-[10px]">
                    <Star className="w-3 h-3 text-gold fill-gold" /> {selectedPOI.rating}
                  </span>
                )}
                {selectedPOI.time && (
                  <span className="flex items-center gap-1 font-body text-[10px]">
                    <Clock className="w-3 h-3 text-gold/60" /> {selectedPOI.time}
                  </span>
                )}
                {selectedPOI.energy && (
                  <span className="flex items-center gap-1 font-body text-[10px]">
                    <Zap className="w-3 h-3 text-electric/60" /> {selectedPOI.energy}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Legend */}
          {fogCleared && (
            <div className="absolute bottom-4 left-4 glass rounded-xl p-3 z-20">
              <div className="flex flex-wrap gap-3">
                {Object.entries(categoryInfo).map(([key, info]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">{info.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RealitoBubble />
    </div>
  );
};

export default MapaVivo;
