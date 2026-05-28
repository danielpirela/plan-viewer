import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, CircleDot } from "lucide-react"

// ── Types ──

export interface MicroOption {
  id: string
  name: string
  desc: string
  effort: string
}

export interface MicroDecisionProps {
  title: string
  description: string
  decisionKey: string
  options: MicroOption[]
  onConfirm?: (selected: string) => void
  signalAction: (action: string, data?: Record<string, unknown>) => void
}

// ── Component ──

export function MicroDecision({
  title,
  description,
  decisionKey,
  options,
  onConfirm,
  signalAction,
}: MicroDecisionProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (!selected || confirmed) return
    setConfirmed(true)
    onConfirm?.(selected)
    signalAction("micro-decision", {
      decision: decisionKey,
      selected,
      section: "plan-dashboard",
    })
  }

  return (
    <div className="mt-5">
      <Card className="bg-[#181825] border border-[#45475a] rounded-xl shadow-none">
        {/* ── HEADER ── */}
        <CardHeader>
          <div className="flex items-center gap-2">
            {confirmed ? (
              <CheckCircle2 className="w-4 h-4 text-[#a6e3a1]" />
            ) : (
              <CircleDot className="w-4 h-4 text-[#f9e2af]" />
            )}
            <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
              Micro-decisión: {title}
            </CardTitle>
            <span
              className={`text-xs ml-auto font-mono ${
                confirmed ? "text-[#a6e3a1]" : "text-[#6c7086]"
              }`}
            >
              {confirmed ? "Confirmado" : "1 pendiente"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-xs text-[#a6adc8] font-mono mb-3">{description}</p>

          {/* ── OPTIONS ── */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {options.map((opt) => {
              const isPicked = selected === opt.id
              return (
                <div
                  key={opt.id}
                  role="radio"
                  aria-checked={isPicked}
                  tabIndex={confirmed ? -1 : 0}
                  onClick={() => {
                    if (!confirmed) setSelected(opt.id)
                  }}
                  onKeyDown={(e) => {
                    if (
                      !confirmed &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault()
                      setSelected(opt.id)
                    }
                  }}
                  className={`flex items-start gap-3 py-3 px-4 rounded-lg transition-all duration-200 select-none ${
                    confirmed
                      ? "pointer-events-none opacity-60"
                      : "cursor-pointer"
                  } ${
                    isPicked
                      ? "bg-[#1a1a2e] border border-[#89b4fa] shadow-[0_0_20px_rgba(137,180,250,0.15)]"
                      : "bg-[#11111b]/50 border border-[#313244] hover:border-[#45475a] hover:bg-[#14141f]"
                  }`}
                >
                  {/* Radio circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                      isPicked
                        ? "border-[#a6e3a1] bg-[#a6e3a1] scale-110"
                        : "border-[#45475a] group-hover:border-[#585b70]"
                    }`}
                  >
                    {isPicked && (
                      <CheckCircle2 className="w-3 h-3 text-[#11111b] stroke-[3]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold font-mono transition-colors ${
                          isPicked ? "text-[#a6e3a1]" : "text-[#cdd6f4]"
                        }`}
                      >
                        {opt.name}
                      </span>
                      {isPicked && (
                        <Badge className="rounded bg-[#1a3624] text-[#a6e3a1] border border-[#a6e3a1]/30 text-[10px] font-mono uppercase px-1.5 py-0">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                          Seleccionado
                        </Badge>
                      )}
                      <Badge className="rounded bg-[#1e1e2e] text-[#6c7086] border border-[#313244] text-[10px] font-mono">
                        {opt.effort}
                      </Badge>
                    </div>
                    <p
                      className={`text-[11px] font-mono mt-0.5 transition-colors ${
                        isPicked ? "text-[#a6adc8]" : "text-[#6c7086]"
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── CONFIRM BUTTON ── */}
          <Button
            onClick={handleConfirm}
            disabled={!selected || confirmed}
            className={`rounded-lg font-mono text-xs px-4 h-8 transition-all ${
              confirmed
                ? "bg-[#1a3624] border border-[#a6e3a1]/30 text-[#a6e3a1] cursor-not-allowed"
                : selected
                  ? "bg-[#89b4fa] hover:bg-[#74c7ec] text-[#11111b]"
                  : "bg-[#1e1e2e] border border-[#45475a] text-[#6c7086] cursor-not-allowed"
            }`}
          >
            {confirmed
              ? "Confirmado"
              : selected
                ? "Confirmar selección"
                : "Elegí una opción"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
