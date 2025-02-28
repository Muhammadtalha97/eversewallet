import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Task } from "@/lib/models/task"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

async function verifyToken(token: string | null) {
  if (!token) throw new Error("No token provided")
  return jwt.verify(token, JWT_SECRET)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await verifyToken(req.headers.get("Authorization"))
    await dbConnect()

    const data = await req.json()
    const task = await Task.findByIdAndUpdate(params.id, data, { new: true })

    if (!task) {
      return new NextResponse(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Failed to update task" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

