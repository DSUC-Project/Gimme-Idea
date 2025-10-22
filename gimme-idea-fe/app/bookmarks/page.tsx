"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2 } from "lucide-react"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/types"

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadBookmarks()
    async function loadBookmarks() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await projectsApi.getBookmarked()
        setBookmarks(response.projects)
      } catch (err: any) {
        console.error("[bookmarks] failed to load:", err)
        setError(err?.message || "Unable to load bookmarks.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const handleRemove = async (projectId: string) => {
    try {
      await projectsApi.toggleBookmark(projectId)
      setBookmarks((prev) => prev.filter((project) => project.id !== projectId))
    } catch (err) {
      console.error("[bookmarks] remove bookmark failed:", err)
    }
  }

  return (
    <LayoutWrapper>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bookmarks</h1>
          <p className="text-muted-foreground">
            {bookmarks.length} saved {bookmarks.length === 1 ? "project" : "projects"}
          </p>
        </div>

        {error ? (
          <div className="glass p-6 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">{error}</div>
        ) : null}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="glass p-6 rounded-xl border animate-pulse h-48" />
            ))}
          </div>
        ) : bookmarks.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((project) => (
              <div key={project.id} className="relative group">
                <ProjectCard project={project} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(project.id)}
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-xl border text-center">
            <p className="text-muted-foreground mb-4">No bookmarks yet</p>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/browse">Browse Ideas</Link>
            </Button>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
