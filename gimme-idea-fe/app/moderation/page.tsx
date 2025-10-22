"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ModerationItem } from "@/components/moderation-item"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ModerationPage() {
  const [items, setItems] = useState([
    {
      id: "1",
      type: "spam" as const,
      content: "BUY CHEAP PRODUCTS NOW!!! Click here for amazing deals!!!",
      author: "Unknown User",
      project: "AI-Powered Email Assistant",
      confidence: 98,
      reason: "Contains promotional content and excessive punctuation",
    },
    {
      id: "2",
      type: "low-quality" as const,
      content: "This is ok I guess",
      author: "John Doe",
      project: "Fitness Tracking App",
      confidence: 72,
      reason: "Feedback lacks constructive details and specific suggestions",
    },
    {
      id: "3",
      type: "duplicate" as const,
      content: "Great idea! The UI is intuitive and the AI suggestions are accurate.",
      author: "Sarah Chen",
      project: "AI-Powered Email Assistant",
      confidence: 85,
      reason: "Similar feedback already exists from another user",
    },
    {
      id: "4",
      type: "inappropriate" as const,
      content: "This project is terrible and you should give up",
      author: "Anonymous",
      project: "Design System UI Kit",
      confidence: 91,
      reason: "Contains harsh criticism without constructive feedback",
    },
  ])

  const handleApprove = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleReject = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const stats = [
    { label: "Pending Review", value: items.length },
    { label: "Approved Today", value: "24" },
    { label: "Rejected Today", value: "8" },
    { label: "Accuracy", value: "94%" },
  ]

  return (
    <LayoutWrapper>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moderation Center</h1>
          <p className="text-muted-foreground">Review flagged content and help maintain community quality</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-4 rounded-lg border">
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Moderation Items */}
        {items.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Items Pending Review</h2>
              <Button variant="outline" className="bg-transparent">
                Auto-Approve All
              </Button>
            </div>
            {items.map((item) => (
              <ModerationItem key={item.id} {...item} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-xl border text-center">
            <p className="text-muted-foreground mb-4">All caught up! No items pending review.</p>
            <Button className="bg-primary hover:bg-primary/90">View Moderation History</Button>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
