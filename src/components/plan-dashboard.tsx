import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronRight, CircleDot, CheckCircle2, FileText, Wifi, WifiOff } from "lucide-react"
import { PlanHero } from "@/components/plan-hero"
import { ScopeSection } from "@/components/scope-section"
import { TaskList } from "@/components/task-list"
import { RiskList } from "@/components/risk-list"
import { DecisionItemList } from "@/components/decision-item-list"
import { ArchitectureSection } from "@/components/architecture-section"
import { MicroDecision } from "@/components/micro-decision"
import { PlanLoading } from "@/components/plan-loading"
import type { PlanConfig } from "@/lib/plan-data"
import { signalAction, createSignalClient, getConnectionStatus, onConnectionStatusChange, type ConnectionStatus } from "@/lib/signal"

export default function PlanDashboard() {
  const [searchParams] = useSearchParams()
  const decision = searchParams.get("decision")

  const [plan, setPlan] = useState<PlanConfig | null>(null)
  const [specRequested, setSpecRequested] = useState(false)
  const [specCreated, setSpecCreated] = useState(false)
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>("disconnected")

  // WebSocket signal client
  useEffect(() => {
    createSignalClient(4200)
    return onConnectionStatusChange(setWsStatus)
  }, [])

  // Poll plan-output.json cada 1s
  useEffect(() => {
    if (!decision) return

    const poll = async () => {
      try {
        const res = await fetch("/src/lib/plan-output.json")
        const data = await res.json()
        if (data) {
          setPlan(data)
          if (data.specStatus === "created") setSpecCreated(true)
        }
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [decision])

  // ── Sin decisión: mostrar loader ──
  if (!decision) {
    return <PlanLoading />
  }

  // ── Esperando que se genere el plan ──
  if (!plan || (plan.tasks?.length === 0 && plan.scopeIn?.length === 0 && plan.specStatus !== "created")) {
    return <PlanLoading />
  }

  // ── Spec creada: plan archivado ──
  if (specCreated) {
    return (
      <div className="min-h-screen bg-[#11111b] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle2 className="w-16 h-16 text-[#a6e3a1] mx-auto" />
          <h2 className="text-xl font-bold text-[#cdd6f4] font-mono">Spec creada</h2>
          <p className="text-sm text-[#a6adc8] font-mono leading-relaxed">
            El plan fue archivado porque la spec ya fue generada. Volvé al panel de decisiones para iniciar un nuevo cambio.
          </p>
          <Button
            onClick={() => window.location.replace("/")}
            className="rounded-lg bg-[#89b4fa] hover:bg-[#74c7ec] text-[#11111b] font-mono font-bold text-xs px-6 h-9 mt-4"
          >
            Volver al inicio
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Plan generado ──
  return (
    <div className="min-h-screen bg-[#11111b]">
      <div className="max-w-[1200px] mx-auto p-6 md:p-10">

        <PlanHero
          icon={FileText}
          title={plan.heroTitle ?? "Plan"}
          badge={plan.heroBadge}
          description={plan.heroDescription}
        />

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 space-y-5">
            <ScopeSection scopeIn={plan.scopeIn} scopeOut={plan.scopeOut} />
            <TaskList tasks={plan.tasks} />
          </div>
          <div className="col-span-2 space-y-5">
            <RiskList risks={plan.risks} />
            <DecisionItemList decisions={plan.decisions} />
            <ArchitectureSection details={plan.archDetails} stack={plan.archStack} />
          </div>
        </div>

        {plan.microDecisions.map((md) => (
          <MicroDecision
            key={md.decisionKey}
            title={md.title}
            description={md.description}
            decisionKey={md.decisionKey}
            signalAction={signalAction}
            options={md.options}
          />
        ))}

        {/* ── FOOTER CTA ── */}
        <div className="flex items-center justify-between pt-5 border-t border-[#313244] mt-5">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-mono transition-all duration-300 ${
              specRequested
                ? "bg-[#1a3624] border-[#a6e3a1]/30 text-[#a6e3a1]"
                : "bg-[#1e1e2e] border-[#313244] text-[#89b4fa]"
            }`}>
              {specRequested ? (
                <CheckCircle2 className="w-3 h-3 text-[#a6e3a1]" />
              ) : (
                <CircleDot className="w-3 h-3 fill-[#89b4fa] text-[#89b4fa]" />
              )}
              {specRequested ? "Decisión tomada — Creando Spec..." : "Recomendación: Avanzar a Spec"}
            </div>
            {/* WS Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-wide ${
              wsStatus === "connected"
                ? "bg-[#1a3624] border-[#a6e3a1]/30 text-[#a6e3a1]"
                : wsStatus === "connecting"
                  ? "bg-[#2a241a] border-[#f9e2af]/30 text-[#f9e2af]"
                  : wsStatus === "degraded"
                    ? "bg-[#2a1a1a] border-[#f38ba8]/30 text-[#f38ba8]"
                    : "bg-[#1e1e2e] border-[#45475a] text-[#6c7086]"
            }`}>
              {wsStatus === "connected" ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {wsStatus === "connected" ? "WS conectado" : wsStatus === "connecting" ? "Conectando..." : wsStatus === "degraded" ? "Modo HTTP" : "Sin conexión"}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (specRequested) return
                setSpecRequested(true)
                signalAction("create-spec", { changeName: "Search Engine", decision })
              }}
              disabled={specRequested}
              className={`rounded-lg font-mono font-bold text-xs px-6 h-9 transition-all ${
                specRequested
                  ? "bg-[#1a3624] border border-[#a6e3a1]/30 text-[#a6e3a1] cursor-not-allowed"
                  : "bg-[#89b4fa] hover:bg-[#74c7ec] text-[#11111b] hover:shadow-[0_0_20px_rgba(137,180,250,0.3)]"
              }`}
            >
              {specRequested ? "Spec solicitada" : "Crear Spec"}
              {!specRequested && <ChevronRight className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => signalAction("edit-proposal", { changeName: "Search Engine" })}
              className="rounded-lg border-[#313244] text-[#cdd6f4] hover:bg-[#1e1e2e] hover:text-[#cdd6f4] font-mono text-xs px-6 h-9"
            >
              Editar propuesta
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
