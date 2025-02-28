"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Circle } from 'lucide-react'

interface Task {
  id: number
  title: string
  description: string
  reward: number
  completed: boolean
}

export function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([
  
    {
      id: 2,
      title: "Invite Friends",
      description: "Invite 3 friends to join Erverse",
      reward: 100,
      completed: false,
    },
    {
      id: 3,
      title: "First Mining Session",
      description: "Mine for 1 hour continuously",
      reward: 75,
      completed: false,
    },
  ])

  const completeTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    )
  }

  return (
    <Card className="w-full max-w-md border-[#9FE635]/20">
      <CardHeader>
        <CardTitle>Daily Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-4 rounded-lg bg-black/50 p-4"
          >
            <button
              onClick={() => completeTask(task.id)}
              className="mt-1 flex-shrink-0 text-[#9FE635]"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-gray-400">{task.description}</p>
              <div className="mt-2 text-sm text-[#9FE635]">+{task.reward} points</div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

