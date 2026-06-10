const TARGET_HOURS = 23000;

export function FounderStory() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-display font-bold">Historia de resiliencia</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          RDM Digital es el resultado de años de trabajo individual, autofinanciado,
          dedicado a demostrar que un pueblo puede construir su propio Sistema Operativo Urbano.
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-border/30 p-6">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-gold/80">
          Edwin “Anubis” Villaseñor · Fundador de TAMV Online
        </p>
        <p className="mt-3 text-sm text-foreground/90">
          Desde 2018, Edwin ha invertido más de{" "}
          <span className="font-semibold">{TARGET_HOURS.toLocaleString("es-MX")}</span>{" "}
          horas de investigación, diseño, programación y gestión comunitaria para darle forma a RDM Digital LTOS.
          Sin deuda, sin capital de riesgo, con el objetivo de dejar un instrumento de mando tecnológico al servicio del pueblo.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Al alcanzar este hito de {TARGET_HOURS.toLocaleString("es-MX")} horas, se realizará el despliegue oficial de RDM Digital LTOS como Gemelo Digital soberano de Real del Monte.
        </p>
      </div>
    </section>
  );
}
