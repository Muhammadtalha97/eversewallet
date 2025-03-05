import { NextResponse } from "next/server"
import { db } from "@/lib/firebase" // Import your Firebase Firestore instance
import { collection, getDocs, query, where } from "firebase/firestore"

interface Task {
    id: string
    title: string
    description: string
    reward: number
    type: "SOCIAL" | "REFERRAL" | "DAILY"
    xLink?: string
    active: boolean
}

export async function GET() {
    try {
        // Fetch tasks from Firestore
        const tasksQuery = query(collection(db, "tasks"), where("active", "==", true))
        const tasksSnapshot = await getDocs(tasksQuery)

        if (tasksSnapshot.empty) {
            return NextResponse.json([]) // Return an empty array if no tasks are found
        }

        // Map Firestore documents to the Task interface
        const tasks: Task[] = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            reward: doc.data().reward,
            type: doc.data().type,
            xLink: doc.data().xLink || undefined,
            active: doc.data().active,
        }))

        // Return the tasks as JSON
        return NextResponse.json(tasks)
    } catch (error) {
        console.error("Error fetching tasks:", error)
        return NextResponse.json(
            { message: "Failed to fetch tasks" },
            { status: 500 }
        )
    }
}