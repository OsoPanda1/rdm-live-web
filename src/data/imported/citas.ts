// Base de datos de citas y constelaciones del ecosistema TAMV.
// Constelaciones: Anubis (guardianía), Horus (visión/observabilidad), Dekateotl (memoria/territorio).

export type Constelacion = "anubis" | "horus" | "dekateotl" | "isabella" | "realito";

export interface Cita {
  id: string;
  texto: string;
  autor: string;
  fuente?: string;
  año: number;
  constelacion: Constelacion;
  etiquetas: string[];
}

export const CONSTELACIONES: Record<Constelacion, { nombre: string; icono: string; color: string; descripcion: string }> = {
  anubis: { nombre: "Anubis", icono: "🜁", color: "rdm-amber", descripcion: "Guardianía, juicio justo, custodia del umbral digital." },
  horus: { nombre: "Horus", icono: "𓂀", color: "rdm-amber", descripcion: "Visión panóptica ética, observabilidad sin vigilancia." },
  dekateotl: { nombre: "Dekateotl", icono: "🪶", color: "rdm-amber", descripcion: "Memoria mexica, raíz territorial, voz del pueblo." },
  isabella: { nombre: "Isabella", icono: "🌹", color: "rdm-amber", descripcion: "IA guardiana del ecosistema TAMV." },
  realito: { nombre: "REALITO", icono: "⛏️", color: "rdm-amber", descripcion: "Voz operativa de RDM Digital, anfitrión cultural." },
};

export const CITAS: Cita[] = [
  { id: "c1", texto: "En LATAM no innovamos por permiso — innovamos por necesidad.", autor: "Anubis Villaseñor", fuente: "Manifiesto TAMV 2025", año: 2025, constelacion: "anubis", etiquetas: ["soberanía", "latam", "manifiesto"] },
  { id: "c2", texto: "Desde un pueblito en México, una mente humana teje la primera infraestructura digital pensada para la dignidad.", autor: "Anubis Villaseñor", fuente: "Proclama Nodo Cero", año: 2026, constelacion: "anubis", etiquetas: ["dignidad", "rdm", "infraestructura"] },
  { id: "c3", texto: "La tecnología existe para proteger, cuidar y conectar — no para manipular.", autor: "Manifiesto TAMV", año: 2025, constelacion: "isabella", etiquetas: ["humanismo", "ética"] },
  { id: "c4", texto: "Cada nodo preserva la voz, los dichos y la historia de su pueblo dentro de la red federada.", autor: "Códice Maestro DM-X4", año: 2025, constelacion: "dekateotl", etiquetas: ["memoria", "territorio", "federación"] },
  { id: "c5", texto: "Observabilidad sí, vigilancia nunca. La diferencia es la dignidad humana.", autor: "Doctrina MD-X4", año: 2025, constelacion: "horus", etiquetas: ["observabilidad", "ética", "kernel"] },
  { id: "c6", texto: "Identidad propia, datos propios, infraestructura propia.", autor: "Pilar I — Soberanía Digital", año: 2025, constelacion: "anubis", etiquetas: ["soberanía", "id-nvida"] },
  { id: "c7", texto: "21,600 horas de una sola mente humana son una infraestructura.", autor: "Telemetría Nodo Cero", año: 2026, constelacion: "horus", etiquetas: ["telemetría", "rdm"] },
  { id: "c8", texto: "Real del Monte no es un decorado: es el primer territorio del Sistema Operativo Civilizatorio.", autor: "REALITO AI", año: 2026, constelacion: "realito", etiquetas: ["rdm", "territorio"] },
  { id: "c9", texto: "Los dichos del pueblo son el código fuente de su memoria.", autor: "Dekateotl · Códice", año: 2025, constelacion: "dekateotl", etiquetas: ["dichos", "memoria", "cultura"] },
  { id: "c10", texto: "Defensa antes que vigilancia. Acompañar antes que extraer.", autor: "Isabella Villaseñor AI", año: 2026, constelacion: "isabella", etiquetas: ["ética", "defensa"] },
  { id: "c11", texto: "El kernel cuántico-emocional no es metáfora: es ingeniería de cuidado.", autor: "Edwin Castillo Trejo", fuente: "MD-X4 Whitepaper", año: 2025, constelacion: "horus", etiquetas: ["kernel", "md-x4"] },
  { id: "c12", texto: "Una IA que no sabe de dónde viene su gente, no debería hablar por ella.", autor: "Anubis Villaseñor", año: 2026, constelacion: "anubis", etiquetas: ["ia", "territorio", "ética"] },
  { id: "c13", texto: "Korima: economía del don, no de la extracción.", autor: "Doctrina Económica TAMV", año: 2025, constelacion: "dekateotl", etiquetas: ["korima", "economía"] },
  { id: "c14", texto: "CITEMESH es la malla donde el saber se cita a sí mismo sin pedir permiso.", autor: "Códice CITEMESH", año: 2026, constelacion: "horus", etiquetas: ["citemesh", "ciencia"] },
  { id: "c15", texto: "Pasté caliente, mina viva, mente despierta.", autor: "REALITO AI", año: 2026, constelacion: "realito", etiquetas: ["rdm", "cultura", "pastes"] },
  { id: "c16", texto: "El Pueblo Mágico también es un Pueblo Digital.", autor: "RDM Digital · Nodo Cero", año: 2026, constelacion: "realito", etiquetas: ["rdm", "pueblo-mágico"] },
  { id: "c17", texto: "Resistir 5 años sin recursos es la primera capa del kernel.", autor: "Anubis Villaseñor", año: 2025, constelacion: "anubis", etiquetas: ["resistencia", "manifiesto"] },
  { id: "c18", texto: "La periferia diseña sistemas operativos cuando el centro deja de escuchar.", autor: "Manifiesto Nueva Era", año: 2025, constelacion: "anubis", etiquetas: ["periferia", "soberanía"] },
  { id: "c19", texto: "Un guardián digital no controla: acompaña.", autor: "Isabella AI", año: 2026, constelacion: "isabella", etiquetas: ["guardianía", "ética"] },
  { id: "c20", texto: "Antifrágil significa que el caos te hace más fuerte, no más frágil.", autor: "Pilar V — MD-X4", año: 2025, constelacion: "horus", etiquetas: ["antifragilidad", "kernel"] },
  { id: "c21", texto: "A Reina Trejo Serrano — gracias por nunca rendirte.", autor: "Edwin Castillo Trejo", fuente: "Dedicatoria oficial", año: 2026, constelacion: "dekateotl", etiquetas: ["dedicatoria", "memoria"] },
  { id: "c22", texto: "Ciencia abierta o no es ciencia: es propiedad privada disfrazada.", autor: "Pilar VI — Apertura", año: 2025, constelacion: "horus", etiquetas: ["ciencia-abierta", "doi"] },
  { id: "c23", texto: "Cada repositorio público es una declaración política.", autor: "OsoPanda1", fuente: "GitHub Manifest", año: 2024, constelacion: "anubis", etiquetas: ["github", "open-source"] },
  { id: "c24", texto: "Tenochtitlan no terminó: se digitalizó.", autor: "Núcleo Simbólico Mexica", año: 2026, constelacion: "dekateotl", etiquetas: ["mexica", "simbolismo"] },
];

export const TODAS_ETIQUETAS = Array.from(new Set(CITAS.flatMap((c) => c.etiquetas))).sort();
