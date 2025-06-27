"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, BookOpen, Award, Search, LogOut, Bell, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, getUsers, getBooks } from "@/lib/api"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [managers, setManagers] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalManagers: 0,
    totalBooks: 0,
    totalTransactions: 0,
    rewardPointsDistributed: 0,
    rewardPointsUsed: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData?.user || userData.user.role !== "admin") {
        router.push("/auth/login")
        return
      }

      setUser(userData.user)

      // Load all data
      const [studentsResponse, managersResponse, booksResponse] = await Promise.all([
        getUsers("student"),
        getUsers("manager"),
        getBooks(),
      ])

      const studentsData = studentsResponse.data?.users || []
      const managersData = managersResponse.data?.users || []
      const booksData = booksResponse.data?.books || []

      setStudents(studentsData)
      setManagers(managersData)
      setBooks(booksData)

      // Calculate stats
      const totalRewardPoints = studentsData.reduce((sum, student) => sum + student.reward_points, 0)
      const verifiedBooks = booksData.filter((b) => b.status === "verified" || b.status === "sold")
      const soldBooks = booksData.filter((b) => b.status === "sold")

      setStats({
        totalStudents: studentsData.length,
        totalManagers: managersData.length,
        totalBooks: booksData.length,
        totalTransactions: verifiedBooks.length + soldBooks.length,
        rewardPointsDistributed: verifiedBooks.reduce((sum, b) => sum + Math.floor(b.mrp * 0.4), 0),
        rewardPointsUsed: soldBooks.reduce((sum, b) => sum + (b.points_price || 0), 0),
      })
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

  const handleDownloadReport = (type: string) => {
    // Mock download functionality - in real app, generate CSV/PDF
    alert(`Downloading ${type} report...`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manager.institution && manager.institution.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-600">BookCycle</h1>
            <Badge variant="destructive">Admin Panel</Badge>
          </div>
          <div className="flex items-center gap-4">
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
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Monitor and manage the BookCycle platform ecosystem.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Managers</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalManagers}</div>
              <p className="text-xs text-muted-foreground">Verified institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
              <p className="text-xs text-muted-foreground">Books in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rewardPointsDistributed}</div>
              <p className="text-xs text-muted-foreground">Points distributed</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Books Donated</span>
                <span className="font-semibold">{books.filter((b) => b.status !== "pending").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Books Sold</span>
                <span className="font-semibold">{books.filter((b) => b.status === "sold").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {books.length > 0
                    ? Math.round(
                        (books.filter((b) => b.status === "sold").length /
                          books.filter((b) => b.status === "verified" || b.status === "sold").length) *
                          100,
                      ) || 0
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Points Economy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points Distributed</span>
                <span className="font-semibold">{stats.rewardPointsDistributed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points Used</span>
                <span className="font-semibold">{stats.rewardPointsUsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Utilization Rate</span>
                <span className="font-semibold text-blue-600">
                  {stats.rewardPointsDistributed > 0
                    ? Math.round((stats.rewardPointsUsed / stats.rewardPointsDistributed) * 100)
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => handleDownloadReport("users")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download User Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => handleDownloadReport("books")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Book Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => handleDownloadReport("transactions")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Transaction Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="managers">Book Managers ({managers.length})</TabsTrigger>
            <TabsTrigger value="books">Books ({books.length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>View and manage all registered students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Reward Points</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.reward_points} pts</Badge>
                        </TableCell>
                        <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers">
            <Card>
              <CardHeader>
                <CardTitle>Book Manager Management</CardTitle>
                <CardDescription>View and manage all book managers and institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredManagers.map((manager) => (
                      <TableRow key={manager._id}>
                        <TableCell className="font-medium">{manager.name}</TableCell>
                        <TableCell>{manager.email}</TableCell>
                        <TableCell>{manager.institution || "N/A"}</TableCell>
                        <TableCell>{new Date(manager.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>Book Management</CardTitle>
                <CardDescription>View all books in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Points Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.slice(0, 20).map((book) => (
                      <TableRow key={book._id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.subject}</TableCell>
                        <TableCell>₹{book.mrp}</TableCell>
                        <TableCell>{book.points_price || 0} pts</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              book.status === "verified"
                                ? "default"
                                : book.status === "sold"
                                  ? "secondary"
                                  : book.status === "pending"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {book.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
