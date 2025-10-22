export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string | null
  walletAddress?: string | null
  bio?: string | null
  linkedinUrl?: string | null
  twitterHandle?: string | null
  githubUrl?: string | null
  role: "BUILDER" | "REVIEWER" | "BOTH"
  reputationScore: number
  totalEarned: number
  balance: number
  bookmarks: string[]
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  projectsCreated: number
  feedbackGiven: number
  feedbackReceived: number
  pendingFeedback: number
  bookmarks: number
}

export interface ProjectBuilder {
  id: string
  username: string
  email?: string
  avatarUrl?: string | null
  reputationScore?: number
}

export interface Project {
  id: string
  builderId: string
  title: string
  description: string
  demoUrl?: string | null
  repoUrl?: string | null
  category: string
  tags: string[]
  bountyAmount: number
  bountyDistributed: number
  deadline: string | null
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  viewCount: number
  feedbackCount: number
  createdAt: string
  updatedAt: string
  builder: ProjectBuilder
  isBookmarked: boolean
  feedback?: Feedback[]
}

export interface FeedbackContent {
  overall: string
  pros?: string[]
  cons?: string[]
  suggestions?: string[]
}

export interface Feedback {
  id: string
  projectId: string
  reviewerId: string
  content: FeedbackContent
  rewardAmount: number
  qualityScore?: number | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
  reviewer?: {
    id: string
    username: string
    avatarUrl?: string | null
    reputationScore?: number
  } | null
}

export interface PaginatedProjects {
  projects: Project[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface CurrentUserResponse {
  user: User
  stats: UserStats
}
