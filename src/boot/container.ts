import { logger } from '@/lib/logger';

type Factory<T> = (container: Container) => T;

export class Container {
  private registry = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();

  register<T>(key: string, instance: T): this {
    if (this.registry.has(key)) {
      logger.warn(`[DI] Sobrescritura del servicio: ${key}`);
    }
    this.registry.set(key, instance);
    return this;
  }

  registerFactory<T>(key: string, factory: Factory<T>): this {
    this.factories.set(key, factory as Factory<unknown>);
    return this;
  }

  resolve<T>(key: string): T {
    if (this.registry.has(key)) {
      return this.registry.get(key) as T;
    }
    const factory = this.factories.get(key);
    if (factory) {
      const instance = factory(this) as T;
      this.registry.set(key, instance);
      return instance;
    }
    throw new Error(`[DI] Servicio no registrado: ${key}`);
  }

  has(key: string): boolean {
    return this.registry.has(key) || this.factories.has(key);
  }

  keys(): string[] {
    return [...new Set([...this.registry.keys(), ...this.factories.keys()])];
  }
}

export const container = new Container();
