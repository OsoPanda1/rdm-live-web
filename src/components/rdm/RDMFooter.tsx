import { Mountain, MapPin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function RDMFooter() {
  return (
    <footer className="border-t border-[hsl(220_11%_82%)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--rdm-amber))] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>RDM Digital</p>
                <p className="text-xs text-[hsl(215_13%_42%)]" style={{ fontFamily: "var(--font-body)" }}>OS Territorial Soberano</p>
              </div>
            </div>
            <p className="text-sm text-[hsl(215_13%_42%)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Sistema operativo territorial diseñado para transformar Real del Monte en el primer nodo turístico inteligente de Latinoamérica.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Contacto</h4>
            <div className="space-y-3 text-sm text-[hsl(215_13%_42%)]" style={{ fontFamily: "var(--font-body)" }}>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[hsl(var(--rdm-amber))]" /> Real del Monte, Hidalgo, México</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[hsl(var(--rdm-amber))]" /> info@rdmdigital.mx</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>Explorar</h4>
            <div className="space-y-2" style={{ fontFamily: "var(--font-body)" }}>
              {[
                { to: "/historia", label: "Historia" },
                { to: "/gastronomia", label: "Gastronomía" },
                { to: "/mapa", label: "Mapa Inteligente" },
                { to: "/directorio", label: "Directorio" },
                { to: "/eventos", label: "Eventos" },
                { to: "/arquitectura", label: "Arquitectura" },
                { to: "/seguridad-tenochtitlan", label: "Seguridad" },
                { to: "/quienes-somos", label: "Quiénes Somos" },
                { to: "/guardian", label: "Gobernanza" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="block text-sm text-[hsl(215_13%_42%)] hover:text-[hsl(var(--rdm-amber))] transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[hsl(220_11%_82%)] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[hsl(215_13%_42%)]" style={{ fontFamily: "var(--font-body)" }}>© 2026 RDM Digital · Infraestructura TAMV Online · Soberanía territorial</p>
          <div className="flex items-center gap-2 text-xs text-[hsl(215_13%_42%)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--rdm-green))] animate-pulse" />
            Sistema Online — v5.0
          </div>
        </div>
      </div>
    </footer>
  );
}
