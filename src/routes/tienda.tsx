import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Package, Shirt, ShoppingBag } from "lucide-react";
import { ModulePortal } from "@/components/site/ModulePortal";

export const Route = createFileRoute("/tienda")({
  head: () => ({
    meta: [
      { title: "Tienda RDM Digital · Real del Monte" },
      {
        name: "description",
        content: "Artículos exclusivos que apoyan el desarrollo de RDM Digital.",
      },
    ],
  }),
  component: Tienda,
});
function Tienda() {
  return (
    <ModulePortal
      eyebrow="Plano 3 · Comercio con propósito"
      title="Tienda"
      highlight="RDM Digital."
      description="Objetos de edición limitada inspirados en Real del Monte. Cada compra sostiene la infraestructura y el contenido del proyecto."
      items={[
        {
          icon: Shirt,
          title: "Playera La Veta",
          description: "Edición territorial en algodón, gráfica inspirada en los planos mineros.",
          meta: "$449 MXN",
        },
        {
          icon: BookOpen,
          title: "Bitácora del viajero",
          description: "Cuaderno de rutas, sellos y notas para documentar tu recorrido.",
          meta: "$289 MXN",
        },
        {
          icon: Package,
          title: "Caja de memoria minera",
          description: "Selección de postales, mapa ilustrado y piezas de colección.",
          meta: "$699 MXN",
        },
        {
          icon: ShoppingBag,
          title: "Bolsa Pueblo de Niebla",
          description: "Bolsa reutilizable con diseño exclusivo de la plataforma.",
          meta: "$249 MXN",
        },
      ]}
    />
  );
}
