import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface PlanHeroProps {
  icon: LucideIcon
  title: string
  badge: string
  badgeVariant?: "green" | "yellow"
  description: string
}

const badgeVariantClass: Record<string, string> = {
  green: "text-[#a6e3a1] border-[#a6e3a1]/20",
  yellow: "text-[#f9e2af] border-[#f9e2af]/20",
}

export function PlanHero({
  icon: Icon,
  title,
  badge,
  badgeVariant = "green",
  description,
}: PlanHeroProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6 text-[#89b4fa]" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#cdd6f4] font-mono">
          {title}
        </h1>
        <Badge
          className={`rounded bg-[#1e1e2e] border text-[10px] font-mono uppercase px-3 py-0.5 ${badgeVariantClass[badgeVariant]}`}
        >
          {badge}
        </Badge>
      </div>
      <p className="text-sm text-[#6c7086] font-mono max-w-2xl">{description}</p>
    </div>
  )
}
