"use client"

import { Settings, CheckSquare, Users } from "lucide-react"
import { motion } from "framer-motion"

interface NavigationBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function NavigationBar({ activeTab, onTabChange }: NavigationBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
      <div className="flex justify-around">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onTabChange("mining")}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === "mining" ? "text-[#9FE635]" : "text-gray-400"
          }`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs">Mining</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onTabChange("tasks")}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === "tasks" ? "text-[#9FE635]" : "text-gray-400"
          }`}
        >
          <CheckSquare className="h-6 w-6" />
          <span className="text-xs">Tasks</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onTabChange("frens")}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === "frens" ? "text-[#9FE635]" : "text-gray-400"
          }`}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs">Frens</span>
        </motion.button>
      </div>
    </div>
  )
}

