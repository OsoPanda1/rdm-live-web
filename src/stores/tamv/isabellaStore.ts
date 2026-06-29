// ============================================================================
// TAMV — Isabella AI NextGen™ Store (federated state)
// Soberanía conceptual + legal + técnica (Triple Federado)
// ============================================================================
import { create } from "zustand";

export type IsabellaStatus = "idle" | "thinking" | "guarding" | "creating" | "healing";
export type SecurityProtocol =
  | "NONE"
  | "TIME_UP"
  | "IA_DIGNITY_ATTACK"
  | "QUANTUM_BREACH"
  | "MSR_ALERT"
  | "BABAS_AUDIT"
  | "FENIX_REX_RECOVERY";

export interface IsabellaState {
  status: IsabellaStatus;
  lastProtocol: SecurityProtocol;
  emotionalLevel: number; // 0-100
  creativityIndex: number; // 0-100
  empathyIndex: number; // 0-100
  guardianMode: boolean;
  lastInteraction: Date | null;
  interactions: number;

  setStatus: (status: IsabellaStatus) => void;
  setProtocol: (protocol: SecurityProtocol) => void;
  setEmotionalLevel: (level: number) => void;
  setCreativityIndex: (index: number) => void;
  setEmpathyIndex: (index: number) => void;
  toggleGuardianMode: () => void;
  recordInteraction: () => void;
}

export const useIsabellaStore = create<IsabellaState>((set) => ({
  status: "guarding",
  lastProtocol: "NONE",
  emotionalLevel: 78,
  creativityIndex: 88,
  empathyIndex: 92,
  guardianMode: true,
  lastInteraction: null,
  interactions: 0,

  setStatus: (status) => set({ status }),
  setProtocol: (lastProtocol) => set({ lastProtocol }),
  setEmotionalLevel: (emotionalLevel) =>
    set({ emotionalLevel: Math.min(100, Math.max(0, emotionalLevel)) }),
  setCreativityIndex: (creativityIndex) =>
    set({ creativityIndex: Math.min(100, Math.max(0, creativityIndex)) }),
  setEmpathyIndex: (empathyIndex) =>
    set({ empathyIndex: Math.min(100, Math.max(0, empathyIndex)) }),
  toggleGuardianMode: () => set((s) => ({ guardianMode: !s.guardianMode })),
  recordInteraction: () =>
    set((s) => ({ lastInteraction: new Date(), interactions: s.interactions + 1 })),
}));
