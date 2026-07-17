import { randomUUID } from "node:crypto";
import { db } from "../../lib/store.js";
import type { DataSource, EntityType, QueryOptions, QueryResult } from "../types.js";

const ENTITY_MAP: Record<string, keyof typeof db> = {
  user: "users",
  profile: "profiles",
  business: "businesses",
  donation: "donations",
  interaction: "interactions",
  digitalTwin: "digitalTwins",
  twinEvent: "twinEvents",
  socialPost: "socialPosts",
  socialComment: "socialComments",
  socialChannel: "socialChannels",
  directMessage: "directMessages",
  streamRoom: "streamRooms",
  videoCallRoom: "videoCallRooms",
  ledger: "ledger",
  membership: "memberships",
  tokenBalance: "tokenBalances",
  protocolRun: "protocolRuns",
  msrEvent: "msrEvents",
  bookpiNarrative: "bookpiNarratives",
  guardianAlert: "guardianAlerts",
  dreamspace: "dreamspaces",
};

function getMap(entityType: EntityType): Map<string, unknown> | null {
  const mapName = ENTITY_MAP[entityType];
  if (!mapName) return null;
  const map = db[mapName];
  if (!map || typeof map.get !== "function") return null;
  return map as unknown as Map<string, unknown>;
}

function matchFilter(record: Record<string, unknown>, filter: { field: string; operator: string; value: unknown }): boolean {
  const val = record[filter.field];
  switch (filter.operator) {
    case "eq": return val === filter.value;
    case "neq": return val !== filter.value;
    case "gt": return typeof val === "number" && typeof filter.value === "number" && val > filter.value;
    case "gte": return typeof val === "number" && typeof filter.value === "number" && val >= filter.value;
    case "lt": return typeof val === "number" && typeof filter.value === "number" && val < filter.value;
    case "lte": return typeof val === "number" && typeof filter.value === "number" && val <= filter.value;
    case "in": return Array.isArray(filter.value) && filter.value.includes(val);
    case "contains": return typeof val === "string" && typeof filter.value === "string" && val.includes(filter.value);
    case "startsWith": return typeof val === "string" && typeof filter.value === "string" && val.startsWith(filter.value);
    default: return true;
  }
}

function sortRecords(records: Record<string, unknown>[], field: string, direction: "asc" | "desc") {
  return records.sort((a, b) => {
    const av = a[field] as string | number | undefined;
    const bv = b[field] as string | number | undefined;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return direction === "desc" ? -cmp : cmp;
  });
}

export const storeSource: DataSource = {
  name: "in-memory-store",

  async findById<T>(entityType: EntityType, id: string): Promise<T | null> {
    const map = getMap(entityType);
    if (!map) return null;
    return (map.get(id) as T) ?? null;
  },

  async query<T>(entityType: EntityType, options?: QueryOptions): Promise<QueryResult<T>> {
    const map = getMap(entityType);
    if (!map) return { data: [], total: 0, offset: 0, limit: 0 };

    let records = Array.from(map.values()) as Record<string, unknown>[];

    if (options?.filters?.length) {
      records = records.filter((r) => options.filters!.every((f) => matchFilter(r, f)));
    }

    const total = records.length;

    if (options?.sort) {
      records = sortRecords(records, options.sort.field, options.sort.direction);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    records = records.slice(offset, offset + limit);

    return { data: records as T[], total, offset, limit };
  },

  async create<T>(entityType: EntityType, data: Partial<T>): Promise<T> {
    const map = getMap(entityType);
    const id = (data as Record<string, unknown>)?.id as string ?? randomUUID();
    const record = { ...data, id, createdAt: new Date().toISOString() } as T;
    if (map) map.set(id, record);
    return record;
  },

  async update<T>(entityType: EntityType, id: string, data: Partial<T>): Promise<T | null> {
    const map = getMap(entityType);
    if (!map) return null;
    const existing = map.get(id) as Record<string, unknown> | undefined;
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() } as T;
    map.set(id, updated);
    return updated;
  },

  async delete(entityType: EntityType, id: string): Promise<boolean> {
    const map = getMap(entityType);
    if (!map) return false;
    return map.delete(id);
  },
};
