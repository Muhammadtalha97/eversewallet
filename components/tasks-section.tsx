"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle, Circle } from "lucide-react"
import { toast } from "sonner"

interface Task {
  _id: string
  title: string
  description: string
  reward: number
  type: string
  xLink?: string
  active: boolean
  completed?: boolean
}

interface TasksSectionProps {
  onTaskComplete: (reward: number) => void
}

export function TasksSection({ onTaskComplete }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTasks()
    loadCompletedTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/admin/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.filter((task: Task) => task.active))
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const loadCompletedTasks = () => {
    const completed = localStorage.getItem("completedTasks")
    if (completed) {
      setCompletedTasks(new Set(JSON.parse(completed)))
    }
  }

  const handleTaskCompletion = async (taskId: string, reward: number, xLink?: string) => {
    if (completedTasks.has(taskId)) {
      toast.error("Task already completed")
      return
    }

    if (xLink) {
      window.open(xLink, "_blank")
    }

    // Update completed tasks
    const newCompletedTasks = new Set(completedTasks)
    newCompletedTasks.add(taskId)
    setCompletedTasks(newCompletedTasks)
    localStorage.setItem("completedTasks", JSON.stringify([...newCompletedTasks]))

    // Award tokens
    onTaskComplete(reward)
    toast.success(`Earned ${reward} ERVE tokens!`)
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Daily Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id} className="bg-white p-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1 text-[#25D366]">
                {completedTasks.has(task._id) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : task.xLink ? (
                  <a
                    href={task.xLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTaskCompletion(task._id, task.reward, task.xLink)}
                    className={`text-blue-500 hover:underline ${
                      completedTasks.has(task._id) ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {completedTasks.has(task._id) ? "Completed" : "Join"}
                  </a>
                ) : (
                  <button
                    onClick={() => handleTaskCompletion(task._id, task.reward)}
                    className={`text-[#25D366] hover:text-[#128C7E] ${
                      completedTasks.has(task._id) ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="mt-2 text-sm text-[#25D366]">+{task.reward} ERVE</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

