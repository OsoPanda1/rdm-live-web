import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CinematicIntro } from "@/components/site/CinematicIntro";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="font-mono text-[10px] tracking-sovereign text-muted-foreground">
        Ruta no federada
      </span>
      <h1 className="font-display text-7xl text-ink mt-2">404</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        El nodo solicitado no está registrado en el kernel territorial.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex rounded-full bg-foreground text-background px-5 py-2 text-sm"
      >
        Volver al núcleo
      </a>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl">Fallo en el pulso federado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Un nodo del kernel no respondió. Puedes reintentar.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-foreground text-background px-5 py-2 text-sm"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RDM Digital · Turismo inteligente en Real del Monte" },
      {
        name: "description",
        content:
          "Plataforma turística territorial de Real del Monte: rutas, gastronomía, cultura, eventos, comunidad y comercios locales.",
      },
      { name: "author", content: "Edwin Oswaldo Castillo Trejo · Anubis Villaseñor" },
      { property: "og:title", content: "RDM Digital · Real del Monte" },
      {
        property: "og:description",
        content:
          "Descubre, recorre y comparte Real del Monte en su plataforma turística inteligente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CinematicIntro />
      <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24">
          <Outlet />
        </main>
        <Footer />
      </div>
      <SpeedInsights />
    </QueryClientProvider>
  );
}
