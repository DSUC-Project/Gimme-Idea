"use client"

import { Bookmark, Share2, MoreVertical, Globe, Wallet } from "lucide-react"
import Link from "next/link"

import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ProjectHeaderProps {
  project: Project
  onToggleBookmark?: (projectId: string, nextState: boolean) => Promise<void> | void
}

export function ProjectHeader({ project, onToggleBookmark }: ProjectHeaderProps) {
  const authorName = project.builder?.username ?? "Unknown Creator"
  const avatarUrl = project.builder?.avatarUrl ?? "/placeholder.svg"

  const handleBookmark = async () => {
    if (onToggleBookmark) {
      await onToggleBookmark(project.id, !project.isBookmarked)
    }
  }

  return (
    <div className="glass p-8 rounded-xl border mb-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <img src={avatarUrl} alt={authorName} className="w-14 h-14 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-foreground text-lg">{authorName}</p>
            <p className="text-sm text-muted-foreground capitalize">{project.category || "General"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent"
            onClick={handleBookmark}
            aria-label={project.isBookmarked ? "Remove bookmark" : "Bookmark project"}
          >
            <Bookmark className={`w-5 h-5 ${project.isBookmarked ? "fill-current text-primary" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent" aria-label="Share project">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent" aria-label="More actions">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-4">{project.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div>
          <p className="font-semibold text-foreground">{project.viewCount}</p>
          <p className="text-xs">Views</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{project.feedbackCount}</p>
          <p className="text-xs">Feedback Items</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">${project.bountyAmount.toLocaleString()}</p>
          <p className="text-xs">Bounty Pool</p>
        </div>
        {project.deadline ? (
          <div>
            <p className="font-semibold text-foreground">
              {new Date(project.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-xs">Deadline</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {project.demoUrl ? (
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-accent hover:bg-accent/90 gap-2 text-sm md:text-base">
              <Globe className="w-4 h-4" />
              Visit Project
            </Button>
          </a>
        ) : null}
        <Button variant="outline" className="gap-2 bg-transparent text-sm md:text-base">
          <Wallet className="w-4 h-4" />
          Support Creator
        </Button>
        <Link href={`/project/${project.id}/edit`}>
          <Button variant="ghost" className="text-sm md:text-base">
            Edit Project
          </Button>
        </Link>
      </div>
    </div>
  )
}
