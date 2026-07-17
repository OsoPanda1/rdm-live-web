import { motion } from "framer-motion";

interface PageHeroProps {
  image: string;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  highlightClass?: string;
}

const PageHero = ({ image, tag, title, highlight, description, highlightClass = "text-gradient-cyan" }: PageHeroProps) => (
  <section className="relative min-h-[60vh] flex items-end overflow-hidden">
    <div className="absolute inset-0">
      <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
    </div>
    <div className="relative z-10 container mx-auto px-6 pb-16 pt-32">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <span className="font-mono text-xs uppercase tracking-widest text-primary mb-3 block">{tag}</span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9] mb-4">
          {title} <span className={highlightClass}>{highlight}</span>
        </h1>
        <p className="max-w-xl text-muted-foreground text-lg leading-relaxed">{description}</p>
      </motion.div>
    </div>
  </section>
);

export default PageHero;
