import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
  delay?: number;
  stagger?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  stagger = false,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("rdm-revealed");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const dirClass =
    direction === "left"
      ? "rdm-reveal-left"
      : direction === "right"
        ? "rdm-reveal-right"
        : direction === "scale"
          ? "rdm-reveal-scale"
          : "rdm-reveal";

  return (
    // @ts-expect-error Tag is a valid HTML element
    <Tag
      ref={ref}
      className={`${dirClass} ${stagger ? "rdm-stagger" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

interface ParallaxSectionProps {
  children: ReactNode;
  bgImage?: string;
  className?: string;
  overlay?: boolean;
}

export function ParallaxSection({
  children,
  bgImage,
  className = "",
  overlay = true,
}: ParallaxSectionProps) {
  return (
    <div
      className={`rdm-parallax-section relative ${className}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {overlay && <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-[1]" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface CinematicBannerProps {
  image: string;
  alt: string;
  height?: string;
  children?: ReactNode;
  className?: string;
}

export function CinematicBanner({
  image,
  alt,
  height = "60vh",
  children,
  className = "",
}: CinematicBannerProps) {
  return (
    <div
      className={`rdm-cinematic-banner ${className}`}
      style={{ height, minHeight: "400px" }}
    >
      <img src={image} alt={alt} loading="lazy" />
      {children && (
        <div className="absolute inset-0 z-10 flex items-end p-8 md:p-16">
          {children}
        </div>
      )}
    </div>
  );
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
}

export function FloatingParticles({ count = 6, color }: FloatingParticlesProps) {
  return (
    <div className="rdm-particles">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={color ? { background: color } : undefined}
        />
      ))}
    </div>
  );
}

interface GlowDividerProps {
  className?: string;
}

export function GlowDivider({ className = "" }: GlowDividerProps) {
  return <div className={`rdm-glow-divider my-8 ${className}`} />;
}
