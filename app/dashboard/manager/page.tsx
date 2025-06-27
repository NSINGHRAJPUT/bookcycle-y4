"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, XCircle, Clock, Users, LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, getBooks, verifyBook } from "@/lib/api"

export default function ManagerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [pendingBooks, setPendingBooks] = useState<any[]>([])
  const [verifiedBooks, setVerifiedBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData?.user || userData.user.role !== "manager") {
        router.push("/auth/login")
        return
      }

      setUser(userData.user)

      // Load pending and verified books
      const [pendingResponse, verifiedResponse] = await Promise.all([
        getBooks({ status: "pending" }),
        getBooks({ status: "verified" }),
      ])

      setPendingBooks(pendingResponse.data?.books || [])
      setVerifiedBooks(verifiedResponse.data?.books || [])
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

  const handleApprove = async (bookId: string) => {
    try {
      const { error } = await verifyBook(bookId, true)
      if (error) {
        alert(`Approval failed: ${error}`)
        return
      }

      alert("Book approved successfully!")
      loadData() // Refresh data
    } catch (error: any) {
      alert(`Approval failed: ${error.message}`)
    }
  }

  const handleReject = async (bookId: string) => {
    try {
      const { error } = await verifyBook(bookId, false)
      if (error) {
        alert(`Rejection failed: ${error}`)
        return
      }

      alert("Book rejected.")
      loadData() // Refresh data
    } catch (error: any) {
      alert(`Rejection failed: ${error.message}`)
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
            <Badge variant="secondary">Book Manager</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.institution}</span>
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
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-gray-600">Review and verify book donations from students.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBooks.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedBooks.length}</div>
              <p className="text-xs text-muted-foreground">Total verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Sold</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedBooks.filter((b) => b.status === "sold").length}</div>
              <p className="text-xs text-muted-foreground">Successfully sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {verifiedBooks.length > 0
                  ? Math.round((verifiedBooks.filter((b) => b.status === "sold").length / verifiedBooks.length) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Books sold rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Reviews ({pendingBooks.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified Books ({verifiedBooks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingBooks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
                  <p className="text-gray-600">All book donations have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              pendingBooks.map((book) => (
                <Card key={book._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{book.title}</CardTitle>
                        <CardDescription>by {book.author}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Book Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subject:</span>
                              <span>{book.subject}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">MRP:</span>
                              <span>₹{book.mrp}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Condition:</span>
                              <Badge variant="outline">{book.condition}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reward Points:</span>
                              <span className="text-green-600 font-semibold">{Math.floor(book.mrp * 0.4)} pts</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Student Information</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-600">Submitted:</span>{" "}
                              {new Date(book.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {book.description && (
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{book.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Book Images</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(book.images || ["/placeholder.svg?height=200&width=150"]).map((image, index) => (
                              <div key={index} className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Book image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => handleApprove(book._id)} className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="destructive" onClick={() => handleReject(book._id)} className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="verified" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verified Books</CardTitle>
                <CardDescription>Books you have approved and listed on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedBooks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No books verified yet.</p>
                ) : (
                  <div className="space-y-4">
                    {verifiedBooks.map((book) => (
                      <div key={book._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-gray-600">by {book.author}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">MRP: ₹{book.mrp}</p>
                            <p className="text-sm text-green-600">Price: {book.points_price} pts</p>
                          </div>
                          <Badge variant={book.status === "sold" ? "default" : "secondary"}>{book.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
