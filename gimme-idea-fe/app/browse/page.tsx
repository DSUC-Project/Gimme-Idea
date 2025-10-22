"use client"

import { useEffect, useState } from "react"
import { Filter } from "lucide-react"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { projectsApi } from "@/lib/api/projects"
import type { Project } from "@/lib/types"

const CATEGORY_FILTERS = ["all", "SaaS", "Mobile", "Web", "AI/ML", "Design", "Other"]

export default function BrowsePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [category, setCategory] = useState("all")
  const [searchValue, setSearchValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadProjects()
    async function loadProjects() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await projectsApi.list({
          category: category !== "all" ? category : undefined,
          search: searchQuery || undefined,
        })
        setProjects(response.projects)
      } catch (err: any) {
        console.error("[browse] failed to load projects:", err)
        setError(err?.message || "Unable to load projects at this time.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [category, searchQuery])

  const handleBookmarkToggle = async (projectId: string, nextState: boolean) => {
    try {
      await projectsApi.toggleBookmark(projectId)
      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? { ...project, isBookmarked: nextState } : project)),
      )
    } catch (err) {
      console.error("[browse] toggle bookmark failed:", err)
    }
  }

  return (
    <LayoutWrapper>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Ideas</h1>
          <p className="text-muted-foreground">Discover projects from creators and join the discussion.</p>
        </div>

        <form
          className="flex flex-col sm:flex-row gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setSearchQuery(searchValue.trim())
          }}
        >
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="bg-muted/50 border-muted"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Search
          </Button>
          <Button type="button" variant="outline" className="bg-transparent gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((item) => {
            const value = item.toLowerCase()
            return (
              <Button
                key={value}
                variant={category === value ? "default" : "outline"}
                className={category === value ? "bg-primary hover:bg-primary/90" : "bg-transparent"}
                onClick={() => setCategory(value)}
              >
                {item}
              </Button>
            )
          })}
        </div>

        {error ? (
          <div className="glass p-6 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">{error}</div>
        ) : null}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass p-6 rounded-xl border animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length ? (
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} onToggleBookmark={handleBookmarkToggle} />
              ))
            ) : (
              <div className="glass p-12 rounded-xl border text-center text-muted-foreground col-span-full">
                No projects found. Try adjusting your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
