"use client"

import { X, MessageCircle, AtSign, Bookmark, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationItemProps {
  id: string
  type: "feedback" | "mention" | "bookmark" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  onDismiss: (id: string) => void
}

export function NotificationItem({ id, type, title, message, timestamp, read, onDismiss }: NotificationItemProps) {
  const typeColors = {
    feedback: "bg-blue-500/10 border-blue-500/20",
    mention: "bg-purple-500/10 border-purple-500/20",
    bookmark: "bg-yellow-500/10 border-yellow-500/20",
    system: "bg-green-500/10 border-green-500/20",
  }

  const typeIcons = {
    feedback: <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    mention: <AtSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    bookmark: <Bookmark className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
    system: <Info className="w-5 h-5 text-green-600 dark:text-green-400" />,
  }

  return (
    <div className={`glass p-4 rounded-lg border ${typeColors[type]} ${!read ? "border-primary/50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {typeIcons[type]}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm md:text-base">{title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{message}</p>
            <p className="text-xs text-muted-foreground mt-2">{timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" onClick={() => onDismiss(id)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
