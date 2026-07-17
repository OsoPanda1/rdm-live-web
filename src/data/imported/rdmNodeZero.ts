export type NodeZeroRepoStatus = "absorbed" | "orchestrated" | "reference";

export interface NodeZeroRepo {
  id: string;
  name: string;
  url: string;
  family: "RDM" | "TAMV" | "Smart City" | "Documentación";
  status: NodeZeroRepoStatus;
  focus: string;
  absorbedImprovements: string[];
}

export interface NodeZeroCapability {
  id: string;
  title: string;
  signal: string;
  implementation: string;
  routes: string[];
  maturity: number;
}

export interface NodeZeroProtocolStep {
  id: string;
  title: string;
  description: string;
  evidence: string;
}

export const NODE_ZERO_REPOS: NodeZeroRepo[] = [
  {
    id: "rdm-digital-x",
    name: "RDM-Digital-X",
    url: "https://github.com/OsoPanda1/RDM-Digital-X",
    family: "RDM",
    status: "absorbed",
    focus:
      "Manifiesto RDM·X, páginas operativas, estado TAMV y contrato de fusión.",
    absorbedImprovements: [
      "Registro explícito de repos y capacidades federadas.",
      "Lectura del ecosistema como sistema operativo, no como landing aislada.",
      "Panel de madurez por capacidades con rutas ejecutables.",
    ],
  },
  {
    id: "real-del-monte-digital",
    name: "real-del-monte-digital",
    url: "https://github.com/OsoPanda1/real-del-monte-digital",
    family: "RDM",
    status: "absorbed",
    focus: "Shell turístico-comercial base y experiencia de Pueblo Mágico.",
    absorbedImprovements: [
      "Priorización de visitante, comercio y cultura antes del apéndice técnico.",
      "Rutas públicas para historia, gastronomía, comercio, mapa y comunidad.",
      "Capa visual cinematográfica con identidad Real del Monte.",
    ],
  },
  {
    id: "real-del-monte-explorer",
    name: "real-del-monte-explorer-7b2783c6",
    url: "https://github.com/OsoPanda1/real-del-monte-explorer-7b2783c6",
    family: "RDM",
    status: "absorbed",
    focus:
      "Exploración cultural, sitios, relatos y navegación de experiencias.",
    absorbedImprovements: [
      "Estructura de páginas culturales especializadas.",
      "Patrón de tarjetas por experiencia territorial.",
      "Navegación orientada a descubrir antes que administrar.",
    ],
  },
  {
    id: "rdm-turismo-digital",
    name: "rdm-turismodigital",
    url: "https://github.com/OsoPanda1/rdm-turismodigital",
    family: "RDM",
    status: "orchestrated",
    focus: "Catálogo turístico, rutas, eventos y servicios para visitantes.",
    absorbedImprovements: [
      "Agrupación turismo + comercios + rutas como una sola experiencia operacional.",
      "CTA directas hacia rutas, catálogo, mapa y directorio.",
      "Lenguaje de producto para activar economía local.",
    ],
  },
  {
    id: "real-del-monte-twin",
    name: "real-del-monte-twin",
    url: "https://github.com/OsoPanda1/real-del-monte-twin",
    family: "Smart City",
    status: "absorbed",
    focus:
      "Gemelo digital, telemetría, capas geoespaciales y lectura territorial.",
    absorbedImprovements: [
      "Matriz de gemelo territorial conectada a mapa y dashboard.",
      "Vocabulario de sensores, saturación, flujos y cuidado patrimonial.",
      "Puente entre decisiones de IA y evidencia geográfica.",
    ],
  },
  {
    id: "rdm-smart-city-os",
    name: "rdm-smart-city-os",
    url: "https://github.com/OsoPanda1/rdm-smart-city-os",
    family: "Smart City",
    status: "orchestrated",
    focus:
      "Paquetes de ciudad inteligente, conectividad, seguridad y operación municipal.",
    absorbedImprovements: [
      "Fases de conectividad soberana y telemetría urbana.",
      "Indicadores de operación para pasar de visión a ejecución.",
      "Lectura modular compatible con administración pública y comercios.",
    ],
  },
  {
    id: "rdm-digital-nodo-cero",
    name: "rdm-digital-nodo-cero",
    url: "https://github.com/OsoPanda1/rdm-digital-nodo-cero",
    family: "Documentación",
    status: "absorbed",
    focus:
      "Nodo Cero soberano, tesis, identidad, protocolos y constitución funcional.",
    absorbedImprovements: [
      "Nodo Cero como comando verificable y no solo declaración.",
      "Anclaje de identidad, BookPI, Phoenix 20/30/50 y auditoría BABAS.",
      "Secuencia de activación para ejecutar el núcleo desde este repo.",
    ],
  },
  {
    id: "tamv-core-atlas",
    name: "tamv-core-atlas",
    url: "https://github.com/OsoPanda1/tamv-core-atlas",
    family: "TAMV",
    status: "reference",
    focus: "Atlas técnico TAMV y lenguaje de interoperabilidad federada.",
    absorbedImprovements: [
      "Mapa de capacidades TAMV reutilizable por rutas del portal.",
      "Criterios de madurez por dominio.",
      "Separación entre visión, contrato y ejecución.",
    ],
  },
  {
    id: "tamv-orchestrator",
    name: "tamv-orchestrator",
    url: "https://github.com/OsoPanda1/tamv-orchestrator",
    family: "TAMV",
    status: "orchestrated",
    focus: "Orquestación API, mutaciones, auth y contratos de datos.",
    absorbedImprovements: [
      "Lectura de cada módulo como contrato ejecutable.",
      "Foco en esquemas, cliente API y control de estado.",
      "Preparación para trazabilidad entre UI y servicios.",
    ],
  },
  {
    id: "tamv-sovereign-hub",
    name: "tamv-sovereign-hub",
    url: "https://github.com/OsoPanda1/tamv-sovereign-hub",
    family: "TAMV",
    status: "reference",
    focus:
      "Hub soberano con economía, wallet, universidad, gobernanza y dream spaces.",
    absorbedImprovements: [
      "Visión de economía soberana y universidad digital como capas futuras.",
      "Governance, achievements y marketplace como destinos de expansión.",
      "Isabella AI como guardianía transversal.",
    ],
  },
  {
    id: "documentacion-tamv",
    name: "DOCUMENTACION-TAMV-DM-X4-e-ISABELLA-AI",
    url: "https://github.com/OsoPanda1/DOCUMENTACION-TAMV-DM-X4-e-ISABELLA-AI",
    family: "Documentación",
    status: "absorbed",
    focus: "Corpus maestro de visión TAMV DM-X4 e Isabella AI.",
    absorbedImprovements: [
      "Narrativa de metaverso sensorial 4D anclado en Real del Monte.",
      "Lenguaje de autoría, soberanía tecnológica y orgullo territorial.",
      "Marco conceptual para superar la landing turística tradicional.",
    ],
  },
];

export const NODE_ZERO_CAPABILITIES: NodeZeroCapability[] = [
  {
    id: "shell",
    title: "Shell turístico-comercial soberano",
    signal:
      "Visitante, comercio, cultura y donativo entran por una sola superficie pública.",
    implementation:
      "Home, rutas, catálogo, directorio, mapa, eventos y REALITO ya se exponen como producto unificado.",
    routes: ["/", "/rutas", "/catalogo", "/directorio", "/mapa"],
    maturity: 92,
  },
  {
    id: "twin",
    title: "Gemelo territorial operable",
    signal:
      "Sitios, rutas, comercios y riesgo territorial pueden leerse como capas del mismo mapa vivo.",
    implementation:
      "POIs georreferenciados, dashboard, contexto soberano y HUD de señales mineras quedan enlazados al Nodo Cero.",
    routes: ["/mapa", "/admin/telemetry", "/sovereign"],
    maturity: 84,
  },
  {
    id: "isabella",
    title: "Isabella / REALITO contextual",
    signal:
      "La IA responde desde memoria cultural, retención turística y cuidado del territorio.",
    implementation:
      "Asistente flotante, motor Isabella, corpus RDM y decisiones auditables operan como una capa transversal.",
    routes: ["/tamv", "/tamv/api", "/corpus", "/admin/isabella"],
    maturity: 88,
  },
  {
    id: "commerce",
    title: "Economía Phoenix 20/30/50",
    signal:
      "El directorio, tiers comerciales y donativos se conectan a una narrativa económica verificable.",
    implementation:
      "Onboarding comercial, tiers, catálogo y donaciones quedan preparados para contratos Stripe/Supabase.",
    routes: ["/negocios", "/catalogo", "/donar", "/admin/economy"],
    maturity: 79,
  },
  {
    id: "memory",
    title: "Memoria federada auditable",
    signal:
      "Cada módulo conserva fuente, contrato, ruta y madurez para evitar dispersión entre repos.",
    implementation:
      "Este registro Nodo Cero consolida RDM, TAMV, Smart City y documentación en una bitácora navegable.",
    routes: ["/fusion", "/federacion", "/enciclopedia", "/corpus"],
    maturity: 95,
  },
  {
    id: "execution",
    title: "Ejecución Nodo Cero",
    signal:
      "La visión se convierte en secuencia: absorber, normalizar, exponer, medir y escalar.",
    implementation:
      "El home ahora muestra el panel de ejecución y Fusion dejó de ser una lista pasiva de repos.",
    routes: ["/fusion", "/admin", "/dashboard"],
    maturity: 90,
  },
];

export const NODE_ZERO_PROTOCOL: NodeZeroProtocolStep[] = [
  {
    id: "investigate",
    title: "Investigar",
    description:
      "Recorrer repositorios RDM/TAMV de OsoPanda1, clasificar familias y detectar capacidades no visibles en este shell.",
    evidence:
      "GitHub API + clones locales de RDM-Digital-X, rdm-digital-nodo-cero, real-del-monte-* y tamv-*.",
  },
  {
    id: "absorb",
    title: "Absorber",
    description:
      "Traer al repo actual la matriz de fusión, el lenguaje operativo y la lectura de capacidades por madurez.",
    evidence:
      "NODE_ZERO_REPOS y NODE_ZERO_CAPABILITIES quedan como contrato fuente del panel.",
  },
  {
    id: "unify",
    title: "Unificar",
    description:
      "Conectar turismo, comercio, gemelo digital, Isabella, soberanía y documentación en rutas existentes.",
    evidence:
      "Cada capacidad lista rutas reales del portal para operar la visión desde una sola interfaz.",
  },
  {
    id: "execute",
    title: "Ejecutar Nodo Cero",
    description:
      "Publicar consola visual con estado, avances, comandos de navegación y próximos contratos técnicos.",
    evidence:
      "NodoCeroCommandCenter se renderiza en home y se reutiliza en Fusion.",
  },
];

export const getNodeZeroCompletion = () => {
  const absorbed = NODE_ZERO_REPOS.filter(
    (repo) => repo.status === "absorbed",
  ).length;
  const weighted = NODE_ZERO_CAPABILITIES.reduce(
    (sum, cap) => sum + cap.maturity,
    0,
  );
  return {
    repos: NODE_ZERO_REPOS.length,
    absorbed,
    orchestrated: NODE_ZERO_REPOS.filter(
      (repo) => repo.status === "orchestrated",
    ).length,
    reference: NODE_ZERO_REPOS.filter((repo) => repo.status === "reference")
      .length,
    maturity: Math.round(weighted / NODE_ZERO_CAPABILITIES.length),
  };
};
