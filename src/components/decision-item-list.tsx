import { CheckCircle2, CircleDot, Shield } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface DecisionItem {
  label: string
  resolved: boolean
}

export interface DecisionItemListProps {
  decisions: DecisionItem[]
}

export function DecisionItemList({ decisions }: DecisionItemListProps) {
  const resolvedCount = decisions.filter((d) => d.resolved).length
  return (
    <Card className="bg-[#181825] border-[#313244] rounded-xl shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#f9e2af]" />
          <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
            Decisiones
          </CardTitle>
          <span className="text-xs text-[#6c7086] ml-auto">
            {resolvedCount}/{decisions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4 pt-0">
        {decisions.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#11111b]/50"
          >
            {d.resolved ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#a6e3a1] flex-shrink-0" />
            ) : (
              <CircleDot className="w-3.5 h-3.5 text-[#f9e2af] flex-shrink-0" />
            )}
            <span className="text-xs text-[#a6adc8] font-mono">{d.label}</span>
            {!d.resolved && (
              <Badge className="ml-auto rounded bg-[#2a2a1a] text-[#f9e2af] border border-[#f9e2af]/20 text-[10px] font-mono uppercase px-2 py-0">
                Pendiente
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
