import { apiClient } from "@/lib/api-client";

export interface EarningsSummary {
  totalEarnings: number;
  currentBalance: number;
  periodEarnings: number;
  feedbackCount: number;
  averagePerFeedback: number;
}

export interface MonthlyBreakdown {
  month: string;
  feedback_count: number;
  earnings: number;
}

export interface TopProject {
  id: string;
  title: string;
  feedback_count: number;
  total_earnings: number;
}

export interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  project: {
    id: string;
    title: string;
  };
  fromUser: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface EarningsResponse {
  summary: EarningsSummary;
  monthlyBreakdown: MonthlyBreakdown[];
  topProjects: TopProject[];
  recentTransactions: Transaction[];
}

export interface EarningsHistoryResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const earningsApi = {
  getEarnings(period?: "all" | "month" | "year") {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    const query = params.toString();
    return apiClient.get<EarningsResponse>(
      `/earnings${query ? `?${query}` : ""}`
    );
  },
  getHistory(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const queryString = query.toString();
    return apiClient.get<EarningsHistoryResponse>(
      `/earnings/history${queryString ? `?${queryString}` : ""}`
    );
  },
};
