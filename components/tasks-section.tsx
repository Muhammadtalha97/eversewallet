"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: "SOCIAL" | "REFERRAL" | "DAILY";
  xLink?: string;
  active: boolean;
}

interface TasksSectionProps {
  onTaskComplete: (reward: number) => void;
}

export function TasksSection({ onTaskComplete }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTasks();
    loadCompletedTasks();
  }, []);

  // Fetch tasks from the API
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/admin/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  // Load completed tasks from Firestore
  const loadCompletedTasks = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const completed = userDoc.data()?.completedTasks || [];
        setCompletedTasks(new Set(completed)); // Convert array to Set for faster lookups
      }
    } catch (error) {
      console.error("Failed to load completed tasks:", error);
    }
  };

  // Handle task completion
  const handleTaskCompletion = async (
    taskId: string,
    reward: number,
    type: "SOCIAL" | "REFERRAL" | "DAILY",
    xLink?: string
  ) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to complete tasks");
      return;
    }

    // Check if the task is already completed
    if (completedTasks.has(taskId)) {
      toast.error("Task already completed");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      // Update user document
      await updateDoc(userRef, {
        points: increment(reward),
        completedTasks: arrayUnion(taskId), // Add task ID to completedTasks array
      });

      // Update local state
      setCompletedTasks((prev) => new Set([...prev, taskId]));
      onTaskComplete(reward);
      toast.success(`Earned ${reward} ERVE tokens!`);

      // Handle task-specific actions
      if (type === "SOCIAL" && xLink) {
        window.open(xLink, "_blank"); // Open social link in a new tab
      }
    } catch (error) {
      console.error("Task completion failed:", error);
      toast.error("Failed to complete task");
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Daily Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="bg-white p-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1 text-[#25D366]">
                {completedTasks.has(task.id) ? (
                  <CheckCircle className="h-5 w-5" /> 
                ) : (
                  <button
                    className="text-[#25D366] hover:text-[#128C7E]"
                    disabled={completedTasks.has(task.id)} 
                  >
                    <Circle className="h-5 w-5" /> 
                  </button>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
                <div className="mt-2 text-sm text-[#25D366]">
                  +{task.reward} ERVE
                </div>
              </div>

              {task.xLink && !completedTasks.has(task.id) && (
                <div>
                  <button
                    onClick={() => {
                      window.open(task.xLink, "_blank");
                      handleTaskCompletion(
                        task.id,
                        task.reward,
                        task.type,
                        task.xLink
                      );
                    }}
                    className="px-4 py-2 bg-[#25D366] text-white rounded hover:bg-[#128C7E] transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Link
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
