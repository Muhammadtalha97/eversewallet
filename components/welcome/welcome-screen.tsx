"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import Image from "next/image"

interface WelcomeScreenProps {
  onComplete: () => void
}

const screens = [
  {
    title: "Listing coming soon!",
    heading: "Mine $ERVE token by ERVERSE 🎮",
    items: [
      { icon: "🤖", text: "Complete simple actions." },
      { icon: "⬆️", text: "Boost your mining speed." },
      { icon: "🌱", text: "Claim every 1 hours to save tokens." },
    ],
    buttonText: "What simple actions?",
  },
  {
    title: "Claim ERVE, not points!",
    heading: "The more active you are, the faster you mine",
    items: [
      { icon: "🎮", text: "Invite your friends." },
      { icon: "🔒", text: "Trade crypto." },
      { icon: "👥", text: "Join socials and partner tasks." },
    ],
    buttonText: "What else is here?",
  },
  {
    title: "Earn with fun!",
    heading: "Boost your speed with the BigPump 📈",
    items: [
      { icon: "🎨", text: "Create memecoins and earn 10% of the trading volume." },
      { icon: "💱", text: "Trade and gain up to 240 $ERVE/daily." },
      { icon: "👥", text: "Invite friends and get up to 30% of their fees." },
    ],
    buttonText: "Start mining",
  },
]

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  useEffect(() => {
    const welcomed = localStorage.getItem("welcomed")
    if (welcomed) {
      onComplete()
    } else {
      setHasShownWelcome(true)
    }
  }, [onComplete])

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1)
    } else {
      localStorage.setItem("welcomed", "true")
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  if (!hasShownWelcome) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HD-wallpaper-abstract-background-black-green-yellow.jpg-B8peaR7HCBUNDBHKSD1nUrUfvU8E2r.jpeg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative h-full w-full max-w-md">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="mb-8 flex space-x-2">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-16 rounded-full ${index === currentScreen ? "bg-[#9FE635]" : "bg-white/30"}`}
              />
            ))}
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-black/40 backdrop-blur-lg p-6">
            <h2 className="text-center text-sm font-medium text-gray-300 mb-2">{screens[currentScreen].title}</h2>
            <h1 className="text-center text-2xl font-bold text-white mb-6">{screens[currentScreen].heading}</h1>
            <div className="space-y-4">
              {screens[currentScreen].items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 flex items-center">
            {currentScreen > 0 && (
              <button
                onClick={handleBack}
                className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 rounded-full bg-[#9FE635] py-4 text-center font-medium text-black hover:bg-[#8ACF2B] transition-colors"
            >
              {screens[currentScreen].buttonText}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

