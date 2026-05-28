import type { Task } from "@/components/task-list"
import type { Risk } from "@/components/risk-list"
import type { DecisionItem } from "@/components/decision-item-list"
import type { ArchitectureDetail } from "@/components/architecture-section"
import type { MicroOption } from "@/components/micro-decision"

export interface PlanConfig {
  heroBadge: string
  heroDescription: string
  scopeIn: string[]
  scopeOut: string[]
  tasks: Task[]
  risks: Risk[]
  decisions: DecisionItem[]
  archDetails: ArchitectureDetail[]
  archStack: string[]
  microDecisions: MicroDecisionConfig[]
  specStatus?: "created" | null
}

export interface MicroDecisionConfig {
  title: string
  description: string
  decisionKey: string
  options: MicroOption[]
}
