// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SocialLinks from "@/modules/constelacionInteractiva/SocialLinks";

/**
 * Constelación Interactiva: Sistema de Navegación - Menú Interactivo
 * 
 * Proporciona un sistema de navegación visualmente atractivo y fácil de usar
 * para explorar la plataforma TAMV Online Network.
 */
const Navigation = () => {
  return (
    <motion.header 
      className="w-full bg-black/50 backdrop-blur-md border-b border-blue-500/20 py-4 px-6 relative z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
        </div>
        
        <nav className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-4">
          <ul className="flex space-x-4 sm:space-x-8 items-center">
            <li>
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-blue-300 transition-colors relative group px-2"
              >
                Inicio
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
            <li>
              <Link 
                to="/documentation" 
                className="text-sm text-muted-foreground hover:text-blue-300 transition-colors relative group px-2"
              >
                Documentación
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
            <li>
              <Link 
                to="/membership" 
                className="text-sm text-muted-foreground hover:text-blue-300 transition-colors relative group px-2"
              >
                Membresía
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            </li>
            <li>
              <a 
                href="https://orcid.org/0009-0008-5050-1539" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-muted-foreground hover:text-blue-300 transition-colors relative group px-2"
              >
                ORCID
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            </li>
          </ul>
          
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <Link to="/register" className="ml-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-blue-300 border-blue-500/30 hover:bg-blue-500/10">
                <User className="h-4 w-4" />
                <span>Registro</span>
              </Button>
            </Link>
            <SocialLinks className="ml-2 text-muted-foreground" iconSize={4} />
          </div>
        </nav>
      </div>
      
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
    </motion.header>
  );
};

export default Navigation;