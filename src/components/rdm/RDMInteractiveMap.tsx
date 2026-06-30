import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, Search, Car } from "lucide-react";
import { REAL_DEL_MONTE_SITES, CATEGORY_COLORS } from "@/lib/rdm-data";
import { ESTACIONAMIENTOS, ALL_TERRITORIAL_SITES } from "@/data/rdm-territorial";
import "leaflet/dist/leaflet.css";

type MapPlace = { id: string; name: string; category: string; lat: number; lng: number; rating: number | null; description: string | null; };
type MoodFilter = "all" | "tranquilo" | "aventura" | "familiar" | "romantico";

const MOOD_CATEGORIES: Record<MoodFilter, string[]> = {
  all: ["historia", "cultura", "gastronomia", "aventura", "hospedaje"],
  tranquilo: ["historia", "hospedaje", "cultura"],
  aventura: ["aventura", "historia"],
  familiar: ["cultura", "gastronomia", "historia"],
  romantico: ["hospedaje", "cultura", "gastronomia"],
};

export function RDMInteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletLibRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [places] = useState<MapPlace[]>([
    ...REAL_DEL_MONTE_SITES.map(s => ({ ...s, rating: s.rating, description: s.description })),
    ...ALL_TERRITORIAL_SITES.map(s => ({ id: s.id, name: s.nombre, category: s.categoria === "naturaleza" ? "aventura" : s.categoria === "museo" ? "historia" : "cultura", lat: s.lat, lng: s.lng, rating: null, description: s.descripcion })),
  ]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = useMemo(() => {
    const allowed = new Set(MOOD_CATEGORIES[selectedMood]);
    return places.filter((p) => allowed.has(p.category)).filter((p) => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [places, selectedMood, searchTerm]);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;
      leafletLibRef.current = L;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({ iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" });
      const map = L.map(mapRef.current!, { center: [20.138, -98.671], zoom: 15, zoomControl: false });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OSM &copy; CARTO', maxZoom: 19 }).addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 250);
    });
    return () => { cancelled = true; leafletMapRef.current?.remove(); leafletMapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapReady || !leafletLibRef.current || !markersLayerRef.current) return;
    const L = leafletLibRef.current;
    markersLayerRef.current.clearLayers();
    filteredPlaces.forEach((site) => {
      const color = CATEGORY_COLORS[site.category] ?? "hsl(24 72% 50%)";
      const marker = L.marker([site.lat, site.lng], { icon: L.divIcon({ className: "rdm-map-marker", html: `<div class="rdm-map-pin" style="--pin-color: ${color}"></div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(markersLayerRef.current);
      marker.bindPopup(`<div class="rdm-popup-card"><div class="rdm-popup-kicker"><span class="rdm-popup-dot" style="background:${color}"></span>${site.category}</div><h3 class="rdm-popup-title">${site.name}</h3><p class="rdm-popup-desc">${site.description ?? "Experiencia territorial."}</p><div class="rdm-popup-meta"><span>★ ${(site.rating ?? 4.5).toFixed(1)}</span></div></div>`, { className: "rdm-popup" });
    });
    // Parking markers
    ESTACIONAMIENTOS.forEach((est) => {
      const marker = L.marker([est.lat, est.lng], { icon: L.divIcon({ className: "rdm-map-marker", html: `<div class="rdm-map-pin" style="--pin-color: hsl(210 100% 55%)"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(markersLayerRef.current);
      marker.bindPopup(`<div class="rdm-popup-card"><div class="rdm-popup-kicker"><span class="rdm-popup-dot" style="background:hsl(210 100% 55%)"></span>estacionamiento</div><h3 class="rdm-popup-title">${est.nombre}</h3><p class="rdm-popup-desc">${est.capacidad}</p></div>`, { className: "rdm-popup" });
    });
    if (filteredPlaces.length > 1) {
      const bounds = L.latLngBounds(filteredPlaces.map((p) => [p.lat, p.lng]));
      leafletMapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    }
  }, [filteredPlaces, mapReady]);

  return (
    <section className="px-6 py-16 md:px-16 lg:px-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
        <p className="mb-4 flex items-center justify-center gap-2 text-sm uppercase tracking-[0.3em] text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-body)" }}>
          <Navigation className="h-4 w-4" /> Cartografía Territorial
        </p>
        <h2 className="text-4xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Mapa <span className="text-[hsl(var(--rdm-amber))]">Inteligente</span></h2>
      </motion.div>

      <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215_13%_42%)]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar lugar..." className="w-full rounded-xl border border-[hsl(220_11%_82%)] bg-white/80 py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--rdm-amber)/0.3)]" style={{ fontFamily: "var(--font-body)" }} />
        </div>
        {(["all", "tranquilo", "aventura", "familiar", "romantico"] as MoodFilter[]).map((mood) => (
          <button key={mood} onClick={() => setSelectedMood(mood)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedMood === mood ? "bg-[hsl(var(--rdm-amber))] text-white border-[hsl(var(--rdm-amber))]" : "bg-white/70 border-[hsl(220_11%_82%)] text-[hsl(218_24%_18%)] hover:border-[hsl(var(--rdm-amber))]"}`} style={{ fontFamily: "var(--font-body)" }}>
            {mood === "all" ? "Todo" : mood.charAt(0).toUpperCase() + mood.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden rdm-glass" style={{ height: "500px" }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredPlaces.slice(0, 8).map((place) => (
          <button key={place.id} onClick={() => leafletMapRef.current?.flyTo([place.lat, place.lng], 17, { duration: 1 })} className="rdm-glass rounded-xl p-3 text-left hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3 h-3 text-[hsl(var(--rdm-amber))]" />
              <span className="text-[10px] uppercase tracking-wider text-[hsl(215_13%_42%)]" style={{ fontFamily: "var(--font-body)" }}>{place.category}</span>
            </div>
            <p className="text-sm font-semibold group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{place.name}</p>
            <p className="text-xs text-[hsl(215_13%_42%)] mt-1" style={{ fontFamily: "var(--font-body)" }}>★ {(place.rating ?? 4.5).toFixed(1)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
