import { apiClient } from "@/lib/api-client";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

export const notificationsApi = {
  list(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.unreadOnly)
      query.append("unreadOnly", params.unreadOnly.toString());

    const queryString = query.toString();
    return apiClient.get<NotificationsResponse>(
      `/notifications${queryString ? `?${queryString}` : ""}`
    );
  },
  markAsRead(id: string) {
    return apiClient.put(`/notifications/${id}/read`);
  },
  markAllAsRead() {
    return apiClient.put("/notifications/read-all");
  },
  delete(id: string) {
    return apiClient.delete(`/notifications/${id}`);
  },
};
