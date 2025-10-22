const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ApiError extends Error {
  status?: number
  details?: unknown
}

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private refreshToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL

    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken")
      const storedRefresh = localStorage.getItem("refreshToken")
      if (storedToken) {
        this.token = storedToken
      }
      if (storedRefresh) {
        this.refreshToken = storedRefresh
      }
    }
  }

  setToken(token: string | null, refreshToken?: string | null) {
    this.token = token
    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken
    }

    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("authToken", token)
      } else {
        localStorage.removeItem("authToken")
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken)
      } else if (refreshToken === null) {
        localStorage.removeItem("refreshToken")
      }
    }
  }

  getToken() {
    return this.token
  }

  getRefreshToken() {
    return this.refreshToken
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {
      ...options.headers,
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const contentType = response.headers.get("content-type")
    const isJSON = contentType && contentType.includes("application/json")
    const payload = isJSON ? await response.json() : await response.text()

    if (!response.ok || (isJSON && payload?.success === false)) {
      const error: ApiError = new Error(
        (isJSON ? payload?.error || payload?.message : payload) || "Request failed",
      )
      error.status = response.status
      error.details = isJSON ? payload?.details : undefined
      throw error
    }

    return isJSON ? (payload?.data ?? payload) : (payload as T)
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    const payload = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    return this.request<T>(endpoint, { ...options, method: "POST", body: payload })
  }

  put<T>(endpoint: string, body?: any, options?: RequestInit) {
    const payload = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    return this.request<T>(endpoint, { ...options, method: "PUT", body: payload })
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    const payload = body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: payload })
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
