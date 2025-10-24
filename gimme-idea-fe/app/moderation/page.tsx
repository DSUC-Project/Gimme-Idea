"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { ModerationItem } from "@/components/moderation-item"
import { Button } from "@/components/ui/button"
import { moderationApi } from "@/lib/api/moderation"
import type { ModerationFeedback, ModerationStats } from "@/lib/api/moderation"

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationFeedback[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadModerationData()
    async function loadModerationData() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await moderationApi.getQueue()
        setItems(response.feedback)
        setStats(response.stats)
      } catch (err: any) {
        console.error("[moderation] failed to load:", err)
        setError(err?.message || "Unable to load moderation data.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await moderationApi.approve(id, { rewardAmount: 10, qualityScore: 75 })
      setItems(prev => prev.filter(item => item.id !== id))
      setStats(prev => prev ? { ...prev, pending: prev.pending - 1, approvedToday: prev.approvedToday + 1 } : null)
    } catch (err) {
      console.error("[moderation] approve failed:", err)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await moderationApi.reject(id, { reason: "Moderation rejection" })
      setItems(prev => prev.filter(item => item.id !== id))
      setStats(prev => prev ? { ...prev, pending: prev.pending - 1, rejectedToday: prev.rejectedToday + 1 } : null)
    } catch (err) {
      console.error("[moderation] reject failed:", err)
    }
  }

  const handleAutoApprove = async () => {
    try {
      const response = await moderationApi.autoApproveAll()
      setItems([])
      setStats(prev => prev ? { 
        ...prev, 
        pending: 0, 
        approvedToday: prev.approvedToday + response.approved,
        rejectedToday: prev.rejectedToday + response.rejected
      } : null)
    } catch (err) {
      console.error("[moderation] auto approve failed:", err)
    }
  }

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <div className="glass p-8 rounded-xl border animate-pulse h-64" />
        </div>
      </LayoutWrapper>
    )
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="glass p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            {error}
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moderation Center</h1>
          <p className="text-muted-foreground">Review flagged content and help maintain community quality</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-lg border">
              <p className="text-muted-foreground text-sm mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
            <div className="glass p-4 rounded-lg border">
              <p className="text-muted-foreground text-sm mb-1">Approved Today</p>
              <p className="text-2xl font-bold text-foreground">{stats.approvedToday}</p>
            </div>
            <div className="glass p-4 rounded-lg border">
              <p className="text-muted-foreground text-sm mb-1">Rejected Today</p>
              <p className="text-2xl font-bold text-foreground">{stats.rejectedToday}</p>
            </div>
            <div className="glass p-4 rounded-lg border">
              <p className="text-muted-foreground text-sm mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-foreground">{stats.accuracy}%</p>
            </div>
          </div>
        )}

        {/* Moderation Items */}
        {items.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Items Pending Review</h2>
              <Button variant="outline" className="bg-transparent" onClick={handleAutoApprove}>
                Auto-Approve All
              </Button>
            </div>
            {items.map((item) => (
              <ModerationItem 
                key={item.id} 
                id={item.id}
                type="feedback"
                content={item.content.overall || "No content"}
                author={item.reviewer.username}
                project={item.project.title}
                confidence={75}
                reason="Pending moderation review"
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
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
