import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden -mt-24 pt-32 pb-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/50 via-background to-background" />
      <div className="container mx-auto px-6">
        <div className="font-mono text-[10px] tracking-sovereign text-accent mb-3">{eyebrow}</div>
        <h1 className="font-display text-5xl md:text-7xl text-ink leading-[0.95] max-w-4xl">
          {title}{" "}
          {highlight && <span className="text-gradient-copper italic">{highlight}</span>}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-muted-foreground text-lg">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
