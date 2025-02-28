"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Users } from "lucide-react"
import { useReferral } from "@/hooks/useReferral"

import Image from "next/image"
import { toast } from "sonner"

interface Friend {
  id: number
  name: string
  level: number
  mining: number
  joinedAt: string
  avatar?: string
}

interface FrensProps {
  onReferralReward?: (amount: number) => void
}

export function FrensSection({ onReferralReward }: FrensProps) {
  const { referralCode } = useReferral()
  const [copied, setCopied] = useState(false)
  const [totalRewards, setTotalRewards] = useState(0)
  const [friends, setFriends] = useState<Friend[]>([])

  useEffect(() => {
    

    // Load friends from localStorage
    const storedFriends = localStorage.getItem("referredFriends")
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends))
    }

    // Load total rewards
    const storedRewards = localStorage.getItem("referralRewards")
    if (storedRewards) {
      setTotalRewards(Number(storedRewards))
    }
  }, [])

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simulate adding a new friend (in real app, this would be called when someone uses the referral code)
  const addFriend = (newFriend: Friend) => {
    setFriends((prev) => {
      const updated = [...prev, newFriend]
      localStorage.setItem("referredFriends", JSON.stringify(updated))
      return updated
    })

    // Award 5 coins for successful referral
    const rewardAmount = 5
    setTotalRewards((prev) => {
      const newTotal = prev + rewardAmount
      localStorage.setItem("referralRewards", String(newTotal))
      return newTotal
    })

    if (onReferralReward) {
      onReferralReward(rewardAmount)
    }
  }

  return (
    <div className="p-4">
      <Card className="mb-6 bg-white p-4">
        <div className="text-sm text-gray-600">Your Referral Code</div>
        <div className="mt-2 flex items-center justify-between">
          <code className="text-lg font-medium text-[#25D366]">{referralCode}</code>
          <Button variant="ghost" size="sm" onClick={copyReferralCode} className="text-[#25D366] hover:text-[#128C7E]">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {copied && <div className="mt-2 text-sm text-green-500">Referral link copied to clipboard!</div>}
      </Card>

      <div className="mb-6 space-y-4">
        <Card className="bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Referrals</div>
              <div className="text-2xl font-medium">{friends.length}</div>
            </div>
            <Users className="h-8 w-8 text-[#25D366]" />
          </div>
        </Card>

        <Card className="bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Earned Rewards</div>
              <div className="text-2xl font-medium">{totalRewards}</div>
            </div>
            <div className="text-[#25D366]">Coins</div>
          </div>
        </Card>
      </div>

      <Card className="mb-6 bg-white p-4">
        <h3 className="text-lg font-semibold mb-4">Enter Referral Code</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const code = formData.get("referralCode") as string

            if (!code) {
              toast.error("Please enter a referral code")
              return
            }

            if (!code.startsWith("ERV-")) {
              toast.error("Invalid referral code format")
              return
            }

            // Check if code has been used before
            const usedCodes = JSON.parse(localStorage.getItem("usedReferralCodes") || "[]")
            if (usedCodes.includes(code)) {
              toast.error("This referral code has already been used")
              return
            }

            // Save used code
            localStorage.setItem("usedReferralCodes", JSON.stringify([...usedCodes, code]))

            // Add reward
            if (onReferralReward) {
              onReferralReward(10)
            }

            toast.success("Successfully claimed 10 ERVE tokens!")
            ;(e.target as HTMLFormElement).reset()
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            />
            <Button type="submit" className="bg-[#25D366] hover:bg-[#128C7E] text-white">
              Submit
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="flex items-center text-xl font-bold">
          <Users className="mr-2 h-5 w-5" />
          Your Frens
        </h2>

        {friends.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Invite friends to start earning rewards!</div>
        ) : (
          friends.map((friend) => (
            <Card key={friend.id} className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    {friend.avatar && (
                      <Image
                        src={friend.avatar || "/placeholder.svg"}
                        alt={friend.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{friend.name}</h3>
                    <p className="text-sm text-gray-500">Level {friend.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Mining Rate</div>
                  <div className="font-medium text-[#25D366]">{friend.mining.toFixed(4)} /hr</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

