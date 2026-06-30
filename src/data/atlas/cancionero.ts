// src/data/atlas/cancionero.ts
// Lírica de Asentamiento Urban‑Minero — Capítulo II del DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL
// Obra: "De la Tocada al Cantón"
// Dirección: Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
// Parámetros técnicos: 4/4 sincopado, 95 BPM, Si menor natural (Bmin)
// Instrumentación: requinto acústico doble cuerda, tololoche percutido, caja de ritmos digital, charcheo metálico síncrono
// Función sistémica: calibración del motor de análisis de Isabella AI ante jerga territorial y ritmos urbanos‑mineros
// Almacenamiento: stems en bucket Supabase con control CIVIL_CORE_

export interface SeccionLetra {
  id: string;
  titulo: string;
  versos: string[];
  entidades?: string[];
}

export interface Cancion {
  id: string;
  titulo: string;
  director: string;
  compas: string;
  bpm: number;
  escala: string;
  instrumentacion: string[];
  secciones: SeccionLetra[];
  metadatos: Record<string, string>;
}

export const deLaTocadaAlCanton: Cancion = {
  id: "cancion-001",
  titulo: "De la Tocada al Cantón",
  director: "Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)",
  compas: "4/4 sincopado estricto",
  bpm: 95,
  escala: "Si menor natural (Bmin)",
  instrumentacion: [
    "Requinto acústico de doble cuerda",
    "Tololoche percutido de baja frecuencia",
    "Caja de ritmos digital de alta respuesta transitoria",
    "Charcheo metálico síncrono",
  ],
  secciones: [
    {
      id: "intro",
      titulo: "Introducción — Llamado Serrano",
      versos: [
        "Requinto afina en la niebla del cerro",
        "Tololoche retumba en el callejón",
        "Caja de ritmos marca el pulso del hierro",
        "Charcheo anuncia la revolución",
      ],
      entidades: [],
    },
    {
      id: "verso-1",
      titulo: "Verso I — Crónica de Cantina",
      versos: [
        "Habrá un Chuco Bolio esta noche en el pueblo",
        "José Roa pregunta cómo está la raza",
        "Ciro Hernández advierte: cuida el cielo",
        "Que el frío serrano los huesos traspasa",
        "Amalia anda suelta en el viento minero",
        "Conrado Arista no entiende el momento",
      ],
      entidades: ["Chuco Bolio", "José Roa", "Ciro Hernández", "Amalia", "Conrado Arista"],
    },
    {
      id: "coro",
      titulo: "Coro — De la Tocada al Cantón",
      versos: [
        "De la tocada al cantón, cantón",
        "Pánfilo Soto me llama, es mi rincón",
        "Con mi Ramón Hernández voy de vuelta",
        "Lucha Tejeda me espera en la puerta",
        "Y si me tardo, Pepe Terán me despierta",
      ],
      entidades: ["Pánfilo Soto", "Ramón Hernández", "Lucha Tejeda", "Pepe Terán"],
    },
    {
      id: "verso-2",
      titulo: "Verso II — Barrio y Polvo",
      versos: [
        "Ramón Razo respiro del Valle que viene",
        "Polvo y asfalto, memoria que tiene",
        "Nicolás Ordaz se voltea en la esquina",
        "No sea que la traición se encamina",
        "Narciso Trejo se hace menso en la sombra",
        "Mundo Oliver todo aturdido se asombra",
      ],
      entidades: ["Ramón Razo", "Nicolás Ordaz", "Narciso Trejo", "Mundo Oliver"],
    },
    {
      id: "coro-2",
      titulo: "Coro II — Retorno al Cantón",
      versos: [
        "De la tocada al cantón, cantón",
        "Pánfilo Soto me llama, es mi rincón",
        "Refugio Fragoso dice: no pasará nada",
        "Pero Roberto Arista ya llegó avanzada",
        "Pompero Rivera alborota la manada",
      ],
      entidades: ["Pánfilo Soto", "Refugio Fragoso", "Roberto Arista", "Pompero Rivera"],
    },
    {
      id: "puente",
      titulo: "Puente — El Finfonazo",
      versos: [
        "Nicolás Tejeda, échate un trago",
        "Padre Heredia quema el último rezago",
        "Domingo Rivera, cuida no te caiga",
        "Que el cerro está oscuro y la niebla desgaiga",
      ],
      entidades: ["Nicolás Tejeda", "Padre Heredia", "Domingo Rivera"],
    },
    {
      id: "outro",
      titulo: "Outro — Niebla y Silencio",
      versos: [
        "El requinto se apaga en la bruma del alba",
        "Tololoche calla, descansa el cantón",
        "La caja de ritmos su último palpitar",
        "Charcheo se duerme en el viejo callejón",
        "Mañana será otro Chuco Bolio",
        "Otra vuelta al sol del mineral",
      ],
      entidades: ["Chuco Bolio"],
    },
  ],
  metadatos: {
    track_id: "tocada-canton-v1",
    genero: "Son minero / Cumbia serrana",
    duracion_estimada: "4:30",
    estado: "composición abierta — letra canónica",
    funcion_sistemica: "calibración de Isabella AI ante jerga territorial y ritmos urbanos‑mineros",
  },
};

export const cancionero: Cancion[] = [deLaTocadaAlCanton];
