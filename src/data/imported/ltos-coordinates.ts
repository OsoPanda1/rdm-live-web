// @ts-nocheck
/**
 * Coordenadas verificadas para anclar cada sub-plataforma LTOS al territorio
 * de Real del Monte, Hidalgo. Centro canónico: 20.1437, -98.6692.
 * Los offsets sitúan cada plataforma sobre un punto patrimonial relevante.
 */
export const LTOS_COORDINATES: Record<string, { lat: number; lng: number; anchor: string }> = {
  "rdm-digital-os":         { lat: 20.1437, lng: -98.6692, anchor: "Plaza Principal" },
  "rdm-smart-city-os":      { lat: 20.1452, lng: -98.6705, anchor: "Palacio Municipal" },
  "realdelmonte-digital-kernel": { lat: 20.1418, lng: -98.6671, anchor: "Mina de Acosta" },
  "rdm-turismodigital":     { lat: 20.1463, lng: -98.6678, anchor: "Museo de Medicina Laboral" },
  "real-del-monte-digital": { lat: 20.1409, lng: -98.6712, anchor: "Panteón Inglés" },
  "real-del-monte-twin":    { lat: 20.1476, lng: -98.6655, anchor: "Cerro del Judío" },
  "real-del-monte-atlas":   { lat: 20.1391, lng: -98.6660, anchor: "Mirador del Hiloche" },
  "real-del-monte-elevated":{ lat: 20.1445, lng: -98.6720, anchor: "Parroquia Asunción" },
  "rdm-digital-2026":       { lat: 20.1428, lng: -98.6643, anchor: "Centro Cultural" },
  "citemesh-roots":         { lat: 20.1482, lng: -98.6694, anchor: "Bosque El Hiloche" },
  "civilizational-core":    { lat: 20.1401, lng: -98.6685, anchor: "Mina La Rica" },
  "rdm-digital-nodo-cero":  { lat: 20.1437, lng: -98.6692, anchor: "Nodo Cero · Plaza" },
};

export const RDM_CENTER: [number, number] = [20.1437, -98.6692];
