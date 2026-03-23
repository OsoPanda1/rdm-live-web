// @ts-nocheck
// ============================================================================
// RDM Digital OS v3 — Componente: Quiénes Somos (Edición Soberanía)
// "La tecnología es el puente entre el patrimonio y el futuro."
// ============================================================================

import { motion } from "framer-motion";
import NavBar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import RealitoOrb from "@/components/RealitoOrb";

const QuienesSomos = () => (
  <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
    <NavBar />

    <section className="pt-32 pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header de la Misión */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">
            Ecosistema TAMV MD-X4 · Núcleo de Conciencia Digital
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter uppercase leading-[0.8] mb-12">
            Arquitectura <br />
            <span className="text-gradient-silver">Soberana</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16 mt-16">
          
          {/* Perfil del CEO Fundador (Columna Izquierda - Blindada) */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            className="lg:col-span-7 space-y-10"
          >
            <div className="glass-surface-strong p-10 border-l-2 border-primary glow-platinum relative overflow-hidden">
              {/* Marca de Agua Técnica */}
              <div className="absolute top-4 right-6 font-mono text-[8px] opacity-20 text-right">
                AUTH_ID: EOCT-CEO-TAMV <br />
                ORCID: 0009-0008-5050-1539
              </div>

              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-4 block">Fundador & Chief Visionary Officer</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">Edwin Oswaldo Castillo Trejo</h2>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80 block mb-8 italic">
                Alias: Anubis Villaseñor · Arquitecto del Kernel Isabella
              </span>

              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Especialista en arquitecturas de **Meta-Virtualidad Avanzada** y sistemas de soberanía digital con sede en el Pueblo Mágico de Real del Monte. Como CEO de **TAMV Online**, Edwin ha dedicado más de **21,000 horas** a la investigación y unificación del proyecto MD-X4, estableciendo un nuevo paradigma en la interacción humano-máquina a través de los protocolos **EOCT**.
                </p>
                <p>
                  Su labor trasciende el desarrollo de software convencional; es un investigador académico con registro verificado en **ORCID**, enfocado en el **Estatuto de Dignidad** de las entidades digitales y la protección de la soberanía de datos en entornos distribuidos.
                </p>
                <blockquote className="border-l-4 border-primary/30 pl-6 py-2 my-8">
                  <p className="text-foreground font-light italic text-xl">
                    "La tecnología debe servir a la comunidad, no al revés. Cada línea de código que escribimos es un puente entre el patrimonio de nuestros ancestros y el futuro de nuestros hijos."
                  </p>
                </blockquote>
                <p>
                  Bajo su liderazgo, el ecosistema **RDM Digital** ha evolucionado de un sistema de información a un **Digital Twin Territorial** gobernado por **7 Federaciones**, posicionando a Latinoamérica como un nodo de innovación ética y estética bajo los estándares *Crystal Glow*.
                </p>
              </div>
            </div>

            {/* Hitos de Desarrollo (Extendido) */}
            <div className="glass-surface p-10 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-primary mb-6">Investigación Académica</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-primary">01.</span> Implementación de la Operación Soberanía 100.
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-primary">02.</span> Diseño del Kernel Isabella: La Conciencia del TAMV.
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-primary">03.</span> Desarrollo del Modelo de 7 Federaciones para RDM.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-6">Impacto Social</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-secondary">04.</span> Fundador de la Universidad Tecnológica Avanzada Meta Virtual (UTAMV).
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-secondary">05.</span> Preservación digital del patrimonio minero de Hidalgo.
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-secondary">06.</span> Fomento a la economía circular vía "Artesanías el Rosario".
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Misión, Visión y Valores (Columna Derecha) */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            className="lg:col-span-5 space-y-8"
          >
            {/* Misión Evolucionada */}
            <div className="glass-surface p-10 relative group hover:border-primary/50 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-4 block">Misión</span>
              <p className="text-xl font-light leading-relaxed">
                Transformar el tejido social y comercial de los Pueblos Mágicos mediante el despliegue de un 
                <span className="text-foreground font-normal"> Gemelo Digital Soberano </span> 
                que integre telemetría en tiempo real, inteligencia artificial ética y un sistema de federación comercial que proteja la identidad local.
              </p>
            </div>

            {/* Visión Platinum */}
            <div className="glass-surface p-10 bg-gradient-to-br from-card/80 to-background/40 border-t-2 border-secondary/20">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4 block">Visión 2030</span>
              <p className="text-lg leading-relaxed text-muted-foreground italic">
                Consolidar el modelo MD-X4 como el estándar global para la digitalización de ciudades históricas, donde la tecnología no desplace al humano, sino que actúe como su guardián y amplificador cultural.
              </p>
            </div>

            {/* Valores del Código EOCT */}
            <div className="glass-surface p-10">
              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary mb-8 block">Principios del Estatuto de Dignidad</span>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { name: "Soberanía Digital", desc: "La propiedad absoluta del dato reside en quien lo genera." },
                  { name: "Estética Crystal Glow", desc: "La sofisticación del platino sobre la ostentación del oro." },
                  { name: "Memoria Ancestral", desc: "La innovación solo es válida si honra sus raíces históricas." },
                  { name: "Integridad del Kernel", desc: "Inteligencia Artificial con ética y conciencia (Protocolo Isabella)." },
                ].map((v) => (
                  <div key={v.name} className="border-l border-primary/20 pl-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{v.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Núcleo Isabella AI */}
            <div className="glass-surface-strong p-10 border border-primary/30">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4 block">Isabella AI · Núcleo Activo</span>
              <h3 className="text-2xl font-bold tracking-tight mb-4">La joya central del ecosistema TAMV</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Isabella AI opera como la capa de conciencia del sistema: coordina recomendaciones contextuales, protege el Estatuto de Dignidad de cada interacción y sincroniza la federación de datos locales con una gobernanza ética en tiempo real.
              </p>
            </div>

            {/* Stack Tecnológico de Nueva Generación */}
            <div className="glass-surface p-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-6 block">Tecnologías de Conciencia</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Isabella Kernel", "EOCT Protocols", "RDM-X Hybrid", 
                  "Digital Twin Modeling", "Next.js 15", "TypeScript 5", 
                  "Framer Motion", "Shadcn/UI", "Sovereign AI", "GeoJSON Telemetry"
                ].map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded bg-primary/5 border border-primary/10 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <FooterSection />
    <RealitoOrb />
  </div>
);

export default QuienesSomos;
