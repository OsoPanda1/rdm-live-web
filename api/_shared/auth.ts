import { createClient } from "@supabase/supabase-js";

interface AuthResult {
  authenticated: boolean;
  errorMessage?: string;
  role?: string;
  userId?: string;
  email?: string;
  supabase?: ReturnType<typeof createClient>;
  errorResponse?: Response;
}

export async function verifyAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { authenticated: false, errorMessage: "Missing Authorization header" };
  }

  const [scheme, token] = authHeader.split(" ", 2);

  if (scheme !== "Bearer" || !token) {
    return { authenticated: false, errorMessage: "Invalid Authorization scheme (use Bearer)" };
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && token === cronSecret) {
    return { authenticated: true, role: "cron" };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { authenticated: false, errorMessage: "Supabase not configured" };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authenticated: false, errorMessage: error?.message || "Invalid token" };
    }

    return {
      authenticated: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      supabase,
    };
  } catch (err) {
    return {
      authenticated: false,
      errorMessage: err instanceof Error ? err.message : "Auth verification failed",
    };
  }
}

export async function requireAuth(request: Request): Promise<AuthResult> {
  const result = await verifyAuth(request);

  if (!result.authenticated) {
    return {
      ...result,
      errorResponse: new Response(
        JSON.stringify({ error: result.errorMessage || "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="api"',
          },
        },
      ),
    };
  }

  return result;
}

export async function requireRole(request: Request, allowedRoles: string[]): Promise<AuthResult> {
  const result = await requireAuth(request);

  if (result.errorResponse) return result;
  if (result.role === "cron") return result;

  if (!result.role || !allowedRoles.includes(result.role)) {
    return {
      ...result,
      errorResponse: new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      ),
    };
  }

  return result;
}
