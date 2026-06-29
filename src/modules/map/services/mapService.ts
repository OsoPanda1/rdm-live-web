/**
 * Map service abstraction.
 * Implementación actual: Leaflet. Switch a Mapbox solo requiere reescribir este archivo.
 */
import L from "leaflet";

export interface MapInitOptions {
  center: [number, number];
  zoom: number;
  containerId?: string;
}

export interface MapMarkerConfig {
  id: string;
  lat: number;
  lng: number;
  color: string;
  emoji: string;
  onClick?: () => void;
}

export interface RdmMapHandle {
  raw: L.Map;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  destroy: () => void;
}

export function initMap(container: HTMLElement, opts: MapInitOptions): RdmMapHandle {
  const map = L.map(container, {
    center: opts.center,
    zoom: opts.zoom,
    zoomControl: false,
    attributionControl: false,
  });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
  }).addTo(map);
  L.control.zoom({ position: "bottomright" }).addTo(map);

  return {
    raw: map,
    flyTo: (lat, lng, zoom = 17) => map.flyTo([lat, lng], zoom, { duration: 0.9 }),
    destroy: () => map.remove(),
  };
}

export function createMarker(cfg: MapMarkerConfig): L.Marker {
  const icon = L.divIcon({
    className: "rdm-marker",
    html: `<div style="width:36px;height:36px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:${cfg.color}cc;border:2px solid ${cfg.color};font-size:18px;box-shadow:0 4px 12px ${cfg.color}66;">${cfg.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
  const marker = L.marker([cfg.lat, cfg.lng], { icon });
  if (cfg.onClick) marker.on("click", cfg.onClick);
  return marker;
}
