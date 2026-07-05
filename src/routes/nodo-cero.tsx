import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/nodo-cero")({
  head: () => ({
    meta: [
      { title: "Nodo Cero · Manifiesto Soberano · RDM Digital" },
      { name: "description", content: "Manifiesto del Nodo Cero: el punto de origen del Sistema Operativo Territorial de Real del Monte." },
      { property: "og:title", content: "Nodo Cero · Manifiesto" },
    ],
  }),
  component: NodoCeroPage,
});

function NodoCeroPage() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-sovereign text-accent mb-3">V · Origen</div>
          <h1 className="font-display text-6xl md:text-7xl text-ink">Nodo <span className="text-gradient-copper italic">Cero</span></h1>
          <p className="mt-6 text-muted-foreground">El primer pulso del kernel. La piedra angular del territorio digital.</p>
        </div>

        <article className="prose prose-stone mt-16 space-y-6 text-foreground">
          <p className="text-2xl font-display italic text-ink leading-snug">
            "Real del Monte no es una aplicación. Es un cuerpo. Es una memoria. Es un voto."
          </p>
          <p>
            El Nodo Cero declara que toda infraestructura digital construida sobre este territorio responde primero al territorio mismo: a sus calles empedradas, a sus minas heredadas del cornish, a sus muertos, a sus capillas, a sus paste, a sus dichos.
          </p>
          <p>
            <strong>RDM Digital LTOS</strong> es el Sistema Operativo Urbano Soberano que articula —bajo el Kernel Heptafederado TAMV MD-X4— identidad ciudadana, cartografía viva, turismo inteligente, telemetría federada, comercio Phoenix, conocimiento BookPi y decimación divina Dekateotl.
          </p>
          <p>
            Las doce sub-plataformas fusionadas son una sola obra: un organismo computacional al servicio de un pueblo. La fusión no las anula, las orquesta. Cada una conserva su federación originaria mientras responde al pulso común del Nodo Cero.
          </p>
          <p className="text-lg italic">
            "Pesamos el corazón del código contra la pluma de la verdad."
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 not-prose">
            <div className="rounded-2xl border-hairline bg-card p-5">
              <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground">ORCID</div>
              <div className="font-display text-lg text-ink mt-1">0009-0008-5050-1539</div>
            </div>
            <div className="rounded-2xl border-hairline bg-card p-5">
              <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground">DOI</div>
              <div className="font-display text-lg text-ink mt-1">10.5281/zenodo.19436662</div>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground text-center">
            Edwin Oswaldo Castillo Trejo · Anubis Villaseñor<br />
            Arquitectos del Nodo Cero
          </p>
        </article>
      </div>
    </section>
  );
}
