import { TaskForm } from "@/components/form/task-form"
import { LiquidShell } from "@/components/liquid/shell"

export default function HomePage() {
  return (
    <LiquidShell
      title="פתיחת משימת אוטומציה"
      subtitle="במקום לשלוח וואטסאפ"
      showLogout
    >
      <TaskForm />
    </LiquidShell>
  )
}
