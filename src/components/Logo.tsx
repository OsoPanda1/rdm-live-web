
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  linkClassName?: string;
}

const Logo = ({ variant = "default", size = "md", className = "", linkClassName = "" }: LogoProps) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: { container: "h-8", logo: "h-8", text: "text-xs" },
    md: { container: "h-10", logo: "h-10", text: "text-sm" },
    lg: { container: "h-12", logo: "h-12", text: "text-base" },
    xl: { container: "h-16", logo: "h-16", text: "text-lg" },
  };

  const logoContent = imgError ? (
    <div className={cn("flex items-center justify-center rounded-full bg-[hsl(var(--rdm-amber))] text-white font-bold", sizeClasses[size].logo, sizeClasses[size].text)}>
      RDM
    </div>
  ) : (
    <img
      src="/lovable-uploads/fbe48ba3-319f-4b17-b3b5-61d51d87c80d.png"
      alt="GÉNESIS DIGYTAMV"
      loading="lazy" className={cn("object-contain transition-all hover:scale-105", sizeClasses[size].logo, className)}
      onError={() => setImgError(true)}
    />
  );

  if (variant === "icon") {
    return (
      <Link to="/" className={cn("flex items-center group", linkClassName)}>
        {logoContent}
      </Link>
    );
  }

  if (variant === "full") {
    return (
      <Link to="/" className={cn("flex items-center group", linkClassName)}>
        <div className={cn("relative", sizeClasses[size].container)}>
          {logoContent}
        </div>
      </Link>
    );
  }

  return (
    <Link to="/" className={cn("flex items-center space-x-2 group", linkClassName)}>
      <div className={cn("relative", sizeClasses[size].container)}>
        {logoContent}
      </div>
    </Link>
  );
};

export default Logo;
