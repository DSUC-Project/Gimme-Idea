import { Zap } from "lucide-react"

interface AIBadgeProps {
  confidence?: number
  label?: string
}

export function AIBadge({ confidence = 85, label = "IdeaBot" }: AIBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/50">
      <Zap className="w-3 h-3 text-accent" />
      <span className="text-xs font-medium text-accent">{label}</span>
      {confidence && <span className="text-xs text-accent/70">{confidence}%</span>}
    </div>
  )
}
