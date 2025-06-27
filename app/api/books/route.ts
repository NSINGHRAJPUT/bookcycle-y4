import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Book from "@/models/Book"
import User from "@/models/User"
import Notification from "@/models/Notification"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    const query: any = {}

    if (status) {
      query.status = status
    }

    if (userId) {
      query.donor_id = userId
    }

    const books = await Book.find(query)
      .populate("donor_id", "name email")
      .populate("verifier_id", "name email")
      .populate("buyer_id", "name email")
      .sort({ created_at: -1 })

    return NextResponse.json({ books })
  } catch (error: any) {
    console.error("Get books error:", error)
    return NextResponse.json({ error: error.message || "Failed to get books" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, author, isbn, subject, mrp, condition, description, images } = body

    // Validate required fields
    if (!title || !author || !subject || !mrp || !condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const book = new Book({
      title,
      author,
      isbn,
      subject,
      mrp: Number(mrp),
      condition,
      description,
      images: images || [],
      donor_id: decoded.userId,
    })

    const savedBook = await book.save()

    // Create notifications for managers
    await createNotificationForManagers(
      "New Book Donation",
      `A new book "${title}" has been submitted for verification.`,
      "book_donation",
    )

    return NextResponse.json({ book: savedBook })
  } catch (error: any) {
    console.error("Create book error:", error)
    return NextResponse.json({ error: error.message || "Failed to create book" }, { status: 500 })
  }
}

async function createNotificationForManagers(title: string, message: string, type: string) {
  try {
    await connectDB()

    // Get all managers
    const managers = await User.find({ role: "manager" })

    if (managers.length > 0) {
      const notifications = managers.map((manager) => ({
        user_id: manager._id,
        title,
        message,
        type,
        read: false,
      }))

      await Notification.insertMany(notifications)
    }
  } catch (error) {
    console.error("Error creating notifications:", error)
  }
}
