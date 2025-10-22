import { apiClient } from "@/lib/api-client"
import type { AuthResponse, CurrentUserResponse } from "@/lib/types"

export const authApi = {
  login(email: string, password: string) {
    return apiClient.post<AuthResponse>("/auth/login", { email, password })
  },
  register(email: string, password: string, username: string) {
    return apiClient.post<AuthResponse>("/auth/register", { email, password, username })
  },
  logout() {
    return apiClient.post("/auth/logout")
  },
  refresh(refreshToken: string) {
    return apiClient.post<{ token: string; refreshToken: string }>("/auth/refresh", { refreshToken })
  },
  getCurrentUser() {
    return apiClient.get<CurrentUserResponse>("/users/me")
  },
}
