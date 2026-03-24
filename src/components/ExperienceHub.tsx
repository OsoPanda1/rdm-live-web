import { Compass, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import pasteriasImg from "@/assets/pasterias.png";
import plateriasImg from "@/assets/platerias.png";
import artesaniasImg from "@/assets/artesanias.png";
import sanitariosImg from "@/assets/sanitarios.png";

const experiences = [
  {
    title: "Pasterías del Monte",
    category: "Gastronomía",
    image: pasteriasImg,
    description: "Los pastes más auténticos con receta inglesa de 1824. Sabores clásicos y nuevas creaciones.",
    rating: 5.0,
  },
  {
    title: "Platerías Artesanales",
    category: "Artesanía & Joyería",
    image: plateriasImg,
    description: "Joyería artesanal en plata que refleja la herencia minera de Real del Monte.",
    rating: 4.8,
  },
  {
    title: "Mercado de Artesanías",
    category: "Cultura & Compras",
    image: artesaniasImg,
    description: "Textiles, cerámica y arte popular de la sierra de Hidalgo.",
    rating: 4.9,
  },
  {
    title: "Servicios al Visitante",
    category: "Información",
    image: sanitariosImg,
    description: "Sanitarios públicos, puntos de información turística y primeros auxilios.",
    rating: 4.7,
  },
];
export default function ExperienceHub() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h2 className="mb-4 font-serif text-5xl font-light italic">Experience Hub</h2>
          <p className="leading-relaxed text-gray-400">
            Explora Real del Monte a través de experiencias curadas por la red RDM Digital. Desde las profundidades
            de las minas hasta los sabores más auténticos.
          </p>
        </div>
        <div className="flex gap-2">
          {["Todos", "Aventura", "Sabor", "Cultura"].map((filter) => (
            <button
              key={filter}
              className="glass rounded-full px-6 py-2 text-xs font-bold transition-all hover:bg-brand-amber hover:text-black"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1 }}
            className="glass group relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10"
          >
            <img
              src={exp.image}
              alt={exp.title}
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-brand-amber/30 bg-brand-amber/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-amber backdrop-blur-md">
                  {exp.category}
                </span>
                <div className="flex items-center gap-1 text-brand-amber">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-bold">{exp.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-brand-amber">{exp.title}</h3>
                <p className="mb-4 line-clamp-2 text-xs text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {exp.description}
                </p>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/20">
                  Explorar Nodo
                  <Compass className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass relative overflow-hidden rounded-[3rem] border border-white/10 p-12">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-amber/20 to-transparent" />
          <img src="https://picsum.photos/seed/route/800/800" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-amber">
              <MapPin className="h-6 w-6 text-black" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-amber">Ruta Destacada</span>
          </div>
          <h3 className="mb-6 text-4xl font-bold">Senda de los Mineros</h3>
          <p className="mb-8 leading-relaxed text-gray-400">
            Una travesía digitalmente guiada que conecta los puntos más emblemáticos de la herencia minera. Sincroniza
            tu dispositivo con el Gemelo Digital para una experiencia inmersiva.
          </p>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 rounded-xl bg-brand-amber px-8 py-4 font-bold text-black transition-all hover:bg-amber-400">
              Iniciar Navegación
              <Compass className="h-4 w-4" />
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-xs font-bold transition-all hover:bg-white/10">
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
