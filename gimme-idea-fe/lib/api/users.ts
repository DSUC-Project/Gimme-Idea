import { apiClient } from "@/lib/api-client"
import type { CurrentUserResponse, User } from "@/lib/types"

export const usersApi = {
  getCurrent() {
    return apiClient.get<CurrentUserResponse>("/users/me")
  },
  update(payload: Partial<User>) {
    return apiClient.put<{ user: User }>("/users/me", payload)
  },
  getTransactions() {
    return apiClient.get("/users/me/transactions")
  },
}
