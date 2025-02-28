import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  // Only apply to admin API routes
  if (!request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.next()
  }

  // Skip the login route
  if (request.nextUrl.pathname === "/api/admin/login") {
    return NextResponse.next()
  }

  const token = request.headers.get("Authorization")

  if (!token) {
    return new NextResponse(JSON.stringify({ error: "No token provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Missing JWT_SECRET in environment variables");
    }
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next()
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const config = {
  matcher: "/api/admin/:path*",
}

