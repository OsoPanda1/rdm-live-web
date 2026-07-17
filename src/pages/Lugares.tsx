import { RDMLayout } from "@/components/rdm/RDMLayout";
import PlaceCard from "@/components/PlaceCard";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { motion } from "framer-motion";

import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import plazaPrincipalImg from "@/assets/plaza_principal.jpg";
import plazaDosImg from "@/assets/plaza_dos.jpg";
import museoMedicinaImg from "@/assets/museo_medicina.jpg";
import miradorPurisimaImg from "@/assets/mirador_purisima.jpg";
import monumentoMineroImg from "@/assets/monumento_minero.jpg";

const allPlaces = [
  { name: "Museo de Sitio Mina de Acosta", category: "Mina", description: "Museo de historia minera con herramientas antiguas, fotos y visitas guiadas a túneles de 400 m. Dirección: Guerrero s/n, San José Acosta. Horario: 9:30-17:30.", image: minaImg, rating: 4.8 },
  { name: "Panteón Inglés", category: "Museo", description: "Cementerio histórico con 755 tumbas de mineros británicos (90% ocupadas), en un bosque de oyamel a 2,660 msnm, con pequeño museo. A 2.5 km del centro.", image: panteonImg, rating: 4.7 },
  { name: "Peñas Cargadas", category: "Naturaleza", description: "Formaciones rocosas gigantes en equilibrio imposible. Senderismo entre bosque de niebla con vistas panorámicas del valle.", image: penasImg, rating: 4.9 },
  { name: "Parroquia de Nuestra Señora de la Asunción", category: "Iglesia", description: "Iglesia principal en la Plaza Juárez, emblemática del centro histórico con arquitectura colonial. Coordenadas: 20.12928° N, 98.72996° W.", image: heroImg, rating: 4.7 },
  { name: "Museo de Medicina Laboral", category: "Museo", description: "Antiguo hospital de 1908 que muestra enfermedades y tratamientos de mineros. Dirección: Hospital 6, El Hospital. Horario: 9:30-17:30.", image: museoMedicinaImg, rating: 4.5 },
  { name: "Santuario del Señor de Zelontla", category: "Cultura", description: "Templo con detalles fotogénicos como la vestimenta del Cristo Minero, punto de peregrinación local.", image: rdm1, rating: 4.4 },
  { name: "Plaza Principal", category: "Cultura", description: "Corazón del pueblo mágico con portales, fuentes y edificios de aire inglés. Punto de encuentro y vida social.", image: plazaPrincipalImg, rating: 4.5 },
  { name: "Plaza Dos", category: "Cultura", description: "Segunda plaza del centro histórico, rodeada de arquitectura colonial y punto de reunión para eventos culturales y ferias locales.", image: plazaDosImg, rating: 4.3 },
  { name: "Mirador de la Purísima", category: "Naturaleza", description: "Mirador con vistas panorámicas espectaculares del valle y el pueblo. Ideal para fotografías al atardecer cuando la niebla comienza a descender.", image: miradorPurisimaImg, rating: 4.8 },
  { name: "Monumento al Minero", category: "Cultura", description: "Homenaje escultórico a los mineros que forjaron la historia de Real del Monte. Símbolo del sacrificio y la identidad minera de la región.", image: monumentoMineroImg, rating: 4.6 },
  { name: "Museo del Paste", category: "Museo", description: "Conoce la historia del paste, su origen inglés y cómo se convirtió en el platillo emblemático de Real del Monte.", image: pasteImg, rating: 4.6 },
  { name: "Callejón de los Artistas", category: "Cultura", description: "Exhibe fotos de producciones cinematográficas, con vistas panorámicas del pueblo y la sierra.", image: rdm2, rating: 4.3 },
  { name: "Iglesia de la Santa Veracruz", category: "Iglesia", description: "Iglesia histórica vinculada al patrimonio religioso del pueblo.", image: heroImg, rating: 4.3 },
];

const LugaresPage = () => {
  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <SEOMeta {...PAGE_SEO.lugares} />
        <div className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Lugares y Atractivos</h1>
              <p className="text-muted-foreground max-w-lg">Descubre los rincones más emblemáticos de Real del Monte, desde minas históricas hasta bosques de niebla.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPlaces.map((place, i) => (
                <PlaceCard key={place.name} {...place} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </RDMLayout>
  );
};

export default LugaresPage;
