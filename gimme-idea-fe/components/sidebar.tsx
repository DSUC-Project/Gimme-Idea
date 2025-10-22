"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Home, Compass, Bookmark, DollarSign, User, Bell, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const mainNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "Browse Ideas", href: "/browse", icon: <Compass className="w-5 h-5" /> },
    { label: "Bookmarks", href: "/bookmarks", icon: <Bookmark className="w-5 h-5" /> },
    { label: "Earnings", href: "/earnings", icon: <DollarSign className="w-5 h-5" /> },
  ]

  const secondaryNav: NavItem[] = [
    { label: "Notifications", href: "/notifications", icon: <Bell className="w-5 h-5" />, badge: 3 },
    { label: "Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
    { label: "Moderation", href: "/moderation", icon: <Settings className="w-5 h-5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="glass">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 glass border-r transition-transform duration-300 z-40",
          "md:translate-x-0 md:static md:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* Logo - Updated to use new logo image */}
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <img src="/gimme-idea-logo.png" alt="Gimme Idea" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors hidden sm:inline">
              Gimme Idea
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="flex-1 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Main</div>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 text-sm md:text-base",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs font-bold bg-accent text-accent-foreground px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Secondary Navigation */}
          <nav className="space-y-2 mb-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Account</div>
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 text-sm md:text-base",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs font-bold bg-accent text-accent-foreground px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent text-sm md:text-base"
            onClick={() => setIsOpen(false)}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
