// RDM Digital · Sitemap XML
// - Reemplazar BASE_URL por el dominio definitivo.
// - Poblar entries desde el router o la BD (rutas dinámicas, slugs).
// - Mantener lastmod en formato ISO (YYYY-MM-DD o completo con TZ).

interface APIContext {
  request: Request;
  params: Record<string, string>;
  locals: Record<string, unknown>;
}

const BASE_URL = "https://www.visitarealdelmonte.online";

type Changefreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapEntry {
  path: string;
  /** ISO 8601 date/time. Idealmente la fecha real de última modificación. */
  lastmod?: string;
  /** Hint para crawlers; opcional y cada vez menos relevante. */
  changefreq?: Changefreq;
  /** Cadena entre 0.0 y 1.0; opcional. */
  priority?: string;
}

/**
 * Normaliza una ruta a <loc> absoluto.
 * Asegura que siempre exista una única barra entre BASE_URL y path.
 */
function toAbsoluteLoc(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

/**
 * Serializa una entrada individual de sitemap a XML <url>…</url>.
 */
function serializeEntry(entry: SitemapEntry): string {
  const lines: string[] = [];

  lines.push("  <url>");
  lines.push(`    <loc>${toAbsoluteLoc(entry.path)}</loc>`);

  if (entry.lastmod) {
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  }
  if (entry.changefreq) {
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  }
  if (entry.priority) {
    lines.push(`    <priority>${entry.priority}</priority>`);
  }

  lines.push("  </url>");

  return lines.join("\n");
}

/**
 * Genera el contenido XML del sitemap a partir de una lista de entries.
 */
function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(serializeEntry).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
}

/**
 * GET /sitemap.xml
 *
 * Nota:
 * - Idealmente, lastmod debería reflejar la fecha real de actualización de cada ruta.
 * - changefreq y priority son hints; Google suele ignorarlos o minimizar su peso.
 */
export async function GET(_ctx: APIContext): Promise<Response> {
  const now = new Date().toISOString();

  const entries: SitemapEntry[] = [
    // Mother Repo — prioridad máxima
    { path: "/", lastmod: now, changefreq: "daily", priority: "1.0" },
    { path: "/mapa", lastmod: now, changefreq: "daily", priority: "0.9" },
    { path: "/lugares", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/directorio", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/eventos", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/comunidad", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/historia", lastmod: now, changefreq: "monthly", priority: "0.7" },
    { path: "/cultura", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/relatos", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/ecoturismo", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/gastronomia", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/arte", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/rutas", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/musica", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/dichos", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/catalogo", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/negocios", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/apoya", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/reglamento", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/auth", lastmod: now, changefreq: "monthly", priority: "0.3" },

    // Smart City OS
    { path: "/dashboard", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/comercios", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/paquetes", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/transporte-local", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/shuttle-cdmx-rdm", lastmod: now, changefreq: "weekly", priority: "0.6" },

    // RDM Digital-X
    { path: "/quienes-somos", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/donar", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/gracias-donativo", lastmod: now, changefreq: "monthly", priority: "0.3" },
    { path: "/comercios/panel", lastmod: now, changefreq: "weekly", priority: "0.5" },

    // Elevated
    { path: "/registro-comercio", lastmod: now, changefreq: "monthly", priority: "0.5" },

    // Citemesh / Wiki
    { path: "/introduccion", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/filosofia", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/arquitectura", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/ia-agentes", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/timeline", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/documentacion", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/gobernanza", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/sistemas-avanzados", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/manuales", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/despliegue", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/biografia-ceo", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/casos-de-uso", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/kit-apis", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/estrategia", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/red-social", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/seguridad-tenochtitlan", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/blockchain-msr", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/xr-tecnologia", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/economia-federada", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/quantum-computing", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/enciclopedia", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/isabella-ai", lastmod: now, changefreq: "weekly", priority: "0.8" },
    { path: "/impacto-civilizatorio", lastmod: now, changefreq: "monthly", priority: "0.4" },

    // Genesis / TAMV
    { path: "/metaverse", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/register", lastmod: now, changefreq: "monthly", priority: "0.3" },
    { path: "/login", lastmod: now, changefreq: "monthly", priority: "0.3" },

    // Civilizational Core
    { path: "/guardian", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/atlas", lastmod: now, changefreq: "weekly", priority: "0.7" },
    { path: "/devhub", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/feed", lastmod: now, changefreq: "weekly", priority: "0.5" },
    { path: "/territorial-dashboard", lastmod: now, changefreq: "weekly", priority: "0.7" },

    // Turismo
    { path: "/estacionamientos", lastmod: now, changefreq: "weekly", priority: "0.6" },
    { path: "/patrimonio-cultural", lastmod: now, changefreq: "weekly", priority: "0.7" },

    // Atlas Territorial
    { path: "/capitulos", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/capitulos/minas", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/capitulos/pastes", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/capitulos/cementerio", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/capitulos/calles", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/capitulos/leyendas", lastmod: now, changefreq: "monthly", priority: "0.6" },
    { path: "/atlas-maximus", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/corpus", lastmod: now, changefreq: "monthly", priority: "0.4" },
    { path: "/ecosistema-ltos", lastmod: now, changefreq: "monthly", priority: "0.5" },
    { path: "/repos", lastmod: now, changefreq: "monthly", priority: "0.4" },

    // Social
    { path: "/perfil", lastmod: now, changefreq: "weekly", priority: "0.5" },
    { path: "/leaderboard", lastmod: now, changefreq: "weekly", priority: "0.5" },
    { path: "/ranking", lastmod: now, changefreq: "weekly", priority: "0.4" },
  ];

  const xml = buildSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      // Suele ser razonable cachear 1h; ajusta según frecuencia de cambios.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
