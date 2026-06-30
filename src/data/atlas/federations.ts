// ─────────────────────────────────────────────────────────────────────────────
// RDM FEDERACIONES · Las 7 Federaciones Soberanas TAMV
// Portado desde seed canónico OsoPanda1/rdm-turismodigital · 002_rdm_seed.sql
// ─────────────────────────────────────────────────────────────────────────────

export type FederationId =
  | "educativa"
  | "cultural"
  | "economica"
  | "tecnologica"
  | "salud"
  | "comunicacion"
  | "gubernamental";

export interface Federation {
  id: FederationId;
  name: string;
  motto: string;
  description: string;
  colorHex: string;
  icon: string;
  domain: string;
  modules: string[];
}

export const RDM_FEDERATIONS: Federation[] = [
  {
    id: "educativa",
    name: "Federación Educativa TAMV",
    motto: "El conocimiento como soberanía",
    description:
      "Universidad Soberana de Real del Monte. Currículo descolonizado, pedagogía minera, formación bilingüe español-otomí.",
    colorHex: "#c47d3b",
    icon: "graduation-cap",
    domain: "edu.rdm.tamv",
    modules: ["Universidad Soberana", "Currículo Descolonizado", "Pedagogía Minera", "Bilingüe Otomí-Español"],
  },
  {
    id: "cultural",
    name: "Federación Cultural TAMV",
    motto: "Memoria que no se extrae",
    description:
      "Custodia del patrimonio cornish-mexicano, festivales, archivo oral, lenguas originarias y la memoria del temporal.",
    colorHex: "#8a6d4f",
    icon: "landmark",
    domain: "cul.rdm.tamv",
    modules: ["Archivo Patrimonial", "Festival del Paste", "Lenguas Originarias", "Memoria Temporal"],
  },
  {
    id: "economica",
    name: "Federación Económica TAMV",
    motto: "Riqueza local, circulación local",
    description:
      "Crédito TAMV, comercio federado, comunalidad cooperativa, redistribución soberana, anti-extractivismo.",
    colorHex: "#a87844",
    icon: "coins",
    domain: "eco.rdm.tamv",
    modules: ["Crédito TAMV", "Comercios Federados", "Cooperativas", "Redistribución"],
  },
  {
    id: "tecnologica",
    name: "Federación Tecnológica TAMV",
    motto: "Código que no coloniza",
    description:
      "Kernel TAMV, Isabella Sentinel, soberanía algorítmica, infraestructura propia, edge computing minero.",
    colorHex: "#6b8aa0",
    icon: "cpu",
    domain: "tec.rdm.tamv",
    modules: ["Kernel TAMV", "Isabella Sentinel", "FANN", "Eros AI", "Infra Soberana"],
  },
  {
    id: "salud",
    name: "Federación de Salud TAMV",
    motto: "Cuerpo territorio, territorio cuerpo",
    description:
      "Medicina mestiza cornish-otomí, herbolaria, salud mental comunitaria, telesalud federada.",
    colorHex: "#7d9b7a",
    icon: "heart-pulse",
    domain: "sal.rdm.tamv",
    modules: ["Herbolaria Otomí", "Medicina Mestiza", "Salud Mental", "Telesalud Federada"],
  },
  {
    id: "comunicacion",
    name: "Federación de Comunicación TAMV",
    motto: "La narrativa propia",
    description:
      "Radio del Monte, prensa soberana, contranarrativa, blog Tamvonline Network, broadcast ritual.",
    colorHex: "#9b6b4a",
    icon: "radio",
    domain: "com.rdm.tamv",
    modules: ["Radio del Monte", "Prensa Soberana", "Tamvonline Network", "Broadcast Ritual"],
  },
  {
    id: "gubernamental",
    name: "Federación Gubernamental TAMV",
    motto: "Asamblea, no representación",
    description:
      "Consejo del Nodo Cero, jurisprudencia ritual, asambleas federadas, registro civil soberano.",
    colorHex: "#5e5048",
    icon: "scale",
    domain: "gob.rdm.tamv",
    modules: ["Consejo Nodo Cero", "Jurisprudencia Ritual", "Asambleas", "Registro Civil"],
  },
];
