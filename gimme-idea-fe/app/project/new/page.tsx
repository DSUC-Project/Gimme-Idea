"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { projectsApi } from "@/lib/api/projects"

export default function NewProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "SaaS",
    details: "",
    projectLink: "",
    bountyAmount: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      // Default deadline: 30 days from now
      const defaultDeadline = new Date()
      defaultDeadline.setDate(defaultDeadline.getDate() + 30)

      // Combine short description and details
      const fullDescription = formData.details
        ? `${formData.description}\n\n${formData.details}`
        : formData.description

      const response = await projectsApi.create({
        title: formData.title.trim(),
        description: fullDescription,
        demoUrl: formData.projectLink.trim() || "https://example.com",
        category: formData.category,
        tags: [],
        bountyAmount: formData.bountyAmount ? parseFloat(formData.bountyAmount) : 0,
        deadline: defaultDeadline.toISOString(),
      })
      router.push(`/project/${response.project.id}`)
    } catch (err: any) {
      console.error("[project/new] failed:", err)
      setError(err?.message || "Failed to create project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="glass p-6 md:p-8 rounded-xl border">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Create New Project</h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            Share your idea and get feedback from the community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Project Title</label>
              <Input
                type="text"
                name="title"
                placeholder="e.g., AI-Powered Email Assistant"
                value={formData.title}
                onChange={handleChange}
                className="bg-muted/50 border-muted text-sm md:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Short Description</label>
              <Textarea
                name="description"
                placeholder="Briefly describe your idea in 1-2 sentences"
                value={formData.description}
                onChange={handleChange}
                className="bg-muted/50 border-muted min-h-20 text-sm md:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-muted text-foreground text-sm md:text-base"
              >
                <option value="SaaS">SaaS</option>
                <option value="Mobile">Mobile</option>
                <option value="Web">Web</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bounty Amount (USD)</label>
              <Input
                type="number"
                name="bountyAmount"
                min="0"
                placeholder="e.g., 100"
                value={formData.bountyAmount}
                onChange={handleChange}
                className="bg-muted/50 border-muted text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Project Link</label>
              <Input
                type="url"
                name="projectLink"
                placeholder="https://example.com or https://github.com/..."
                value={formData.projectLink}
                onChange={handleChange}
                className="bg-muted/50 border-muted text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional: share a demo, repository, or landing page.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Detailed Description</label>
              <Textarea
                name="details"
                placeholder="Provide more details about your project, target audience, and what makes it unique"
                value={formData.details}
                onChange={handleChange}
                className="bg-muted/50 border-muted min-h-32 text-sm md:text-base"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-3 md:gap-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-sm md:text-base" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent text-sm md:text-base"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </LayoutWrapper>
  )
}
