import type { LucideIcon } from "lucide-react"
import { CheckCircle2, HelpCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { effortBadgeClass, effortLabel } from "@/lib/colors"

export interface DecisionOption {
  id: string
  title: string
  description: string
  icon: string
  effort: "low" | "medium" | "high"
  pros: string[]
  cons: string[]
}

export interface DecisionOptionCardProps {
  option: DecisionOption
  isSelected: boolean
  disabled?: boolean
  onSelect: () => void
  iconMap: Record<string, LucideIcon>
}

export function DecisionOptionCard({
  option,
  isSelected,
  disabled = false,
  onSelect,
  iconMap,
}: DecisionOptionCardProps) {
  const Icon = iconMap[option.icon] || HelpCircle

  return (
    <Card
      onClick={() => !disabled && onSelect()}
      className={`cursor-pointer transition-all duration-200 border ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${
        isSelected
          ? "border-[#89b4fa] bg-[#1a1a2e] shadow-[0_0_24px_rgba(137,180,250,0.15)]"
          : "border-[#313244] bg-[#181825] hover:border-[#45475a]"
      } rounded-xl shadow-none`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSelected ? "bg-[#89b4fa]/20" : "bg-[#1e1e2e]"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isSelected ? "text-[#89b4fa]" : "text-[#6c7086]"}`}
              />
            </div>
            <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
              {option.title.split(" ").slice(0, 3).join(" ")}
            </CardTitle>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              isSelected ? "border-[#89b4fa] bg-[#89b4fa]" : "border-[#45475a]"
            }`}
          >
            {isSelected && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#11111b]" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-[#a6adc8] leading-relaxed font-mono">
          {option.description}
        </p>

        <Badge
          className={`rounded border text-[10px] font-mono uppercase px-2 py-0.5 ${effortBadgeClass[option.effort]}`}
        >
          {effortLabel[option.effort]}
        </Badge>

        <Separator className="border-[#313244]" />

        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wide text-[#a6e3a1]">
            + Pros
          </p>
          {option.pros.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#a6e3a1] text-xs mt-0.5">•</span>
              <span className="text-xs text-[#a6adc8] font-mono leading-relaxed">
                {p}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wide text-[#f38ba8]">
            - Contras
          </p>
          {option.cons.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#f38ba8] text-xs mt-0.5">•</span>
              <span className="text-xs text-[#a6adc8] font-mono leading-relaxed">
                {c}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
