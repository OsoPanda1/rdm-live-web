import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L, { type LeafletEventHandlerFnMap, type Map as LeafletMap } from "leaflet";
import Supercluster from "supercluster";
import { Compass, Layers3, LocateFixed, RotateCcw, Sparkles } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_VIEWPORT, type MapMarkerData, type MapViewportState } from "@/features/places/mapTypes";

// Definición estricta de tipos para evitar errores de propiedades inexistentes
type ClusterProps = { cluster: true; cluster_id: number; point_count: number };
type PointProps = { cluster: false; markerId: string };

type ClusterFeature = GeoJSON.Feature<GeoJSON.Point, ClusterProps>;
type PointFeature = GeoJSON.Feature<GeoJSON.Point, PointProps>;

type ClusterItem = ClusterFeature | PointFeature;

interface Map2DPanelProps {
  markers: MapMarkerData[];
  selected: MapMarkerData | null;
  viewport: MapViewportState;
  onSelect: (marker: MapMarkerData) => void;
  onViewportChange: (next: Partial<MapViewportState>) => void;
}

// Estética Platinum & Obsidian Mist para marcadores
const createPinIcon = (type: MapMarkerData["type"], isPremium?: boolean) => {
  const color = isPremium ? "#E5E7EB" : type === "place" ? "#60a5fa" : "#34d399";
  const glow = isPremium ? "0 0 15px rgba(229, 231, 235, 0.8)" : `0 0 12px ${color}`;
  
  return L.divIcon({
    className: "custom-map-pin",
    html: `<span style="display:flex;width:${isPremium ? 26 : 20}px;height:${isPremium ? 26 : 20}px;border-radius:999px;background:${color};box-shadow:0 0 0 4px rgba(10,15,27,.8), ${glow};border:1px solid rgba(255,255,255,0.9);backdrop-filter: blur(2px);"></span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createClusterIcon = (count: number) =>
  L.divIcon({
    className: "custom-cluster-pin",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;background:radial-gradient(circle at top left, rgba(229,231,235,0.95), rgba(75,85,99,0.9));color:#0b1020;font-size:12px;font-weight:700;box-shadow:0 0 0 6px rgba(15,23,42,0.55),0 0 22px rgba(229,231,235,0.4);border:1px solid rgba(255,255,255,0.85)">${count}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

function MapEventBridge({ onViewportChange }: { onViewportChange: (next: Partial<MapViewportState>) => void }) {
  const map = useMap();

  useEffect(() => {
    const handler: LeafletEventHandlerFnMap = {
      moveend: () => {
        const center = map.getCenter();
        onViewportChange({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      },
      zoomend: () => {
        const center = map.getCenter();
        onViewportChange({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
      },
    };

    map.on(handler);
    return () => {
      map.off(handler);
    };
  }, [map, onViewportChange]);

  return null;
}

function MapFocus({ selected }: { selected: MapMarkerData | null }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 15), { duration: 0.75 });
  }, [map, selected]);

  return null;
}

function MapViewportSync({ viewport }: { viewport: MapViewportState }) {
  const map = useMap();

  useEffect(() => {
    const center = map.getCenter();
    const latDiff = Math.abs(center.lat - viewport.lat);
    const lngDiff = Math.abs(center.lng - viewport.lng);
    const zoomDiff = Math.abs(map.getZoom() - viewport.zoom);
    if (latDiff < 0.0001 && lngDiff < 0.0001 && zoomDiff < 0.01) return;
    map.flyTo([viewport.lat, viewport.lng], viewport.zoom, { duration: 0.6 });
  }, [map, viewport.lat, viewport.lng, viewport.zoom]);

  return null;
}

function buildClusterIndex(points: PointFeature[]) {
  return new Supercluster<PointProps, ClusterProps>({
    radius: 58,
    maxZoom: 18,
    minZoom: 0,
  }).load(points);
}

function getBounds(map: LeafletMap): [number, number, number, number] {
  const bounds = map.getBounds();
  return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
}

function isClusterFeature(item: ClusterItem): item is ClusterFeature {
  return Boolean((item.properties as ClusterProps).cluster);
}

function ClusterLayer({ markers, onSelect }: { markers: MapMarkerData[]; onSelect: (marker: MapMarkerData) => void }) {
  const map = useMap();
  const markerLookup = useMemo(() => new Map(markers.map((m) => [m.id, m])), [markers]);

  const points = useMemo<PointFeature[]>(
    () =>
      markers.map((marker) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [marker.lng, marker.lat] },
        properties: { cluster: false, markerId: marker.id },
      })),
    [markers],
  );

  const index = useMemo(() => buildClusterIndex(points), [points]);
  const [version, setVersion] = useState(0);

  const clusterItems = useMemo<ClusterItem[]>(() => {
    const bbox = getBounds(map);
    const zoom = Math.floor(map.getZoom());
    return index.getClusters(bbox, zoom) as ClusterItem[];
  }, [index, map, version]); // eslint-disable-line react-hooks/exhaustive-deps -- version forces recalc on pan/zoom

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    map.on("zoomend", refresh);
    map.on("moveend", refresh);
    return () => {
      map.off("zoomend", refresh);
      map.off("moveend", refresh);
    };
  }, [map]);

  return (
    <>
      {clusterItems.map((item, idx) => {
        const [lng, lat] = item.geometry.coordinates;
        const { properties } = item;

        // Type Guard para diferenciar entre Cluster y Punto Individual
        if (isClusterFeature(item)) {
          return (
            <Marker
              key={`cluster-${item.properties.cluster_id}-${idx}`}
              position={[lat, lng]}
              icon={createClusterIcon(item.properties.point_count)}
              eventHandlers={{
                click: () => {
                  const expansionZoom = index.getClusterExpansionZoom(item.properties.cluster_id);
                  map.flyTo([lat, lng], Math.min(expansionZoom, 18), { duration: 0.6 });
                },
              }}
            />
          );
        }

        const marker = markerLookup.get(item.properties.markerId);
        if (!marker) return null;

        return (
          <Marker
            key={`marker-${marker.id}`}
            position={[marker.lat, marker.lng]}
            icon={createPinIcon(marker.type, marker.isPremium)}
            eventHandlers={{ click: () => onSelect(marker) }}
          >
            <Popup>
              <div className="p-1">
                <strong className="text-slate-900 block border-b pb-1 mb-1">{marker.name}</strong>
                <p className="text-xs text-slate-600 leading-tight">{marker.description}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function Map2DPanel({ markers, selected, viewport, onSelect, onViewportChange }: Map2DPanelProps) {
  const [tileMode, setTileMode] = useState<"dark" | "light">("dark");
  const tileConfig =
    tileMode === "dark"
      ? {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution: "&copy; CARTO",
        }
      : {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: "&copy; OpenStreetMap contributors",
        };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      <MapContainer
        center={[viewport.lat, viewport.lng]}
        zoom={viewport.zoom}
        className="h-[420px] w-full md:h-[640px]"
        zoomControl={true}
        scrollWheelZoom={true}
        preferCanvas
      >
        <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />
        <MapEventBridge onViewportChange={onViewportChange} />
        <MapViewportSync viewport={viewport} />
        <MapFocus selected={selected} />
        <ClusterLayer markers={markers} onSelect={onSelect} />
      </MapContainer>


      {markers.length === 0 && (
        <div className="absolute inset-0 z-[510] flex items-center justify-center bg-slate-950/70 p-4 text-center text-sm text-silver-300 backdrop-blur-sm">
          No hay nodos para este filtro. Cambia el criterio o vuelve a “Todo” para recuperar la visualización.
        </div>
      )}

      <div className="absolute left-3 top-3 z-[500] flex gap-2">
        <button
          onClick={() => setTileMode((prev) => (prev === "dark" ? "light" : "dark"))}
          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/80 px-2.5 py-1.5 text-[11px] text-white backdrop-blur-md transition hover:bg-slate-800/90"
        >
          <Layers3 className="h-3.5 w-3.5" />
          {tileMode === "dark" ? "Claro" : "Oscuro"}
        </button>
        <button
          onClick={() => onViewportChange(DEFAULT_MAP_VIEWPORT)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/80 px-2.5 py-1.5 text-[11px] text-white backdrop-blur-md transition hover:bg-slate-800/90"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Recentrar
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[500] rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2 text-[11px] text-white backdrop-blur-md">
        <div className="mb-1 flex items-center gap-2 text-white/70">
          <Sparkles className="h-3 w-3 text-blue-300" />
          Leyenda interactiva
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Lugares
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Negocios
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Premium
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-[500] rounded-xl border border-white/20 bg-slate-900/75 px-3 py-2 text-[11px] text-white/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <LocateFixed className="h-3.5 w-3.5 text-cyan-300" />
          {viewport.lat.toFixed(4)}, {viewport.lng.toFixed(4)}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-amber-300" />
          Zoom {viewport.zoom.toFixed(1)}
        </div>
      </div>

      {/* Overlay de diseño Crystal Glow en los bordes */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5 ring-1 ring-inset ring-white/10" />
    </div>
  );
}
