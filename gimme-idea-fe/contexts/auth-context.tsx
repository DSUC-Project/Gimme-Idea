"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { authApi } from "@/lib/api/auth"
import { apiClient } from "@/lib/api-client"
import type { CurrentUserResponse, User, UserStats } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  stats: UserStats | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(): Promise<CurrentUserResponse> {
  return authApi.getCurrentUser()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const storedRefresh = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null

    if (storedToken) {
      setToken(storedToken)
      apiClient.setToken(storedToken, storedRefresh ?? undefined)
      void initializeProfile()
    } else {
      setIsLoading(false)
    }

    async function initializeProfile() {
      try {
        const profile = await fetchProfile()
        setUser(profile.user)
        setStats(profile.stats)
      } catch (err) {
        console.error("[auth] failed to initialize profile:", err)
        apiClient.setToken(null, null)
        setToken(null)
        setRefreshToken(null)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const handleAuthSuccess = (payload: { user: User; token: string; refreshToken: string }) => {
    apiClient.setToken(payload.token, payload.refreshToken)
    setToken(payload.token)
    setRefreshToken(payload.refreshToken)
    setUser(payload.user)
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authApi.login(email, password)
      handleAuthSuccess(response)
      const profile = await fetchProfile()
      setStats(profile.stats)
      setUser(profile.user)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Unable to sign in")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authApi.register(email, password, username)
      handleAuthSuccess(response)
      const profile = await fetchProfile()
      setStats(profile.stats)
      setUser(profile.user)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Unable to create account")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error("[auth] logout failed:", err)
    } finally {
      apiClient.setToken(null, null)
      setToken(null)
      setRefreshToken(null)
      setUser(null)
      setStats(null)
      router.push("/login")
    }
  }

  const refreshProfile = async () => {
    try {
      const profile = await fetchProfile()
      setUser(profile.user)
      setStats(profile.stats)
    } catch (err: any) {
      console.error("[auth] refresh profile failed:", err)
      setError(err?.message || "Unable to refresh profile")
      throw err
    }
  }

  const clearError = () => setError(null)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      stats,
      token,
      refreshToken,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      clearError,
    }),
    [user, stats, token, refreshToken, isLoading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
