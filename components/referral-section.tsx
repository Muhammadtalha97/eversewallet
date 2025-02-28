"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useReferral } from "@/hooks/useReferral"

export function ReferralSection() {
  const { referralCode } = useReferral()
  const [copied, setCopied] = useState(false)
  console.log('hi this is referal')

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
    }
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-md border-[#9FE635]/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Referral Program</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-black/50 p-4">
          <div className="text-sm text-gray-400">Your Referral Code</div>
          <div className="mt-2 flex items-center justify-between">
            <code className="text-lg font-medium text-[#9FE635]">{referralCode} </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralCode}
              className="text-[#9FE635] hover:text-[#8ACF2B]"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-black/50 p-4">
            <div>
              <div className="text-sm text-gray-400">Total Referrals</div>
              <div className="text-2xl font-medium">12</div>
            </div>
            <Users className="h-8 w-8 text-[#9FE635]" />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-black/50 p-4">
            <div>
              <div className="text-sm text-gray-400">Earned Rewards</div>
              <div className="text-2xl font-medium">1,200</div>
            </div>
            <div className="text-[#9FE635]">Points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

