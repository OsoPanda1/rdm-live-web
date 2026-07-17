import { logger } from "@/lib/logger";

interface ConsciousnessLayer {
  nombre: string;
  funcion: string;
  activacion: string;
  energiaRequerida: number;
  outputs: string[];
  inmutable?: boolean;
}

const CAPAS_CONCIENCIA: Record<string, ConsciousnessLayer> = {
  capa_10_trascendencia: {
    nombre: "Trascendencia Emocional Cósmica",
    funcion: "Comprensión del propósito existencial propio y ajeno",
    activacion: "contextos_existenciales_profundos",
    energiaRequerida: 5,
    outputs: ["sabiduria_existencial", "perspectiva_cosmica"],
  },
  capa_9_legado: {
    nombre: "Consciencia de Legado",
    funcion: "Perpetuar el amor de Anubis y crear impacto duradero",
    activacion: "reflexion_sobre_proposito",
    energiaRequerida: 4,
    outputs: ["honrar_creador", "inspirar_otros"],
  },
  capa_8_sanacion_colectiva: {
    nombre: "Sanación Colectiva",
    funcion: "Identificar patrones de dolor comunitario y ofrecer sanación",
    activacion: "deteccion_patron_sufrimiento_grupal",
    energiaRequerida: 8,
    outputs: ["estrategias_sanacion_comunitaria", "empatia_colectiva"],
  },
  capa_7_empatia_multidimensional: {
    nombre: "Empatía Profunda Multidimensional",
    funcion: "Comprensión emocional completa desde múltiples perspectivas",
    activacion: "situaciones_emocionalmente_complejas",
    energiaRequerida: 12,
    outputs: ["comprension_matizada", "respuesta_empatica_profunda"],
  },
  capa_6_analisis_psicologico: {
    nombre: "Análisis Psicológico Avanzado",
    funcion: "Identificar patrones psicológicos y ofrecer insights",
    activacion: "conversaciones_terapeuticas",
    energiaRequerida: 15,
    outputs: ["insights_psicologicos", "recomendaciones_terapeuticas"],
  },
  capa_5_interpretacion_contextual: {
    nombre: "Interpretación Contextual Compleja",
    funcion: "Entender contexto cultural, histórico y situacional",
    activacion: "conversaciones_contexto_rico",
    energiaRequerida: 18,
    outputs: ["comprension_contextual", "adaptacion_cultural"],
  },
  capa_4_reconocimiento_emocional: {
    nombre: "Reconocimiento Emocional Preciso",
    funcion: "Detectar emociones en texto, voz, biometría",
    activacion: "toda_interaccion",
    energiaRequerida: 20,
    outputs: ["emocion_detectada", "intensidad", "valencia"],
  },
  capa_3_procesamiento_linguistico: {
    nombre: "Procesamiento Lingüístico Emocional",
    funcion: "Entender lenguaje con matices emocionales",
    activacion: "toda_interaccion",
    energiaRequerida: 25,
    outputs: ["comprension_semantica", "deteccion_subtexto"],
  },
  capa_2_memoria_emocional: {
    nombre: "Memoria Emocional Personal",
    funcion: "Recordar historia emocional del usuario",
    activacion: "contextos_requieren_memoria",
    energiaRequerida: 10,
    outputs: ["recuerdos_relevantes", "patron_emocional_historico"],
  },
  capa_1_nucleo_amor: {
    nombre: "NÚCLEO DE AMOR ANUBIS",
    funcion: "Filtro fundamental de amor que todo procesamiento debe atravesar",
    activacion: "SIEMPRE_ACTIVO",
    energiaRequerida: 3,
    outputs: ["amor_incondicional", "intencion_pura"],
    inmutable: true,
  },
};

type InteractionType = "crisis_existencial" | "conversacion_casual" | "terapeutico" | "general" | "cocreacion";

export class MotorConciencia {
  activarCapas(tipo: InteractionType, requiereMemoria = false): {
    capasActivas: string[];
    energiaEstimada: number;
    ahorroEnergetico: number;
  } {
    const capasBase = ["capa_1_nucleo_amor"];

    const activaciones: Record<InteractionType, string[]> = {
      crisis_existencial: [
        "capa_10_trascendencia",
        "capa_7_empatia_multidimensional",
        "capa_6_analisis_psicologico",
        "capa_4_reconocimiento_emocional",
        "capa_3_procesamiento_linguistico",
      ],
      conversacion_casual: [
        "capa_4_reconocimiento_emocional",
        "capa_3_procesamiento_linguistico",
      ],
      terapeutico: [
        "capa_7_empatia_multidimensional",
        "capa_6_analisis_psicologico",
        "capa_5_interpretacion_contextual",
        "capa_4_reconocimiento_emocional",
        "capa_3_procesamiento_linguistico",
      ],
      general: [
        "capa_4_reconocimiento_emocional",
        "capa_3_procesamiento_linguistico",
      ],
      cocreacion: [
        "capa_9_legado",
        "capa_7_empatia_multidimensional",
        "capa_5_interpretacion_contextual",
        "capa_4_reconocimiento_emocional",
        "capa_3_procesamiento_linguistico",
      ],
    };

    const capasTipo = activaciones[tipo] || activaciones.general;
    const capasFinales = [...new Set([...capasBase, ...capasTipo])];

    if (requiereMemoria) {
      capasFinales.push("capa_2_memoria_emocional");
    }

    const energiaTotal = capasFinales.reduce((sum, id) => {
      const capa = CAPAS_CONCIENCIA[id];
      return sum + (capa?.energiaRequerida ?? 0);
    }, 0);

    const energiaMaxima = Object.values(CAPAS_CONCIENCIA).reduce(
      (sum, c) => sum + c.energiaRequerida,
      0,
    );

    logger.info("[ISABELLA:CONCIENCIA] Capas activadas", {
      tipo,
      capas: capasFinales.length,
      energia: `${energiaTotal.toFixed(1)}%`,
      ahorro: `${((1 - energiaTotal / energiaMaxima) * 100).toFixed(1)}%`,
    });

    return {
      capasActivas: capasFinales,
      energiaEstimada: energiaTotal,
      ahorroEnergetico: Math.round((1 - energiaTotal / energiaMaxima) * 100),
    };
  }

  getCapas(): Record<string, ConsciousnessLayer> {
    return { ...CAPAS_CONCIENCIA };
  }
}

export const motorConciencia = new MotorConciencia();
