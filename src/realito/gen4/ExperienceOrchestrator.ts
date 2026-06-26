import { logger } from "@/lib/logger";
interface Coordenadas {
  lat: number;
  lng: number;
}

interface TuristaEstado {
  id: string;
  coords: Coordenadas;
  tiempoEstadiaHoras: number;
  ultimaInteraccion: Date;
}

interface OrquestacionAccion {
  accion: 'PUSH_NOTIFICATION';
  nivel: 'CRITICO' | 'ALERTA';
  payload: {
    titulo: string;
    mensaje: string;
    ruta_ar_activada: boolean;
  };
}

export class ExperienceOrchestrator {
  private readonly SALIDAS_RDM: Coordenadas[] = [
    { lat: 20.1415, lng: -98.6701 },
    { lat: 20.133, lng: -98.675 },
  ];

  private getDistanciaMetros(coord1: Coordenadas, coord2: Coordenadas): number {
    const R = 6371e3;
    const rLat1 = (coord1.lat * Math.PI) / 180;
    const rLat2 = (coord2.lat * Math.PI) / 180;
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public async evaluarGeovallaDeRetencion(turista: TuristaEstado): Promise<OrquestacionAccion | null> {
    const distanciasSalida = this.SALIDAS_RDM.map((salida) => this.getDistanciaMetros(turista.coords, salida));
    const cercaDeSalida = distanciasSalida.some((dist) => dist < 150);
    const inactividadMinutos = (Date.now() - turista.ultimaInteraccion.getTime()) / 60000;

    if (cercaDeSalida && turista.tiempoEstadiaHoras < 3.0) {
      logger.info(`[REALITO GEN-4] Turista ${turista.id} en riesgo de fuga económica.`);

      return {
        accion: 'PUSH_NOTIFICATION',
        nivel: inactividadMinutos > 30 ? 'CRITICO' : 'ALERTA',
        payload: {
          titulo: '¡Espera! El Real tiene un secreto para ti...',
          mensaje:
            'Anubis detecta que aún no pruebas la plata de autor. Gira a la derecha en el próximo callejón y obtén precio de taller en la Federación de Platería.',
          ruta_ar_activada: true,
        },
      };
    }

    return null;
  }
}
