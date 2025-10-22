"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Award, Wallet } from "lucide-react"
import { useState } from "react"

export default function EarningsPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const earnings = [
    { month: "January", amount: 245.5, feedback: 28 },
    { month: "February", amount: 312.75, feedback: 35 },
    { month: "March", amount: 189.25, feedback: 22 },
    { month: "April", amount: 456.0, feedback: 52 },
  ]

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0)
  const totalFeedback = earnings.reduce((sum, e) => sum + e.feedback, 0)

  const topContributions = [
    { title: "AI-Powered Email Assistant", earnings: 156.5, feedback: 18 },
    { title: "Design System UI Kit", earnings: 234.75, feedback: 28 },
    { title: "Fitness Tracking App", earnings: 89.25, feedback: 12 },
  ]

  const walletOptions = [
    { name: "Phantom", icon: "🪽" },
    { name: "Solflare", icon: "☀️" },
    { name: "MetaMask", icon: "🦊" },
    { name: "Coinbase Wallet", icon: "💙" },
    { name: "Trust Wallet", icon: "🛡️" },
  ]

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
            <p className="text-2xl md:text-3xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
          </div>
          <div className="glass p-4 md:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">Feedback Items</p>
              <Award className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{totalFeedback}</p>
          </div>
          <div className="glass p-4 md:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs md:text-sm text-muted-foreground">Average per Item</p>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              ${(totalEarnings / totalFeedback).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="glass p-4 md:p-6 rounded-lg border">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Monthly Breakdown</h2>
          <div className="space-y-3 md:space-y-4">
            {earnings.map((month, i) => (
              <div key={i} className="flex items-center justify-between pb-3 md:pb-4 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">{month.month}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{month.feedback} feedback items</p>
                </div>
                <p className="text-base md:text-lg font-bold text-primary">${month.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributions */}
        <div className="glass p-4 md:p-6 rounded-lg border">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6">Top Contributions</h2>
          <div className="space-y-3 md:space-y-4">
            {topContributions.map((contrib, i) => (
              <div key={i} className="flex items-center justify-between pb-3 md:pb-4 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-foreground text-sm md:text-base">{contrib.title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{contrib.feedback} feedback items</p>
                </div>
                <p className="text-base md:text-lg font-bold text-primary">${contrib.earnings.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Section - Added wallet connection and withdrawal functionality */}
        <div className="glass p-4 md:p-6 rounded-lg border bg-accent/5">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Payout</h2>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-xs md:text-sm mb-1">Available Balance</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
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
                        max={totalEarnings}
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
