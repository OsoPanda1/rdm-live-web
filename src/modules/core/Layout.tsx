// @ts-nocheck
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import TAMVTrixEffect from "@/components/TAMVTrixEffect";

type LayoutProps = {
  children: React.ReactNode;
  showTAMVtrixEffect?: boolean;
};

/**
 * Layout principal de TAMV Online Network
 * Núcleo visual compartido (TAMVTRIX 3.0, Header y contenedor de contenido)
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  showTAMVtrixEffect = true,
}) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 relative overflow-hidden perspective-1000">
        {/* TAMVTRIX 3.0 — Efecto de campo cuántico con letras T A M V O N L I N E */}
        {showTAMVtrixEffect && (
          <TAMVTrixEffect
            baseColor="#3bf5ff"
            minFontSize={10}
            maxFontSize={40}
            speed={1}
            density={0.94}
            words={["TAMV", "ONLINE", "TAMVONLINE", "GENESIS", "DIGYTAMV", "NETWORK"]}
            className="matrix-canvas opacity-30 mix-blend-screen"
          />
        )}

        {/* Nexo Estelar: Header / navegación principal */}
        <Header />

        {/* Contenido principal */}
        <main className="flex-1 relative z-10">
          {children}
        </main>

        <Toaster />
        <Sonner />
      </div>
    </TooltipProvider>
  );
};

export default Layout;