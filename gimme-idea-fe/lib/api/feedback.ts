import { apiClient } from "@/lib/api-client"
import type { Feedback } from "@/lib/types"

export const feedbackApi = {
  list(projectId: string) {
    return apiClient.get<{ feedback: Feedback[] }>(`/projects/${projectId}/feedback`)
  },
  create(projectId: string, content: { overall: string; pros?: string[]; cons?: string[]; suggestions?: string[] }) {
    return apiClient.post<{ feedback: Feedback }>(`/projects/${projectId}/feedback`, {
      content: {
        overall: content.overall,
        pros: content.pros ?? [],
        cons: content.cons ?? [],
        suggestions: content.suggestions ?? [],
      },
    })
  },
}
