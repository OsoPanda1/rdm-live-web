// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";

/**
 * Interfaz Sensorial: Efectos de Fondo Dinámicos
 * 
 * Componente que gestiona los efectos visuales de fondo que crean
 * la atmósfera inmersiva de TAMV Online Network.
 */
const BackgroundEffects: React.FC = () => {
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
    <div ref={containerRef} className="fixed inset-0 bg-black z-0">
      {/* Cosmic Tree Layer */}
      <div 
        className="absolute inset-0 bg-[url('/lovable-uploads/46b80c50-4191-4268-9b90-920da55ae5e6.png')] bg-cover bg-center opacity-30 mix-blend-screen"
        style={{
          transform: `translateZ(-200px) scale(${1 + scrollPosition * 0.0005})`,
          transition: "transform 0.1s ease-out",
        }}
      />
      
      {/* Mystical Tree Layer */}
      <div 
        className="absolute inset-0 bg-[url('/lovable-uploads/7f7da0f7-8fa6-4df7-a139-2668062c0b01.png')] bg-cover bg-center opacity-20 mix-blend-overlay"
        style={{
          ...getParallaxStyle(20),
          transform: `translateZ(-150px) translateX(${-scrollPosition * 0.02}px)`,
        }}
      />
      
      {/* Cosmic Circle Layer */}
      <div 
        className="absolute inset-0 bg-[url('/lovable-uploads/e56b7d2b-3b9b-4f2d-bc6c-245f063b39ec.png')] bg-cover opacity-15 mix-blend-luminosity"
        style={{
          ...getParallaxStyle(15),
          transform: `translateZ(-100px) translateX(${scrollPosition * 0.03}px)`,
        }}
      />

      {/* Digital Earth Layer */}
      <div 
        className="absolute inset-0 bg-[url('/lovable-uploads/81cc94d5-e823-4cb3-8227-f751a0c02485.png')] bg-cover bg-center opacity-10 mix-blend-overlay"
        style={{
          ...getParallaxStyle(25),
          transform: `translateZ(-120px) scale(${1 + scrollPosition * 0.0005})`,
        }}
      />

      {/* Animated particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute rounded-full bg-white" 
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Metallic overlay for elegance */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-cyan-800/10 to-slate-900/20 mix-blend-overlay"
        style={{transform: `translateZ(-80px)`}}
      />
      
      {/* Animated subtle grid pattern */}
      <div 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzBBNEJDRCIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBjeD0iMjAiIGN5PSIyMCIgcj0iMTkuNSIvPjwvZz48L3N2Zz4=')]"
        style={{
          opacity: 0.15,
          backgroundSize: '60px 60px',
          ...getParallaxStyle(30)
        }}
      />
    </div>
  );
};

export default BackgroundEffects;