import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  accent?: "gold" | "electric" | "copper";
  align?: "center" | "left";
}

const SectionHeader = ({ label, title, subtitle, accent = "gold", align = "center" }: SectionHeaderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const gradientClass = accent === "electric" ? "text-gradient-electric" : "text-gradient-gold";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1 }}
      className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <span className="font-body text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/60 block mb-3">
        {label}
      </span>
      <h2 className={`font-display text-4xl md:text-6xl tracking-tight ${gradientClass}`}>
        {title}
      </h2>
      {subtitle && (
        <p className="font-display text-lg text-[hsl(var(--platinum))]/50 italic mt-4 max-w-lg mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
