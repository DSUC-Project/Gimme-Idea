"use client"

import { useEffect, useMemo, useState } from "react"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProjectHeader } from "@/components/project-header"
import { FeedbackItem } from "@/components/feedback-item"
import { AIBadge } from "@/components/ai-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { projectsApi } from "@/lib/api/projects"
import { feedbackApi } from "@/lib/api/feedback"
import type { Feedback, Project } from "@/lib/types"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([])
  const [message, setMessage] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadProject()
    async function loadProject() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await projectsApi.getById(params.id)
        setProject(response.project)
        if (response.project.feedback?.length) {
          setFeedbackItems(response.project.feedback)
        } else {
          const feedbackResponse = await feedbackApi.list(params.id)
          setFeedbackItems(feedbackResponse.feedback)
        }
      } catch (err: any) {
        console.error("[project] load failed:", err)
        setError(err?.message || "Unable to load project details.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [params.id])

  const handleBookmarkToggle = async (projectId: string, nextState: boolean) => {
    try {
      await projectsApi.toggleBookmark(projectId)
      setProject((prev) => (prev ? { ...prev, isBookmarked: nextState } : prev))
    } catch (err) {
      console.error("[project] toggle bookmark failed:", err)
    }
  }

  const handleSubmitFeedback = async () => {
    const trimmed = message.trim()
    if (!trimmed) return
    setIsPosting(true)
    try {
      const response = await feedbackApi.create(params.id, {
        overall: trimmed,
        pros: [trimmed],
      })
      setFeedbackItems((prev) => [response.feedback, ...prev])
      setMessage("")
    } catch (err: any) {
      console.error("[project] feedback submission failed:", err)
      setError(err?.message || "Unable to post feedback.")
    } finally {
      setIsPosting(false)
    }
  }

  const aiSummary = useMemo(() => {
    return feedbackItems.find((item) => !item.reviewer)?.content?.overall
  }, [feedbackItems])

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="glass p-8 rounded-xl border animate-pulse h-64" />
        </div>
      </LayoutWrapper>
    )
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="glass p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">{error}</div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!project) {
    return (
      <LayoutWrapper>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="glass p-8 rounded-xl border text-center text-muted-foreground">Project not found.</div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
        <ProjectHeader project={project} onToggleBookmark={handleBookmarkToggle} />

        {aiSummary ? (
          <div className="glass p-4 md:p-6 rounded-lg border bg-accent/5">
            <div className="flex items-start gap-4">
              <AIBadge label="IdeaBot Summary" confidence={90} />
              <p className="text-sm md:text-base text-foreground whitespace-pre-line">{aiSummary}</p>
            </div>
          </div>
        ) : null}

        <div className="glass p-4 md:p-6 rounded-lg border">
          <h3 className="font-semibold text-foreground mb-4 text-sm md:text-base">Share Your Feedback</h3>
          <Textarea
            placeholder="What do you think about this idea? Share constructive feedback..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mb-4 bg-muted/50 border-muted min-h-24 text-sm md:text-base"
          />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">Your feedback helps creators improve their ideas.</p>
            <Button className="bg-primary hover:bg-primary/90 text-sm md:text-base" onClick={handleSubmitFeedback} disabled={isPosting}>
              {isPosting ? "Posting..." : "Post Feedback"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {feedbackItems.length ? (
            feedbackItems.map((item) => (
              <FeedbackItem key={item.id} feedback={item} isAI={!item.reviewer} aiConfidence={item.qualityScore ?? undefined} />
            ))
          ) : (
            <div className="glass p-6 rounded-lg border text-muted-foreground">No feedback yet — be the first to comment.</div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
