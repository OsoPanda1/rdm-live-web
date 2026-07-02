// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PrismaticCard from "@/components/PrismaticCard";
import FileUpload from "@/components/FileUpload";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Github } from "lucide-react";

/**
 * Nexo Estelar: Interfaz Principal - Panel Central
 * 
 * Punto de acceso centralizado para todas las funcionalidades de TAMV Online Network.
 * Interfaz intuitiva y personalizable que permite a los usuarios navegar a las diferentes 
 * secciones de la plataforma, gestionar su perfil, acceder a Dream Spaces, chats, la galería, y más.
 */
const NexoEstelarPanel = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle mouse movement for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate parallax transformations
  const getParallaxStyle = (depth: number) => {
    const x = (mousePosition.x - (containerRef.current?.offsetWidth || 0) / 2) / depth;
    const y = (mousePosition.y - (containerRef.current?.offsetHeight || 0) / 2) / depth;
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  return (
    <div ref={containerRef} className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-12">
        {/* Hero section with enhanced visuals */}
        <section className="text-center space-y-6 relative pt-8">
          {/* Holographic Effect */}
          <div className="absolute -top-20 -left-20 w-[140%] h-[140%] bg-gradient-prismatic opacity-5 blur-3xl animate-pulse-slow" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight relative mb-2 leading-tight">
              <span className="text-gradient bg-gradient-crystal animate-text-shimmer inline-block">
                GÉNESIS
              </span>
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white/90 tracking-wider">
              DIGYTAMV
            </h2>
          </motion.div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light tracking-wide">
            Arquitectura Visionaria para la Documentación y Desarrollo del Futuro
          </p>
          
          <div className="flex justify-center">
            <Separator className="bg-gradient-crystal h-0.5 opacity-70 w-24 rounded-full" />
          </div>
        </section>

        {/* Main content with panels representing the blueprint structure */}
        <section className="relative">
          {/* Neural Network Background Effect */}
          <div className="absolute inset-0 bg-[url('/photo-1485827404703-89b55fcc595e')] bg-cover opacity-5 mix-blend-overlay rounded-2xl" />
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <PrismaticCard className="h-full flex flex-col backdrop-blur-lg border-white/10 p-6">
                <div className="absolute inset-0 bg-gradient-quantum opacity-5 animate-pulse-slow rounded-lg" />
                <div className="flex items-center mb-4">
                  <div className="mr-3 p-2 rounded-full bg-blue-500/20 text-blue-400">
                    <Settings className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold relative z-10">Integración Neural de Datos</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6 relative z-10 leading-relaxed">
                  La plataforma Génesis Digytamv permite la asimilación de documentos en 
                  su estructura n-dimensional mediante un proceso de cristalización dinámica.
                </p>
                
                <FileUpload className="flex-1 relative z-10" />
              </PrismaticCard>
            </motion.div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <PrismaticCard variant="crystal" className="relative overflow-hidden p-5">
                  <div className="absolute inset-0 bg-[url('/photo-1439337153520-7082a56a81f4')] bg-cover opacity-10 rounded-lg" />
                  <div className="flex items-center mb-2">
                    <div className="mr-2 p-1.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      <Github className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium relative z-10">Prisma Cognitivo</h3>
                  </div>
                  <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
                    Explora la arquitectura multidimensional donde el conocimiento 
                    trasciende las estructuras lineales convencionales.
                  </p>
                </PrismaticCard>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                <PrismaticCard variant="quantum" className="relative overflow-hidden p-5">
                  <div className="absolute inset-0 bg-[url('/photo-1496307653780-42ee777d4833')] bg-cover opacity-10 rounded-lg" />
                  <div className="flex items-center mb-2">
                    <div className="mr-2 p-1.5 rounded-full bg-purple-500/20 text-purple-300">
                      <Zap className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium relative z-10">Nodos Simbióticos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
                    Los elementos documentales existen en un estado de refinamiento constante, 
                    mejorando automáticamente su precisión y relevancia.
                  </p>
                </PrismaticCard>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
              >
                <PrismaticCard variant="nebula" className="relative overflow-hidden p-5">
                  <div className="absolute inset-0 bg-[url('/photo-1551038247-3d9af20df552')] bg-cover opacity-10 rounded-lg" />
                  <div className="flex items-center mb-2">
                    <div className="mr-2 p-1.5 rounded-full bg-rose-500/20 text-rose-300">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M19 12H21M3 12H5M12 19V21M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h3 className="font-medium relative z-10">Seguridad Exoplanar</h3>
                  </div>
                  <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
                    Sistema inmune digital que detecta y neutraliza inconsistencias lógicas
                    mediante cifrado homomórfico completo.
                  </p>
                </PrismaticCard>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Call to action section */}
        <motion.section 
          className="text-center pt-4 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          <div className="mb-8">
            <Button 
              className="bg-gradient-crystal hover:bg-gradient-quantum hover:shadow-lg transition-all duration-300 text-white px-6 py-6 rounded-md font-medium text-lg" 
              size="lg"
            >
              Explorar el Universo TAMV
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            TAMV ONLINE NETWORK © 2025 — Metaconsciencia Sistémica v1.0
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default NexoEstelarPanel;