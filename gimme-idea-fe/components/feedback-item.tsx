"use client"

import { useMemo } from "react"
import { Flag, MessageCircle, Star, ThumbsUp } from "lucide-react"

import type { Feedback } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { AIBadge } from "@/components/ai-badge"

interface FeedbackItemProps {
  feedback: Feedback
  isAI?: boolean
  aiConfidence?: number
  onMarkHelpful?: (feedbackId: string) => Promise<void> | void
  onReport?: (feedbackId: string) => Promise<void> | void
}

export function FeedbackItem({ feedback, isAI, aiConfidence, onMarkHelpful, onReport }: FeedbackItemProps) {
  const authorName = feedback.reviewer?.username ?? (isAI ? "IdeaBot" : "Anonymous")
  const avatarUrl = feedback.reviewer?.avatarUrl ?? (isAI ? "/ideabot-avatar.png" : "/placeholder.svg")

  const contentText = useMemo(() => {
    const segments = [feedback.content.overall]
    if (feedback.content.pros?.length) {
      segments.push(`Pros: ${feedback.content.pros.join(", ")}`)
    }
    if (feedback.content.cons?.length) {
      segments.push(`Cons: ${feedback.content.cons.join(", ")}`)
    }
    if (feedback.content.suggestions?.length) {
      segments.push(`Suggestions: ${feedback.content.suggestions.join(", ")}`)
    }
    return segments.filter(Boolean).join("\n\n")
  }, [feedback.content])

  const createdAt = new Date(feedback.createdAt).toLocaleString()

  return (
    <div className="glass p-6 rounded-lg border hover:border-primary/50 transition-all">
      <div className="flex items-start gap-4">
        <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{authorName}</p>
              {isAI ? <AIBadge confidence={aiConfidence} /> : null}
              {feedback.rewardAmount > 0 ? (
                <span className="text-xs rounded-full bg-success/10 text-success px-2 py-0.5">
                  Rewarded ${feedback.rewardAmount.toFixed(2)}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">{createdAt}</p>
          </div>

          <pre className="whitespace-pre-wrap text-sm text-foreground mb-4">{contentText}</pre>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
              onClick={() => onMarkHelpful?.(feedback.id)}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs">Helpful</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Reply</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-destructive ml-auto"
              onClick={() => onReport?.(feedback.id)}
            >
              <Flag className="w-4 h-4" />
              <span className="text-xs">Report</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
