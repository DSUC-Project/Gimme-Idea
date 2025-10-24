"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { adminApi } from "@/lib/api/admin"
import type { SystemStats } from "@/lib/api/admin"

export default function DebugEnvPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "NOT SET"
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    void loadStats()
    async function loadStats() {
      try {
        const response = await adminApi.getStats()
        setStats(response)
      } catch (err) {
        console.error("[debug] failed to load stats:", err)
      }
    }
  }, [])

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear ALL data? This cannot be undone!")) {
      return
    }
    
    setIsClearing(true)
    try {
      await adminApi.clearAllData()
      alert("All data cleared successfully!")
      // Reload stats
      const response = await adminApi.getStats()
      setStats(response)
    } catch (err: any) {
      console.error("[debug] clear data failed:", err)
      alert(err?.message || "Failed to clear data")
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>🔍 Environment Variables Debug</h1>
      <div style={{
        background: "#1a1a1a",
        color: "#00ff00",
        padding: "1rem",
        borderRadius: "8px",
        marginTop: "1rem"
      }}>
        <p><strong>NEXT_PUBLIC_API_URL:</strong></p>
        <p style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>{apiUrl}</p>

        <hr style={{ margin: "1rem 0", borderColor: "#333" }} />

        <p><strong>Expected value:</strong></p>
        <p style={{ color: "#00d9ff" }}>https://gimme-idea.onrender.com/api</p>

        <hr style={{ margin: "1rem 0", borderColor: "#333" }} />

        <p><strong>Status:</strong></p>
        {apiUrl === "https://gimme-idea.onrender.com/api" ? (
          <p style={{ color: "#00ff00", fontSize: "1.5rem" }}>✅ CORRECT</p>
        ) : apiUrl.includes("localhost") ? (
          <p style={{ color: "#ff0000", fontSize: "1.5rem" }}>❌ WRONG - Using localhost!</p>
        ) : (
          <p style={{ color: "#ffaa00", fontSize: "1.5rem" }}>⚠️ NOT SET or WRONG</p>
        )}
      </div>

      <div style={{ marginTop: "2rem", background: "#fff3cd", color: "#856404", padding: "1rem", borderRadius: "8px" }}>
        <p><strong>If WRONG:</strong></p>
        <ol>
          <li>Go to Vercel Dashboard</li>
          <li>Settings → Environment Variables</li>
          <li>Add: NEXT_PUBLIC_API_URL = https://gimme-idea.onrender.com/api</li>
          <li>Redeploy</li>
        </ol>
      </div>

      {/* Database Stats */}
      <div style={{ marginTop: "2rem", background: "#1a1a1a", color: "#00ff00", padding: "1rem", borderRadius: "8px" }}>
        <h2>📊 Database Stats</h2>
        {stats ? (
          <div style={{ marginTop: "1rem" }}>
            <p>Users: {stats.users}</p>
            <p>Projects: {stats.projects}</p>
            <p>Feedback: {stats.feedback}</p>
            <p>Transactions: {stats.transactions}</p>
          </div>
        ) : (
          <p>Loading stats...</p>
        )}
        
        <div style={{ marginTop: "1rem" }}>
          <Button
            variant="destructive"
            onClick={handleClearData}
            disabled={isClearing}
            style={{ 
              background: "#dc2626", 
              color: "white", 
              border: "none", 
              padding: "0.5rem 1rem", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isClearing ? "Clearing..." : "Clear All Data"}
          </Button>
        </div>
      </div>
    </div>
  )
}
