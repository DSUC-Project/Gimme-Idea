"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, FolderOpen, Bookmark, User, LogOut, Search, PlusCircle } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "My Projects" },
    { href: "/browse", icon: Search, label: "Browse" },
    { href: "/project/new", icon: PlusCircle, label: "New Project" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-r border-primary/20 flex flex-col ${className}`}>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 p-6 border-b border-primary/20">
        <div className="w-10 h-10 rounded-lg bg-gradient-cyan-purple flex items-center justify-center shadow-glow-cyan">
          <span className="text-white font-bold text-xl">G</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">GIMME IDEA</h1>
          <p className="text-xs text-gray">Feedback Marketplace</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                active
                  ? "gradient-yellow text-black font-semibold shadow-lg"
                  : "text-gray hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 w-1 h-full bg-accent-yellow-light" />
              )}
              <Icon size={20} className={active ? "text-black" : "text-primary group-hover:text-primary-dark"} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-primary/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray hover:text-white hover:bg-red-500/20 transition-all duration-300 group"
        >
          <LogOut size={20} className="text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
