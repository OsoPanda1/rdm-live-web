// src/data/dichos.ts
// Archivo histórico de jerga realmontense.
// Cada dicho usa un nombre propio como cifra de una palabra cotidiana.
// Memoria oral viva — Capa III · Memoria silenciosa del LTOS.

export interface Dicho {
  id: number;
  personaje: string;
  jerga: string;
  significado: string;
  // letra inicial para ordenar y filtrar
  inicial: string;
}

export const dichos: Dicho[] = [
  { id: 1, personaje: "Agustín Hernández", jerga: "Estás Agustín Hernández", significado: "Estás débil.", inicial: "A" },
  { id: 2, personaje: "Alberto Rivera", jerga: "Vamos a hacer los Alberto Rivera", significado: "Vamos a hacer los ejercicios.", inicial: "A" },
  { id: 3, personaje: "Amalia", jerga: "Andas Amalia", significado: "Andas caliente.", inicial: "A" },
  { id: 4, personaje: "Aurelia Melgarejo", jerga: "Ya estamos todas las Aurelia Melgarejo", significado: "Ya estamos todas las muchachas (usado entre viejitas).", inicial: "A" },
  { id: 5, personaje: "Braulia Rutas", jerga: "Ponme para mi Braulia Rutas", significado: "Ponme para mi desayuno.", inicial: "B" },
  { id: 6, personaje: "Carmelito", jerga: "Me voy a Carmelito", significado: "Me voy a descansar.", inicial: "C" },
  { id: 7, personaje: "Chucho Colunga", jerga: "Viene con sus Chucho Colunga", significado: "Viene con sus mejores garritas (ropa elegante).", inicial: "C" },
  { id: 8, personaje: "Chucho Pérez", jerga: "Perdóname la Chucho Pérez", significado: "Perdóname la vida.", inicial: "C" },
  { id: 9, personaje: "Chuco Bolio", jerga: "Habrá un Chuco Bolio", significado: "Habrá una tocada (fiesta musical).", inicial: "C" },
  { id: 10, personaje: "Ciro Arellano", jerga: "Ya me duelen las Ciro Arellano", significado: "Ya me duelen las sentaderas.", inicial: "C" },
  { id: 11, personaje: "Ciro Hernández", jerga: "Cuidado con la Ciro Hernández", significado: "Cuidado con la pulmonía.", inicial: "C" },
  { id: 12, personaje: "Conrado Arista", jerga: "Cómo eres Conrado Arista", significado: "Qué bruto eres.", inicial: "C" },
  { id: 19, personaje: "José Luis Fernández", jerga: "Estás muy José Luis Fernández", significado: "Estás muy chulo.", inicial: "J" },
  { id: 20, personaje: "José Roa", jerga: "¿Cómo está la José Roa?", significado: "¿Cómo está la raza?", inicial: "J" },
  { id: 21, personaje: "Kiko García", jerga: "Yo uso puro Kiko García", significado: "Puro billete tosco (efectivo grande).", inicial: "K" },
  { id: 24, personaje: "Mamá del Bolillo", jerga: "Vienes como la mamá del Bolillo", significado: "Vienes con tu carota (de mal humor).", inicial: "M" },
  { id: 25, personaje: "Manuel Negrón", jerga: "Andas todo Manuel Negrón", significado: "Andas todo lambrijo (flaco/hambriento).", inicial: "M" },
  { id: 26, personaje: "Mario Hernández", jerga: "Andas todo Mario Hernández", significado: "Andas todo roído (desgastado).", inicial: "M" },
  { id: 27, personaje: "Martín López", jerga: "Me dejaste Martín López", significado: "Me dejaste picadito (con ganas de más).", inicial: "M" },
  { id: 28, personaje: "Martín Pérez", jerga: "Para echarme mis Martín Pérez", significado: "Para echarme mis sagrados alimentos.", inicial: "M" },
  { id: 29, personaje: "Moisés Escamilla", jerga: "No seas Moisés Escamilla", significado: "No seas ladinito (astuto/ventajoso).", inicial: "M" },
  { id: 30, personaje: "Mundo Oliver", jerga: "Andas todo Mundo Oliver", significado: "Andas todo menso.", inicial: "M" },
  { id: 37, personaje: "Pepe Terán", jerga: "Te pega la Pepe Terán", significado: "Te pega la vieja (la esposa).", inicial: "P" },
  { id: 38, personaje: "Plutarco García", jerga: "Mis Plutarco García se pusieron malos", significado: "Mis hijos se enfermaron.", inicial: "P" },
  { id: 39, personaje: "Pompero Rivera", jerga: "Veo a puro Pompero Rivera", significado: "Pura mula loca (gente alborotada).", inicial: "P" },
  { id: 42, personaje: "Refugio Fragoso", jerga: "Verás como Refugio Fragoso", significado: "Verás como no pasa nada.", inicial: "R" },
  { id: 43, personaje: "Roberto Arista", jerga: "Llegaste Roberto Arista", significado: "Llegaste un poquito tarde.", inicial: "R" },
  { id: 44, personaje: "Roberto Martínez", jerga: "Vienes como Roberto Martínez", significado: "Vienes como el diablo (enojado).", inicial: "R" },
  { id: 45, personaje: "Ruberta García", jerga: "Te traes a la Ruberta García", significado: "Te traes a la descendencia (a la familia).", inicial: "R" },
  { id: 46, personaje: "Sergio Pérez", jerga: "Están muy Sergio Pérez", significado: "Están muy chirris (pequeños/débiles).", inicial: "S" },
  { id: 47, personaje: "Simón Guerrero", jerga: "Mi Simón Guerrero no me dejaba", significado: "Mi fiera (esposa/pareja) no me dejaba.", inicial: "S" },
];

export const dichosPorInicial = dichos.reduce<Record<string, Dicho[]>>((acc, d) => {
  (acc[d.inicial] ||= []).push(d);
  return acc;
}, {});
