"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, Plus, ShoppingCart, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, getBooks, purchaseBook } from "@/lib/api"

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [availableBooks, setAvailableBooks] = useState<any[]>([])
  const [userDonations, setUserDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData?.user || userData.user.role !== "student") {
        router.push("/auth/login")
        return
      }

      setUser(userData.user)

      // Load available books and user donations
      const [booksResponse, donationsResponse] = await Promise.all([
        getBooks({ status: "verified" }),
        getBooks({ userId: userData.user._id }),
      ])

      setAvailableBooks(booksResponse.data?.books || [])
      setUserDonations(donationsResponse.data?.books || [])
    } catch (error) {
      console.error("Error loading data:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handlePurchase = async (book: any) => {
    if (!user) return

    if (user.reward_points < (book.points_price || 0)) {
      alert("Insufficient reward points!")
      return
    }

    try {
      const { error } = await purchaseBook(book._id)
      if (error) {
        alert(`Purchase failed: ${error}`)
        return
      }

      alert(`Successfully purchased "${book.title}"!`)
      loadData() // Refresh data
    } catch (error: any) {
      alert(`Purchase failed: ${error.message}`)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-600">BookCycle</h1>
            <Badge variant="secondary">Student Dashboard</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{user.reward_points} Points</span>
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Manage your book donations and discover new books to purchase.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.reward_points}</div>
              <p className="text-xs text-muted-foreground">Available for purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Donated</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userDonations.length}</div>
              <p className="text-xs text-muted-foreground">Total submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Available</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableBooks.length}</div>
              <p className="text-xs text-muted-foreground">Ready to purchase</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Donate a Book
              </CardTitle>
              <CardDescription>Upload your used books and earn reward points</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/student/donate">
                <Button className="w-full">Start Donation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Browse Books
              </CardTitle>
              <CardDescription>Find verified books to purchase with your points</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Books */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Books</CardTitle>
            <CardDescription>Purchase these verified books using your reward points</CardDescription>
          </CardHeader>
          <CardContent>
            {availableBooks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No books available at the moment.</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {availableBooks.slice(0, 6).map((book) => (
                  <Card key={book._id} className="overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-100">
                      <img
                        src={book.images?.[0] || "/placeholder.svg?height=200&width=150"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {book.condition}
                        </Badge>
                        <span className="text-xs text-gray-500">MRP: ₹{book.mrp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600">{book.points_price} pts</span>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(book)}
                          disabled={user.reward_points < (book.points_price || 0)}
                        >
                          Buy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Donations */}
        <Card>
          <CardHeader>
            <CardTitle>My Donations</CardTitle>
            <CardDescription>Track the status of your book donations</CardDescription>
          </CardHeader>
          <CardContent>
            {userDonations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">You haven't donated any books yet.</p>
            ) : (
              <div className="space-y-4">
                {userDonations.map((donation) => (
                  <div key={donation._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{donation.title}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          donation.status === "verified"
                            ? "default"
                            : donation.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {donation.status}
                      </Badge>
                      {donation.status === "verified" && (
                        <span className="text-green-600 font-semibold">+{Math.floor(donation.mrp * 0.4)} pts</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
