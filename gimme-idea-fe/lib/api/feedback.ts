import { apiClient } from "@/lib/api-client";
import type { Feedback } from "@/lib/types";

export const feedbackApi = {
  list(projectId: string) {
    return apiClient.get<{ feedback: Feedback[] }>(
      `/projects/${projectId}/feedback`
    );
  },
  create(
    projectId: string,
    content: {
      overall: string;
      pros?: string[];
      cons?: string[];
      suggestions?: string[];
    }
  ) {
    return apiClient.post<{ feedback: Feedback }>(
      `/projects/${projectId}/feedback`,
      {
        content: {
          overall: content.overall,
          pros: content.pros ?? [],
          cons: content.cons ?? [],
          suggestions: content.suggestions ?? [],
        },
      }
    );
  },
  approve(id: string, data: { rewardAmount: number; qualityScore?: number }) {
    return apiClient.post(`/feedback/${id}/approve`, data);
  },
  reject(id: string, data: { reason?: string }) {
    return apiClient.post(`/feedback/${id}/reject`, data);
  },
  update(
    id: string,
    content: {
      overall: string;
      pros?: string[];
      cons?: string[];
      suggestions?: string[];
    }
  ) {
    return apiClient.put<{ feedback: Feedback }>(`/feedback/${id}`, {
      content: {
        overall: content.overall,
        pros: content.pros ?? [],
        cons: content.cons ?? [],
        suggestions: content.suggestions ?? [],
      },
    });
  },
  delete(id: string) {
    return apiClient.delete(`/feedback/${id}`);
  },
};
