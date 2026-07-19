import { lazy, Suspense, type ReactNode } from "react";

const MotionAnimatePresence = lazy(() =>
  import("framer-motion").then((m) => ({ default: m.AnimatePresence }))
);

interface AnimatedOutletProps {
  children: ReactNode;
  mode?: "popLayout" | "wait" | "sync" | undefined;
}

export function AnimatedOutlet({ children, mode }: AnimatedOutletProps) {
  return (
    <Suspense fallback={null}>
      <MotionAnimatePresence mode={mode}>{children}</MotionAnimatePresence>
    </Suspense>
  );
}
