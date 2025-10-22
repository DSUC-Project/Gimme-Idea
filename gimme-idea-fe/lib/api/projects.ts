import { apiClient } from "@/lib/api-client"
import type { PaginatedProjects, Project } from "@/lib/types"

export interface ProjectFilters {
  category?: string
  search?: string
  status?: string
  page?: number
  limit?: number
}

const buildQuery = (filters?: ProjectFilters) => {
  if (!filters) return ""
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value))
    }
  })
  const query = params.toString()
  return query ? `?${query}` : ""
}

export const projectsApi = {
  list(filters?: ProjectFilters) {
    return apiClient.get<PaginatedProjects>(`/projects${buildQuery(filters)}`)
  },
  getById(id: string) {
    return apiClient.get<{ project: Project }>(`/projects/${id}`)
  },
  create(data: {
    title: string
    description: string
    demoUrl?: string
    repoUrl?: string
    category: string
    tags?: string[]
    bountyAmount?: number
    deadline?: string | null
  }) {
    return apiClient.post<{ project: Project }>("/projects", data)
  },
  update(id: string, data: Partial<Project>) {
    return apiClient.put<{ project: Project }>(`/projects/${id}`, data)
  },
  getMyProjects() {
    return apiClient.get<{ projects: Project[] }>("/projects/my/projects")
  },
  getBookmarked() {
    return apiClient.get<{ projects: Project[] }>("/projects/bookmarked")
  },
  toggleBookmark(id: string) {
    return apiClient.post<{ isBookmarked: boolean }>(`/projects/${id}/bookmark`)
  },
}
