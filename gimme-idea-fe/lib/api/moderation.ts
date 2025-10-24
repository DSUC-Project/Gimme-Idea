import { apiClient } from "@/lib/api-client";

export interface ModerationFeedback {
  id: string;
  projectId: string;
  reviewerId: string;
  content: any;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
  };
  reviewer: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface ModerationStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
  accuracy: number;
}

export interface ModerationResponse {
  feedback: ModerationFeedback[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: ModerationStats;
}

export const moderationApi = {
  getQueue(params?: { page?: number; limit?: number; type?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.type) query.append("type", params.type);

    const queryString = query.toString();
    return apiClient.get<ModerationResponse>(
      `/moderation${queryString ? `?${queryString}` : ""}`
    );
  },
  approve(id: string, data: { rewardAmount: number; qualityScore?: number }) {
    return apiClient.post(`/moderation/${id}/approve`, data);
  },
  reject(id: string, data: { reason?: string }) {
    return apiClient.post(`/moderation/${id}/reject`, data);
  },
  autoApproveAll() {
    return apiClient.post("/moderation/auto-approve");
  },
};
