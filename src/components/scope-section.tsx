import { CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Layers } from "lucide-react"

export interface ScopeSectionProps {
  scopeIn: string[]
  scopeOut: string[]
}

export function ScopeSection({ scopeIn, scopeOut }: ScopeSectionProps) {
  return (
    <Card className="bg-[#181825] border-[#313244] rounded-xl shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#89b4fa]" />
          <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
            Scope
          </CardTitle>
          <span className="text-xs text-[#6c7086] ml-auto">
            {scopeIn.length + scopeOut.length} items
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 px-4 pb-4 pt-0">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wide text-[#a6e3a1] mb-2">
            ✓ Dentro del alcance
          </p>
          {scopeIn.map((s, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#a6e3a1] mt-0.5 flex-shrink-0" />
              <span className="text-xs text-[#a6adc8] font-mono leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wide text-[#f38ba8] mb-2">
            ✗ Fuera del alcance
          </p>
          {scopeOut.map((s, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="text-[#f38ba8] text-xs mt-0.5">−</span>
              <span className="text-xs text-[#6c7086] font-mono leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
