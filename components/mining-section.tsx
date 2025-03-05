"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { DailyBoost } from "./daily-boost"
import { BalancePage } from "./balance/balance-page"
import { GuildPage } from "./guild/guild-page"
import { FrensSection } from "./frens-section"
import { TasksSection } from "./tasks-section"
import { RoadmapPage } from "./roadmap-page"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, getUserData, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"

interface MiningProps {
  totalMined: number
  setTotalMined: React.Dispatch<React.SetStateAction<number>>
}

export function MiningSection({ totalMined, setTotalMined }: MiningProps) {
  const [unclaimedTokens, setUnclaimedTokens] = useState(0)
  const [burnTime, setBurnTime] = useState(3600)
  const [showBalancePage, setShowBalancePage] = useState(false)
  const [showGuildPage, setShowGuildPage] = useState(false)
  const [activeTab, setActiveTab] = useState("mining")
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [progress, setProgress] = useState(0)
  const [userData, setUserData] = useState<any>(null)
  const [miningSpeed, setMiningSpeed] = useState(0.458)
  const [user, loading] = useAuthState(auth)
  const [mounted, setMounted] = useState(false)
  const [lastActiveTime, setLastActiveTime] = useState(Date.now())
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/")
    }
  }, [user, loading, router, mounted])

  // Load initial data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getUserData(user.uid)
        if (data) {
          setUserData(data)
          setMiningSpeed(data.miningSpeed || 0.458)
          setTotalMined(data.erveBalance || 0)
        }
      }
    }
    if (mounted) fetchData()
  }, [user, mounted, setTotalMined])

  useEffect(() => {
    const updateBalance = async () => {
      if (user && user.uid && totalMined !== userData?.erveBalance) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            erveBalance: totalMined
          })
          setUserData((prev: any) => ({ ...prev, erveBalance: totalMined }))
        } catch (error) {
          console.error("Error updating balance:", error)
        }
      }
    }

    const debounceTimer = setTimeout(() => {
      updateBalance()
    }, 900) // Debounce to prevent too many writes

    return () => clearTimeout(debounceTimer)
  }, [totalMined, user, userData?.erveBalance])

  // Mining interval
  useEffect(() => {
    if (miningSpeed <= 0) return

    const miningInterval = setInterval(() => {
      setTotalMined(prev => {
        const newTotal = prev + miningSpeed / 3600
        return Number(newTotal.toFixed(4))
      })
      setUnclaimedTokens(prev => {
        const newUnclaimed = prev + miningSpeed / 3600
        return Number(newUnclaimed.toFixed(4))
      })
      setProgress(prev => (prev + 1) % 360)
    }, 1000 / 60)

    return () => clearInterval(miningInterval)
  }, [miningSpeed, setTotalMined])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now()
        const elapsedTime = (currentTime - lastActiveTime) / 1000 // in seconds
        const minedTokens = (elapsedTime * miningSpeed) / 3600
        setTotalMined(prev => prev + minedTokens)
        setUnclaimedTokens(prev => prev + minedTokens)
      } else {
        setLastActiveTime(Date.now())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [lastActiveTime, miningSpeed, setTotalMined])

  useEffect(() => {
    if (burnTime > 0) {
      const timer = setInterval(() => {
        setBurnTime((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else {
      setUnclaimedTokens(0)
      setBurnTime(3600)
    }
  }, [burnTime])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

  const handleClaim = async () => {
    const newTotal = totalMined + unclaimedTokens;
    setTotalMined(newTotal);
    setUnclaimedTokens(0);
    setBurnTime(3600);

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          erveBalance: newTotal
        });
      } catch (error) {
        console.error("Error claiming tokens:", error);
      }
    }
  };

  const handleTokensClaimed = (amount: number) => {
    setTotalMined((prev) => prev + amount)
  }

  if (showBalancePage) {
    return <BalancePage onBack={() => setShowBalancePage(false)} totalBalance={totalMined} />
  }

  if (showGuildPage) {
    return <GuildPage onBack={() => setShowGuildPage(false)} />
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex w-full justify-between">
        <Card className="bg-white p-4 shadow-sm cursor-pointer" onClick={() => setShowBalancePage(true)}>
          <div className="text-sm text-gray-600">Total balance</div>
          <div className="text-xl ">{totalMined.toFixed(2)} ERVE</div>
        </Card>
        
        <Card className="bg-white p-4 shadow-sm cursor-pointer" onClick={() => setShowGuildPage(true)}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Guild level →</div>
            <div className="text-xl font-bold">{userData?.level || 1}</div>
          </div>
        </Card>
      </div>

      <Card
        className="w-full bg-white p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowRoadmap(true)
          }
        }}
      >
        <h2 className="text-center text-gray-600">Roadmap</h2>
      </Card>

      <Card className="w-full bg-white p-6">
        <h2 className="text-center text-gray-600">Total $ERVE mined</h2>
        <div className="text-center text-4xl font-bold">{totalMined.toFixed(2)}</div>
        <div className="mt-2 text-center text-sm text-gray-500">$ERVE per hour: {miningSpeed.toFixed(3)}</div>
      </Card>

      <Card className="w-full bg-white p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-48 w-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="46"
                cx="50"
                cy="50"
              />
              <motion.circle
                className="text-[#9FE635]" // Lemon green color
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="46"
                cx="50"
                cy="50"
                strokeLinecap="round"
                initial={{ pathLength: 0, rotate: 0 }}
                animate={{
                  pathLength: unclaimedTokens / (miningSpeed * 24), // Fill based on unclaimed tokens
                  rotate: progress, // Rotate based on progress
                }}
                transition={{ duration: 0.5, ease: "linear" }}
                style={{ originX: "50px", originY: "50px" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold"
              >
                {unclaimedTokens.toFixed(1)}
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-gray-500"
              >
                ERVE
              </motion.div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            burn in {formatTime(burnTime)} | claim from {(miningSpeed / 24).toFixed(3)}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            className="mt-4 w-full rounded-lg bg-[#9FE635] px-6 py-3 font-medium text-white transition-colors hover:bg-[#8ACF2B]"
          >
            Claim {unclaimedTokens.toFixed(1)} ERVE
          </motion.button>
        </div>
      </Card>

      {userData?.level >= 4 && <DailyBoost onTokensClaimed={handleTokensClaimed} />}
      {activeTab === "frens" && <FrensSection onReferralReward={() => {}} />}
      {activeTab === "tasks" && <TasksSection onTaskComplete={handleTokensClaimed} />}
      {showRoadmap && <RoadmapPage onClose={() => setShowRoadmap(false)} />}
    </div>
  )
}