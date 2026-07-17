import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Building2, Gamepad2, Store } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/membresias")({
  head: () => ({
    meta: [
      { title: "Membresías · RDM Digital" },
      {
        name: "description",
        content: "Planes para viajeros y comercios dentro de la plataforma turística territorial.",
      },
    ],
  }),
  component: Membresias,
});
const plans = [
  {
    icon: Gamepad2,
    name: "Explorador",
    price: 99,
    audience: "usuario / mes",
    features: [
      "Retos y recompensas",
      "Insignias territoriales",
      "Rutas guardadas",
      "Beneficios participantes",
    ],
  },
  {
    icon: Store,
    name: "Comercio Esencial",
    price: 299,
    audience: "comercio / mes",
    features: ["Perfil en directorio", "Datos de contacto", "Reseñas verificadas", "Panel básico"],
  },
  {
    icon: Building2,
    name: "Comercio Crece",
    price: 399,
    audience: "comercio / mes",
    features: ["Todo Esencial", "Promociones", "Estadísticas", "Prioridad por categoría"],
  },
  {
    icon: BadgeCheck,
    name: "Comercio Territorial",
    price: 799,
    audience: "comercio / mes",
    features: [
      "Todo Crece",
      "Sello verificado",
      "Experiencias destacadas",
      "Acompañamiento editorial",
    ],
  },
];
function Membresias() {
  return (
    <>
      <PageHero
        eyebrow="Plano 2 · Membresías"
        title="Crece dentro del"
        highlight="territorio."
        description="Planes claros para recompensar a viajeros y dar herramientas digitales a los comercios de Real del Monte."
      />
      <section className="container mx-auto px-6 pb-24 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <article key={p.name} className="rounded-2xl border-hairline bg-card p-6 flex flex-col">
            <p.icon className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl mt-4">{p.name}</h2>
            <div className="mt-3">
              <span className="font-display text-4xl">${p.price}</span>
              <span className="text-xs text-muted-foreground"> MXN</span>
            </div>
            <p className="text-xs text-muted-foreground">{p.audience}</p>
            <ul className="my-6 space-y-2 text-sm flex-1">
              {p.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <Link
              to="/auth"
              className="rounded-full bg-foreground text-background px-4 py-2.5 text-sm text-center"
            >
              Crear cuenta
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
