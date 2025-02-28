"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface User {
  walletAddress: string
  referralCode: string
  totalMined: number
  level: number
  createdAt: string
}

interface Task {
  _id: string
  title: string
  description: string
  reward: number
  type: "SOCIAL" | "REFERRAL" | "DAILY"
  xLink?: string
  active: boolean
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    reward: number
    type: "SOCIAL" | "REFERRAL" | "DAILY"
    xLink?: string
  }>({
    title: "",
    description: "",
    reward: 0,
    type: "SOCIAL",
    xLink: "",
  })

  useEffect(() => {
    const authToken = localStorage.getItem("adminToken")
    if (authToken) {
      verifyAuth(authToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyAuth = async (token?: string) => {
    try {
      const res = await fetch("/api/admin/verify", {
        headers: {
          Authorization: token || "",
        },
      })
      if (res.ok) {
        setIsAuthenticated(true)
        fetchData()
      }
    } catch (error) {
      console.error("Auth verification failed:", error)
      toast.error("Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        const { token } = await res.json()
        localStorage.setItem("adminToken", token)
        setIsAuthenticated(true)
        fetchData()
        toast.success("Login successful")
      } else {
        toast.error("Invalid password")
      }
    } catch (error) {
      toast.error("Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [usersRes, tasksRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: {
            Authorization: localStorage.getItem("adminToken") || "",
          },
        }),
        fetch("/api/admin/tasks", {
          headers: {
            Authorization: localStorage.getItem("adminToken") || "",
          },
        }),
      ])

      if (!usersRes.ok || !tasksRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const [usersData, tasksData] = await Promise.all([usersRes.json(), tasksRes.json()])
      setUsers(usersData)
      setTasks(tasksData)
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("adminToken") || "",
        },
        body: JSON.stringify(newTask),
      })

      if (res.ok) {
        toast.success("Task added successfully")
        setNewTask({
          title: "",
          description: "",
          reward: 0,
          type: "SOCIAL",
          xLink: "",
        })
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to add task")
      }
    } catch (error) {
      toast.error("Failed to add task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTaskStatus = async (taskId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("adminToken") || "",
        },
        body: JSON.stringify({ active: !active }),
      })

      if (res.ok) {
        toast.success("Task status updated")
        fetchData()
      } else {
        toast.error("Failed to update task status")
      }
    } catch (error) {
      toast.error("Failed to update task status")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#25D366]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Login
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            onClick={() => {
              localStorage.removeItem("adminToken")
              setIsAuthenticated(false)
            }}
            variant="destructive"
          >
            Logout
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <Input
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              disabled={isSubmitting}
              required
            />
            <Input
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              disabled={isSubmitting}
              required
            />
            <Input
              type="number"
              placeholder="Reward Amount"
              value={newTask.reward}
              onChange={(e) => setNewTask({ ...newTask, reward: Number(e.target.value) })}
              disabled={isSubmitting}
              required
              min="0"
              step="0.1"
            />
            <select
              className="w-full p-2 border rounded"
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value as "SOCIAL" | "REFERRAL" | "DAILY" })}
              disabled={isSubmitting}
              required
            >
              <option value="SOCIAL">Social</option>
              <option value="REFERRAL">Referral</option>
              <option value="DAILY">Daily</option>
            </select>
            <Input
              placeholder="X Link (optional)"
              value={newTask.xLink}
              onChange={(e) => setNewTask({ ...newTask, xLink: e.target.value })}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Task
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Tasks</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <p className="text-sm text-[#25D366]">Reward: {task.reward} ERVE</p>
                  <p className="text-sm text-gray-500">Type: {task.type}</p>
                  {task.xLink && (
                    <a
                      href={task.xLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View Link
                    </a>
                  )}
                </div>
                <Button
                  onClick={() => toggleTaskStatus(task._id, task.active)}
                  variant={task.active ? "destructive" : "default"}
                >
                  {task.active ? "Disable" : "Enable"}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.referralCode} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Code: {user.referralCode}</p>
                    <p className="text-sm text-gray-500">
                      Wallet:{" "}
                      {user.walletAddress
                        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                        : "Not connected"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.totalMined.toFixed(2)} ERVE</p>
                    <p className="text-sm text-gray-500">Level {user.level}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

