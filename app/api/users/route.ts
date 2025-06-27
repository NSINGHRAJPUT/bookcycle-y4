import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const query: any = {}
    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .select("-password") // Exclude password
      .sort({ created_at: -1 })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: error.message || "Failed to get users" }, { status: 500 })
  }
}
