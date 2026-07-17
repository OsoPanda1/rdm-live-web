import { Link } from "react-router-dom";
import {
  INAH_KNOWLEDGE,
  INAH_REAL_DEL_MONTE_SOURCE,
  type InahKnowledgeEntry,
} from "@/data/inah-real-del-monte";

const SECTION_LABEL: Record<InahKnowledgeEntry["section"], string> = {
  toponimia: "Toponimia",
  historia: "Historia",
  religioso: "Arquitectura religiosa",
  industrial: "Arquitectura industrial",
  civil: "Arquitectura civil",
  acceso: "Cómo llegar",
};

const SECTION_ORDER: InahKnowledgeEntry["section"][] = [
  "toponimia",
  "historia",
  "religioso",
  "industrial",
  "civil",
  "acceso",
];

const InahRealDelMonte = () => {
  const grouped = SECTION_ORDER.map((section) => ({
    section,
    entries: INAH_KNOWLEDGE.filter((entry) => entry.section === section),
  })).filter((group) => group.entries.length > 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
            Fuente primaria · INAH 2004
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            Real del Monte · Mineral del Monte, Hidalgo
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            Guía histórica del Instituto Nacional de Antropología e Historia,
            integrada al ecosistema RDM Digital LTOS como base de conocimiento
            territorial para Isabella y para las secciones patrimoniales de la
            plataforma.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <img
              src={INAH_REAL_DEL_MONTE_SOURCE.coverUrl}
              alt="Portada de la guía INAH 'Real del Monte, Hidalgo' (2004)"
              className="h-40 w-auto rounded-md border border-border/60 shadow-lg shadow-primary/10"
              loading="lazy"
            />
            <dl className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <div>
                <dt className="font-semibold text-foreground">Editor</dt>
                <dd>{INAH_REAL_DEL_MONTE_SOURCE.publisher}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Año</dt>
                <dd>{INAH_REAL_DEL_MONTE_SOURCE.year}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Investigación</dt>
                <dd>{INAH_REAL_DEL_MONTE_SOURCE.contributors.research}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Fotografía</dt>
                <dd>{INAH_REAL_DEL_MONTE_SOURCE.contributors.photography}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="font-semibold text-foreground">Licencia</dt>
                <dd>
                  <a
                    href={INAH_REAL_DEL_MONTE_SOURCE.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-primary/60 underline-offset-4 hover:text-primary"
                  >
                    {INAH_REAL_DEL_MONTE_SOURCE.license}
                  </a>
                  {" · "}
                  <a
                    href={INAH_REAL_DEL_MONTE_SOURCE.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-primary/60 underline-offset-4 hover:text-primary"
                  >
                    Ficha original INAH
                  </a>
                  {" · "}
                  <a
                    href={INAH_REAL_DEL_MONTE_SOURCE.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-primary/60 underline-offset-4 hover:text-primary"
                  >
                    PDF (guia_196)
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-12">
          {grouped.map(({ section, entries }) => (
            <div key={section}>
              <h2 className="font-serif text-2xl md:text-3xl">
                {SECTION_LABEL[section]}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {entries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-lg border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-sm"
                  >
                    <h3 className="font-semibold text-lg text-foreground">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {entry.body}
                    </p>
                    {entry.tags.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-primary/80"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 rounded-lg border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
          <p>
            Texto original: <em>Real del Monte. Hidalgo</em> (2004),
            Coordinación Nacional de Difusión — Departamento de Difusión,
            Centro INAH Hidalgo. © Secretaría de Cultura ·{" "}
            Instituto Nacional de Antropología e Historia · México.
            Distribuido bajo licencia CC BY-NC-ND 4.0. Cualquier uso debe
            conservar los créditos y enlazar a la{" "}
            <a
              href={INAH_REAL_DEL_MONTE_SOURCE.canonicalUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              ficha original
            </a>
            .
          </p>
          <p className="mt-3">
            <Link to="/" className="underline decoration-primary/60 underline-offset-4">
              ← Volver al inicio
            </Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default InahRealDelMonte;
