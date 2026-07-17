import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface EditorialSectionProps {
  id: string;
  chapter: string;
  title: string;
  subtitle: string;
  body: string[];
  image: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  accentColor?: "gold" | "electric" | "copper";
}

const EditorialSection = ({
  id, chapter, title, subtitle, body, image, imageAlt,
  imagePosition = "left", accentColor = "gold",
}: EditorialSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const accentClass = {
    gold: "text-gradient-gold",
    electric: "text-gradient-electric",
    copper: "text-gold",
  }[accentColor];

  const lineColor = {
    gold: "bg-gold",
    electric: "bg-electric",
    copper: "bg-copper",
  }[accentColor];

  const imgBlock = (
    <motion.div
      className="relative overflow-hidden rounded-lg"
      initial={{ opacity: 0, x: imagePosition === "left" ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="img-zoom aspect-[3/4] md:aspect-auto md:h-full">
        <img src={image} alt={imageAlt} loading="lazy" className="w-full h-full object-cover" />
      </div>
      {/* Glass overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
      {/* Category badge */}
      <div className="absolute top-4 left-4 glass rounded-full px-3 py-1">
        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-gold">{chapter.split("·")[0]?.trim()}</span>
      </div>
    </motion.div>
  );

  const textBlock = (
    <motion.div
      className="flex flex-col justify-center py-12 md:py-24 px-6 md:px-16"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4">
        {chapter}
      </span>

      <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4 leading-tight ${accentClass}`}>
        {title}
      </h2>

      <div className={`w-16 h-px mb-6 ${lineColor}`} />

      <p className="font-display text-lg md:text-xl text-platinum/70 italic mb-8">
        {subtitle}
      </p>

      {body.map((paragraph, i) => (
        <p key={i} className="font-body text-sm md:text-base text-foreground/70 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </motion.div>
  );

  return (
    <section ref={ref} id={id} className="relative min-h-screen">
      <div className="grid md:grid-cols-5 min-h-screen">
        {imagePosition === "left" ? (
          <>
            <div className="md:col-span-3">{imgBlock}</div>
            <div className="md:col-span-2">{textBlock}</div>
          </>
        ) : (
          <>
            <div className="md:col-span-2">{textBlock}</div>
            <div className="md:col-span-3">{imgBlock}</div>
          </>
        )}
      </div>
    </section>
  );
};

export default EditorialSection;
