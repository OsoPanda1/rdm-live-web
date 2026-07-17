import { RDMPageShell } from "@/components/rdm/RDMPageShell";
import { OperationalReadinessBoard } from "@/components/operations/OperationalReadinessBoard";

export default function Guardian() {
  return (
    <RDMPageShell
      eyebrow="Gobernanza HITL"
      title="Guardian Console"
      description="Panel de supervisión humana sobre decisiones de IA territorial. Moderación, auditoría y diagnóstico via Gateway TAMV DM-X7."
      bullets={[
        "Revisión HITL (Human-In-The-Loop) de acciones sensibles generadas por Isabella AI.",
        "Pipeline de diagnóstico: kernel.isabella.test y security.sentinel.status vía Gateway unificado.",
        "Centro de Preparación Operativa con métricas de progreso hacia stage y producción.",
      ]}
    >
      <OperationalReadinessBoard />
    </RDMPageShell>
  );
}
