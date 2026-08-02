import { describe, expect, it, beforeEach } from "vitest";
import { db } from "../server/src/lib/store";
import {
  attachAuditEvidence,
  evaluateFreezeReadiness,
  listAuditChecklist,
  requestFreezeDecision,
} from "../server/src/services/audit-workbench.service";

function clearAuditState() {
  db.auditChecklistItems.clear();
  db.auditEvidence.clear();
  db.freezeDecisions.clear();
  db.msrEvents.clear();
  db.bookpiNarratives.clear();
}

describe("audit workbench", () => {
  beforeEach(() => clearAuditState());

  it("seeds the prioritized operational backlog with P0 perimeter and backend blockers", () => {
    const items = listAuditChecklist({ priority: "P0" });

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.priority === "P0")).toBe(true);
    expect(items.map((item) => item.modulePath)).toContain("runtime/pkg/security/");
    expect(items.map((item) => item.modulePath)).toContain("api/");
  });

  it("attaches evidence, updates status, and records MSR plus BookPI traces", () => {
    const [item] = listAuditChecklist({ priority: "P0" });

    const evidence = attachAuditEvidence({
      itemId: item.id,
      actorId: "guardian-1",
      status: "approved",
      command: "vitest run --config vitest.runtime.config.ts",
      result: "pass",
      notes: "Suite runtime aprobada para congelamiento perimetral.",
    });

    const updated = db.auditChecklistItems.get(item.id);
    expect(updated?.status).toBe("approved");
    expect(updated?.evidenceIds).toContain(evidence.id);
    expect(db.msrEvents.size).toBe(1);
    expect(db.bookpiNarratives.size).toBe(1);
  });

  it("blocks freeze until every P0 item is approved", () => {
    const firstDecision = requestFreezeDecision("guardian-1");
    expect(firstDecision.ready).toBe(false);
    expect(firstDecision.blockers.length).toBeGreaterThan(0);

    for (const item of listAuditChecklist({ priority: "P0" })) {
      attachAuditEvidence({
        itemId: item.id,
        actorId: "guardian-1",
        status: "approved",
        result: "pass",
        notes: `Cierre operativo aprobado para ${item.modulePath}`,
      });
    }

    const readiness = evaluateFreezeReadiness();
    expect(readiness.ready).toBe(true);
    expect(readiness.blockers).toEqual([]);
  });
});
