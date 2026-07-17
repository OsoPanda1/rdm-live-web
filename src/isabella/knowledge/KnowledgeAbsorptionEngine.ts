import { logger } from "@/lib/logger";
import { getPQC } from "@/security/PostQuantumCrypto";

interface KnowledgeSource {
  url: string;
  type: "WEB" | "API" | "DOCUMENT" | "SOCIAL";
  lastFetch: Date | null;
  fetchIntervalMs: number;
  tags: string[];
}

interface KnowledgeEntry {
  id: string;
  source: string;
  title: string;
  content: string;
  summary: string;
  timestamp: Date;
  hash: string;
  relevance: number;
  tags: string[];
}

export class KnowledgeAbsorptionEngine {
  private sources: KnowledgeSource[] = [];
  private knowledgeBase: KnowledgeEntry[] = [];
  private fetchTimer: ReturnType<typeof setInterval> | null = null;
  private readonly maxEntries = 5000;

  registerSource(source: KnowledgeSource): void {
    this.sources.push(source);
    logger.info("[KNOWLEDGE] Fuente registrada", { url: source.url, type: source.type });
  }

  registerSources(sources: KnowledgeSource[]): void {
    for (const source of sources) {
      this.registerSource(source);
    }
  }

  startAbsorptionCycle(intervalMs = 300000): void {
    if (this.fetchTimer) return;
    logger.info("[KNOWLEDGE] Ciclo de absorción iniciado", { intervalMs });
    this.fetchTimer = setInterval(() => this.cycle(), intervalMs);
    this.cycle();
  }

  stop(): void {
    if (this.fetchTimer) {
      clearInterval(this.fetchTimer);
      this.fetchTimer = null;
    }
  }

  query(query: string, limit = 5): KnowledgeEntry[] {
    const lower = query.toLowerCase();
    return this.knowledgeBase
      .map(entry => ({
        entry,
        score: this.relevanceScore(entry, lower),
      }))
      .filter(r => r.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.entry);
  }

  getKnowledgeByTags(tags: string[]): KnowledgeEntry[] {
    return this.knowledgeBase.filter(entry =>
      tags.some(tag => entry.tags.includes(tag)),
    );
  }

  getStats(): { totalEntries: number; totalSources: number; lastFetch: Date | null } {
    const lastFetch = this.knowledgeBase.length > 0
      ? this.knowledgeBase.reduce((latest, e) => e.timestamp > latest ? e.timestamp : latest, this.knowledgeBase[0].timestamp)
      : null;
    return {
      totalEntries: this.knowledgeBase.length,
      totalSources: this.sources.length,
      lastFetch,
    };
  }

  private async cycle(): Promise<void> {
    for (const source of this.sources) {
      if (source.lastFetch && Date.now() - source.lastFetch.getTime() < source.fetchIntervalMs) {
        continue;
      }

      try {
        await this.fetchSource(source);
        source.lastFetch = new Date();
      } catch (error) {
        logger.warn("[KNOWLEDGE] Error fetching source", { url: source.url, error });
      }
    }
  }

  private async fetchSource(source: KnowledgeSource): Promise<void> {
    const response = await fetch(source.url, {
      headers: { "User-Agent": "IsabellaVillasenor/1.0 (TAMV Knowledge Absorber)" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return;

    const contentType = response.headers.get("content-type") || "";
    let content: string;

    if (contentType.includes("application/json")) {
      content = JSON.stringify(await response.json());
    } else {
      content = await response.text();
    }

    const hash = await getPQC().hash(content);
    if (this.knowledgeBase.some(e => e.hash === hash)) return;

    const entry: KnowledgeEntry = {
      id: crypto.randomUUID(),
      source: source.url,
      title: this.extractTitle(content, source.url),
      content: content.slice(0, 5000),
      summary: this.generateSummary(content),
      timestamp: new Date(),
      hash,
      relevance: 1.0,
      tags: source.tags,
    };

    this.knowledgeBase.push(entry);
    if (this.knowledgeBase.length > this.maxEntries) {
      this.knowledgeBase = this.knowledgeBase.sort((a, b) => b.relevance - a.relevance).slice(0, this.maxEntries);
    }

    logger.info("[KNOWLEDGE] Entrada absorbida", { url: source.url, title: entry.title, tags: source.tags });
  }

  private relevanceScore(entry: KnowledgeEntry, query: string): number {
    let score = 0;
    const lowerTitle = entry.title.toLowerCase();
    const lowerSummary = entry.summary.toLowerCase();
    const lowerContent = entry.content.toLowerCase();

    if (lowerTitle.includes(query)) score += 0.5;
    if (lowerSummary.includes(query)) score += 0.3;
    if (lowerContent.includes(query)) score += 0.2;

    const tagMatch = entry.tags.filter(t => t.toLowerCase().includes(query)).length;
    score += tagMatch * 0.1;

    return Math.min(1, score);
  }

  private extractTitle(content: string, url: string): string {
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim().slice(0, 200);

    try {
      const parsed = JSON.parse(content);
      if (parsed.title) return String(parsed.title).slice(0, 200);
      if (parsed.name) return String(parsed.name).slice(0, 200);
    } catch { /* JSON parse expected to fail for non-JSON content */ }

    return url.split("/").pop()?.split(".")[0]?.replace(/[-_]/g, " ") || url;
  }

  private generateSummary(content: string): string {
    const clean = content
      .replace(/<[^>]*>/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(new RegExp("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "g"), "")
      .replace(/\s+/g, " ")
      .trim();
    return clean.slice(0, 300);
  }
}

export const knowledgeEngine = new KnowledgeAbsorptionEngine();
