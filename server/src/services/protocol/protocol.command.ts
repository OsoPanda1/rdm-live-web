import { z } from "zod";

export const protocolCommandSchema = z.object({
  type: z.enum(["START", "TRANSITION", "HALT"]),
  mode: z.enum(["hoyo-negro", "fenix", "futuros"]),
  context: z
    .string()
    .min(8)
    .max(2000)
    .trim(),
  actorId: z
    .string()
    .min(1)
    .max(256)
    .trim(),
  tags: z
    .array(
      z
        .string()
        .min(2)
        .max(64)
        .trim(),
    )
    .max(20)
    .optional(),
});

export type ProtocolCommandPayload = z.infer<typeof protocolCommandSchema>;

/**
 * Helper para validar comandos de protocolo desde HTTP/body.
 * Lanza ZodError si el payload es inválido.
 */
export function parseProtocolCommand(input: unknown): ProtocolCommandPayload {
  return protocolCommandSchema.parse(input);
}
