import { Mountain, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const TURISMO = [
  { to: "/mapa", label: "Mapa Interactivo" },
  { to: "/historia", label: "Historia" },
  { to: "/gastronomia", label: "Gastronomía" },
  { to: "/ecoturismo", label: "Ecoturismo" },
  { to: "/rutas", label: "Rutas Temáticas" },
  { to: "/patrimonio-cultural", label: "Patrimonio" },
  { to: "/estacionamientos", label: "Dónde Estacionar" },
];

const COMUNIDAD = [
  { to: "/directorio", label: "Directorio" },
  { to: "/eventos", label: "Eventos" },
  { to: "/comunidad", label: "Comunidad" },
  { to: "/arte", label: "Arte" },
  { to: "/apoya", label: "Apoya RDM" },
];

export function RDMFooter() {
  return (
    <footer className="border-t border-[hsl(var(--border))] mt-auto" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--rdm-amber))] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>RDM Digital</p>
                <p className="text-[10px] tracking-widest uppercase text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-body)" }}>Pueblo Mágico · Hidalgo</p>
              </div>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Tu guía digital para explorar Real del Monte. Historia minera, gastronomía de pastes, naturaleza de montaña y una comunidad que te espera.
            </p>
          </div>

          {/* Turismo */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ fontFamily: "var(--font-display)" }}>Explora</h4>
            <div className="space-y-2" style={{ fontFamily: "var(--font-body)" }}>
              {TURISMO.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Comunidad */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ fontFamily: "var(--font-display)" }}>Comunidad</h4>
            <div className="space-y-2" style={{ fontFamily: "var(--font-body)" }}>
              {COMUNIDAD.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ fontFamily: "var(--font-display)" }}>Contacto</h4>
            <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[hsl(var(--rdm-amber))]" /> Real del Monte, Hidalgo, México</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[hsl(var(--rdm-amber))]" /> +52 771 123 4567</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[hsl(var(--rdm-amber))]" /> info@rdmdigital.mx</p>
            </div>
            <div className="mt-4">
              <Link
                to="/arquitectura"
                className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <ExternalLink className="w-3 h-3" /> Plataforma técnica
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
            © 2026 RDM Digital · Infraestructura TAMV Online · Soberanía territorial
          </p>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--rdm-green))] animate-pulse" />
            Sistema Online
          </div>
        </div>
      </div>
    </footer>
  );
}
