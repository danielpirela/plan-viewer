import { AlertTriangle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { effortColorMap, riskBadgeClass } from "@/lib/colors"

export interface Risk {
  label: string
  level: "low" | "medium" | "high"
}

export interface RiskListProps {
  risks: Risk[]
}

export function RiskList({ risks }: RiskListProps) {
  return (
    <Card className="bg-[#181825] border-[#313244] rounded-xl shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f38ba8]" />
          <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
            Riesgos
          </CardTitle>
          <span className="text-xs text-[#6c7086] ml-auto">{risks.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4 pt-0">
        {risks.map((r, i) => (
          <div
            key={i}
            className="flex items-start gap-2 py-2 px-3 rounded-lg bg-[#11111b]/50"
          >
            <span
              className="text-xs mt-0.5 flex-shrink-0"
              style={{ color: effortColorMap[r.level] }}
            >
              ●
            </span>
            <div className="min-w-0">
              <span className="text-xs text-[#a6adc8] font-mono leading-relaxed">
                {r.label}
              </span>
            </div>
            <Badge
              className={`ml-auto flex-shrink-0 rounded border text-[10px] font-mono uppercase px-2 py-0 ${riskBadgeClass[r.level]}`}
            >
              {r.level}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
