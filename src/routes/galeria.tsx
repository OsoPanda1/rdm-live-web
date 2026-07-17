import { createFileRoute } from "@tanstack/react-router";
import { Camera, Image, MapPin, Sparkles } from "lucide-react";
import { ModulePortal } from "@/components/site/ModulePortal";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galería de Real del Monte · RDM Digital" },
      {
        name: "description",
        content: "Fotografías y experiencias compartidas por visitantes de Real del Monte.",
      },
    ],
  }),
  component: Galeria,
});
function Galeria() {
  return (
    <ModulePortal
      eyebrow="Plano 3 · Miradas"
      title="Galería"
      highlight="viajera."
      description="La memoria visual del Pueblo Mágico, construida por quienes lo recorren y lo habitan."
      action={{ to: "/auth", label: "Compartir una foto" }}
      items={[
        {
          icon: Camera,
          title: "Calles con niebla",
          description: "Fachadas, portales y callejones del centro histórico al amanecer.",
          meta: "Centro histórico",
        },
        {
          icon: Image,
          title: "Memoria minera",
          description: "Máquinas, socavones y detalles del patrimonio industrial vivo.",
          meta: "Patrimonio",
        },
        {
          icon: MapPin,
          title: "Bosque y montaña",
          description: "Senderos, miradores y paisajes de la Sierra de Pachuca.",
          meta: "Naturaleza",
        },
        {
          icon: Sparkles,
          title: "Sabores del viaje",
          description: "Pastes, café, cocina local y momentos alrededor de la mesa.",
          meta: "Gastronomía",
        },
      ]}
    />
  );
}
