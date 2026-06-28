
import React from "react";
import { Facebook, Instagram, Twitter, Github, Send, Phone, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

type SocialLinksProps = {
  className?: string;
  iconSize?: number;
  variant?: "default" | "buttons" | "links";
};

/**
 * Componente de enlaces sociales que forma parte de la Constelación Interactiva
 * 
 * Este componente proporciona acceso a las diferentes plataformas sociales
 * y puede presentarse en diferentes variantes según el contexto.
 */
const SocialLinks = ({ className = "", iconSize = 4, variant = "links" }: SocialLinksProps) => {
  const socialLinks = [
    { name: "Facebook", icon: Facebook, url: "https://facebook.com", hoverColor: "hover:text-blue-400" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com", hoverColor: "hover:text-pink-400" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com", hoverColor: "hover:text-blue-300" },
    { name: "Telegram", icon: Send, url: "https://t.me/genesisdigytamv", hoverColor: "hover:text-blue-400" },
    { name: "WhatsApp", icon: Phone, url: "https://wa.me/1234567890", hoverColor: "hover:text-green-400" },
    { name: "GitHub", icon: Github, url: "https://github.com", hoverColor: "hover:text-gray-300" },
    { name: "TikTok", icon: Music, url: "https://tiktok.com", hoverColor: "hover:text-pink-300" },
  ];

  if (variant === "buttons") {
    return (
      <div className={`grid grid-cols-7 gap-2 ${className}`}>
        {socialLinks.map((social) => (
          <Button 
            key={social.name}
            variant="outline" 
            size="icon" 
            className="border-blue-500/30 hover:bg-blue-500/10"
            asChild
          >
            <a href={social.url} target="_blank" rel="noopener noreferrer" title={social.name}>
              <social.icon className={`h-${iconSize} w-${iconSize}`} />
            </a>
          </Button>
        ))}
      </div>
    );
  }

  // We'll show just a subset in the header for space reasons
  const displayedSocials = variant === "links" ? socialLinks.slice(0, 4) : socialLinks;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {displayedSocials.map((social) => (
        <a 
          key={social.name}
          href={social.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`transition-colors ${social.hoverColor}`}
          title={social.name}
        >
          <social.icon className={`h-${iconSize} w-${iconSize}`} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
