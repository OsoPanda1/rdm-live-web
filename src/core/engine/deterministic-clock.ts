/**
 * @file deterministic-clock.ts
 * @description Abstracciones de tiempo seguras y deterministas para el motor del sistema.
 */

export interface IClock {
  /**
   * Retorna el timestamp actual en milisegundos.
   */
  now(): number;
}

/**
 * Implementación de producción basada en el tiempo real del sistema.
 */
export class Clock implements IClock {
  public now(): number {
    return Date.now();
  }
}

/**
 * Reloj determinista y mutable diseñado para pruebas unitarias y simulaciones temporales.
 */
export class FixedClock implements IClock {
  private current: number;

  constructor(initialTime: number = Date.now()) {
    if (!Number.isFinite(initialTime)) {
      throw new Error("[FixedClock] El tiempo inicial debe ser un número finito válido.");
    }
    this.current = initialTime;
  }

  public now(): number {
    return this.current;
  }

  /**
   * Avanza el tiempo del reloj una cantidad específica de milisegundos.
   */
  public advance(ms: number): void {
    if (!Number.isFinite(ms)) {
      throw new Error("[FixedClock] El incremento de tiempo (ms) debe ser un número finito válido.");
    }
    this.current += ms;
  }

  /**
   * Establece el reloj en un timestamp absoluto de forma explícita.
   */
  public set(timestamp: number): void {
    if (!Number.isFinite(timestamp)) {
      throw new Error("[FixedClock] El timestamp debe ser un número finito válido.");
    }
    this.current = timestamp;
  }
}
