import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import DecisionPanel from "@/components/decision-panel"
import PlanDashboard from "@/components/plan-dashboard"

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<DecisionPanel />} />
          <Route path="/plan" element={<PlanDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}
