"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { NotificationItem } from "@/components/notification-item"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "feedback" as const,
      title: "New Feedback on Your Project",
      message: "Mike Johnson left feedback on 'AI-Powered Email Assistant': Great idea! The UI is intuitive...",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "mention" as const,
      title: "You Were Mentioned",
      message: "Sarah Chen mentioned you in a comment: @You should check out this new feature...",
      timestamp: "4 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "bookmark" as const,
      title: "Project Bookmarked",
      message: "Someone bookmarked your project 'Design System UI Kit'",
      timestamp: "1 day ago",
      read: true,
    },
    {
      id: "4",
      type: "system" as const,
      title: "Earnings Update",
      message: "You earned $45.50 from feedback contributions this week",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: "5",
      type: "feedback" as const,
      title: "New Feedback on Your Project",
      message: "Emma Wilson left feedback on 'Fitness Tracking App': The tone adjustment feature is excellent...",
      timestamp: "3 days ago",
      read: true,
    },
  ])

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <LayoutWrapper>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground">
                {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" className="bg-transparent">
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} {...notification} onDismiss={dismissNotification} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-xl border text-center">
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
