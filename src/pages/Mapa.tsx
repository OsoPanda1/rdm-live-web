import { lazy, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TerritorialSVGMap from "@/components/map/TerritorialSVGMap";
import POIDetailPanel from "@/components/map/POIDetailPanel";
import { Award, Filter, Layers, LocateFixed, MapPin, Phone, Radar, Search, Star, Zap, Compass, Activity, Cpu, DatabaseZap, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { PAGE_SEO, SEOMeta } from "@/components/SEOMeta";
import { Link } from "react-router-dom";
import { Map2DPanel } from "@/components/map/Map2DPanel";
import { MapSyncProvider, useMapSync } from "@/hooks/useMapSync";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import type { MapMarkerData, MarkerType } from "@/features/places/mapTypes";
import { buildRecommendedActions, buildTwinOverlaySummary, synthesizeTwinSignals } from "@/features/twins/hybridTwin";

import pasteImg from "@/assets/paste.webp";
import minaImg from "@/assets/mina-acosta.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";

const Map3DTwin = lazy(() => import("@/components/map/Map3DTwin").then((module) => ({ default: module.Map3DTwin })));

const markers: MapMarkerData[] = [
  { id: "1", name: "Mina de Acosta", category: "Mina", lat: 20.141, lng: -98.672, description: "Museo y túneles históricos de minería con experiencias guiadas inmersivas.", image: minaImg, type: "place", rating: 4.8, status: "Verificado" },
  { id: "2", name: "Panteón Inglés", category: "Museo", lat: 20.08, lng: -98.7, description: "Patrimonio británico en el bosque con recorridos narrados por audio-guía.", image: panteonImg, type: "place", rating: 4.7, status: "Activo" },
  { id: "3", name: "Peñas Cargadas", category: "Naturaleza", lat: 20.15, lng: -98.66, description: "Formaciones rocosas y senderismo panorámico para ecoturismo de aventura.", image: penasImg, type: "place", rating: 4.9, status: "En alta demanda" },
  { id: "4", name: "Plaza Principal", category: "Cultura", lat: 20.138, lng: -98.6735, description: "Centro social y turístico del pueblo con eventos culturales diarios.", image: callesImg, type: "place", rating: 4.5, status: "Activo" },
  { id: "5", name: "Museo del Paste", category: "Museo", lat: 20.1375, lng: -98.674, description: "Historia del paste y su herencia cornish con talleres gastronómicos.", image: pasteImg, type: "place", rating: 4.6, status: "Verificado" },
  { id: "6", name: "Pastes El Portal", category: "Pastes", lat: 20.1378, lng: -98.6738, description: "Pastes tradicionales en el centro histórico y menú digital actualizado.", image: pasteImg, type: "business", isPremium: true, rating: 4.9, phone: "771 123 4567", status: "En alta demanda" },
  { id: "7", name: "Hotel Real de Minas", category: "Hospedaje", lat: 20.1395, lng: -98.675, description: "Hospedaje boutique en casona colonial con check-in inteligente.", image: callesImg, type: "business", isPremium: true, rating: 4.7, phone: "771 234 5678", status: "Verificado" },
  { id: "8", name: "Café La Neblina", category: "Restaurante", lat: 20.1382, lng: -98.6742, description: "Café de altura con ambiente local y reservación express.", image: panteonImg, type: "business", rating: 4.4, status: "Activo" },
];

function MapaPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<"all" | MarkerType>("all");
  const [selected, setSelected] = useState<MapMarkerData | null>(markers[0]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const { viewport, syncFrom2D, syncFrom3D } = useMapSync();

  // POI de territorio (panel deslizante) sincronizado con ?poi=
  const territoryPoiId = searchParams.get("poi");
  const handleSelectTerritoryPOI = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("poi", id);
    setSearchParams(next, { replace: false });
  };
  const handleClosePOIPanel = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("poi");
    setSearchParams(next, { replace: true });
  };

  const handleFilterChange = (nextFilter: MarkerType | "all") => {
    setFilter(nextFilter);
    setSelected((current) => {
      if (!current) return null;
      if (nextFilter === "all") return current;
      return current.type === nextFilter ? current : null;
    });
  };

  const filtered = useMemo(
    () =>
      markers.filter((item) => {
        const byType = filter === "all" || item.type === filter;
        const byQuery = `${item.name} ${item.category} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase().trim());
        return byType && byQuery;
      }),
    [filter, query],
  );

  const stats = useMemo(
    () => [
      { label: "Nodos activos", value: filtered.length.toString(), icon: Radar },
      {
        label: "Comercios premium",
        value: filtered.filter((item) => item.isPremium).length.toString(),
        icon: Zap,
      },
      {
        label: "Calificación promedio",
        value: `${(
          filtered.reduce((sum, current) => sum + (current.rating ?? 0), 0) /
          Math.max(filtered.length, 1)
        ).toFixed(1)}`,
        icon: Star,
      },
    ],
    [filtered],
  );


  const twinSignals = useMemo(() => synthesizeTwinSignals(filtered), [filtered]);
  const twinSummary = useMemo(() => buildTwinOverlaySummary(twinSignals), [twinSignals]);
  const suggestedActions = useMemo(() => buildRecommendedActions(twinSummary), [twinSummary]);

  const integrationReferences = [
    { label: "Eclipse Ditto", url: "https://github.com/eclipse-ditto/ditto" },
    { label: "Underrun (simulación inmersiva)", url: "https://github.com/phoboslab/underrun" },
    { label: "OpenTwins", url: "https://github.com/ertis-research/opentwins" },
    { label: "Awesome Digital Twins", url: "https://github.com/edt-community/awesome-digital-twins" },
    { label: "SmartHotel360 IoT", url: "https://github.com/microsoft/SmartHotel360-IoT" },
    { label: "Forge Digital Twin", url: "https://github.com/Autodesk-Forge/forge-digital-twin" },
  ] as const;

  return (
    <RDMLayout>
      <SEOMeta {...PAGE_SEO.mapa} />

        {/* Hero del Mapa */}
        <section className="relative overflow-hidden pt-24 pb-10 bg-[hsl(var(--background))]">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${callesImg})` }} />

          <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.08)] px-4 py-2 text-xs uppercase tracking-[0.2em]">
                  <Compass className="h-3.5 w-3.5 text-[hsl(var(--rdm-amber))]" />
                  <span className="text-[hsl(var(--foreground))]">Gemelo Digital en Tiempo Real</span>
                </div>
                <h1 className="text-4xl md:text-6xl leading-tight font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  <span className="block text-[hsl(var(--foreground))]">Mapa</span>
                  <span className="block text-[hsl(var(--rdm-amber))]">Inteligente</span>
                </h1>
                <p className="max-w-2xl text-base text-[hsl(var(--muted-foreground))] md:text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  Infraestructura cartográfica con clustering dinámico, sincronización 2D/3D y gemelo digital territorial.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-1 text-xs">
                <button
                  onClick={() => setMode("2d")}
                  className={`rounded-full px-4 py-2 transition font-medium ${mode === "2d" ? "bg-[hsl(var(--rdm-amber))] text-white" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Vista 2D
                </button>
                <button
                  onClick={() => setMode("3d")}
                  className={`rounded-full px-4 py-2 transition font-medium ${mode === "3d" ? "bg-[hsl(var(--rdm-amber))] text-white" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Gemelo 3D
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl space-y-5 px-4 pb-12 md:px-6">

          <section className="grid gap-4 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rdm-glass rounded-2xl border border-[hsl(var(--border)/0.4)] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[hsl(var(--rdm-amber)/0.1)] p-2">
                    <item.icon className="h-5 w-5 text-[hsl(var(--rdm-amber))]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{item.label}</p>
                    <p className="text-xl font-semibold text-[hsl(var(--foreground))]">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Mapa Soberano SVG inmersivo (POIs glassmórficos + tooltips narrativos) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--rdm-amber))]">Capa simbólica</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>Mapa Soberano del Nodo Cero</h2>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-md" style={{ fontFamily: "var(--font-body)" }}>
                Vista narrativa de las federaciones territoriales. Cada POI revela su memoria al posar el cursor.
              </p>
            </div>
            <TerritorialSVGMap
              highlightId={territoryPoiId ?? undefined}
              selectedId={territoryPoiId}
              onSelect={handleSelectTerritoryPOI}
            />
          </section>

          <POIDetailPanel poiId={territoryPoiId} onClose={handleClosePOIPanel} />

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="rdm-glass rounded-2xl border border-[hsl(var(--border)/0.4)] p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2">
                    <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar lugares, comercios o experiencias..."
                      className="w-full bg-transparent text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>
                  <button
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                      filter === "place"
                        ? "border-[hsl(var(--rdm-amber)/0.6)] bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--rdm-amber)/0.3)]"
                    }`}
                    onClick={() => handleFilterChange("place")}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <Filter className="h-4 w-4" /> Lugares
                  </button>
                  <button
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                      filter === "business"
                        ? "border-[hsl(var(--rdm-amber)/0.6)] bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--rdm-amber)/0.3)]"
                    }`}
                    onClick={() => handleFilterChange("business")}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <Layers className="h-4 w-4" /> Negocios
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {["all", "place", "business"].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleFilterChange(item as "all" | MarkerType)}
                      className={`rounded-full border px-3 py-1.5 ${
                        filter === item
                          ? "border-[hsl(var(--rdm-amber)/0.6)] bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item === "all" ? "Todo" : item === "place" ? "Lugares" : "Negocios"}
                    </button>
                  ))}
                </div>
              </div>

              <MapErrorBoundary>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  {mode === "2d" ? (
                    <Map2DPanel
                      markers={filtered}
                      selected={selected}
                      viewport={viewport}
                      onSelect={setSelected}
                      onViewportChange={syncFrom2D}
                    />
                  ) : (
                    <Suspense
                      fallback={
                        <div className="flex h-[420px] items-center justify-center bg-[hsl(var(--muted)/0.5)] text-sm text-[hsl(var(--muted-foreground))] md:h-[640px]">
                          Cargando Gemelo Digital 3D...
                        </div>
                      }
                    >
                      <Map3DTwin viewport={viewport} markers={filtered} onViewportChange={syncFrom3D} />
                    </Suspense>
                  )}
                </div>
              </MapErrorBoundary>
            </div>

            <aside className="space-y-4 lg:col-span-4">
              <div className="rdm-glass rounded-2xl border border-[hsl(var(--border)/0.4)] p-4">
                {selected ? (
                  <>
                    <img src={selected.image} alt={selected.name} loading="lazy" className="mb-3 h-40 w-full rounded-xl object-cover" />
                    <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>{selected.name}</h2>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>{selected.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-2 py-1">
                        <MapPin className="h-3.5 w-3.5" /> {selected.category}
                      </span>
                      {selected.rating && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] px-2 py-1 text-[hsl(var(--rdm-amber))]">
                          <Star className="h-3.5 w-3.5" /> {selected.rating}
                        </span>
                      )}
                      {selected.isPremium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] px-2 py-1 text-[hsl(var(--rdm-amber))]">
                          <Award className="h-3.5 w-3.5" /> Premium
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-300">
                        <Layers className="h-3.5 w-3.5" /> {selected.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      {selected.phone && (
                        <a
                          href={`tel:${selected.phone}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--rdm-amber))] px-3 py-2 text-sm font-medium text-white"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          <Phone className="h-4 w-4" /> Llamar
                        </a>
                      )}
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                        onClick={() => setSelected(markers[0])}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <LocateFixed className="h-4 w-4" /> Volver al nodo principal
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>Selecciona un punto del mapa para ver detalles.</p>
                )}
              </div>

              <div className="rdm-glass rounded-2xl border border-[hsl(var(--rdm-amber)/0.25)] p-4">
                <h3 className="font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>Exploración rápida</h3>
                <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {filtered.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setSelected(item)}
                        className="flex w-full items-center justify-between rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-left transition hover:border-[hsl(var(--rdm-amber)/0.4)] hover:bg-[hsl(var(--muted)/0.5)]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-[hsl(var(--rdm-amber))]">Ver</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.06)] p-4">
                <h3 className="font-semibold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>Capa Realito AI</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                  <li>Asistente contextual por POI con sugerencias de ruta y horario.</li>
                  <li>Streaming geoespacial de eventos por WebSocket federado.</li>
                  <li>Sugerencias proactivas según densidad y perfil de visitante.</li>
                </ol>
                <Link to="/negocios" className="mt-3 inline-block rounded-lg bg-[hsl(var(--rdm-amber))] px-3 py-2 text-sm font-semibold text-white" style={{ fontFamily: "var(--font-body)" }}>
                  Ir al portal de comercios
                </Link>
              </div>
            </aside>
          </section>

          <section className="space-y-4 rounded-2xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--muted)/0.2)] p-4 md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Integración híbrida</p>
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>Control Room de Gemelos Digitales</h2>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>Pipeline unificado para telemetría, modelos BIM/3D y simulaciones inmersivas.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.08)] px-3 py-1.5 text-xs text-[hsl(var(--foreground))]">
                <Workflow className="h-3.5 w-3.5 text-[hsl(var(--rdm-amber))]" />
                Modo federado activo
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {twinSummary.map((source) => (
                <article key={source.source} className="rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] p-3">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>{source.displayName}</p>
                  <p className="mt-1 text-lg font-semibold text-[hsl(var(--foreground))]">{source.healthScore}%</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Salud operativa</p>
                  <div className="mt-2 space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <p className="flex items-center gap-1"><Activity className="h-3 w-3 text-emerald-500" /> {source.throughputPerMinute}/min</p>
                    <p className="flex items-center gap-1"><Cpu className="h-3 w-3 text-[hsl(var(--rdm-amber))]" /> {source.avgLatencyMs} ms</p>
                    <p className="flex items-center gap-1"><DatabaseZap className="h-3 w-3 text-rose-400" /> {source.incidents} incidentes</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.06)] p-4">
                <h3 className="font-semibold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>Acciones recomendadas</h3>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                  {suggestedActions.length > 0 ? (
                    suggestedActions.map((action) => <li key={action}>{action}</li>)
                  ) : (
                    <li>Sin alertas críticas; mantener sincronización en tiempo real y simulación calibrada.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] p-4">
                <h3 className="font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>Referencias integradas</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                  {integrationReferences.map((reference) => (
                    <li key={reference.url}>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--rdm-amber))]" />
                        {reference.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>
    </RDMLayout>
  );
}


export default function MapaPage() {
  return (
    <MapSyncProvider>
      <MapaPageContent />
    </MapSyncProvider>
  );
}
