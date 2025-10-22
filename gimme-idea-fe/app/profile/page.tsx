"use client"

import { useEffect, useState } from "react"
import { Edit2, Mail, MapPin, LinkIcon } from "lucide-react"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { projectsApi } from "@/lib/api/projects"
import { usersApi } from "@/lib/api/users"
import type { Project } from "@/lib/types"

export default function ProfilePage() {
  const { user, stats, refreshProfile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    email: user?.email ?? "",
    location: "",
    website: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormState({
        username: user.username,
        bio: user.bio ?? "",
        email: user.email,
        location: "",
        website: "",
      })
    }
  }, [user])

  useEffect(() => {
    void loadProjects()
    async function loadProjects() {
      try {
        const response = await projectsApi.getMyProjects()
        setProjects(response.projects)
      } catch (err) {
        console.error("[profile] failed to load projects:", err)
      }
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!user) return
    setIsSaving(true)
    setError(null)
    try {
      await usersApi.update({
        username: formState.username,
        bio: formState.bio,
      })
      await refreshProfile()
      setIsEditing(false)
    } catch (err: any) {
      console.error("[profile] update failed:", err)
      setError(err?.message || "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="glass p-8 rounded-xl border">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <img
                src={user?.avatarUrl ?? "/placeholder.svg"}
                alt={user?.username ?? "Profile"}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{user?.username ?? "Creator"}</h1>
                <p className="text-muted-foreground mb-4">{user?.bio ?? "Share something about yourself."}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                  {formState.location ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {formState.location}
                    </div>
                  ) : null}
                  {formState.website ? (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      {formState.website}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-transparent gap-2" onClick={() => setIsEditing((prev) => !prev)}>
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
            {[
              { label: "Projects", value: stats?.projectsCreated ?? 0 },
              { label: "Feedback Given", value: stats?.feedbackGiven ?? 0 },
              { label: "Earnings", value: `$${(user?.totalEarned ?? 0).toFixed(2)}` },
              { label: "Bookmarks", value: stats?.bookmarks ?? 0 },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {isEditing ? (
          <div className="glass p-8 rounded-xl border space-y-4">
            <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Username</label>
                <Input
                  name="username"
                  value={formState.username}
                  onChange={handleChange}
                  className="bg-muted/50 border-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                <Textarea name="bio" value={formState.bio} onChange={handleChange} className="bg-muted/50 border-muted" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <Input
                  name="location"
                  value={formState.location}
                  onChange={handleChange}
                  className="bg-muted/50 border-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                <Input
                  name="website"
                  value={formState.website}
                  onChange={handleChange}
                  className="bg-muted/50 border-muted"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="flex gap-4 pt-2">
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">My Projects</h2>
          {projects.length ? (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="glass p-6 rounded-lg border text-muted-foreground">
              You haven't published any projects yet.
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
