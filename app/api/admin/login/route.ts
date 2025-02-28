import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const JWT_SECRET = process.env.JWT_SECRET as string

if (!ADMIN_PASSWORD || !JWT_SECRET) {
  throw new Error("Missing required environment variables")
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (password !== ADMIN_PASSWORD) {
      return new NextResponse(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" })

    return new NextResponse(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

