// Shared ecosystem repo contracts (used by /fusion and tooling)

export type RepoRole = "core" | "satellite" | "legacy" | "experimental";
export type RepoStatus = "active" | "archived" | "integrated" | "partial" | "planned";

export interface EcosystemRepo {
  name: string;
  url: string;
  role: RepoRole;
  domain: string;
  tech: string[];
  status: RepoStatus;
}
