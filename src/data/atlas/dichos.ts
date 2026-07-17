// src/data/dichos.ts
// Archivo histórico de jerga realmontense — Corpus Lexicográfico del DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL
// Cada dicho usa un nombre propio como cifra de una palabra cotidiana.
// Memoria oral viva — Capa III · Memoria silenciosa del LTOS.
// Indexado en tabla civil_lexicon (federación CIVIL_CORE) con políticas RLS estrictas.

export interface Dicho {
  id: number;
  personaje: string;
  jerga: string;
  significado: string;
  fonetica: string;
  inicial: string;
}

export const dichos: Dicho[] = [
  { id: 1, personaje: "Agustín Hernández", jerga: "Estás Agustín Hernández", significado: "Debilidad física, carencia de fuerza motriz, fatiga muscular o desgano existencial operativo.", fonetica: "A-gus-tín Her-nán-dez", inicial: "A" },
  { id: 2, personaje: "Alberto Rivera", jerga: "Vamos a hacer los Alberto Rivera", significado: "Activación de capacidades corporales vía ejercicio físico, trabajo manual pesado o calistenia de mantenimiento en entorno serrano.", fonetica: "Al-ber-to Ri-ve-ra", inicial: "A" },
  { id: 3, personaje: "Amalia", jerga: "Andas Amalia", significado: "Estado de alta excitación térmica, alteración libidinal o hiperactividad pasional.", fonetica: "A-ma-lia", inicial: "A" },
  { id: 4, personaje: "Aurelia Melgarejo", jerga: "Ya estamos todas las Aurelia Melgarejo", significado: "Reunión colectiva de mujeres jóvenes; uso satírico o irónico en contextos comunitarios.", fonetica: "Au-re-lia Mel-ga-re-jo", inicial: "A" },
  { id: 5, personaje: "Braulia Rutas", jerga: "Ponme para mi Braulia Rutas", significado: "Solicitud de recursos económicos para la primera ingesta alimenticia del día (desayuno operativo).", fonetica: "Brau-lia Ru-tas", inicial: "B" },
  { id: 6, personaje: "Carmelito", jerga: "Me voy a Carmelito", significado: "Cese inmediato de operaciones para entrar en reposo, sueño profundo o descanso reparador.", fonetica: "Car-me-li-to", inicial: "C" },
  { id: 7, personaje: "Chucho Colunga", jerga: "Viene con sus Chucho Colunga", significado: "Uso de vestimenta de gala o indumentaria formal para eventos públicos.", fonetica: "Chu-cho Co-lun-ga", inicial: "C" },
  { id: 8, personaje: "Chucho Pérez", jerga: "Perdóname la Chucho Pérez", significado: "Súplica extrema de absolución de falta crítica o exención de castigo severo.", fonetica: "Chu-cho Pé-rez", inicial: "C" },
  { id: 9, personaje: "Chuco Bolio", jerga: "Habrá un Chuco Bolio", significado: "Convocatoria masiva a concierto popular, festival barrial o celebración sonora.", fonetica: "Chu-co Bo-lio", inicial: "C" },
  { id: 10, personaje: "Ciro Arellano", jerga: "Ya me duelen las Ciro Arellano", significado: "Dolor en glúteos por sedestación prolongada (operación extendida frente a terminales).", fonetica: "Ci-ro A-re-lla-no", inicial: "C" },
  { id: 11, personaje: "Ciro Hernández", jerga: "Cuidado con la Ciro Hernández", significado: "Advertencia climática ante riesgos respiratorios graves por frío y humedad extrema.", fonetica: "Ci-ro Her-nán-dez", inicial: "C" },
  { id: 12, personaje: "Conrado Arista", jerga: "Cómo eres Conrado Arista", significado: "Calificación de torpeza, falta de agudeza mental o ejecución errónea de un procedimiento técnico.", fonetica: "Con-ra-do A-ris-ta", inicial: "C" },
  { id: 13, personaje: "Domingo Rivera", jerga: "No te vaya a caer un Domingo Rivera", significado: "Advertencia sobre impacto físico, accidente de trabajo o desgracia inminente.", fonetica: "Do-min-go Ri-ve-ra", inicial: "D" },
  { id: 14, personaje: "José Luis Fernández", jerga: "Estás muy José Luis Fernández", significado: "Actitud de superioridad estética o presunción.", fonetica: "Jo-sé Lu-is Fer-nán-dez", inicial: "J" },
  { id: 15, personaje: "José Roa", jerga: "¿Cómo está la José Roa?", significado: "Estado y cohesión del colectivo comunitario o tejido social local.", fonetica: "Jo-sé Roa", inicial: "J" },
  { id: 16, personaje: "Kiko García", jerga: "Yo uso puro Kiko García", significado: "Puro billete tosco, efectivo de denominación grande.", fonetica: "Ki-ko Gar-cí-a", inicial: "K" },
  { id: 17, personaje: "Lucha Tejeda", jerga: "Voy a echarme una Lucha Tejeda", significado: "Eufemismo escatológico para evacuación intestinal.", fonetica: "Lu-cha Te-je-da", inicial: "L" },
  { id: 18, personaje: "Mamá del Bolillo", jerga: "Vienes como la mamá del Bolillo", significado: "Expresión facial severa o de mal humor.", fonetica: "Ma-má del Bo-li-llo", inicial: "M" },
  { id: 19, personaje: "Manuel Negrón", jerga: "Andas todo Manuel Negrón", significado: "Estado de delgadez extrema, apariencia de hambruna o desnutrición.", fonetica: "Ma-nuel Ne-grón", inicial: "M" },
  { id: 20, personaje: "Mario Hernández", jerga: "Andas todo Mario Hernández", significado: "Apariencia desgastada, roída por el uso o el tiempo.", fonetica: "Ma-rio Her-nán-dez", inicial: "M" },
  { id: 21, personaje: "Martín López", jerga: "Me dejas Martín López", significado: "Sensación de quedar picado, insatisfecho por interrupción abrupta de actividad.", fonetica: "Mar-tín Ló-pez", inicial: "M" },
  { id: 22, personaje: "Martín Pérez", jerga: "Para echarme mis Martín Pérez", significado: "Para consumir mis alimentos sagrados, ingesta formal.", fonetica: "Mar-tín Pé-rez", inicial: "M" },
  { id: 23, personaje: "Moisés Escamilla", jerga: "No seas Moisés Escamilla", significado: "Comportamiento astuto, ventajoso o ladino.", fonetica: "Moi-sés Es-ca-mi-lla", inicial: "M" },
  { id: 24, personaje: "Mundo Oliver", jerga: "Andas todo Mundo Oliver", significado: "Dispersión atencional, desorientación espacial o comportamiento aturdido.", fonetica: "Mun-do O-li-ver", inicial: "M" },
  { id: 25, personaje: "Narciso Trejo", jerga: "No te hagas Narciso Trejo", significado: "Reprensión para abandonar la simulación de ignorancia o la cobardía intelectual.", fonetica: "Nar-ci-so Tre-jo", inicial: "N" },
  { id: 26, personaje: "Nicolás Ordaz", jerga: "Parecen Nicolás Ordaz", significado: "Señalamiento de traición, deslealtad o comportamiento de delator (Judas).", fonetica: "Ni-co-lás Or-daz", inicial: "N" },
  { id: 27, personaje: "Nicolás Tejeda", jerga: "Échate un Nicolás Tejeda", significado: "Ingesta rápida de bebida alcohólica espirituosa de alta graduación (finfonazo).", fonetica: "Ni-co-lás Te-je-da", inicial: "N" },
  { id: 28, personaje: "Padre Heredia", jerga: "Échale copal al santo, no le hace que le queme los ojos como el Padre Heredia", significado: "Ejecución maximalista de tareas, empujando recursos al límite sin considerar daños colaterales.", fonetica: "Pa-dre He-re-dia", inicial: "P" },
  { id: 29, personaje: "Pancho Soto", jerga: "Con todo Pancho Soto", significado: "Fórmula ritualizada para anteponer respeto máximo antes de juicio crítico.", fonetica: "Pan-cho So-to", inicial: "P" },
  { id: 30, personaje: "Pánfilo Soto", jerga: "Vete a tu Pánfilo Soto", significado: "Orden de retirada hacia el domicilio particular, regresar al cantón.", fonetica: "Pán-fi-lo So-to", inicial: "P" },
  { id: 31, personaje: "Pepe Terán", jerga: "Te pega la Pepe Terán", significado: "Alusión a sometimiento conyugal, dominación por decisiones de la pareja.", fonetica: "Pe-pe Te-rán", inicial: "P" },
  { id: 32, personaje: "Plutarco García", jerga: "Mis Plutarco García se pusieron malos", significado: "Referencia afectiva a descendencia directa en situación de enfermedad.", fonetica: "Plu-tar-co Gar-cí-a", inicial: "P" },
  { id: 33, personaje: "Pompero Rivera", jerga: "Veo a puro Pompero Rivera", significado: "Tumulto desordenado, excitación colectiva y comportamiento caótico.", fonetica: "Pom-pe-ro Ri-ve-ra", inicial: "P" },
  { id: 34, personaje: "Ramón Hernández", jerga: "Con mi Ramón Hernández", significado: "Estado de acompañamiento formal y protector junto a la pareja en espacio público.", fonetica: "Ra-món Her-nán-dez", inicial: "R" },
  { id: 35, personaje: "Ramón Razo", jerga: "Vengo de la Ramón Razo", significado: "Tránsito por capa de polución atmosférica y esmog de la zona metropolitana del Valle de México.", fonetica: "Ra-món Ra-zo", inicial: "R" },
  { id: 36, personaje: "Refugio Fragoso", jerga: "Verás como Refugio Fragoso", significado: "Postura analítica que predice que, tras conflicto aparente, no ocurrirá nada sustantivo.", fonetica: "Re-fu-gio Fra-go-so", inicial: "R" },
  { id: 37, personaje: "Roberto Arista", jerga: "Llegaste Roberto Arista", significado: "Denuncia de comportamiento oportunista, abusivo o ventajoso.", fonetica: "Ro-ber-to A-ris-ta", inicial: "R" },
  { id: 38, personaje: "Roberto Martínez", jerga: "Vienes como Roberto Martínez", significado: "Actitud de furia intensa, aproximación colérica.", fonetica: "Ro-ber-to Mar-tí-nez", inicial: "R" },
  { id: 39, personaje: "Ruberta García", jerga: "Te traes a la Ruberta García", significado: "Carga familiar o descendencia que se transporta.", fonetica: "Ru-ber-ta Gar-cí-a", inicial: "R" },
  { id: 40, personaje: "Sergio Pérez", jerga: "Están muy Sergio Pérez", significado: "Estado de pequeñez o debilidad física (chirris).", fonetica: "Ser-gio Pé-rez", inicial: "S" },
  { id: 41, personaje: "Simón Guerrero", jerga: "Mi Simón Guerrero no me dejaba", significado: "Referencia a la pareja como figura de autoridad o fiera domestica.", fonetica: "Si-món Gue-rre-ro", inicial: "S" },
];

export const dichosPorInicial = dichos.reduce<Record<string, Dicho[]>>((acc, d) => {
  (acc[d.inicial] ||= []).push(d);
  return acc;
}, {});
