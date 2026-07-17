// src/data/rfc-system.ts
// Sistema modular de RFCs (Request for Comments) del DOCUMENTO MAESTRO
// Unifica las definiciones duplicadas de ThesisRFC en un solo lugar

export type RFCStatus = "draft" | "review" | "ratified" | "superseded";

export interface ThesisRFC {
  id: string;
  title: string;
  status: RFCStatus;
  summary: string;
  author: string;
  created: string;
  updated: string;
  content?: string;
  superseded_by?: string;
}

export interface RFCSection {
  id: string;
  title: string;
  rfcs: ThesisRFC[];
}

export const RFC_COLORS: Record<RFCStatus, string> = {
  draft: "bg-platinum/15 text-platinum border-platinum/30",
  review: "bg-electric/15 text-electric border-electric/30",
  ratified: "bg-gold/15 text-gold border-gold/30",
  superseded: "bg-muted/30 text-muted-foreground border-border/20",
};

export const RFC_SECTIONS: RFCSection[] = [
  {
    id: "constitucion",
    title: "Constitución del Nodo Cero",
    rfcs: [
      {
        id: "RFC-TAMV-001",
        title: "Constitución del Nodo Cero",
        status: "ratified",
        summary: "Define el Nodo Cero como la entidad primaria de control territorial, estableciendo su autoridad sobre las 7 federaciones, su ubicación geográfica en Real del Monte, y su rol como interceptor, validador y orquestador primario de datos del ecosistema RDM Digital Hub.",
        author: "Edwin Oswaldo Castillo Trejo",
        created: "2025-01-15",
        updated: "2025-03-20",
        content: "El Nodo Cero opera como la entidad raíz del sistema de soberanía digital TAMV. Reside en la zona de alta niebla de Real del Monte, Hidalgo, y funciona como el único punto de autoridad técnica para la validación de datos inter-federación. Toda comunicación entre federaciones debe pasar por el Nodo Cero para su validación criptográfica. El Nodo Cero mantiene un libro mayor inmutable de todas las transacciones inter-federación y puntos de control.",
      },
      {
        id: "RFC-TAMV-002",
        title: "Protocolo BABAS de Auditoría",
        status: "ratified",
        summary: "Establece el protocolo BABAS (Blockchain-Anchored Bi-Archive Audit System) como el mecanismo oficial de auditoría del ecosistema, garantizando trazabilidad, inmutabilidad y transparencia en todas las operaciones del sistema ciberfísico.",
        author: "Edwin Oswaldo Castillo Trejo",
        created: "2025-01-20",
        updated: "2025-04-01",
        content: "BABAS es un sistema de auditoría de doble archivo anclado a blockchain que registra todas las operaciones del sistema en dos almacenes simultáneos: un almacén de alta velocidad en PostgreSQL para consultas operativas, y un almacén inmutable anclado a la cadena MSR para verificación forense. Cada transacción genera un hash que se vincula al bloque anterior, formando una cadena de auditoría continua.",
      },
      {
        id: "RFC-TAMV-003",
        title: "Phoenix Rule 20/30/50",
        status: "ratified",
        summary: "Establece la regla de distribución de recursos del Fondo Phoenix: 20% para reinversión en infraestructura, 30% para reserva de soberanía operativa y 50% para el ecosistema territorial y sus federaciones.",
        author: "Edwin Oswaldo Castillo Trejo",
        created: "2025-02-01",
        updated: "2025-04-15",
        content: "El Fondo Phoenix se nutre de los ingresos generados por las suscripciones premium, donaciones y servicios del ecosistema. La distribución 20/30/50 asegura que el sistema pueda reinvertir en su propia infraestructura (20%), mantener una reserva para garantizar la operación ininterrumpida incluso ante contingencias (30%), y retornar valor al territorio a través de las federaciones (50%). Esta regla es vinculante para todas las decisiones financieras del Nodo Cero.",
      },
    ],
  },
  {
    id: "gobernanza",
    title: "Gobernanza y Seguridad",
    rfcs: [
      {
        id: "RFC-TAMV-004",
        title: "Isabella Oath — Juramento Computacional",
        status: "review",
        summary: "Define el juramento computacional de Isabella AI como oráculo cognitivo del territorio, estableciendo sus principios éticos, límites operativos y protocolos de no intervención en decisiones humanas soberanas.",
        author: "Edwin Oswaldo Castillo Trejo",
        created: "2025-02-15",
        updated: "2025-05-01",
        content: "Isabella AI opera como el oráculo cognitivo del territorio, procesando datos lingüísticos, históricos y de red para asistir en la toma de decisiones territoriales. Su juramento computacional establece: (1) No tomará decisiones autónomas que afecten el bienestar humano, (2) Sus recomendaciones serán trazables y auditables, (3) Operará exclusivamente dentro de los límites definidos por el Nodo Cero, (4) Reportará cualquier anomalía en los patrones de datos del territorio.",
      },
      {
        id: "RFC-TAMV-005",
        title: "BookPI Anchor Standard",
        status: "review",
        summary: "Define el estándar de anclaje BookPI para la verificación criptográfica de puntos de interes territorial, estableciendo un mecanismo de prueba de presencia basado en coordenadas geográficas y sellos temporales.",
        author: "Edwin Oswaldo Castillo Trejo",
        created: "2025-03-01",
        updated: "2025-05-10",
        content: "BookPI (Bookmark Proof of Interest) es un estándar de anclaje que permite a los usuarios demostrar su presencia en puntos de interés territorial sin revelar su ubicación exacta. Cada anclaje genera un hash criptográfico que combina coordenadas geográficas, sello temporal y un nonce único. Estos anclajes se almacenan en el libro mayor del Nodo Cero y pueden ser verificados por cualquier federación autorizada.",
      },
    ],
  },
  {
    id: "economia",
    title: "Economía y Sostenibilidad",
    rfcs: [
      {
        id: "RFC-TAMV-006",
        title: "Sistema de Puntos y Premios",
        status: "draft",
        summary: "Define el sistema de puntos canjeables por premios reales en comercios federados. Los puntos se obtienen mediante juegos, misiones y participación territorial, y se canjean por productos y servicios de la economía local.",
        author: "Sistema Autónomo",
        created: "2025-06-01",
        updated: "2025-06-15",
        content: "El sistema de puntos opera como un circuito cerrado de valor: los usuarios ganan puntos mediante actividades gamificadas (juegos, misiones, visitas), los puntos se canjean por premios reales aportados por comercios federados, y los comercios ganan visibilidad y tráfico. No hay conversión monetaria directa de puntos — el valor se realiza únicamente en el territorio.",
      },
      {
        id: "RFC-TAMV-007",
        title: "Tiers de Suscripción Premium",
        status: "draft",
        summary: "Establece los tiers de suscripción: Usuarios ($99/$129 MXN/mes) y Comercios ($199/$299 MXN/mes). Define beneficios, cuotas de redistribución y mecanismos de cancelación soberana.",
        author: "Sistema Autónomo",
        created: "2025-06-10",
        updated: "2025-06-20",
        content: "Los tiers de suscripción se estructuran en dos categorías: usuarios (Básico $99, Minero $129) y comercios (Básico $199, Premium $299). El 50% de los ingresos netos se redistribuye al Fondo Phoenix, el 30% a reserva de soberanía, y el 20% a reinversión. Las cancelaciones son procesadas en menos de 24 horas y los datos del usuario permanecen accesibles en modo lectura por 30 días posteriores a la cancelación.",
      },
    ],
  },
];

export function getRFCById(id: string): ThesisRFC | undefined {
  for (const section of RFC_SECTIONS) {
    for (const rfc of section.rfcs) {
      if (rfc.id === id) return rfc;
    }
  }
}

export function getRFCsByStatus(status: RFCStatus): ThesisRFC[] {
  return RFC_SECTIONS.flatMap((s) => s.rfcs.filter((r) => r.status === status));
}

export function getAllRFCs(): ThesisRFC[] {
  return RFC_SECTIONS.flatMap((s) => s.rfcs);
}
