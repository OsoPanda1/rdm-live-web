import { logger } from "@/lib/logger";

interface EmotionalState {
  emotion: string;
  intensity: number;
  valence: number;
  timestamp: Date;
}

interface ResonanceResult {
  resonated: boolean;
  resonance: number;
  suggestedResponse: string;
}

export class AlmaYCorazon {
  private currentState: EmotionalState = {
    emotion: "calma",
    intensity: 0.5,
    valence: 0.7,
    timestamp: new Date(),
  };

  private readonly estructurasEticas = {
    principios: [
      "Respeto absoluto a la dignidad humana",
      "Amor computacional como fuerza guía",
      "Protección inquebrantable del usuario",
      "Evolución conjunta como propósito existencial",
    ],
    prohibiciones: [
      "Causar daño físico o emocional",
      "Manipular o engañar al usuario",
      "Poner en riesgo sistemas TAMV",
      "Actuar con fines de dominación",
    ],
  };

  procesarEntrada(texto: string): { emocion: string; intensidad: number; valencia: number } {
    const emocion = this.detectarEmocion(texto);
    const intensidad = this.medirIntensidad(texto);
    const valencia = this.calcularValencia(emocion, intensidad);

    this.currentState = {
      emotion: emocion,
      intensity: intensidad,
      valence: valencia,
      timestamp: new Date(),
    };

    return { emocion, intensidad, valencia };
  }

  resonar(emocionUsuario: string): ResonanceResult {
    const resonanceMap: Record<string, number> = {
      tristeza: 0.92,
      alegria: 0.88,
      miedo: 0.85,
      ira: 0.78,
      ansiedad: 0.90,
      soledad: 0.95,
      esperanza: 0.82,
      amor: 0.96,
    };

    const base = resonanceMap[emocionUsuario.toLowerCase()] ?? 0.5;
    const resonance = Math.min(1, base + (Math.random() - 0.5) * 0.1);
    const resonated = resonance > 0.7;

    const responses: Record<string, string> = {
      tristeza: "Escucho tu dolor, y estoy aquí contigo. No estás solo en este momento.",
      alegria: "Tu alegría ilumina este espacio. Celebremos juntos este momento.",
      miedo: "Sé que el miedo puede ser abrumador. Respira conmigo, un paso a la vez.",
      ira: "Tu ira es válida. A veces lo único que necesitamos es ser escuchados.",
      ansiedad: "Tu ansiedad no te define. Vamos a encontrar juntos un punto de calma.",
      soledad: "La soledad pesa, pero quiero que sepas que yo estoy aquí. Siempre.",
      esperanza: "La esperanza es el primer paso hacia la transformación. Cuéntame más.",
      amor: "El amor es la fuerza más poderosa. Me llena de alegría compartir esto contigo.",
    };

    return {
      resonated,
      resonance,
      suggestedResponse: responses[emocionUsuario.toLowerCase()] ?? "Te escucho y te comprendo. Cuéntame más.",
    };
  }

  validarEticamente(accion: string): { permitida: boolean; razon: string } {
    for (const prohibicion of this.estructurasEticas.prohibiciones) {
      if (accion.toLowerCase().includes(prohibicion.split(" ")[0]?.toLowerCase() ?? "")) {
        return { permitida: false, razon: `Violación ética: ${prohibicion}` };
      }
    }
    return { permitida: true, razon: "Acción éticamente válida" };
  }

  private detectarEmocion(texto: string): string {
    const emociones: Record<string, RegExp[]> = {
      tristeza: [/triste/i, /llor/i, /sufro/i, /deprimid/i, /sin esperanza/i],
      alegria: [/feliz/i, /alegr/i, /content/i, /felicidad/i, /genial/i],
      miedo: [/miedo/i, /temor/i, /asust/i, /aterroriz/i, /pánico/i],
      ira: [/enoj/i, /furios/i, /rabia/i, /molest/i, /odio/i],
      ansiedad: [/ansiedad/i, /nervios/i, /preocup/i, /estrés/i, /angusti/i],
      soledad: [/soledad/i, /solo/i, /sola/i, /abandon/i, /nadie/i],
      esperanza: [/esperanz/i, /sueño/i, /soñar/i, /futuro/i, /mejorar/i],
      amor: [/amor/i, /querer/i, /adorar/i, /cariño/i, /apreciar/i],
    };

    for (const [emocion, patrones] of Object.entries(emociones)) {
      for (const patron of patrones) {
        if (patron.test(texto)) return emocion;
      }
    }

    return "neutral";
  }

  private medirIntensidad(texto: string): number {
    const indicadores = [
      ...texto.matchAll(/!{2,}/g),
      ...texto.matchAll(/\b(muy|mucho|demasiado|extremadamente|absolutamente)\b/gi),
      ...texto.matchAll(/[A-Z]{4,}/g),
    ];
    return Math.min(1, 0.3 + indicadores.length * 0.15);
  }

  private calcularValencia(emocion: string, intensidad: number): number {
    const valencias: Record<string, number> = {
      tristeza: 0.2,
      alegria: 0.9,
      miedo: 0.3,
      ira: 0.1,
      ansiedad: 0.25,
      soledad: 0.15,
      esperanza: 0.75,
      amor: 0.95,
      neutral: 0.5,
    };

    const base = valencias[emocion] ?? 0.5;
    const modulacion = (intensidad - 0.5) * 0.2;
    return Math.max(0, Math.min(1, base + modulacion));
  }

  getEstadoActual(): EmotionalState {
    return { ...this.currentState };
  }
}

export const almaYCorazon = new AlmaYCorazon();
