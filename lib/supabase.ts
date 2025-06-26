import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  name: string
  email: string
  role: "student" | "manager" | "admin"
  institution?: string
  reward_points: number
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  subject: string
  mrp: number
  condition: "excellent" | "good" | "fair" | "poor"
  description?: string
  status: "pending" | "verified" | "rejected" | "sold"
  points_price?: number
  donor_id: string
  verifier_id?: string
  buyer_id?: string
  images?: string[]
  created_at: string
  updated_at: string
  // Joined data
  donor?: User
  verifier?: User
  buyer?: User
}

export interface Transaction {
  id: string
  type: "donation" | "purchase"
  user_id: string
  book_id: string
  points_amount: number
  status: "pending" | "completed" | "failed"
  created_at: string
  // Joined data
  user?: User
  book?: Book
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}
