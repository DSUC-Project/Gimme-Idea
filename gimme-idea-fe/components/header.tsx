"use client"

import { Bell, Search, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-30 glass border-b">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 gap-2 md:gap-4">
        {/* Search bar - Improved mobile spacing and responsiveness */}
        <div className="w-full max-w-[220px] md:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 bg-muted/50 border-muted text-sm md:text-base" />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Button className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-primary/90">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors"
            aria-label="Connect Wallet"
          >
            <Wallet className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
