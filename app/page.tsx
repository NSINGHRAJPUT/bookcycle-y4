import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, Recycle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">BookCycle</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Smart Book Reuse & Reward Platform</h2>
          <p className="text-xl text-gray-600 mb-8">
            Donate your used books, earn reward points, and purchase verified books from other students. Creating a
            circular economy for academic books.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=student">
              <Button size="lg" className="w-full sm:w-auto">
                Join as Student
              </Button>
            </Link>
            <Link href="/auth/register?role=manager">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Join as Book Manager
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Donate Books</CardTitle>
              <CardDescription>Upload your used books and earn 40% of MRP as reward points</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Verified Quality</CardTitle>
              <CardDescription>All books are verified by trusted institutions and book managers</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Reward Points</CardTitle>
              <CardDescription>Purchase books using points at 60% of MRP - no cash needed</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Recycle className="h-12 w-12 text-green-600 mb-2" />
              <CardTitle>Circular Economy</CardTitle>
              <CardDescription>Promote sustainability by giving books a second life</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Donate Your Books</h4>
              <p className="text-gray-600">Upload book details and images. Submit for verification.</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Verified</h4>
              <p className="text-gray-600">Book managers verify quality and authenticity.</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Earn & Shop</h4>
              <p className="text-gray-600">Earn points and use them to buy other verified books.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Recycle className="h-6 w-6" />
            <span className="text-xl font-bold">BookCycle</span>
          </div>
          <p className="text-gray-400">Building a sustainable future for academic books, one donation at a time.</p>
        </div>
      </footer>
    </div>
  )
}
