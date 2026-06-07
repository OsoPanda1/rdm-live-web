// @ts-nocheck
// src/data/geo.ts
// POIs georreferenciados del Nodo Cero — fuente de verdad para mapas,
// recomendador y futuros gemelos digitales.

export type POICategory =
  | "historico"
  | "mineria"
  | "geologico"
  | "plaza"
  | "mercado"
  | "templo"
  | "panteon"
  | "mirador";

export interface POI {
  id: string;
  nombre: string;
  categoria: POICategory;
  lat: number;
  lng: number;
  altitudM: number;
  descripcion: string;
  significancia: string;
}

export const pois: POI[] = [
  {
    id: "poi-centro",
    nombre: "Centro Histórico · Plaza Juárez",
    categoria: "plaza",
    lat: 20.1432,
    lng: -98.6694,
    altitudM: 2700,
    descripcion: "Cabecera del Nodo Cero. Templo principal y kioskos del territorio.",
    significancia: "Coordenada de fundación de la red TAMV.",
  },
  {
    id: "poi-acosta",
    nombre: "Mina de Acosta",
    categoria: "mineria",
    lat: 20.1378,
    lng: -98.6628,
    altitudM: 2680,
    descripcion: "Museo vivo de la minería cornish-mexicana, malacates activos.",
    significancia: "Patrimonio industrial continuo desde 1727.",
  },
  {
    id: "poi-panteon",
    nombre: "Panteón Inglés",
    categoria: "panteon",
    lat: 20.1453,
    lng: -98.6712,
    altitudM: 2720,
    descripcion: "755 tumbas que miran hacia Cornualles.",
    significancia: "Memoria silenciosa de la migración británica.",
  },
  {
    id: "poi-hiloche",
    nombre: "Bosque del Hiloche",
    categoria: "geologico",
    lat: 20.152,
    lng: -98.68,
    altitudM: 2900,
    descripcion: "Bosque de niebla, hongos de temporada, miradores naturales.",
    significancia: "Pulmón ecológico del territorio.",
  },
  {
    id: "poi-templo",
    nombre: "Templo de la Asunción",
    categoria: "templo",
    lat: 20.1434,
    lng: -98.6692,
    altitudM: 2702,
    descripcion: "Templo principal, conserva retablos del siglo XVIII.",
    significancia: "Centro espiritual del pueblo desde 1572.",
  },
  {
    id: "poi-dolores",
    nombre: "Mina de Dolores",
    categoria: "mineria",
    lat: 20.139,
    lng: -98.665,
    altitudM: 2690,
    descripcion: "Sitio del primer paro minero de América (1766).",
    significancia: "Cuna del derecho laboral americano.",
  },
  {
    id: "poi-mirador-hiloche",
    nombre: "Mirador del Hiloche",
    categoria: "mirador",
    lat: 20.149,
    lng: -98.678,
    altitudM: 2850,
    descripcion: "Vista panorámica hacia Pachuca y la sierra.",
    significancia: "Punto cero del recorrido nocturno de leyendas.",
  },
];

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
