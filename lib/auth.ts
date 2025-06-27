import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import User, { type IUser } from "@/models/User"
import connectDB from "./mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<IUser | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    await connectDB()
    const user = await User.findById(payload.userId).select("-password")
    return user
  } catch (error) {
    return null
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest): Promise<{ user: IUser } | Response> => {
    const user = await getAuthUser(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return { user }
  }
}
