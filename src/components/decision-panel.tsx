import { useState, useEffect, useRef } from "react"
import gsap from "gsap"
import { Server, Search, Database, Zap, Box, Activity, HelpCircle, CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlanHero } from "@/components/plan-hero"
import { DecisionOptionCard, type DecisionOption } from "@/components/decision-option-card"
import { DecisionActionBar } from "@/components/decision-action-bar"
import { signalAction, createSignalClient } from "@/lib/signal"

const iconMap = { Server, Search, Database, Zap, Box, Activity }

interface PlanDecisionData {
  heroTitle?: string
  heroDescription?: string
  heroBadge?: string
  heroBadgeVariant?: "green" | "yellow"
  decisionOptions?: DecisionOption[]
  specStatus?: string
  archDetails?: Array<{ value?: string }>
}

export default function DecisionPanel() {
  const [data, setData] = useState<PlanDecisionData | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [archived, setArchived] = useState(false)
  const [archivedDecision, setArchivedDecision] = useState<string | null>(null)

  // Crear cliente WebSocket al montar
  useEffect(() => {
    createSignalClient(4200)
  }, [])

  // Cargar datos del plan
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/src/lib/plan-output.json")
        const json = await res.json()
        setData(json)
        if (json?.specStatus === "created") {
          setArchived(true)
          setArchivedDecision(json.archDetails?.[0]?.value ?? null)
        }
      } catch {}
    }
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleReset = async () => {
    try {
      await fetch("http://localhost:4200/api/reset-plan", { method: "POST" })
    } catch {}
    setArchived(false)
    setArchivedDecision(null)
    setSelected(null)
    setSent(false)
  }

  const options = data?.decisionOptions ?? []
  const selectedOption = options.find((o) => o.id === selected)

  const handleSend = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!selected) return
    signalAction("decision-chosen", {
      decision: data?.heroTitle?.toLowerCase().replace(/\s+/g, "-") ?? "change",
      selected: selectedOption?.id,
      title: selectedOption?.title,
      timestamp: Date.now(),
    })
    setSent(true)
    setTimeout(() => {
      window.location.replace(`/plan?decision=${selected}`)
    }, 400)
  }

  // ── Estado archivado ──
  if (archived) {
    return (
      <div className="min-h-screen bg-[#11111b] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle2 className="w-16 h-16 text-[#a6e3a1] mx-auto" />
          <h2 className="text-xl font-bold text-[#cdd6f4] font-mono">Cambio completado</h2>
          <p className="text-sm text-[#a6adc8] font-mono leading-relaxed">
            La spec fue creada y el plan archivado.{archivedDecision && <> Último cambio: <span className="text-[#89b4fa]">{archivedDecision}</span>.</>}
          </p>
          <p className="text-xs text-[#6c7086] font-mono">
            Iniciá un nuevo cambio para volver al panel de decisiones.
          </p>
          <Button
            onClick={handleReset}
            className="rounded-lg bg-[#89b4fa] hover:bg-[#74c7ec] text-[#11111b] font-mono font-bold text-xs px-6 h-9 mt-4"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Nuevo cambio
          </Button>
        </div>
      </div>
    )
  }

  // ── Sin opciones: esperando nuevo cambio ──
  if (options.length === 0) {
    return <IdleState title={data?.heroTitle} description={data?.heroDescription} />
  }

  // ── Panel normal ──
  return (
    <div className="min-h-screen bg-[#11111b]">
      <div className="max-w-300 mx-auto p-6 md:p-10">

        <PlanHero
          icon={HelpCircle}
          title={data?.heroTitle ?? "Cargando..."}
          badge={data?.heroBadge ?? "Decisión Pendiente"}
          badgeVariant={data?.heroBadgeVariant ?? "yellow"}
          description={data?.heroDescription ?? ""}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {options.map((opt) => (
            <DecisionOptionCard
              key={opt.id}
              option={opt}
              isSelected={selected === opt.id}
              disabled={sent}
              onSelect={() => setSelected(opt.id)}
              iconMap={iconMap}
            />
          ))}
        </div>

        <DecisionActionBar
          selectedLabel={selectedOption?.title ?? null}
          sent={sent}
          disabled={!selected || sent}
          onSend={handleSend}
        />

      </div>
    </div>
  )
}

// ── Idle state with orbital animation ──
function IdleState({ title, description }: { title?: string; description?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ring3Ref = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(coreRef.current, {
        scale: 1.3,
        opacity: 0.6,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
      gsap.to(ring1Ref.current, {
        rotation: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
      })
      gsap.to(ring2Ref.current, {
        rotation: -360,
        duration: 12,
        ease: "none",
        repeat: -1,
      })
      gsap.to(ring3Ref.current, {
        rotation: 360,
        duration: 16,
        ease: "none",
        repeat: -1,
      })
      dotsRef.current.forEach((dot, i) => {
        if (!dot) return
        gsap.to(dot, {
          y: -12 - i * 3,
          opacity: 0.3,
          duration: 1.5 + i * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.15,
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#11111b] flex items-center justify-center overflow-hidden">
      <div className="relative w-80 h-80 flex items-center justify-center">
        <div ref={ring3Ref} className="absolute inset-0 rounded-full border border-[#313244]/30" style={{ borderStyle: "dashed", borderWidth: "1px" }} />
        <div ref={ring2Ref} className="absolute inset-6 rounded-full border border-[#89b4fa]/15" style={{ borderWidth: "1px" }} />
        <div ref={ring1Ref} className="absolute inset-14 rounded-full border border-[#a6e3a1]/20" style={{ borderWidth: "1.5px" }} />
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 38
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          return (
            <div
              key={i}
              ref={(el) => { dotsRef.current[i] = el }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? "#89b4fa" : "#a6e3a1",
                left: `calc(50% + ${x}% - 4px)`,
                top: `calc(50% + ${y}% - 4px)`,
                boxShadow: i % 2 === 0 ? "0 0 8px rgba(137,180,250,0.5)" : "0 0 8px rgba(166,227,161,0.4)",
              }}
            />
          )
        })}
        <div ref={coreRef} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #89b4fa 0%, #74c7ec 100%)", boxShadow: "0 0 32px rgba(137,180,250,0.4), 0 0 64px rgba(137,180,250,0.15)" }}>
          <div className="w-4 h-4 rounded-full bg-[#11111b]/60" />
        </div>
      </div>
      <div className="absolute bottom-1/6 left-0 right-0 text-center mx-auto">
        <h2 className="text-xl font-bold text-[#cdd6f4] font-mono mb-2">{title ?? "Esperando nuevo cambio"}</h2>
        <p className="text-sm text-[#6c7086] font-mono leading-relaxed max-w-md mx-auto">{description ?? "No hay una issue activa. Cuando se inicie un nuevo SDD, las propuestas aparecerán aquí."}</p>
      </div>
    </div>
  )
}
