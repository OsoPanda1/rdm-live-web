// @ts-nocheck

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Componente de documentación que muestra el blueprint de TAMV Online Network
 */
const Blueprint: React.FC = () => {
  const blueprintModules = [
    {
      id: 1,
      title: "Nexo Estelar: Interfaz Principal",
      description: "Punto de acceso centralizado para todas las funcionalidades de TAMV Online Network.",
      elements: [
        "Panel de navegación principal",
        "Sección de noticias y actualizaciones personalizadas",
        "Acceso rápido a Dream Spaces recientes y recomendados",
        "Visión general del perfil y saldo de Créditos TAMV",
        "Herramientas de búsqueda y descubrimiento de contenido y usuarios"
      ]
    },
    {
      id: 2,
      title: "Constelación Interactiva: Sistema de Navegación",
      description: "Proporciona un sistema de navegación visualmente atractivo y fácil de usar para explorar la plataforma.",
      elements: [
        "Menú principal con iconos representativos de cada sección",
        "Submenús contextuales que se despliegan según la sección seleccionada",
        "Funcionalidad de búsqueda integrada en el menú",
        "Opciones de personalización del menú según las preferencias del usuario"
      ]
    },
    {
      id: 3,
      title: "Oráculo Tecnológico: Panel de Control",
      description: "Ofrece una interfaz para la gestión del perfil, la creación de contenido, la configuración de la privacidad y el acceso a herramientas avanzadas.",
      elements: [
        "Gestión de perfil: edición de biografía, avatar, preferencias",
        "Configuración de privacidad y seguridad",
        "Herramientas de creación y gestión de Dream Spaces",
        "Interfaz para la creación y publicación de contenido mixto",
        "Acceso a estadísticas y analíticas del propio contenido"
      ]
    },
    {
      id: 4,
      title: "ADN Digital: Base de Datos Central",
      description: "Almacenar y gestionar toda la información de la plataforma de forma eficiente y segura.",
      elements: [
        "Estructura de datos optimizada para consultas rápidas y eficientes",
        "Mecanismos de indexación y búsqueda avanzados",
        "Implementación de políticas de seguridad y privacidad"
      ]
    },
    {
      id: 5,
      title: "Árbol de la Vida Digital: Estructura de Módulos",
      description: "Organizar las diferentes funcionalidades de la plataforma en módulos lógicos e interconectados.",
      elements: [
        "Autenticación y gestión de usuarios",
        "Gestión de perfiles y conexiones",
        "Módulo de Dream Spaces",
        "Módulo de Chat 3D",
        "Módulo de Conciertos Sensoriales",
        "Módulo de Publicaciones Mixtas",
        "Módulo de la Tienda Virtual y Créditos TAMV",
        "Módulo de la Galería de Arte TAMV",
        "Módulo de AURA AI (Gemini Cloud)",
        "Módulo de Anubis Sentinel System (Google Cloud)"
      ]
    },
    {
      id: 6,
      title: "Interfaz Sensorial: Experiencia Multimedia",
      description: "Definir los lineamientos para la presentación de contenido multimedia, incluyendo la integración de elementos sensoriales.",
      elements: [
        "Formatos de archivo soportados",
        "Resoluciones y calidad recomendadas",
        "Directrices para la integración de elementos sensoriales",
        "Optimización del rendimiento multimedia"
      ]
    },
    {
      id: 7,
      title: "Estilo y Materiales: Elementos de Diseño Digital",
      description: "Definir la identidad visual de la plataforma a través de la paleta de colores, la tipografía, los iconos y otros elementos de diseño.",
      elements: [
        "Paleta de colores primaria y secundaria",
        "Tipografía principal y secundaria",
        "Biblioteca de iconos y elementos gráficos",
        "Directrices para el uso de la marca"
      ]
    },
    {
      id: 8,
      title: "Transiciones y Animaciones",
      description: "Diseñar las transiciones entre pantallas y las animaciones dentro de la interfaz para crear una experiencia fluida y atractiva.",
      elements: [
        "Tipos de animaciones y transiciones a utilizar",
        "Duración y velocidad de las animaciones",
        "Directrices para el uso consistente de animaciones"
      ]
    },
    {
      id: 9,
      title: "Mascotas Galácticas Fashionistas",
      description: "Definir el diseño conceptual y las especificaciones técnicas de las mascotas digitales.",
      elements: [
        "Diseños conceptuales y modelos 3D",
        "Especificaciones técnicas para su implementación",
        "Mecanismos de personalización e interacción"
      ]
    },
    {
      id: 10,
      title: "Galería de Arte TAMV",
      description: "Definir la disposición y la funcionalidad de la galería virtual para la exhibición y venta de arte.",
      elements: [
        "Diseño de la interfaz de la galería virtual",
        "Opciones para la visualización de obras de arte",
        "Funcionalidades de compra y venta",
        "Herramientas para artistas"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient bg-gradient-crystal animate-text-shimmer">
          Blueprint de TAMV Online Network
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Visión general de la estructura y el diseño de los principales módulos 
          que componen TAMV Online Network, detallando su propósito y funcionalidades clave.
        </p>
        <div className="flex justify-center mt-4">
          <Separator className="bg-gradient-crystal h-0.5 opacity-70 w-24 rounded-full" />
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {blueprintModules.map(module => (
          <motion.div key={module.id} variants={itemVariants}>
            <Card className="bg-black/30 border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-gradient bg-gradient-crystal">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {module.elements.map((element, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span className="text-sm text-muted-foreground">{element}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Blueprint;