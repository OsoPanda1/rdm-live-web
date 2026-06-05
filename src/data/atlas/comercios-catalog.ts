// src/data/comercios.ts
// Directorio fundacional de comercios y oficios — capa V (economía local) del LTOS.
// Fusiona el seed `businesses.json` del repo `rdm-digital-os` con la cartografía
// real del Pueblo Mágico. Cada entrada está pensada para alimentar mapa,
// recomendador Isabella y futuros pagos vía Cattleya Pay.

export type ComercioCategoria =
  | "paste"
  | "cafe"
  | "restaurante"
  | "hospedaje"
  | "artesania"
  | "guia"
  | "experiencia"
  | "mercado";

export type ComercioMembresia = "comunidad" | "raiz" | "guardian";

export interface Comercio {
  id: string;
  nombre: string;
  categoria: ComercioCategoria;
  membresia: ComercioMembresia;
  tagline: string;
  descripcion: string;
  direccion: string;
  horario: string;
  rangoPrecio: "$" | "$$" | "$$$";
  tags: string[];
  lat: number;
  lng: number;
  // Sello narrativo: pequeña frase que el comerciante quiere que se recuerde
  sello?: string;
}

export const comercios: Comercio[] = [
  {
    id: "com-pasteria-real",
    nombre: "Pastería La Plaza",
    categoria: "paste",
    membresia: "raiz",
    tagline: "Hornos a leña desde 1952",
    descripcion:
      "Tres generaciones de la misma familia horneando pastes con la receta original cornish, ajustada al chile y al mole.",
    direccion: "Calle Hidalgo s/n, frente a la Plaza Principal",
    horario: "L–D · 07:00–21:00",
    rangoPrecio: "$",
    tags: ["paste-tradicional", "carne-papa", "mole-verde", "para-llevar"],
    lat: 20.1431,
    lng: -98.6691,
    sello: "El primer paste del día siempre se regala al primer cliente.",
  },
  {
    id: "com-cafe-neblina",
    nombre: "Café Neblina",
    categoria: "cafe",
    membresia: "raiz",
    tagline: "Donde la sierra se asoma a la taza",
    descripcion:
      "Terraza con vista al cerro y café de la región hidalguense. Punto de encuentro de viajeros, escritores y mineros jubilados.",
    direccion: "Callejón de los Mineros 12",
    horario: "L–D · 08:00–22:00",
    rangoPrecio: "$$",
    tags: ["vista", "wifi", "lectura", "niebla"],
    lat: 20.1422,
    lng: -98.6707,
    sello: "Si llueve, el café americano es cortesía de la casa.",
  },
  {
    id: "com-mesa-cornish",
    nombre: "La Mesa Cornish",
    categoria: "restaurante",
    membresia: "guardian",
    tagline: "Hidalgo y Cornualles, en un mismo plato",
    descripcion:
      "Cocina contemporánea que dialoga con la tradición minera: cordero al hoyo, sopa de hongos del Hiloche, postres con piloncillo.",
    direccion: "Plaza Juárez 4, planta alta",
    horario: "Mi–D · 13:00–22:00",
    rangoPrecio: "$$$",
    tags: ["maridaje", "cocina-de-autor", "reservaciones"],
    lat: 20.143,
    lng: -98.6689,
  },
  {
    id: "com-posada-mineral",
    nombre: "Posada Mineral",
    categoria: "hospedaje",
    membresia: "raiz",
    tagline: "Antigua casa de capataces, hoy doce habitaciones",
    descripcion:
      "Casona del siglo XIX restaurada con maderas locales. Cada habitación lleva el nombre de una mina.",
    direccion: "Calle Constitución 27",
    horario: "Recepción 24 h",
    rangoPrecio: "$$",
    tags: ["historico", "familiar", "chimenea", "desayuno-incluido"],
    lat: 20.1438,
    lng: -98.6704,
    sello: "El cuarto Mina Dolores tiene vista al panteón inglés al amanecer.",
  },
  {
    id: "com-taller-cobre",
    nombre: "Taller del Cobre",
    categoria: "artesania",
    membresia: "comunidad",
    tagline: "Cobre martillado a mano",
    descripcion:
      "Piezas utilitarias y decorativas trabajadas con técnicas heredadas de la herrería minera. Visitas al taller con cita.",
    direccion: "Calle Mariano Jiménez 9",
    horario: "L–S · 10:00–18:00",
    rangoPrecio: "$$",
    tags: ["taller-abierto", "regalo", "souvenir-no-turistico"],
    lat: 20.1426,
    lng: -98.6698,
  },
  {
    id: "com-ruta-guia-victor",
    nombre: "Víctor Mendoza · Guía de minas",
    categoria: "guia",
    membresia: "guardian",
    tagline: "Ex-minero, narrador, certificado",
    descripcion:
      "Recorridos privados por Acosta, Dolores y el panteón inglés. Cuenta la historia desde dentro, no desde el folleto.",
    direccion: "Punto de encuentro: Plaza Juárez",
    horario: "Reservas con 24 h",
    rangoPrecio: "$$",
    tags: ["historia-oral", "minas", "ingles-basico"],
    lat: 20.143,
    lng: -98.669,
  },
  {
    id: "com-mercado-domingo",
    nombre: "Mercado del Domingo",
    categoria: "mercado",
    membresia: "comunidad",
    tagline: "Hongos, hierbas y obsequios del bosque",
    descripcion:
      "Mercado semanal donde productoras del Hiloche bajan con cosecha de temporada. Indispensable en otoño.",
    direccion: "Atrio del templo principal",
    horario: "D · 08:00–14:00",
    rangoPrecio: "$",
    tags: ["temporada", "hongos", "trueque"],
    lat: 20.1432,
    lng: -98.6692,
  },
  {
    id: "com-experiencia-cementerio",
    nombre: "Noche del Panteón Inglés",
    categoria: "experiencia",
    membresia: "guardian",
    tagline: "Recorrido nocturno con velas y narradores",
    descripcion:
      "Cada último viernes del mes. Cupo limitado a 25 personas. Narrativa basada en archivos parroquiales reales.",
    direccion: "Panteón Inglés · Camino al Hiloche",
    horario: "Último viernes · 19:00",
    rangoPrecio: "$$",
    tags: ["nocturno", "memoria", "cornualles"],
    lat: 20.1453,
    lng: -98.6712,
  },
];

export const comercioCategoriaLabel: Record<ComercioCategoria, string> = {
  paste: "Pastes",
  cafe: "Cafés",
  restaurante: "Restaurantes",
  hospedaje: "Hospedaje",
  artesania: "Artesanía",
  guia: "Guías",
  experiencia: "Experiencias",
  mercado: "Mercados",
};

export const membresiaLabel: Record<ComercioMembresia, string> = {
  comunidad: "Comunidad",
  raiz: "Raíz",
  guardian: "Guardián",
};
