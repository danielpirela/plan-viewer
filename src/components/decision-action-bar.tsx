import { Button } from "@/components/ui/button"
import { Send, ArrowRight } from "lucide-react"

export interface DecisionActionBarProps {
  selectedLabel: string | null
  sent: boolean
  disabled: boolean
  onSend: (e: React.MouseEvent) => void
}

export function DecisionActionBar({
  selectedLabel,
  sent,
  disabled,
  onSend,
}: DecisionActionBarProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#313244]">
      <div className="text-xs text-[#6c7086] font-mono">
        {sent
          ? "Decisión enviada. Redirigiendo al plan..."
          : selectedLabel
            ? `Opción seleccionada: ${selectedLabel}`
            : "Seleccioná una opción para continuar"}
      </div>
      <Button
        onClick={onSend}
        disabled={disabled}
        className={`rounded-lg font-mono font-bold text-xs px-8 h-10 transition-all ${
          !disabled
            ? "bg-[#89b4fa] hover:bg-[#74c7ec] text-[#11111b] hover:shadow-[0_0_20px_rgba(137,180,250,0.3)]"
            : "bg-[#1e1e2e] text-[#45475a] cursor-not-allowed"
        }`}
      >
        <Send className="w-3.5 h-3.5 mr-2" />
        {sent ? "Redirigiendo..." : "Enviar decisión"}
        <ArrowRight className="w-3.5 h-3.5 ml-2" />
      </Button>
    </div>
  )
}
