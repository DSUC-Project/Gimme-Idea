📜 
SHARED INTERFACE CONTRACT (CẢ 2 ĐỌC TRƯỚC)API BASE CONFIGURATION:
typescript// API Base URL
Development: http://localhost:5000/api
Production: https://api.gimmeidea.com/api

// Authentication Headers
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

// Response Format (ALL endpoints)
Success: {
  success: true,
  data: any,
  message?: string
}

Error: {
  success: false,
  error: string,
  code?: string,
  details?: any
}

// Pagination Format
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}SHARED TYPES (TypeScript):
typescript// User Type
interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  walletAddress?: string;
  bio?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  githubUrl?: string;
  reputationScore: number;
  totalEarned: number;
  role: 'builder' | 'reviewer' | 'both';
  createdAt: string;
}

// Project Type
interface Project {
  id: string;
  builderId: string;
  builder?: User;
  title: string;
  description: string;
  demoUrl: string;
  repoUrl?: string;
  category: string;
  tags: string[];
  bountyAmount: number;
  bountyDistributed: number;
  deadline: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  viewCount: number;
  feedbackCount: number;
  createdAt: string;
  updatedAt: string;
}

// Feedback Type
interface Feedback {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewer?: User;
  content: {
    overall: string;
    pros: string[];
    cons: string[];
    suggestions: string;
  };
  qualityScore?: number;
  rewardAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
---

## Frontend ↔ Backend Integration Notes

- New Next.js frontend lives in `Frontend/gimme-idea-frontend`. Configure `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`) so client-side requests reach the Express API.
- Authentication tokens are stored in localStorage and automatically refreshed; backend exposes `/api/auth/*` plus new `/api/users` endpoints for profile data.
- Project pages now call real endpoints (`/api/projects`, `/api/projects/:id`, `/api/projects/bookmarked`, `/api/projects/my/projects`). Feedback submission uses `/api/projects/:id/feedback`.
- Profile updates call `/api/users/me`; transactions/earnings use `/api/users/me/transactions`.
- Old UI (`Frontend/gimme-idea-legacy`) is preserved only for reference and is no longer wired into the build.

