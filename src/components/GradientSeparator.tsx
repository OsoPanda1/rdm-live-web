import { motion } from "framer-motion";

interface GradientSeparatorProps {
  className?: string;
  animated?: boolean;
  variant?: "gold" | "electric" | "full" | "default";
}

const GradientSeparator = ({ className = "", animated = false, variant = "default" }: GradientSeparatorProps) => {
  if (animated || variant === "full") {
    return (
      <div className={`relative w-full my-0 ${className}`}>
        <div className="separator-animated w-full" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: "hsl(43,80%,55%)", boxShadow: "0 0 12px hsla(43,80%,55%,0.6)" }}
          animate={{ x: ["-50vw", "50vw"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const gradientStyle = variant === "gold"
    ? "linear-gradient(90deg, transparent 0%, hsl(43,80%,55%) 20%, hsl(25,55%,45%) 80%, transparent 100%)"
    : variant === "electric"
    ? "linear-gradient(90deg, transparent 0%, hsl(210,100%,55%) 20%, hsl(210,100%,45%) 80%, transparent 100%)"
    : undefined;

  return (
    <div
      className={`w-full my-0 ${variant === "default" ? "separator-gradient" : ""} ${className}`}
      style={gradientStyle ? { height: "1px", background: gradientStyle } : undefined}
    />
  );
};

export default GradientSeparator;
