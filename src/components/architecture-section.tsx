import { Server, Zap, Search, Database, Cpu, Shield, Globe, BarChart3, Activity, Monitor, Cloud, Clock, Layout } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  server: Server, zap: Zap, search: Search, database: Database,
  cpu: Cpu, shield: Shield, globe: Globe, barchart: BarChart3,
  activity: Activity, monitor: Monitor, cloud: Cloud, clock: Clock,
  layout: Layout,
}

export interface ArchitectureDetail {
  icon: string
  label: string
  value: string
  badge?: string
}

export interface ArchitectureSectionProps {
  details: ArchitectureDetail[]
  stack: string[]
}

export function ArchitectureSection({ details, stack }: ArchitectureSectionProps) {
  return (
    <Card className="bg-[#181825] border-[#313244] rounded-xl shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#89b4fa]" />
          <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
            Arquitectura
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        {details.map((d, i) => {
          const Icon = iconMap[d.icon] || Server
          return (
            <div key={i} className="flex items-center gap-2 text-xs font-mono">
              <Icon className="w-3 h-3 text-[#89b4fa]" />
              <span className="text-[#cdd6f4]">{d.label}:</span>
              <span className={d.badge ? "text-[#f9e2af]" : "text-[#a6adc8]"}>
                {d.value}
              </span>
              {d.badge && (
                <Badge className="rounded bg-[#2a2a1a] text-[#f9e2af] border border-[#f9e2af]/20 text-[10px] font-mono uppercase px-1.5 py-0">
                  {d.badge}
                </Badge>
              )}
            </div>
          )
        })}
        <Separator className="border-[#313244]" />
        <div className="text-[10px] text-[#6c7086] font-mono uppercase tracking-wide">
          Stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <Badge
              key={s}
              className="rounded bg-[#1e1e2e] text-[#6c7086] border border-[#313244] text-[10px] font-mono"
            >
              {s}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
