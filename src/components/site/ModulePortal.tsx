import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "./PageHero";

export type PortalItem = { title: string; description: string; meta?: string; icon: LucideIcon };

export function ModulePortal({
  eyebrow,
  title,
  highlight,
  description,
  items,
  action,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  items: PortalItem[];
  action?: { to: "/auth" | "/comunidad" | "/comercios"; label: string };
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} highlight={highlight} description={description}>
        {action && (
          <Link
            to={action.to}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm"
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </PageHero>
      <section className="container mx-auto px-6 pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all"
          >
            <item.icon className="w-5 h-5 text-accent" />
            {item.meta && (
              <p className="mt-4 font-mono text-[9px] tracking-sovereign text-accent">
                {item.meta}
              </p>
            )}
            <h2 className="font-display text-2xl text-ink mt-2">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
