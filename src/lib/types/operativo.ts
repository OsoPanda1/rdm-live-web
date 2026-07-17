export type ModuleStatus = "done" | "in-progress" | "design"

export interface ModuleState {
  id: string
  name: string
  domain: string
  status: ModuleStatus
  completion: number
  route: string
  spec: string
  notes: string
}

export interface DomainSummary {
  domain: string
  total: number
  done: number
  inProgress: number
  design: number
  completion: number
}
