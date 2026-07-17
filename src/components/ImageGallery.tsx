import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera } from "lucide-react";

// Import ALL available real RDM images
import minaImg from "@/assets/mina-acosta.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import pasteImg from "@/assets/paste.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm01 from "@/assets/rdm01.jpg";
import rdm02 from "@/assets/rdm02.jpg";
import rdm03 from "@/assets/rdm03.jpg";
import rdm04 from "@/assets/rdm04.jpg";
import rdm05 from "@/assets/rdm05.jpg";
import rdm06 from "@/assets/rdm06.jpeg";
import rdm7 from "@/assets/rdm7.jpeg";
import rdm07 from "@/assets/rdm07.avif";
import rdm08 from "@/assets/rdm08.jpeg";
import rmd5 from "@/assets/rmd5.jpeg";
import rmd6 from "@/assets/rmd6.jpeg";
import mapaRdm from "@/assets/Mapardm.png";

interface Image {
  id: string;
  src: string;
  title: string;
  category: string;
  description: string;
}

const galleryImages: Image[] = [
  // Historia
  { id: "1", src: minaImg, title: "Mina de Acosta", category: "Historia", description: "Descenso a 460 metros bajo tierra — la mina más famosa del pueblo" },
  { id: "2", src: panteonImg, title: "Panteón Inglés", category: "Historia", description: "El cementerio anglicano más alto del mundo a 2,700 msnm" },
  { id: "3", src: callesImg, title: "Calles Coloniales", category: "Historia", description: "Arquitectura del siglo XIX con influencia victoriana inglesa" },
  { id: "4", src: heroImg, title: "Vista Panorámica", category: "Historia", description: "Real del Monte envuelto en su neblina característica" },
  { id: "5", src: rdm01, title: "Centro Histórico", category: "Historia", description: "12 manzanas protegidas por el INAH" },
  { id: "6", src: rdm02, title: "Parroquia de la Asunción", category: "Historia", description: "Templo barroco del siglo XVIII en la Plaza Principal" },
  
  // Cultura
  { id: "7", src: pasteImg, title: "Paste Tradicional", category: "Cultura", description: "Herencia culinaria de los mineros cornish desde 1824" },
  { id: "8", src: rdm1, title: "Portal del Comercio", category: "Cultura", description: "Tradición comercial en el centro del pueblo" },
  { id: "9", src: rdm2, title: "Arquitectura Cornish", category: "Cultura", description: "Techos de dos aguas y chimeneas estilo inglés" },
  { id: "10", src: rdm03, title: "Casa de la Cultura", category: "Cultura", description: "Eventos culturales y exposiciones permanentes" },
  { id: "11", src: rdm04, title: "Festival del Paste", category: "Cultura", description: "Celebración anual en octubre con 50,000+ visitantes" },
  
  // Naturaleza
  { id: "12", src: penasImg, title: "Peñas Cargadas", category: "Naturaleza", description: "Formaciones rocosas gigantes en equilibrio imposible" },
  { id: "13", src: rdm05, title: "Bosque de Oyamel", category: "Naturaleza", description: "Flora nativa de la Sierra de Pachuca" },
  { id: "14", src: rdm06, title: "Mirador del Valle", category: "Naturaleza", description: "Vistas panorámicas desde 2,700 metros" },
  { id: "15", src: rdm7, title: "Niebla Matutina", category: "Naturaleza", description: "180+ días de neblina al año crean una atmósfera mágica" },
  { id: "16", src: rdm07, title: "Sierra de Pachuca", category: "Naturaleza", description: "Bosques de pinos y encinos rodean el pueblo" },
  
  // Gastronomía
  { id: "17", src: rdm08, title: "Café de Altura", category: "Gastronomía", description: "Cafeterías artesanales con vista a las montañas" },
  { id: "18", src: rmd5, title: "Restaurante Vista", category: "Gastronomía", description: "Comida típica con panorámica del valle" },
  { id: "19", src: rmd6, title: "Barbacoa Estilo Hidalgo", category: "Gastronomía", description: "Tradición dominical en horno de tierra" },
  
  // Arte y Mapas
  { id: "20", src: mapaRdm, title: "Mapa Turístico", category: "Arte", description: "Mapa ilustrado de los principales atractivos" },
];

const categories = ["Todas", "Historia", "Cultura", "Naturaleza", "Gastronomía", "Arte"];

export const ImageGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredImages = selectedCategory === "Todas" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const openLightbox = (image: Image, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const navigate = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" 
      ? (currentIndex - 1 + filteredImages.length) % filteredImages.length
      : (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <section className="py-20"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--crystal-clear)/0.2), transparent 60%)',
      }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-amber-500 mb-4">
            <Camera className="w-3 h-3" /> {galleryImages.length} Fotografías Reales
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
            Real del Monte en Imágenes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Fotografías auténticas que capturan la esencia de nuestro Pueblo Mágico
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-amber-500 text-white shadow-lg"
                  : "glass hover:bg-amber-500/10"
              }`}
            >
              {category}
              {category !== "Todas" && (
                <span className="ml-1 text-xs opacity-60">
                  ({galleryImages.filter(i => i.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Masonry-style grid */}
        <motion.div layout className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group relative cursor-pointer overflow-hidden rounded-xl break-inside-avoid"
                onClick={() => openLightbox(image, index)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 mb-1">
                    {image.category}
                  </span>
                  <h3 className="text-white font-medium text-sm">{image.title}</h3>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{image.description}</p>
                </div>

                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigate("prev"); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate("next"); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl max-h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                loading="lazy" className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              <div className="absolute -bottom-20 left-0 right-0 text-center">
                <span className="text-amber-400 text-sm uppercase tracking-wider">
                  {selectedImage.category}
                </span>
                <h3 className="text-white font-serif text-2xl mt-1">{selectedImage.title}</h3>
                <p className="text-white/60 text-sm mt-1">{selectedImage.description}</p>
                <p className="text-white/40 text-xs mt-3">
                  {currentIndex + 1} / {filteredImages.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ImageGallery;
