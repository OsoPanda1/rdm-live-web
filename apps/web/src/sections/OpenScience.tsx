import { motion } from "framer-motion";

const references = [
  { label: "ORCID", url: "https://orcid.org/0000-0000-0000-0000" },
  { label: "Zenodo", url: "https://zenodo.org/record/XXXXXX" },
  { label: "Figshare", url: "https://figshare.com/articles/XXXXXX" },
  { label: "OpenAIRE", url: "https://explore.openaire.eu/search/project?projectId=XXXXX" },
  { label: "DataCite", url: "https://search.datacite.org/works?query=RDM+Digital" },
  { label: "CERN / Open Data", url: "https://opendata.cern.ch/" },
  { label: "Blog oficial", url: "https://blog.rdm.digital" },
  { label: "Sitio web TAMV Online", url: "https://tamv.online" },
  { label: "Newsletter LinkedIn", url: "https://www.linkedin.com/newsletters/XXXXX" },
];

export function OpenScienceSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-display font-bold">Ciencia abierta y documentación</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          RDM Digital se documenta y comparte siguiendo los principios de ciencia abierta,
          con registros en plataformas académicas y de datos de investigación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {references.map((ref) => (
          <motion.a
            key={ref.label}
            href={ref.url}
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -3 }}
            className="glass-card block rounded-2xl border border-border/30 p-4 text-sm text-foreground/90"
          >
            <p className="font-semibold">{ref.label}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">{ref.url}</p>
          </motion.a>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Estos registros ayudan a que el proyecto sea indexado y reconocido en comunidades de ciencia abierta y desarrollo urbano a nivel global.
      </p>
    </section>
  );
}
