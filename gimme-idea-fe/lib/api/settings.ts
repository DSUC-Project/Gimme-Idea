import { apiClient } from "@/lib/api-client";

export interface NotificationSettings {
  emailNotifications: boolean;
  feedbackNotifications: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
}

export const settingsApi = {
  changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient.put("/settings/password", data);
  },
  updateProfile(data: {
    username?: string;
    bio?: string;
    avatarUrl?: string;
    walletAddress?: string;
    linkedinUrl?: string;
    twitterHandle?: string;
    githubUrl?: string;
  }) {
    return apiClient.put("/settings/profile", data);
  },
  updateNotifications(settings: NotificationSettings) {
    return apiClient.put("/settings/notifications", settings);
  },
  deleteAccount(password: string) {
    return apiClient.delete("/settings/account", { password });
  },
};
