export interface ContextoCivilizatorio {
  eventos_activos: string[];
  clima?: string;
  temporada?: string;
}

export interface SaturationResult {
  zoneId: string;
  saturationScore: number;
  activeSignals: number;
  recommendation: "normal" | "monitor" | "divert";
}

export const chronusEngine = {
  calcularSaturacionZonal(zoneId: string, contexto: ContextoCivilizatorio, activosEnZona: number): SaturationResult {
    const eventPressure = contexto.eventos_activos.length * 5;
    const saturationScore = Math.min(100, Math.max(0, activosEnZona + eventPressure));
    const recommendation = saturationScore >= 80 ? "divert" : saturationScore >= 55 ? "monitor" : "normal";
    return {
      zoneId,
      saturationScore,
      activeSignals: contexto.eventos_activos.length,
      recommendation,
    };
  },
};
