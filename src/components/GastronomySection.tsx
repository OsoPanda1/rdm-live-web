import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import pastesFood from "@/assets/pastes-food.jpg";
import marketArtesanias from "@/assets/market-artesanias.jpg";
import { ElegantPagination } from "@/components/ElegantPagination";

const DISHES = [
  { name: "Paste Tradicional · El Portal", desc: "Herencia cornish con papa, carne y cebolla", price: "$20" },
  { name: "Paste de Mole · Casa Minera", desc: "Fusión hidalguense con mole y masa dorada", price: "$24" },
  { name: "Paste Dulce de Piña · Kiko's", desc: "Relleno de piña caramelizada con canela", price: "$25" },
  { name: "Paste de Frijol · Artesanal", desc: "Versión popular de barrio, horneada al momento", price: "$22" },
  { name: "Café de Olla", desc: "Con piloncillo, canela y clavo en barro", price: "$25" },
  { name: "Barbacoa de Borrego", desc: "Cocida en horno de tierra toda la noche", price: "$120" },
  { name: "Pulque Curado", desc: "De avena, piñón o tuna, tradición milenaria", price: "$40" },
];

const PAGE_SIZE = 4;

export function GastronomySection() {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const totalPages = Math.ceil(DISHES.length / PAGE_SIZE);
  const pagedDishes = useMemo(
    () => DISHES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page],
  );

  return (
    <section id="gastronomia" ref={ref} className="relative">
      <div className="relative h-[60vh] overflow-hidden">
        <motion.img
          style={{ y: imgY }}
          src={pastesFood}
          alt="Pastes tradicionales"
          className="absolute inset-0 h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 font-body text-sm uppercase tracking-[0.3em] text-accent">
              🍽️ Gastronomía
            </p>
            <h2 className="font-display text-4xl font-bold leading-[0.9] md:text-7xl">
              Sabores que cruzan
              <br />
              <span className="text-accent">océanos</span>
            </h2>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-6 font-body text-lg leading-relaxed text-foreground/70">
              El paste llegó a Real del Monte en 1824 con la migración minera cornish. Nació como comida
              portátil para el socavón y hoy es emblema de la cocina hidalguense. En el centro histórico,
              las piezas tradicionales se mantienen en un rango accesible de <span className="font-semibold text-accent">$20 a $25 MXN</span>,
              variando por establecimiento y receta.
            </p>
            <p className="mb-10 font-body text-base leading-relaxed text-foreground/70">
              Esta sección prioriza precios reales de paste tradicional para evitar expectativas erróneas en visitantes.
              Otros productos como barbacoa o bebidas mantienen sus rangos propios según porción y temporada.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pagedDishes.map((dish, i) => (
                <motion.div
                  key={dish.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/30"
                >
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="font-display text-sm font-semibold transition-colors group-hover:text-accent">
                      {dish.name}
                    </h4>
                    <span className="font-body text-sm font-semibold text-accent">{dish.price}</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{dish.desc}</p>
                </motion.div>
              ))}
            </div>

            <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[500px] overflow-hidden rounded-2xl"
          >
            <img
              src={marketArtesanias}
              alt="Mercado de artesanías"
              loading="lazy" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
