import { logger } from "@/lib/logger";

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  errors: string[];
}

const SQL_INJECTION = /[;'"\\]|(--)|(\/\*)|(\*\/)|(%27)|(%22)|(%3B)/gi;
const XSS_PATTERNS = /<script[\s>]|javascript:|onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=|alert\s*\(|prompt\s*\(|confirm\s*\(/i;
const COMMAND_INJECTION = /[|&;$`\\]|(\|\|)|(&&)|(>\s*)|(<\s*)/gi;
const PATH_TRAVERSAL = /\.\.[\/\\]|~[\/\\]|%2e%2e[\/\\]?|%2e%2e%2f|%2e%2e%5c/i;

const MAX_STRING_LENGTH = 10000;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitizeString(input: string, maxLength = MAX_STRING_LENGTH): ValidationResult {
  const errors: string[] = [];
  let sanitized = input;

  if (typeof input !== "string") {
    return { valid: false, sanitized: "", errors: ["Input must be a string"] };
  }

  if (input.length === 0) {
    return { valid: true, sanitized: "", errors: [] };
  }

  if (input.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  if (SQL_INJECTION.test(sanitized)) {
    errors.push("SQL injection pattern detected");
    sanitized = sanitized.replace(SQL_INJECTION, "");
  }

  if (XSS_PATTERNS.test(sanitized)) {
    errors.push("XSS pattern detected");
    sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
    sanitized = sanitized.replace(/<script\b[^>]*\/?>/gi, "");
    sanitized = sanitized.replace(/[\s"'`]javascript\s*:/gi, " blocked:");
    sanitized = sanitized.replace(/[\s"'`]on\w+\s*=\s*(['"]?)[^'"&\s>]*\1?/gi, " ");
    sanitized = sanitized.replace(/[\s"'`]on\w+\s*=\s*&[^;]+;/gi, " ");
    sanitized = sanitized.replace(/formaction\s*=/gi, "disabled-");
  }

  if (COMMAND_INJECTION.test(sanitized)) {
    errors.push("Command injection pattern detected");
    sanitized = sanitized.replace(COMMAND_INJECTION, "");
  }

  if (PATH_TRAVERSAL.test(sanitized)) {
    errors.push("Path traversal detected");
    sanitized = sanitized.replace(/\.\.[\/\\]/g, "");
    sanitized = sanitized.replace(/%2e%2e[\/\\]?/gi, "");
    sanitized = sanitized.replace(/%2f/gi, "");
    sanitized = sanitized.replace(/%5c/gi, "");
  }

  const final = sanitized.trim();

  return {
    valid: errors.length === 0,
    sanitized: final,
    errors,
  };
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const sanitized = email.trim().toLowerCase();

  if (!sanitized) {
    errors.push("Email is required");
    return { valid: false, sanitized: "", errors };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(sanitized)) {
    errors.push("Invalid email format");
    return { valid: false, sanitized, errors };
  }

  if (sanitized.length > 254) {
    errors.push("Email too long");
    return { valid: false, sanitized: sanitized.slice(0, 254), errors };
  }

  return { valid: true, sanitized, errors };
}

export function validateNumeric(input: string, min?: number, max?: number): ValidationResult & { value?: number } {
  const errors: string[] = [];
  const clean = input.trim();

  if (!/^-?\d+(\.\d+)?$/.test(clean)) {
    errors.push("Not a valid number");
    return { valid: false, sanitized: clean, errors };
  }

  const value = parseFloat(clean);

  if (min !== undefined && value < min) {
    errors.push(`Value below minimum (${min})`);
  }
  if (max !== undefined && value > max) {
    errors.push(`Value above maximum (${max})`);
  }

  return {
    valid: errors.length === 0,
    sanitized: clean,
    errors,
    value,
  };
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, schema: Record<string, { type: string; required?: boolean; maxLength?: number }>): { valid: boolean; data: Partial<T>; errors: string[] } {
  const errors: string[] = [];
  const data: Partial<T> = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];

    if (value === undefined || value === null) {
      if (rules.required) {
        errors.push(`${key} is required`);
      }
      continue;
    }

    if (typeof value !== rules.type) {
      errors.push(`${key} must be of type ${rules.type}`);
      continue;
    }

    if (typeof value === "string" && rules.maxLength && value.length > rules.maxLength) {
      data[key as keyof T] = (value as string).slice(0, rules.maxLength) as T[keyof T];
      errors.push(`${key} truncated to ${rules.maxLength} characters`);
    } else {
      data[key as keyof T] = value as T[keyof T];
    }
  }

  return { valid: errors.length === 0, data, errors };
}

export const inputValidation = { sanitizeString, validateEmail, validateNumeric, sanitizeObject };
