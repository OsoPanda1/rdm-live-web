// Compatibility shim — re-export the centralized logger.
export { logger } from "@/lib/logger";
export default { logger: (await import("@/lib/logger")).logger };
