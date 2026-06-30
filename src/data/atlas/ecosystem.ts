// src/data/ecosystem.ts
// Documentación operacional del ecosistema TAMV / RDM Digital.
// Sintetiza el modelo Heptafederado MD-X4 (7 federaciones + 8 capas L0–L7),
// fusionado a partir de la documentación canónica (Wiki + TAMV OS v2026).

export interface Federation {
  id: string;
  nombre: string;
  dominio: string;
  proposito: string;
  modulos: string[];
}

export const federations: Federation[] = [
  {
    id: "fed-tecnologica",
    nombre: "Tecnológica",
    dominio: "Kernel, IA, sistemas, Nexus",
    proposito: "Sostener el núcleo operativo, las pasarelas de datos y la observabilidad.",
    modulos: ["MD-X4 Kernel", "DM-X7 Gateway", "Isabella Core", "OTel / ECG"],
  },
  {
    id: "fed-cultural",
    nombre: "Cultural",
    dominio: "Documentación, manuscritos, tomos, génesis, wiki",
    proposito: "Custodiar la memoria viva del territorio y su narrativa pública.",
    modulos: ["BookPI", "Archivo Histórico", "Wiki Nodo Cero", "Tomos LTOS"],
  },
  {
    id: "fed-gubernamental",
    nombre: "Gubernamental",
    dominio: "Protocolos, canon, legal, federación",
    proposito: "Gobernanza HITL: protocolos EOCT, auditoría y reglas inter-nodo.",
    modulos: ["EOCT", "Canon Legal", "Guardian Console", "Federación Viva"],
  },
  {
    id: "fed-economica",
    nombre: "Económica",
    dominio: "Mercado, comercio, wallets, pagos, fondos Phoenix",
    proposito: "Dinamizar el comercio local respetando soberanía financiera.",
    modulos: ["Cattleya Pay", "MSR", "Stripe MXN", "Reparto 20/30/50"],
  },
  {
    id: "fed-educativa",
    nombre: "Educativa",
    dominio: "Academia, cursos, UTAMV, pedagogía",
    proposito: "Formar guardianes, mediadores y narradores del territorio.",
    modulos: ["UTAMV", "Academia LTOS", "Talleres locales"],
  },
  {
    id: "fed-salud",
    nombre: "Salud",
    dominio: "Clínica, telemedicina, servicios sanitarios",
    proposito: "Capa de servicios cívicos esenciales en el nodo territorial.",
    modulos: ["Clínica RDM", "Telemedicina TAMV"],
  },
  {
    id: "fed-comunicacion",
    nombre: "Comunicación",
    dominio: "Radio, prensa, medios y relato público",
    proposito: "Mantener un canal soberano de información local y federada.",
    modulos: ["Radio Nodo Cero", "Prensa Federada", "Realito Voz"],
  },
];

export interface Layer {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export const layers: Layer[] = [
  { id: "l0", codigo: "L0", nombre: "Infraestructura física / Territorio", descripcion: "Nodos locales, conectividad, hardware soberano." },
  { id: "l1", codigo: "L1", nombre: "Memoria / Registro", descripcion: "MSR, ledger SQL, Cattleya Pay, BookPI." },
  { id: "l2", codigo: "L2", nombre: "Protocolos controlados", descripcion: "EOCT, motor de protocolos, decisiones auditables." },
  { id: "l3", codigo: "L3", nombre: "Guardianía / Observabilidad", descripcion: "Consolas de guardianes, paneles ECG, monitoreo." },
  { id: "l4", codigo: "L4", nombre: "XR / Visual / Gemelos", descripcion: "Mapas 3D, Real del Monte Twin, Atlas territorial." },
  { id: "l5", codigo: "L5", nombre: "Servicios de dominio", descripcion: "ID-NVIDA, turismo, economía, comercio." },
  { id: "l6", codigo: "L6", nombre: "UX / Shell", descripcion: "Portales para turistas, paneles para comercio." },
  { id: "l7", codigo: "L7", nombre: "Civilizacional / Metacivilización", descripcion: "Legado, narrativa, ecosistema de 100+ repos federados." },
];

export interface EcosystemNode {
  id: string;
  nombre: string;
  rol: string;
  descripcion: string;
}

export const ecosystemNodes: EcosystemNode[] = [
  { id: "rdm-os", nombre: "RDM Digital OS", rol: "Núcleo operativo", descripcion: "Smart City OS del Nodo Cero." },
  { id: "rdm-nexus", nombre: "RDM Digital Nexus (RDM·X)", rol: "Narrativa", descripcion: "Hub de turismo digital y narrativa civilizatoria." },
  { id: "rdm-2026", nombre: "RDM Digital 2026", rol: "Portal unificado", descripcion: "RDM + Wiki TAMV en una sola superficie pública." },
  { id: "rdm-turismo", nombre: "RDM Turismo Digital", rol: "Front cívico", descripcion: "Front turístico con Edge Functions soberanas." },
  { id: "rdm-atlas", nombre: "Real del Monte Atlas", rol: "Cartografía", descripcion: "Mapa vivo y cartografía colectiva." },
  { id: "rdm-twin", nombre: "Real del Monte Twin", rol: "Gemelo digital", descripcion: "Gemelo digital 4D del territorio." },
];

export interface Principio {
  numero: number;
  titulo: string;
  cuerpo: string;
}

export const principiosLTOS: Principio[] = [
  { numero: 1, titulo: "Territorio como interfaz", cuerpo: "La unidad de diseño es el territorio, sus rutas, capas y relaciones." },
  { numero: 2, titulo: "Relaciones sobre contenido", cuerpo: "Prima la red de vínculos (mina–evento–persona) sobre páginas sueltas." },
  { numero: 3, titulo: "Evidencia antes de narrativa", cuerpo: "Cada afirmación se ancla a registros verificables (DOI, ORCID, MSR, BookPI)." },
  { numero: 4, titulo: "Inteligencia contextual", cuerpo: "El sistema interpreta tiempo, lugar e historia, no sólo preguntas." },
  { numero: 5, titulo: "Federación", cuerpo: "El modelo está diseñado para que otros territorios se sumen bajo el mismo protocolo." },
];
