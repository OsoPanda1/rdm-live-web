interface AuthResult {
  authenticated: boolean;
  userId?: string;
  role?: string;
  error?: string;
}

const INTERNAL_API_KEYS = new Set<string>();

export function registerInternalApiKey(key: string): void {
  INTERNAL_API_KEYS.add(key);
}

export function validateApiKey(request: Request): AuthResult {
  const apiKey = request.headers.get('X-Isabella-Api-Key');
  if (!apiKey) {
    return { authenticated: false, error: 'API key requerida. Usa header X-Isabella-Api-Key.' };
  }
  if (!INTERNAL_API_KEYS.has(apiKey)) {
    return { authenticated: false, error: 'API key inválida.' };
  }
  return { authenticated: true, userId: 'isabella-system', role: 'internal' };
}

export function validateTerritorialToken(request: Request): AuthResult {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Token territorial requerido. Usa header Authorization: Bearer <token>.' };
  }
  const token = authHeader.slice(7);
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return {
      authenticated: true,
      userId: payload.sub ?? 'unknown',
      role: payload.role ?? 'ciudadano',
    };
  } catch {
    return { authenticated: false, error: 'Token territorial inválido o expirado.' };
  }
}

export function requireAuth(request: Request, method: 'api-key' | 'token' = 'api-key'): AuthResult | null {
  const result = method === 'api-key' ? validateApiKey(request) : validateTerritorialToken(request);
  if (!result.authenticated) {
    return result;
  }
  return null;
}

if (process.env.ISA_API_KEY) {
  registerInternalApiKey(process.env.ISA_API_KEY);
}
