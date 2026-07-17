import { motion } from "framer-motion";
import { ReactNode } from "react";
import { RDMLayout } from "./RDMLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RDMPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  children?: ReactNode;
}

export function RDMPageShell({ eyebrow, title, description, bullets = [], children }: RDMPageShellProps) {
  return (
    <RDMLayout>
      <main className="pt-24 pb-8">
        <section className="max-w-7xl mx-auto px-4 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, hsl(var(--rdm-amber) / 0.15) 0%, transparent 58%)" }} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-4xl">
            <Badge variant="outline" className="mb-5 tracking-[0.22em] uppercase text-[10px]">{eyebrow}</Badge>
            <h1 className="text-4xl md:text-6xl font-semibold leading-[0.95]" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
            <p className="mt-5 text-lg text-[hsl(215_13%_42%)] max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>{description}</p>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid lg:grid-cols-3 gap-4">
          {bullets.map((bullet, index) => (
            <motion.div key={bullet} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}>
              <Card className="rdm-glass h-full border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm tracking-[0.14em] uppercase text-[hsl(215_13%_42%)]" style={{ fontFamily: "var(--font-body)" }}>Módulo {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[hsl(215_13%_42%)] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{bullet}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {children && <section className="max-w-7xl mx-auto px-4 md:px-8 mt-8">{children}</section>}
      </main>
    </RDMLayout>
  );
}
