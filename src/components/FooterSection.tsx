import { motion } from "framer-motion";
import { Mountain, MapPin, Mail, Phone, Heart } from "lucide-react";
import mistyMountains from "@/assets/misty-mountains.jpg";

export function FooterSection() {
  return (
    <footer className="relative">
      {/* CTA Section */}
      <div className="relative h-[50vh] overflow-hidden flex items-center justify-center">
        <img src={mistyMountains} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 text-center px-6"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Tu aventura
            <br />
            <span className="text-accent">comienza aquí</span>
          </h2>
          <p className="text-foreground/60 font-body max-w-md mx-auto mb-8">
            Real del Monte te espera con 500 años de historia, sabores únicos y la
            magia de la Sierra de Pachuca.
          </p>
          <a
            href="#inicio"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-10 py-4 rounded-full font-body font-semibold text-sm tracking-wide hover:scale-105 transition-transform"
          >
            Explorar Ahora
          </a>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="px-6 md:px-16 lg:px-24 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Mountain className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-display font-bold text-lg">RDM Digital</p>
                <p className="text-xs text-muted-foreground font-body">OS v4.1 — Soberanía Territorial</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Sistema operativo territorial diseñado para transformar Real del Monte
              en el primer nodo turístico inteligente de Latinoamérica.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm text-muted-foreground font-body">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> Real del Monte, Hidalgo, México</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /> info@rdmdigital.mx</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /> +52 771 123 4567</p>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Explorar</h4>
            <div className="space-y-2">
              {["Historia", "Gastronomía", "Aventura", "Hospedaje", "Cultura"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                  className="block text-sm text-muted-foreground font-body hover:text-accent transition-colors"
                >
                  {item}
                </a>
              ))}
              <a
                href="/donar"
                className="flex items-center gap-1 text-sm text-rose-400 font-body hover:text-rose-300 transition-colors"
              >
                <Heart className="w-3.5 h-3.5" /> Apoyar
              </a>
            </div>
          </div>
        </div>

        <div className="section-divider my-8" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © 2026 RDM Digital. Sistema Soberano — Datos locales, infraestructura local, beneficio local.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Sistema Online — v4.1
          </div>
        </div>
      </div>
    </footer>
  );
}
