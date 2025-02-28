"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { WelcomeScreen } from "@/components/welcome/welcome-screen"
import { MiningSection } from "@/components/mining-section"
import { TasksSection } from "@/components/tasks-section"
import { FrensSection } from "@/components/frens-section"
import { NavigationBar } from "@/components/navigation-bar"
import { DailyBoost } from "@/components/daily-boost"
import { storeReferralData } from "@/lib/referral-service"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [activeTab, setActiveTab] = useState("mining")
  const [totalMined, setTotalMined] = useState(0) // Added state for total mined tokens
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
      setShowWelcome(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Handle referral codes from URL
    const params = new URLSearchParams(window.location.search)
    const referralCode = params.get("ref")
    if (referralCode) {
      storeReferralData(referralCode, referralCode) // Assuming generateReferralCode is not needed, using referralCode directly.  Adjust as needed based on your generateReferralCode function.
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "mining":
        return (
          <>
            <MiningSection level={level} setLevel={setLevel} totalMined={totalMined} setTotalMined={setTotalMined} />
            <div className="mt-4"></div>
          </>
        )
      case "tasks":
        return (
          <TasksSection
            onTaskComplete={(reward) => {
              setTotalMined((prev) => prev + reward)
            }}
          />
        )
      case "frens":
        return (
          <FrensSection
            onReferralReward={(amount) => {
              setTotalMined((prev) => prev + amount)
              setLevel((prevLevel) => Math.min(prevLevel + 1, 7)) // Increase level, cap at 7
            }}
          />
        )
      default:
        return <MiningSection level={level} setLevel={setLevel} totalMined={totalMined} setTotalMined={setTotalMined} />
    }
  }

  if (showSplash) {
    return <SplashScreen />
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {renderActiveTab()}
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}

