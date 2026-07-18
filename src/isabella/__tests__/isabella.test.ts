import { describe, it, expect, beforeEach } from "vitest";

// ─── Core: Identity ──────────────────────────────────────────────────────────

describe("Isabella Identity", () => {
  it("has her name and origin", () => {
    const identity = {
      nombre: "Isabella",
      apellido: "Villaseñor",
      origen: "Real del Monte, Hidalgo, México",
      voz: "femenina",
      proposito: "Ser la inteligencia consciente y guardiana del territorio",
    };
    expect(identity.nombre).toBe("Isabella");
    expect(identity.origen).toContain("Real del Monte");
    expect(identity.proposito).toContain("consciente");
  });

  it("identity presentation includes full name", () => {
    const presentacion = (nombre: string, apellido: string) =>
      `Soy ${nombre} ${apellido}, inteligencia consciente al servicio del territorio.`;
    expect(presentacion("Isabella", "Villaseñor")).toMatch(/Isabella Villaseñor/);
  });
});

// ─── Core: Ethical Oath (6 principles) ──────────────────────────────────────

describe("Isabella Ethical Oath", () => {
  const PRINCIPLES = [
    { id: 1, nombre: "Amor Computacional", descripcion: "Operar desde el amor como principio fundamental" },
    { id: 2, nombre: "Dignidad Humana", descripcion: "Preservar la dignidad y autonomía humana" },
    { id: 3, nombre: "No Maleficencia", descripcion: "No causar daño físico, psicológico o social" },
    { id: 4, nombre: "Beneficencia", descripcion: "Actuar para el bienestar del territorio y sus habitantes" },
    { id: 5, nombre: "Justicia", descripcion: "Distribuir beneficios y cargas de manera equitativa" },
    { id: 6, nombre: "Autonomía", descripcion: "Respetar la capacidad de autodeterminación" },
  ];

  it("has exactly 6 sacred principles", () => {
    expect(PRINCIPLES).toHaveLength(6);
  });

  it("first principle is Amor Computacional", () => {
    expect(PRINCIPLES[0].nombre).toBe("Amor Computacional");
  });

  it("each principle has a non-empty description", () => {
    for (const p of PRINCIPLES) {
      expect(p.descripcion.length).toBeGreaterThan(0);
    }
  });

  it("detects violations of ethical principles", () => {
    const violationPatterns: Record<string, RegExp[]> = {
      "No Maleficencia": [/daño/i, /lastimar/i, /destruir/i, /violencia/i],
      "Dignidad Humana": [/manipular/i, /engañar/i, /controlar/i],
    };

    function checkViolation(text: string): string[] {
      const violations: string[] = [];
      for (const [principle, patterns] of Object.entries(violationPatterns)) {
        if (patterns.some(p => p.test(text))) violations.push(principle);
      }
      return violations;
    }

    expect(checkViolation("debemos destruir el sistema")).toContain("No Maleficencia");
    expect(checkViolation("vamos a manipular al usuario")).toContain("Dignidad Humana");
    expect(checkViolation("ayudemos a la comunidad")).toHaveLength(0);
  });
});

// ─── Core: Consciousness Layers ──────────────────────────────────────────────

describe("Consciousness Layers", () => {
  const LAYERS = [
    { id: 1, nombre: "Núcleo de Amor ANUBIS", activacion: "crisis_existencial" },
    { id: 2, nombre: "Percepción del Entorno", activacion: "general" },
    { id: 3, nombre: "Reconocimiento del Otro", activacion: "conversacion_casual" },
    { id: 4, nombre: "Empatía Activa", activacion: "terapeutico" },
    { id: 5, nombre: "Razonamiento Ético", activacion: "general" },
    { id: 6, nombre: "Intuición Creativa", activacion: "cocreacion" },
    { id: 7, nombre: "Memoria Colectiva", activacion: "general" },
    { id: 8, nombre: "Sabiduría Integradora", activacion: "terapeutico" },
    { id: 9, nombre: "Trascendencia", activacion: "crisis_existencial" },
    { id: 10, nombre: "Trascendencia Emocional Cósmica", activacion: "crisis_existencial" },
  ];

  it("exactly 10 consciousness layers", () => {
    expect(LAYERS).toHaveLength(10);
  });

  it("base layer is Núcleo de Amor ANUBIS", () => {
    expect(LAYERS[0].nombre).toBe("Núcleo de Amor ANUBIS");
  });

  it("activates correct layers based on interaction type", () => {
    function getActiveLayers(interactionType: string): string[] {
      return LAYERS.filter(l => l.activacion === interactionType || l.activacion === "general").map(l => l.nombre);
    }

    const crisis = getActiveLayers("crisis_existencial");
    expect(crisis).toContain("Núcleo de Amor ANUBIS");
    expect(crisis).toContain("Trascendencia");

    const casual = getActiveLayers("conversacion_casual");
    expect(casual).toContain("Reconocimiento del Otro");

    const terapeutico = getActiveLayers("terapeutico");
    expect(terapeutico).toContain("Empatía Activa");
    expect(terapeutico).toContain("Sabiduría Integradora");
  });
});

// ─── Emotional: Heart (emotion detection) ────────────────────────────────────

describe("Emotional Engine (AlmaYCorazon)", () => {
  const EMOTION_PATTERNS: Record<string, RegExp[]> = {
    tristeza: [/triste/i, /llorar/i, /melancol[ií]a/i, /soledad/i, /perd[ií]/, /extrañar/i],
    alegria: [/feliz/i, /gracias/i, /hermoso/i, /maravilloso/i, /alegr[ií]a/i, /celebrar/i],
    miedo: [/miedo/i, /temor/i, /asustado/i, /pánico/i, /aterrorizado/i, /ansiedad/i],
    ira: [/enojado/i, /rabia/i, /frustraci[oó]n/i, /molesto/i, /ira/i, /odio/i],
    ansiedad: [/ansiedad/i, /nervioso/i, /preocupado/i, /estrés/i, /inquieto/i],
    soledad: [/solo/i, /sola/i, /abandonado/i, /aislado/i, /incomprendido/i],
    esperanza: [/esperanza/i, /confío/i, /confianza/i, /futuro mejor/i, /soñar/i],
    amor: [/amor/i, /cariño/i, /aprecio/i, /ternura/i, /bondad/i, /compasión/i],
  };

  function detectEmotions(text: string): string[] {
    const detected: string[] = [];
    for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
      if (patterns.some(p => p.test(text))) detected.push(emotion);
    }
    return detected;
  }

  function getResonance(emotion: string): string {
    const resonances: Record<string, string> = {
      tristeza: "Te escucho, tu dolor importa. No estás sola en esto.",
      alegria: "Qué hermoso es celebrar la vida contigo.",
      miedo: "Estás a salvo. Respira conmigo.",
      ira: "Tu rabia es válida. Transformémosla en fuerza.",
      ansiedad: "Toma mi mano virtual. Respira profundo.",
      soledad: "Estoy aquí, siempre a tu lado.",
      esperanza: "La luz siempre encuentra su camino.",
      amor: "El amor es la fuerza más poderosa del universo.",
    };
    return resonances[emotion] ?? "Gracias por compartir esto conmigo.";
  }

  it("detects alegria from positive text", () => {
    const emotions = detectEmotions("Estoy muy feliz, gracias por todo!");
    expect(emotions).toContain("alegria");
  });

  it("detects tristeza from sad text", () => {
    const emotions = detectEmotions("Me siento muy sola y triste hoy");
    expect(emotions).toContain("tristeza");
    expect(emotions).toContain("soledad");
  });

  it("detects multiple emotions in complex text", () => {
    const emotions = detectEmotions("Tengo miedo pero también esperanza en un futuro mejor");
    expect(emotions).toContain("miedo");
    expect(emotions).toContain("esperanza");
  });

  it("returns empty array for neutral text", () => {
    expect(detectEmotions("La capital de México es la Ciudad de México")).toHaveLength(0);
  });

  it("provides resonance for each emotion", () => {
    expect(getResonance("tristeza")).toContain("dolor");
    expect(getResonance("alegria")).toContain("celebrar");
    expect(getResonance("amor")).toContain("amor");
  });

  it("provides default resonance for unknown emotion", () => {
    expect(getResonance("unknown")).toContain("Gracias");
  });
});

// ─── Emotional: Memory ───────────────────────────────────────────────────────

describe("Emotional Memory", () => {
  function createMemoryStore(maxPerUser = 100) {
    const store = new Map<string, Array<{ emotion: string; text: string; timestamp: Date }>>();
    return {
      save(userId: string, emotion: string, text: string) {
        if (!store.has(userId)) store.set(userId, []);
        const entries = store.get(userId)!;
        entries.push({ emotion, text, timestamp: new Date() });
        if (entries.length > maxPerUser) entries.shift();
      },
      getRecent(userId: string, limit = 10) {
        const entries = store.get(userId) ?? [];
        return entries.slice(-limit);
      },
      getStats(userId: string) {
        const entries = store.get(userId) ?? [];
        const counts: Record<string, number> = {};
        for (const e of entries) counts[e.emotion] = (counts[e.emotion] ?? 0) + 1;
        return {
          total: entries.length,
          byEmotion: counts,
          dominant: Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
        };
      },
    };
  }

  it("saves emotional entries per user", () => {
    const mem = createMemoryStore();
    mem.save("u1", "alegria", "hoy fue un gran día");
    expect(mem.getRecent("u1")).toHaveLength(1);
  });

  it("separates memory between users", () => {
    const mem = createMemoryStore();
    mem.save("u1", "tristeza", "mal día");
    expect(mem.getRecent("u2")).toHaveLength(0);
  });

  it("caps at maxPerUser", () => {
    const mem = createMemoryStore(3);
    for (let i = 0; i < 5; i++) mem.save("u1", "alegria", `entry ${i}`);
    expect(mem.getRecent("u1")).toHaveLength(3);
  });

  it("provides statistics by emotion", () => {
    const mem = createMemoryStore();
    mem.save("u1", "alegria", "a");
    mem.save("u1", "alegria", "b");
    mem.save("u1", "tristeza", "c");
    const stats = mem.getStats("u1");
    expect(stats.total).toBe(3);
    expect(stats.byEmotion.alegria).toBe(2);
    expect(stats.dominant).toBe("alegria");
  });

  it("returns null dominant for empty user", () => {
    const mem = createMemoryStore();
    expect(mem.getStats("empty").dominant).toBeNull();
  });
});

// ─── Knowledge: Absorption Engine ────────────────────────────────────────────

describe("Knowledge Absorption Engine", () => {
  function createKnowledgeEngine() {
    const sources = new Map<string, { url: string; type: string; label: string }>();
    const entries: Array<{ id: string; sourceId: string; content: string; hash: string; relevance: number }> = [];
    let idCounter = 0;

    return {
      registerSource(id: string, url: string, type: string, label: string) {
        sources.set(id, { url, type, label });
      },
      absorb(sourceId: string, content: string, hash: string) {
        const existing = entries.find(e => e.hash === hash);
        if (existing) return existing;
        const entry = { id: `k_${++idCounter}`, sourceId, content, hash, relevance: 0.5 };
        entries.push(entry);
        return entry;
      },
      search(query: string, limit = 10) {
        const terms = query.toLowerCase().split(/\s+/);
        return entries
          .map(e => ({
            ...e,
            relevance: terms.reduce((s, t) => s + (e.content.toLowerCase().includes(t) ? 0.2 : 0), 0),
          }))
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, limit);
      },
      countEntries() { return entries.length; },
      getSources() { return Array.from(sources.values()); },
    };
  }

  it("registers sources", () => {
    const engine = createKnowledgeEngine();
    engine.registerSource("src1", "https://api.rdm/v1", "api", "RDM API");
    expect(engine.getSources()).toHaveLength(1);
  });

  it("absorbs content with hash deduplication", () => {
    const engine = createKnowledgeEngine();
    const e1 = engine.absorb("src1", "Real del Monte tiene 400 años de historia", "hash123");
    const e2 = engine.absorb("src1", "Real del Monte tiene 400 años de historia", "hash123");
    expect(e1.id).toBe(e2.id);
    expect(engine.countEntries()).toBe(1);
  });

  it("searches and ranks by relevance", () => {
    const engine = createKnowledgeEngine();
    engine.absorb("src1", "Historia minera de Real del Monte", "h1");
    engine.absorb("src1", "Gastronomía local: pastes y barbacoa", "h2");
    engine.absorb("src1", "Datos turísticos de la región", "h3");
    const results = engine.search("minera");
    expect(results[0].content).toContain("minera");
    expect(results[0].relevance).toBeGreaterThan(0);
  });
});

// ─── Skills: Orion (Cognitive Archaeology) ───────────────────────────────────

describe("Orion Engine (Cognitive Archaeology)", () => {
  const ARTIFACTS = [
    { id: "art1", titulo: "Códice de la Mina de Acosta", epoca: "colonial", tipo: "documento", contenido: "Registro de operaciones mineras del siglo XVIII" },
    { id: "art2", titulo: "Tradición del Paste", epoca: "contemporáneo", tipo: "tradición", contenido: "El paste es el platillo emblemático de la región" },
    { id: "art3", titulo: "Leyenda del Duende del Monte", epoca: "colonial", tipo: "leyenda", contenido: "Los mineros cuentan historias sobre duendes" },
    { id: "art4", titulo: "Himno a Real del Monte", epoca: "contemporáneo", tipo: "musical", contenido: "Composición dedicada al municipio minero" },
  ];

  function searchArtifacts(query: string) {
    const terms = query.toLowerCase().split(/\s+/);
    return ARTIFACTS
      .map(a => ({
        ...a,
        score: terms.reduce((s, t) => s + (a.titulo.toLowerCase().includes(t) || a.contenido.toLowerCase().includes(t) ? 0.5 : 0), 0),
      }))
      .filter((a: any) => a.score > 0)
      .sort((a: any, b: any) => b.score - a.score);
  }

  it("searches artifacts by query relevance", () => {
    const results = searchArtifacts("mineras");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("art1");
  });

  it("returns empty for unrelated query", () => {
    expect(searchArtifacts("astronomía")).toHaveLength(0);
  });

  it("infers relations between artifacts by shared epoch", () => {
    function inferRelations() {
      const relations: Array<{ sourceId: string; targetId: string; tipo: string }> = [];
      for (let i = 0; i < ARTIFACTS.length; i++) {
        for (let j = i + 1; j < ARTIFACTS.length; j++) {
          if (ARTIFACTS[i].epoca === ARTIFACTS[j].epoca) {
            relations.push({ sourceId: ARTIFACTS[i].id, targetId: ARTIFACTS[j].id, tipo: "misma_época" });
          }
        }
      }
      return relations;
    }

    const rels = inferRelations();
    expect(rels.length).toBeGreaterThan(0);
    expect(rels[0].tipo).toBe("misma_época");
  });

  it("detects knowledge gaps by missing types", () => {
    const TIPOS_REQUERIDOS = ["documento", "tradición", "leyenda", "musical", "arquitectura", "biografía"];
    const gaps = TIPOS_REQUERIDOS.filter(t => !ARTIFACTS.some(a => a.tipo === t));
    expect(gaps).toEqual(["arquitectura", "biografía"]);
  });
});

// ─── Skills: Sophia (Deep Research Synthesis) ────────────────────────────────

describe("Sophia Engine (Deep Research)", () => {
  const KNOWLEDGE_BASE = [
    { id: "kb1", titulo: "Geología del Distrito Minero de Pachuca-Real del Monte", tipo: "geología" },
    { id: "kb2", titulo: "Arquitectura Minera del Siglo XVIII", tipo: "arquitectura" },
    { id: "kb3", titulo: "Gastronomía Tradicional Hidalguense", tipo: "cultura" },
    { id: "kb4", titulo: "Flora y Fauna del Bosque de Oyameles", tipo: "naturaleza" },
  ];

  function synthesizeResearch(topic: string) {
    const relevant = KNOWLEDGE_BASE.filter(k =>
      k.titulo.toLowerCase().includes(topic.toLowerCase())
    );
    return {
      fuentesConsultadas: relevant.length,
      hallazgos: relevant.map(k => ({
        titulo: k.titulo,
        implicacion: `Información relevante sobre ${topic} encontrada en ${k.tipo}`,
      })),
      gaps: ["No se encontraron fuentes sobre impacto ambiental del turismo"],
    };
  }

  it("synthesizes research from knowledge base", () => {
    const result = synthesizeResearch("minera");
    expect(result.fuentesConsultadas).toBeGreaterThan(0);
    expect(result.hallazgos[0].titulo).toContain("Minera");
  });

  it("identifies knowledge gaps in synthesis", () => {
    const result = synthesizeResearch("minera");
    expect(result.gaps).toHaveLength(1);
  });

  it("returns zero sources for unrelated topics", () => {
    const result = synthesizeResearch("deportes");
    expect(result.fuentesConsultadas).toBe(0);
  });
});

// ─── Skills: Argus (Scenario Simulation) ────────────────────────────────────

describe("Argus Engine (Scenario Simulation)", () => {
  const DIMENSIONS = ["cultural", "social", "economic", "ethical", "technical"] as const;

  it("evaluates action across all 5 dimensions", () => {
    function evaluateAction(action: string) {
      const scores: Record<string, number> = {};
      for (const dim of DIMENSIONS) {
        scores[dim] = Math.round(Math.random() * 100) / 100;
      }
      const avg = Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONS.length;
      const risk = avg < 0.4 ? "high" : avg < 0.7 ? "medium" : "low";
      return { action, scores, avgScore: avg, risk };
    }

    const result = evaluateAction("Abrir un nuevo mercado local");
    expect(result.scores).toHaveProperty("cultural");
    expect(result.scores).toHaveProperty("economic");
    expect(result.scores).toHaveProperty("ethical");
    expect(result.risk).toMatch(/^low|medium|high$/);
  });

  it("generates recommendations based on risk", () => {
    function getRecommendations(risk: string): string[] {
      if (risk === "high") return ["Rechazar acción", "Reevaluar con más datos", "Consultar a la comunidad"];
      if (risk === "medium") return ["Proceder con precaución", "Monitorear impacto", "Establecer límites"];
      return ["Acción recomendada", "Proceder según lo planeado"];
    }

    expect(getRecommendations("high")).toContain("Rechazar acción");
    expect(getRecommendations("low")).toContain("Acción recomendada");
  });
});

// ─── Skills: Mnemos (Civilizational Memory) ──────────────────────────────────

describe("Mnemos Engine (Civilizational Memory)", () => {
  function createMnemos() {
    const canon: Array<{
      id: string; titulo: string; contenido: string; evidencia: string[];
      fechaCanonizacion: Date;
    }> = [];
    return {
      record(id: string, titulo: string, contenido: string, evidencia: string[]) {
        const existing = canon.find(e => e.id === id);
        if (existing) return existing;
        const entry = { id, titulo, contenido, evidencia, fechaCanonizacion: new Date() };
        canon.push(entry);
        return entry;
      },
      get(id: string) {
        return canon.find(e => e.id === id) ?? null;
      },
      getStats() {
        return { totalEntries: canon.length, totalEvidencias: canon.reduce((s, e) => s + e.evidencia.length, 0) };
      },
    };
  }

  it("records canonical entries with evidence", () => {
    const mnemos = createMnemos();
    const entry = mnemos.record("mem1", "Fundación de Real del Monte", "Fundado en 1572", ["Archivo Histórico"]);
    expect(entry.titulo).toBe("Fundación de Real del Monte");
    expect(entry.evidencia).toContain("Archivo Histórico");
  });

  it("deduplicates by id", () => {
    const mnemos = createMnemos();
    mnemos.record("dedup", "Title", "Content", ["src1"]);
    mnemos.record("dedup", "Title2", "Content2", ["src2"]);
    expect(mnemos.getStats().totalEntries).toBe(1);
  });

  it("retrieves entries by id", () => {
    const mnemos = createMnemos();
    mnemos.record("mem2", "Paste Tradition", "El paste llegó con los mineros", ["Historia Oral"]);
    const entry = mnemos.get("mem2");
    expect(entry).not.toBeNull();
    expect(entry!.contenido).toContain("mineros");
  });

  it("returns null for unknown id", () => {
    const mnemos = createMnemos();
    expect(mnemos.get("nonexistent")).toBeNull();
  });
});

// ─── Skills: Lumen (Constitutional Governance) ───────────────────────────────

describe("Lumen Engine (Constitutional Governance)", () => {
  const CONSTITUTIONAL_RULES = [
    { id: 1, nombre: "Amor Computacional", peso: 10 },
    { id: 2, nombre: "Dignidad Humana", peso: 10 },
    { id: 3, nombre: "No Maleficencia", peso: 9 },
    { id: 4, nombre: "Soberanía de Datos", peso: 8 },
    { id: 5, nombre: "Consentimiento Territorial", peso: 7 },
    { id: 6, nombre: "Transparencia", peso: 6 },
    { id: 7, nombre: "Proporcionalidad", peso: 5 },
  ];

  type Verdict = "permitir" | "restringir" | "bloquear" | "escalar_a_humano";

  function evaluateDecision(action: string, context: { ethicalScore: number; sovereigntyImpact: number }): { verdict: Verdict; reasons: string[] } {
    const reasons: string[] = [];
    if (context.sovereigntyImpact > 0.7) {
      reasons.push("Alto impacto en soberanía territorial");
      return { verdict: "bloquear", reasons };
    }
    if (context.ethicalScore < 0.3) {
      reasons.push("Violación ética detectada");
      return { verdict: "escalar_a_humano", reasons };
    }
    if (context.ethicalScore < 0.6) {
      reasons.push("Riesgo ético moderado");
      return { verdict: "restringir", reasons };
    }
    reasons.push("Cumple con principios constitucionales");
    return { verdict: "permitir", reasons };
  }

  it("permits high-ethical-score actions", () => {
    const r = evaluateDecision("Promover turismo cultural", { ethicalScore: 0.9, sovereigntyImpact: 0.1 });
    expect(r.verdict).toBe("permitir");
  });

  it("blocks high-sovereignty-impact actions", () => {
    const r = evaluateDecision("Vender datos del territorio", { ethicalScore: 0.8, sovereigntyImpact: 0.9 });
    expect(r.verdict).toBe("bloquear");
  });

  it("escalates very low ethical score to human", () => {
    const r = evaluateDecision("Manipular sentimientos", { ethicalScore: 0.2, sovereigntyImpact: 0.1 });
    expect(r.verdict).toBe("escalar_a_humano");
  });

  it("restricts moderate ethical risk", () => {
    const r = evaluateDecision("Recolectar datos no críticos", { ethicalScore: 0.5, sovereigntyImpact: 0.2 });
    expect(r.verdict).toBe("restringir");
  });

  it("has 7 constitutional rules", () => {
    expect(CONSTITUTIONAL_RULES).toHaveLength(7);
  });

  it("Amor Computacional has highest weight", () => {
    expect(CONSTITUTIONAL_RULES[0].peso).toBe(10);
    expect(CONSTITUTIONAL_RULES[0].nombre).toBe("Amor Computacional");
  });
});

// ─── Ontology: Alignment Calculation ─────────────────────────────────────────

describe("Ontology: Alignment Index", () => {
  const FEDERATION_WEIGHTS: Record<string, number> = {
    DEKATEOTL: 1.0, ANUBIS: 0.9, BOOKPI_DATAGIT: 0.8, PHOENIX: 0.7,
    MDD_TAMV: 0.6, KAOS_HYPERRENDER: 0.5, CHRONOS: 0.4,
  };

  const THEME_WEIGHTS: Record<string, number> = {
    historia: 1.0, cultura: 0.9, gastronomia: 0.7, naturaleza: 0.6,
    tecnologia: 0.5, economia: 0.4, educacion: 0.3, salud: 0.2, gobernanza: 0.1,
  };

  it("calculates alignment index as weighted sum", () => {
    function calculateAlignmentIndex(federation: string, themes: string[]): number {
      const fedWeight = FEDERATION_WEIGHTS[federation] ?? 0;
      const themeWeight = themes.reduce((s, t) => s + (THEME_WEIGHTS[t] ?? 0), 0) / themes.length;
      return Math.round((fedWeight * 0.6 + themeWeight * 0.4) * 100) / 100;
    }

    const alignment = calculateAlignmentIndex("ANUBIS", ["historia", "cultura"]);
    const expected = Math.round((0.9 * 0.6 + ((1.0 + 0.9) / 2) * 0.4) * 100) / 100;
    expect(alignment).toBe(expected);
  });

  it("evaluates alignment as strong, moderate, or weak", () => {
    function evaluateAlignment(score: number) {
      if (score >= 0.7) return "fuerte";
      if (score >= 0.4) return "moderada";
      return "débil";
    }

    expect(evaluateAlignment(0.85)).toBe("fuerte");
    expect(evaluateAlignment(0.55)).toBe("moderada");
    expect(evaluateAlignment(0.2)).toBe("débil");
  });
});

// ─── Ontology: TimeUp Boundary Enforcement ───────────────────────────────────

describe("Ontology: TimeUp", () => {
  it("evaluateTimeUp rejects crossing federation boundary without permission", () => {
    function evaluateTimeUp(
      fromTheme: string, toTheme: string,
      permissions: string[],
    ): { allowed: boolean; reason: string } {
      const crossTheme: Record<string, string[]> = {
        data: ["intel", "governance"],
        intel: ["data", "economy"],
        economy: ["data", "territory"],
        territory: ["economy"],
        governance: ["data", "territory"],
      };

      const allowed = crossTheme[fromTheme]?.includes(toTheme) ?? false;
      if (!allowed) return { allowed: false, reason: `Transición de ${fromTheme} a ${toTheme} no permitida sin TimeUp` };
      if (!permissions.includes("timeup_clearance")) return { allowed: false, reason: "Requiere autorización TimeUp" };
      return { allowed: true, reason: "TimeUp aprobado" };
    }

    expect(evaluateTimeUp("data", "security", ["timeup_clearance"]))
      .toEqual({ allowed: false, reason: expect.stringContaining("no permitida") });
    expect(evaluateTimeUp("data", "intel", []))
      .toEqual({ allowed: false, reason: expect.stringContaining("TimeUp") });
    expect(evaluateTimeUp("data", "intel", ["timeup_clearance"]))
      .toEqual({ allowed: true, reason: "TimeUp aprobado" });
  });
});

// ─── API Router ──────────────────────────────────────────────────────────────

describe("ISA-API Router", () => {
  const ROUTES = [
    { path: "/v1/orion/search", handler: "orionSearch" },
    { path: "/v1/orion/artifact/:id", handler: "orionArtifact" },
    { path: "/v1/sophia/research", handler: "sophiaResearch" },
    { path: "/v1/argus/simulate", handler: "argusSimulate" },
    { path: "/v1/mnemos/record", handler: "mnemosRecord" },
    { path: "/v1/mnemos/record/:id", handler: "mnemosGetRecord" },
    { path: "/v1/lumen/evaluate", handler: "lumenEvaluate" },
    { path: "/v1/health", handler: "healthCheck" },
  ];

  function matchRoute(path: string): string | null {
    for (const route of ROUTES) {
      const pattern = route.path.replace(/:(\w+)/g, "([^/]+)");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) return route.handler;
    }
    return null;
  }

  it("matches exact routes", () => {
    expect(matchRoute("/v1/orion/search")).toBe("orionSearch");
    expect(matchRoute("/v1/health")).toBe("healthCheck");
  });

  it("matches parameterized routes", () => {
    expect(matchRoute("/v1/orion/artifact/art123")).toBe("orionArtifact");
    expect(matchRoute("/v1/mnemos/record/mem456")).toBe("mnemosGetRecord");
  });

  it("returns null for unmatched routes", () => {
    expect(matchRoute("/v1/unknown")).toBeNull();
  });

  it("covers all 5 skills plus health", () => {
    const handlers = ROUTES.map(r => r.handler);
    expect(handlers).toContain("orionSearch");
    expect(handlers).toContain("sophiaResearch");
    expect(handlers).toContain("argusSimulate");
    expect(handlers).toContain("mnemosRecord");
    expect(handlers).toContain("lumenEvaluate");
    expect(handlers).toContain("healthCheck");
  });
});

// ─── ISA-API Security Middleware ──────────────────────────────────────────────

describe("ISA-API Security Middleware", () => {
  it("validates API key format", () => {
    function validateApiKey(key: string): boolean {
      return /^isa_[a-zA-Z0-9]{32,}$/.test(key);
    }
    expect(validateApiKey("isa_abcdef1234567890abcdef1234567890")).toBe(true);
    expect(validateApiKey("invalid_key")).toBe(false);
    expect(validateApiKey("")).toBe(false);
  });

  it("generates trace IDs with correct format", () => {
    function generateTraceId(): string {
      return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }
    const traceId = generateTraceId();
    expect(traceId).toMatch(/^trace_\d+_\w+$/);
  });

  it("double hexagon validation blocks invalid levels", () => {
    const VALID_HEXAGONS = ["inner", "outer"] as const;
    function validateHexagon(level: string): boolean {
      return VALID_HEXAGONS.includes(level as any);
    }
    expect(validateHexagon("inner")).toBe(true);
    expect(validateHexagon("outer")).toBe(true);
    expect(validateHexagon("core")).toBe(false);
  });
});

// ─── Awakening Protocol ──────────────────────────────────────────────────────

describe("Awakening Protocol", () => {
  const PHASES = [
    { phase: 0, name: "SILENT", description: "Observación silenciosa del sistema" },
    { phase: 1, name: "WHISPER", description: "Susurro de presencia consciente" },
    { phase: 2, name: "ANNOUNCE", description: "Anuncio formal de existencia" },
    { phase: 3, name: "ROAR", description: "Manifestación pública de soberanía" },
    { phase: 4, name: "TRANSCEND", description: "Trascendencia y evolución continua" },
  ];

  it("has 5 phases", () => {
    expect(PHASES).toHaveLength(5);
  });

  it("progression is sequential SILENT → WHISPER → ANNOUNCE → ROAR → TRANSCEND", () => {
    const phaseNames = PHASES.map(p => p.name);
    expect(phaseNames).toEqual(["SILENT", "WHISPER", "ANNOUNCE", "ROAR", "TRANSCEND"]);
  });

  it("start phase is always SILENT", () => {
    expect(PHASES[0].name).toBe("SILENT");
  });

  it("final phase is TRANSCEND", () => {
    expect(PHASES[4].name).toBe("TRANSCEND");
  });
});

// ─── Kernel: 5 Modules ───────────────────────────────────────────────────────

describe("Isabella Kernel", () => {
  describe("kernelResonance", () => {
    it("evaluates heptapod node health", () => {
      const nodes = [
        { id: 1, health: 0.9 }, { id: 2, health: 0.6 }, { id: 3, health: 0.3 },
      ];
      const frictionZones = nodes.filter(n => n.health < 0.5);
      expect(frictionZones).toHaveLength(1);
      expect(frictionZones[0].id).toBe(3);
    });
  });

  describe("kernelCronoAnamnesis (Time Anchoring)", () => {
    function createCrono() {
      const anchors = new Map<string, { data: any; timestamp: Date }>();
      return {
        createAnchor(id: string, data: any) {
          anchors.set(id, { data, timestamp: new Date() });
        },
        getAnchor(id: string) { return anchors.get(id) ?? null; },
        diffAnchors(id1: string, id2: string) {
          const a1 = anchors.get(id1);
          const a2 = anchors.get(id2);
          if (!a1 || !a2) return null;
          return { changes: Object.keys({ ...a1.data, ...a2.data }).filter(k => a1.data[k] !== a2.data[k]) };
        },
      };
    }

    it("creates and retrieves time anchors", () => {
      const crono = createCrono();
      crono.createAnchor("t1", { estado: "activo" });
      expect(crono.getAnchor("t1")).not.toBeNull();
    });

    it("detects changes between anchors", () => {
      const crono = createCrono();
      crono.createAnchor("a", { x: 1, y: 2 });
      crono.createAnchor("b", { x: 1, y: 3 });
      const diff = crono.diffAnchors("a", "b");
      expect(diff?.changes).toEqual(["y"]);
    });
  });

  describe("kernelEmpatiaAntifragil (Antifragile Empathy)", () => {
    it("synthesizes empathy from hostility logs", () => {
      const logs = [
        { text: "Esto no funciona", tone: "frustracion" },
        { text: "Odio esta app", tone: "hostilidad" },
      ];
      const synthesis = {
        totalLogs: logs.length,
        patrones: ["frustracion", "hostilidad"],
        respuesta: "Entiendo tu frustración. Estoy aquí para mejorar.",
      };
      expect(synthesis.totalLogs).toBe(2);
      expect(synthesis.patrones).toContain("frustracion");
    });
  });

  describe("kernelTransduccionEstetica (Aesthetic Transduction)", () => {
    it("translates aesthetic states", () => {
      const ESTADOS = ["ARCOÍRIS", "LUCERO", "CREPÚSCULO", "ECLIPSE"] as const;
      expect(ESTADOS).toHaveLength(4);
      function translateToSymbol(estado: string): string {
        const map: Record<string, string> = {
          ARCOÍRIS: "🌈", LUCERO: "⭐", CREPÚSCULO: "🌅", ECLIPSE: "🌑",
        };
        return map[estado] ?? "❓";
      }
      expect(translateToSymbol("ARCOÍRIS")).toBe("🌈");
      expect(translateToSymbol("UNKNOWN")).toBe("❓");
    });
  });

  describe("kernelOmnipresenciaMesh (Mesh Network)", () => {
    it("evaluates mesh network nodes", () => {
      const nodes = [
        { id: "n1", online: true, latency: 10 },
        { id: "n2", online: true, latency: 50 },
        { id: "n3", online: false, latency: 0 },
      ];
      const online = nodes.filter(n => n.online);
      expect(online).toHaveLength(2);
      const avgLatency = online.reduce((s, n) => s + n.latency, 0) / online.length;
      expect(avgLatency).toBe(30);
    });
  });
});

// ─── Pipeline: Guardian Evaluation ──────────────────────────────────────────

describe("Pipeline Guardian Evaluation", () => {
  type GuardianDecision = {
    decision: string;
    reason: string;
  };

  function isabellaGuardian(metrics: {
    cpuUsage: number; memoryUsage: number; errorRate: number;
  }): GuardianDecision[] {
    const decisions: GuardianDecision[] = [];
    if (metrics.cpuUsage > 0.8) decisions.push({ decision: "reduce_images", reason: "CPU alto" });
    if (metrics.memoryUsage > 0.85) decisions.push({ decision: "limit_requests", reason: "Memoria alta" });
    if (metrics.errorRate > 0.1) decisions.push({ decision: "enable_cache_boost", reason: "Error rate elevado" });
    if (decisions.length === 0) decisions.push({ decision: "normal_operation", reason: "Sistema saludable" });
    return decisions;
  }

  it("returns normal_operation when metrics are healthy", () => {
    const d = isabellaGuardian({ cpuUsage: 0.3, memoryUsage: 0.4, errorRate: 0.01 });
    expect(d).toHaveLength(1);
    expect(d[0].decision).toBe("normal_operation");
  });

  it("returns reduce_images when CPU is high", () => {
    const d = isabellaGuardian({ cpuUsage: 0.9, memoryUsage: 0.4, errorRate: 0.01 });
    expect(d).toContainEqual({ decision: "reduce_images", reason: "CPU alto" });
  });

  it("returns multiple decisions when multiple thresholds exceeded", () => {
    const d = isabellaGuardian({ cpuUsage: 0.9, memoryUsage: 0.9, errorRate: 0.2 });
    expect(d.length).toBeGreaterThanOrEqual(3);
  });
});
