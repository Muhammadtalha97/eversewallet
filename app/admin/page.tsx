"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { db } from "@/lib/firebase" // Import Firebase Firestore
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore"

interface User {
  createdAt: Timestamp,
  email: string
  erveBalance: number
  level: number
  miningSpeed: number
  numberOfReferrals: number
  points: number
  referralToken: string
  referredBy: string
}

interface Task {
  id: string
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
    const storedAuth = localStorage.getItem("adminAuthenticated")
    if (storedAuth === "true") {
      setIsAuthenticated(true)
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const adminPassword = 'admin123'
      if (password === adminPassword) {
        setIsAuthenticated(true)
        localStorage.setItem("adminAuthenticated", "true")
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
      // Fetch users from Firestore
      const usersQuery = query(collection(db, "users"))
      const usersSnapshot = await getDocs(usersQuery)
      if (usersSnapshot.empty) {
        console.log("No users found")
      } else {
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as User[]
        setUsers(usersData)
      }

      // Fetch tasks from Firestore
      const tasksQuery = query(collection(db, "tasks"))
      const tasksSnapshot = await getDocs(tasksQuery)
      if (tasksSnapshot.empty) {
        console.log("No tasks found")
      } else {
        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[]
        setTasks(tasksData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const taskRef = await addDoc(collection(db, "tasks"), {
        ...newTask,
        active: true,
      })
      toast.success("Task added successfully")
      setNewTask({
        title: "",
        description: "",
        reward: 0,
        type: "SOCIAL",
        xLink: "",
      })
      fetchData()
    } catch (error) {
      toast.error("Failed to add task")
    } finally {
      setIsSubmitting(false)
    }
  }


  const toggleTaskStatus = async (taskId: string, active: boolean) => {
    try {
      const taskRef = doc(db, "tasks", taskId)
      await updateDoc(taskRef, { active: !active })
      toast.success("Task status updated")
      fetchData()
    } catch (error) {
      toast.error("Failed to update task status")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId))
      toast.success("Task deleted successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete task")
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
              localStorage.removeItem("adminAuthenticated")
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
              <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleTaskStatus(task.id, task.active)}
                    variant={task.active ? "destructive" : "default"}
                  >
                    {task.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.referralToken} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Email: {user.email}</p>
                    <p className="text-sm text-gray-500">Referral Token: {user.referralToken}</p>
                    <p className="text-sm text-gray-500">Referred By: {user.referredBy || "None"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.erveBalance.toFixed(4)} ERVE</p>
                    <p className="text-sm text-gray-500">Level {user.level}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Mining Speed: {user.miningSpeed}</p>
                  <p className="text-sm text-gray-500">Referrals: {user.numberOfReferrals}</p>
                  <p className="text-sm text-gray-500">Points: {user.points}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {user.createdAt.toDate().toLocaleDateString()}
                    </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}