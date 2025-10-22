"use client"

import Link from "next/link"
import { Bookmark, Eye, MessageCircle, Tag } from "lucide-react"

import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
  project: Project
  onToggleBookmark?: (projectId: string, nextState: boolean) => Promise<void> | void
}

export function ProjectCard({ project, onToggleBookmark }: ProjectCardProps) {
  const authorName = project.builder?.username ?? "Unknown Creator"
  const avatarUrl = project.builder?.avatarUrl ?? "/placeholder.svg"
  const category = project.category || "General"

  const handleBookmark = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (onToggleBookmark) {
      await onToggleBookmark(project.id, !project.isBookmarked)
    }
  }

  return (
    <Link href={`/project/${project.id}`}>
      <div className="glass p-6 rounded-xl border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{authorName}</p>
              <p className="text-xs text-muted-foreground">{category}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={handleBookmark}
            aria-label={project.isBookmarked ? "Remove bookmark" : "Bookmark project"}
          >
            <Bookmark className={`w-5 h-5 ${project.isBookmarked ? "fill-current text-primary" : ""}`} />
          </Button>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>

        {project.tags?.length ? (
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mb-4">
            <Tag className="w-3 h-3" />
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/60 border text-muted-foreground">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 ? (
              <span className="text-xs text-muted-foreground">+{project.tags.length - 3}</span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{project.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{project.feedbackCount}</span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            Updated {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  )
}
