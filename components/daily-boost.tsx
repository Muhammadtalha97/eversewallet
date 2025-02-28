"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { colors } from "@/lib/colors"

const DAILY_REWARDS = [1, 3, 7, 10, 15, 20, 30]

interface DailyBoostProps {
  onTokensClaimed: (amount: number) => void
}

export function DailyBoost({ onTokensClaimed }: DailyBoostProps) {
  const [currentDay, setCurrentDay] = useState(0)
  const [lastClaimDate, setLastClaimDate] = useState<Date | null>(null)

  useEffect(() => {
    const storedDay = localStorage.getItem("currentDay")
    const storedDate = localStorage.getItem("lastClaimDate")

    if (storedDay) setCurrentDay(Number.parseInt(storedDay))
    if (storedDate) setLastClaimDate(new Date(storedDate))
  }, [])

  const canClaim = () => {
    if (!lastClaimDate) return true
    const now = new Date()
    return (
      now.getDate() !== lastClaimDate.getDate() ||
      now.getMonth() !== lastClaimDate.getMonth() ||
      now.getFullYear() !== lastClaimDate.getFullYear()
    )
  }

  const handleClaim = () => {
    if (canClaim()) {
      const claimedAmount = DAILY_REWARDS[currentDay]
      setCurrentDay((prev) => (prev + 1) % 7)
      setLastClaimDate(new Date())
      localStorage.setItem("currentDay", ((currentDay + 1) % 7).toString())
      localStorage.setItem("lastClaimDate", new Date().toISOString())
      onTokensClaimed(claimedAmount)
    }
  }

  return (
    <Card className="w-full bg-white p-6">
      <h2 className="mb-4 text-center text-xl font-bold">Daily Boost</h2>
      <div className="flex justify-between">
        {DAILY_REWARDS.map((reward, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`h-10 w-10 rounded-full ${
                index < currentDay ? "bg-[#25D366]" : "bg-gray-200"
              } flex items-center justify-center text-white font-bold`}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-sm">{reward}</div>
          </div>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClaim}
        disabled={!canClaim()}
        className={`mt-6 w-full rounded-lg px-6 py-3 font-medium text-white transition-colors ${
          canClaim() ? "bg-[#25D366] hover:bg-[#128C7E]" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {canClaim() ? `Claim ${DAILY_REWARDS[currentDay]} Tokens` : "Already Claimed Today"}
      </motion.button>
    </Card>
  )
}

