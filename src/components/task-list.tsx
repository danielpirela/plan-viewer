import { GitBranch } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { effortColorMap } from "@/lib/colors"

export interface Task {
  id: number
  title: string
  effort: string
  status: string
  risk: "low" | "medium" | "high"
}

export interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <Card className="bg-[#181825] border-[#313244] rounded-xl shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#89b4fa]" />
          <CardTitle className="text-sm font-bold text-[#cdd6f4] uppercase tracking-wide font-mono">
            Tareas
          </CardTitle>
          <span className="text-xs text-[#6c7086] ml-auto">
            {tasks.length} pendientes
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#11111b]/50 border border-[#313244] hover:border-[#45475a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#45475a] font-mono w-4">
                  #{t.id}
                </span>
                <span className="text-xs text-[#cdd6f4] font-mono">
                  {t.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] font-mono"
                  style={{ color: effortColorMap[t.risk] }}
                >
                  {t.effort}
                </span>
                <Badge className="rounded bg-[#1a3624] text-[#a6e3a1] border border-[#a6e3a1]/20 text-[10px] font-mono uppercase px-2 py-0">
                  {t.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
