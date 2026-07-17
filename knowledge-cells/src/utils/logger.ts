/**
 * @file logger.ts
 * @description Centralized logging system for TAMV MD-X4 knowledge cells
 * Integrates with Prometheus and supports structured logging
 */

import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  cellId?: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logFile: string;
  private buffer: LogEntry[] = [];
  private bufferSize = 100;

  private constructor(logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
    this.logFile = path.join(process.cwd(), 'logs', `tamv-${Date.now()}.log`);
    this.ensureLogDirectory();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');
    }
    return Logger.instance;
  }

  private ensureLogDirectory(): void {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevel;
  }

  private write(entry: LogEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.buffer.length === 0) return;

    const content = this.buffer.map((e) => JSON.stringify(e)).join('\n') + '\n';
    fs.appendFileSync(this.logFile, content);
    this.buffer = [];
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(this.formatMessage('debug', message, context));
    this.write({ timestamp: new Date().toISOString(), level: 'debug', message, context });
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    // eslint-disable-next-line no-console
    console.info(this.formatMessage('info', message, context));
    this.write({ timestamp: new Date().toISOString(), level: 'info', message, context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('warn', message, context));
    this.write({ timestamp: new Date().toISOString(), level: 'warn', message, context });
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog('error')) return;
    // eslint-disable-next-line no-console
    console.error(this.formatMessage('error', message, context), error?.stack || '');
    this.write({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error?.stack,
    });
  }

  getLogFile(): string {
    return this.logFile;
  }

  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  closeSync(): void {
    this.flush();
  }
}

process.on('exit', () => {
  Logger.getInstance().closeSync();
});
