import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Task } from "@/lib/models/task"

export async function GET() {
  try {
    await dbConnect()
    const tasks = await Task.find().sort({ createdAt: -1 })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Database error:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch tasks" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const data = await req.json()

    // Validate required fields
    if (!data.title || !data.description || !data.reward || !data.type) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const task = await Task.create(data)
    return NextResponse.json(task)
  } catch (error) {
    console.error("Database error:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to create task" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

