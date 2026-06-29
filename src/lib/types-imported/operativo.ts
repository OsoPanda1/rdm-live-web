// Shared "operativo" (operational dashboard) contracts

export type ModuleStatus = "design" | "in-progress" | "done";

export interface ModuleState {
  id: string;
  name: string;
  domain: string;
  status: ModuleStatus;
  /** 0-100 */
  completion: number;
  /** Optional doc / spec reference */
  spec?: string;
  /** Optional route to open the module in the app */
  route?: string;
  notes?: string;
}

export interface DomainSummary {
  domain: string;
  total: number;
  done: number;
  inProgress: number;
  design: number;
  completion: number;
}
