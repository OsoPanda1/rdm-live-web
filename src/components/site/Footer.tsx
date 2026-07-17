import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-hairline">
      <div className="container mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl text-ink mb-3">
            RDM Digital · <span className="text-gradient-copper">LTOS Territorial</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md font-body">
            Plataforma turística inteligente de Real del Monte, Hidalgo. Rutas, cultura, comunidad,
            comercio y tecnología territorial al servicio del visitante.
          </p>
          <p className="text-[10px] tracking-sovereign text-muted-foreground mt-4 font-mono">
            ORCID 0009-0008-5050-1539 · DOI 10.5281/zenodo.19436662
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-sovereign text-muted-foreground mb-3">Visita</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/rutas" className="hover:text-accent">
                Rutas e itinerarios
              </Link>
            </li>
            <li>
              <Link to="/gastronomia" className="hover:text-accent">
                Gastronomía
              </Link>
            </li>
            <li>
              <Link to="/eventos" className="hover:text-accent">
                Eventos
              </Link>
            </li>
            <li>
              <Link to="/comercios" className="hover:text-accent">
                Directorio local
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-sovereign text-muted-foreground mb-3">Participa</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/comunidad" className="hover:text-accent">
                Comunidad y reseñas
              </Link>
            </li>
            <li>
              <Link to="/membresias" className="hover:text-accent">
                Membresías
              </Link>
            </li>
            <li>
              <Link to="/tienda" className="hover:text-accent">
                Tienda RDM
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-accent">
                Mi cuenta
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground font-mono">
          <span>© 2026 RDM Digital · Real del Monte, Hidalgo</span>
          <span>Arquitectura: Edwin Oswaldo Castillo Trejo · Anubis Villaseñor</span>
        </div>
      </div>
    </footer>
  );
}
