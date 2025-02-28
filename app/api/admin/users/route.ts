import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User } from "@/lib/models/user"

export async function GET() {
  try {
    await dbConnect()
    const users = await User.find().sort({ totalMined: -1 })
    return NextResponse.json(users)
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

