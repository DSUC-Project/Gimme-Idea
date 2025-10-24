"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Award, Wallet } from "lucide-react"
import { earningsApi } from "@/lib/api/earnings"
import type { EarningsResponse } from "@/lib/api/earnings"

export default function EarningsPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [earningsData, setEarningsData] = useState<EarningsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadEarnings()
    async function loadEarnings() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await earningsApi.getEarnings()
        setEarningsData(response)
      } catch (err: any) {
        console.error("[earnings] failed to load:", err)
        setError(err?.message || "Unable to load earnings data.")
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const walletOptions = [
    { name: "Phantom", icon: "🪽" },
    { name: "Solflare", icon: "☀️" },
    { name: "MetaMask", icon: "🦊" },
    { name: "Coinbase Wallet", icon: "💙" },
    { name: "Trust Wallet", icon: "🛡️" },
  ]

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="glass p-8 rounded-xl border animate-pulse h-64" />
        </div>
      </LayoutWrapper>
    )
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="glass p-8 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            {error}
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (!earningsData) {
    return (
      <LayoutWrapper>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="glass p-8 rounded-xl border text-center text-muted-foreground">
            No earnings data available
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Earnings</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your earnings from feedback contributions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="glass p-4 md:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">Total Earnings</p>
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">${earningsData.summary.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="glass p-4 md:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">Feedback Items</p>
              <Award className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{earningsData.summary.feedbackCount}</p>
          </div>
          <div className="glass p-4 md:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">Average per Item</p>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              ${earningsData.summary.averagePerFeedback.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="glass p-4 md:p-6 rounded-lg border">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Monthly Breakdown</h2>
          <div className="space-y-3 md:space-y-4">
            {earningsData.monthlyBreakdown.length > 0 ? (
              earningsData.monthlyBreakdown.map((month, i) => (
                <div key={i} className="flex items-center justify-between pb-3 md:pb-4 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">
                      {new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">{month.feedback_count} feedback items</p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-primary">${Number(month.earnings).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No monthly data available yet
              </div>
            )}
          </div>
        </div>

        {/* Top Contributions */}
        <div className="glass p-4 md:p-6 rounded-lg border">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Top Contributions</h2>
          <div className="space-y-3 md:space-y-4">
            {earningsData.topProjects.length > 0 ? (
              earningsData.topProjects.map((project, i) => (
                <div key={i} className="flex items-center justify-between pb-3 md:pb-4 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">{project.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{project.feedback_count} feedback items</p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-primary">${Number(project.total_earnings).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No project contributions yet
              </div>
            )}
          </div>
        </div>

        {/* Payout Section - Added wallet connection and withdrawal functionality */}
        <div className="glass p-4 md:p-6 rounded-lg border bg-accent/5">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Payout</h2>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm mb-1">Available Balance</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">${earningsData.summary.currentBalance.toFixed(2)}</p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-sm md:text-base"
              onClick={() => setShowWithdraw(!showWithdraw)}
            >
              Request Payout
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Payouts are processed weekly to your connected wallet</p>

          {/* Wallet Connection Section */}
          {!selectedWallet ? (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Connect Wallet</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {walletOptions.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="bg-transparent text-xs md:text-sm h-auto py-2 md:py-3"
                    onClick={() => setSelectedWallet(wallet.name)}
                  >
                    <span className="mr-2">{wallet.icon}</span>
                    {wallet.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 md:p-4 bg-background/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedWallet}</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedWallet(null)}>
                  Change
                </Button>
              </div>

              {showWithdraw && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                      Withdrawal Amount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        max={earningsData.summary.currentBalance}
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                      />
                      <Button className="bg-primary hover:bg-primary/90 text-sm">Withdraw</Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum withdrawal: $10 | Processing time: 1-3 business days
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
