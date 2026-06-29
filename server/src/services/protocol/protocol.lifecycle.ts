import type { ProtocolRunState } from "./protocol.types.js";

const allowedTransitions: Record<ProtocolRunState, ProtocolRunState[]> = {
  draft: ["running", "halted"],
  running: ["completed", "halted"],
  completed: [],
  halted: [],
};

export function transitionState(current: ProtocolRunState, next: ProtocolRunState): ProtocolRunState {
  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`INVALID_TRANSITION_${current}_TO_${next}`);
  }
  return next;
}
