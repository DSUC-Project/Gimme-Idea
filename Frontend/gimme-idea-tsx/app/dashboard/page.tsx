"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import ProtectedRoute from "@/components/protected-route"
import ProjectCard from "@/components/features/project-card"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api-client"
import { Loader2, Plus, FolderOpen } from "lucide-react"
import type { Project } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserProjects()
  }, [])

  const loadUserProjects = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getMyProjects()
      setProjects(response.projects || [])
    } catch (error) {
      console.error("[v0] Failed to load projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Dashboard</h1>
              <p className="text-gray text-base sm:text-lg">Welcome back, {user?.username}!</p>
            </div>
            <button
              onClick={() => router.push("/project/new")}
              className="gradient-yellow text-black px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all whitespace-nowrap flex items-center gap-2"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-xl p-6 shadow-glow-cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray text-sm font-medium">Total Projects</h3>
                <FolderOpen size={24} className="text-primary" />
              </div>
              <p className="text-4xl font-bold text-white">{projects.length}</p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-secondary/30 rounded-xl p-6 shadow-glow-purple">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray text-sm font-medium">Total Feedback</h3>
                <svg className="w-6 h-6 text-secondary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-white">
                {projects.reduce((sum, p) => sum + (p.feedbackCount || 0), 0)}
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-accent-yellow/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray text-sm font-medium">Total Views</h3>
                <svg className="w-6 h-6 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-white">
                {projects.reduce((sum, p) => sum + (p.viewCount || 0), 0)}
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-card/30 backdrop-blur-sm border border-primary/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Projects</h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen size={64} className="mx-auto text-gray mb-4" />
                <p className="text-gray text-xl mb-4">No projects yet</p>
                <button
                  onClick={() => router.push("/project/new")}
                  className="gradient-yellow text-black px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
