function decimalToNumber(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (typeof value === 'object') {
    if (typeof (value as any).toNumber === 'function') {
      return (value as any).toNumber();
    }
    if (typeof (value as any).toString === 'function') {
      const parsed = Number((value as any).toString());
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function transformFeedback(feedback: any) {
  return {
    id: feedback.id,
    projectId: feedback.projectId,
    reviewerId: feedback.reviewerId,
    content: feedback.content,
    rewardAmount: decimalToNumber(feedback.rewardAmount) ?? 0,
    qualityScore: feedback.qualityScore ?? null,
    status: feedback.status,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
    reviewer: feedback.reviewer
      ? {
          id: feedback.reviewer.id,
          username: feedback.reviewer.username,
          avatarUrl: feedback.reviewer.avatarUrl,
          reputationScore: feedback.reviewer.reputationScore,
        }
      : null,
  };
}

export function transformProject(project: any, currentUserId?: string) {
  const feedback = Array.isArray(project.feedback) ? project.feedback : [];
  const bookmarks = Array.isArray(project.bookmarks) ? project.bookmarks : [];

  const includeFeedbackDetails =
    feedback.length > 0 && typeof feedback[0] === 'object' && feedback[0] !== null && 'content' in feedback[0];

  return {
    id: project.id,
    builderId: project.builderId,
    title: project.title,
    description: project.description,
    demoUrl: project.demoUrl,
    repoUrl: project.repoUrl,
    category: project.category,
    tags: project.tags ?? [],
    bountyAmount: decimalToNumber(project.bountyAmount) ?? 0,
    bountyDistributed: decimalToNumber(project.bountyDistributed) ?? 0,
    deadline: project.deadline?.toISOString() ?? null,
    status: project.status,
    viewCount: project.viewCount,
    feedbackCount: feedback.length,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    builder: project.builder,
    feedback: includeFeedbackDetails ? feedback.map((item: any) => transformFeedback(item)) : undefined,
    isBookmarked: currentUserId ? bookmarks.some((bookmark: any) => bookmark.userId === currentUserId) : false,
  };
}

export function transformUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    walletAddress: user.walletAddress,
    bio: user.bio,
    linkedinUrl: user.linkedinUrl,
    twitterHandle: user.twitterHandle,
    githubUrl: user.githubUrl,
    role: user.role,
    reputationScore: user.reputationScore,
    totalEarned: decimalToNumber(user.totalEarned) ?? 0,
    balance: decimalToNumber(user.balance) ?? 0,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    bookmarks: Array.isArray(user.bookmarks) ? user.bookmarks.map((bookmark: any) => bookmark.projectId) : [],
  };
}

export function transformTransaction(transaction: any) {
  return {
    id: transaction.id,
    type: transaction.type,
    fromUserId: transaction.fromUserId,
    toUserId: transaction.toUserId,
    projectId: transaction.projectId,
    amount: decimalToNumber(transaction.amount) ?? 0,
    currency: transaction.currency,
    status: transaction.status,
    stripePaymentId: transaction.stripePaymentId,
    stripeTransferId: transaction.stripeTransferId,
    metadata: transaction.metadata,
    createdAt: transaction.createdAt.toISOString(),
    project: transaction.project,
    fromUser: transaction.fromUser,
    toUser: transaction.toUser,
  };
}
