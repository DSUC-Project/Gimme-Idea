"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Eye, MessageCircle, DollarSign, Bookmark } from "lucide-react"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { projectsApi } from "@/lib/api/projects"
import { feedbackApi } from "@/lib/api/feedback"
import type { Feedback, Project } from "@/lib/types"

interface RecentFeedbackItem {
  feedback: Feedback
  project: Project
}

export default function DashboardPage() {
  const { user, stats } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadProjects()
    async function loadProjects() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await projectsApi.getMyProjects()
        setProjects(response.projects)
        await loadRecentFeedback(response.projects)
      } catch (err: any) {
        console.error("[dashboard] load projects failed:", err)
        setError(err?.message || "Unable to load your projects")
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const loadRecentFeedback = async (projectList: Project[]) => {
    const targets = projectList.slice(0, 3)
    const feedbackResponses = await Promise.allSettled(
      targets.map(async (project) => {
        const feedback = await feedbackApi.list(project.id)
        return feedback.feedback.slice(0, 3).map((item) => ({ feedback: item, project }))
      }),
    )

    const flattened: RecentFeedbackItem[] = feedbackResponses
      .filter((result): result is PromiseFulfilledResult<RecentFeedbackItem[]> => result.status === "fulfilled")
      .flatMap((result) => result.value)

    setRecentFeedback(flattened.slice(0, 6))
  }

  const totalViews = useMemo(
    () => projects.reduce((sum, project) => sum + project.viewCount, 0),
    [projects],
  )

  const statCards = [
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
    { label: "Feedback Items", value: (stats?.feedbackReceived ?? 0).toLocaleString(), icon: MessageCircle },
    { label: "Earnings", value: `$${(user?.totalEarned ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Bookmarks", value: (stats?.bookmarks ?? 0).toLocaleString(), icon: Bookmark },
  ]

  return (
    <LayoutWrapper>
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="glass p-6 md:p-8 rounded-xl border">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.username ?? "creator"}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            Keep building — IdeaBot and the community are ready to help polish your ideas.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 gap-2 text-sm md:text-base">
            <Link href="/project/new">
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="glass p-4 md:p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            )
          })}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Your Projects</h2>
            <Link href="/browse">
              <Button variant="outline" className="bg-transparent text-sm md:text-base">
                Explore Ideas
              </Button>
            </Link>
          </div>

          {error ? (
            <div className="glass p-6 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="glass p-6 rounded-xl border animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {projects.length ? (
                projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onToggleBookmark={async (projectId, nextState) => {
                      await projectsApi.toggleBookmark(projectId)
                      setProjects((prev) =>
                        prev.map((item) => (item.id === projectId ? { ...item, isBookmarked: nextState } : item)),
                      )
                    }}
                  />
                ))
              ) : (
                <div className="glass p-6 rounded-xl border text-center text-muted-foreground">
                  No projects yet — start by sharing your first idea!
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">Recent Feedback</h2>
          {recentFeedback.length ? (
            <div className="space-y-4">
              {recentFeedback.map(({ feedback, project }) => (
                <div key={feedback.id} className="glass p-4 md:p-6 rounded-lg border hover:border-primary/50 transition-all">
                  <div className="flex items-start gap-3 md:gap-4">
                    <img
                      src={feedback.reviewer?.avatarUrl ?? "/placeholder.svg"}
                      alt={feedback.reviewer?.username ?? "Reviewer"}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <p className="font-semibold text-foreground text-sm md:text-base">
                          {feedback.reviewer?.username ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">On: {project.title}</p>
                      <p className="text-sm md:text-base text-foreground mb-3 whitespace-pre-line">
                        {feedback.content.overall}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                          👍 Helpful
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-6 rounded-lg border text-muted-foreground">
              Feedback from the community will appear here once your projects start gathering responses.
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
