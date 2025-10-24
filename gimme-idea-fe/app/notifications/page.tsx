"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { NotificationItem } from "@/components/notification-item"
import { Button } from "@/components/ui/button"
import { notificationsApi } from "@/lib/api/notifications"
import type { Notification } from "@/lib/api/notifications"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    void loadNotifications()
    async function loadNotifications() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await notificationsApi.list()
        setNotifications(response.notifications)
        setUnreadCount(response.unreadCount)
      } catch (err: any) {
        console.error("[notifications] failed to load:", err)
        setError(err?.message || "Unable to load notifications.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const dismissNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("[notifications] delete failed:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("[notifications] mark all as read failed:", err)
    }
  }

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
            <Button variant="outline" className="bg-transparent" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {error ? (
          <div className="glass p-6 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="glass p-4 rounded-lg border animate-pulse h-20" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                id={notification.id}
                type={notification.type}
                title={notification.payload?.title || "Notification"}
                message={notification.payload?.message || ""}
                timestamp={new Date(notification.createdAt).toLocaleString()}
                read={notification.read}
                onDismiss={dismissNotification} 
              />
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
