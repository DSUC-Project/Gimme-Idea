"use client"

import { CheckCircle, XCircle, AlertTriangle, AlertCircle, Copy, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIBadge } from "@/components/ai-badge"

interface ModerationItemProps {
  id: string
  type: "spam" | "inappropriate" | "duplicate" | "low-quality"
  content: string
  author: string
  project: string
  confidence: number
  reason: string
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function ModerationItem({
  id,
  type,
  content,
  author,
  project,
  confidence,
  reason,
  onApprove,
  onReject,
}: ModerationItemProps) {
  const typeColors = {
    spam: "bg-red-500/10 border-red-500/20",
    inappropriate: "bg-orange-500/10 border-orange-500/20",
    duplicate: "bg-yellow-500/10 border-yellow-500/20",
    "low-quality": "bg-blue-500/10 border-blue-500/20",
  }

  const typeIcons = {
    spam: <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />,
    inappropriate: <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
    duplicate: <Copy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
    "low-quality": <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  }

  return (
    <div className={`glass p-6 rounded-lg border ${typeColors[type]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {typeIcons[type]}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground capitalize">{type} Detection</h3>
              <AIBadge confidence={confidence} label="IdeaBot" />
            </div>
            <p className="text-sm text-muted-foreground">
              By {author} on "{project}"
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-background/50 rounded-lg border border-border">
        <p className="text-foreground text-sm">{content}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Reason:</span> {reason}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" className="bg-transparent gap-2" onClick={() => onApprove(id)}>
          <CheckCircle className="w-4 h-4 text-green-600" />
          Approve
        </Button>
        <Button size="sm" variant="outline" className="bg-transparent gap-2" onClick={() => onReject(id)}>
          <XCircle className="w-4 h-4 text-red-600" />
          Reject
        </Button>
      </div>
    </div>
  )
}
