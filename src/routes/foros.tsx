import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Route as RouteIcon, Store, Trees } from "lucide-react";
import { ModulePortal } from "@/components/site/ModulePortal";

export const Route = createFileRoute("/foros")({
  head: () => ({
    meta: [
      { title: "Foros de viajeros · RDM Digital" },
      {
        name: "description",
        content: "Preguntas, recomendaciones y conversaciones para visitar Real del Monte.",
      },
    ],
  }),
  component: Foros,
});
function Foros() {
  return (
    <ModulePortal
      eyebrow="Plano 2 · Conversación"
      title="Foros de"
      highlight="viajeros."
      description="Resuelve dudas, comparte recomendaciones y conversa con habitantes y comercios de Real del Monte."
      action={{ to: "/auth", label: "Iniciar conversación" }}
      items={[
        {
          icon: RouteIcon,
          title: "Planea tu visita",
          description: "Clima, equipaje, rutas de un día y consejos para recorrer el centro a pie.",
          meta: "Viajes",
        },
        {
          icon: Store,
          title: "Recomendaciones locales",
          description: "Pregunta dónde comer, hospedarte o contratar experiencias verificadas.",
          meta: "Directorio",
        },
        {
          icon: Trees,
          title: "Naturaleza y aventura",
          description: "Senderismo, bosque, ciclismo y seguridad en la montaña.",
          meta: "Experiencias",
        },
        {
          icon: MessageCircle,
          title: "Historias del territorio",
          description: "Memoria minera, leyendas, cultura y conversaciones de la comunidad.",
          meta: "Cultura",
        },
      ]}
    />
  );
}
