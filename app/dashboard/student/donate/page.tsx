"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createBookDonation } from "@/lib/books"

export default function DonatePage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    subject: "",
    mrp: "",
    condition: "",
    description: "",
    images: [] as File[],
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      await createBookDonation({
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        subject: formData.subject,
        mrp: Number.parseInt(formData.mrp),
        condition: formData.condition,
        description: formData.description,
        images: formData.images.map((file) => `/placeholder.svg?height=200&width=150`), // In real app, upload to storage
        donor_id: currentUser.id,
      })

      alert("Book donation submitted successfully! You will be notified once it's reviewed.")
      router.push("/dashboard/student")
    } catch (error: any) {
      alert(`Submission failed: ${error.message}`)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5), // Max 5 images
    }))
  }

  const expectedPoints = formData.mrp ? Math.floor(Number.parseInt(formData.mrp) * 0.4) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-green-600">Donate a Book</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Book Donation Form</CardTitle>
            <CardDescription>
              Fill in the details of your book. Once verified by our book managers, you'll earn{" "}
              {expectedPoints > 0 ? expectedPoints : "reward"} points (40% of MRP).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Book Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter book title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={formData.author}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN (Optional)</Label>
                    <Input
                      id="isbn"
                      placeholder="Enter ISBN number"
                      value={formData.isbn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isbn: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="literature">Literature</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (₹) *</Label>
                    <Input
                      id="mrp"
                      type="number"
                      placeholder="Enter original MRP"
                      value={formData.mrp}
                      onChange={(e) => setFormData((prev) => ({ ...prev, mrp: e.target.value }))}
                      required
                    />
                    {expectedPoints > 0 && (
                      <p className="text-sm text-green-600">Expected reward: {expectedPoints} points</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent - Like new</SelectItem>
                        <SelectItem value="good">Good - Minor wear</SelectItem>
                        <SelectItem value="fair">Fair - Noticeable wear</SelectItem>
                        <SelectItem value="poor">Poor - Heavy wear</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Additional Description</Label>
                <Textarea
                  id="description"
                  placeholder="Any additional details about the book's condition, edition, etc."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Book Images</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload clear photos of your book (cover, spine, and any damage)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload">
                    <Button type="button" variant="outline" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Images
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-2">Maximum 5 images, up to 5MB each</p>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((file, index) => (
                      <Badge key={index} variant="secondary">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your book will be reviewed by verified book managers</li>
                  <li>• You'll earn 40% of MRP as reward points if approved</li>
                  <li>• Rejected books won't earn any points</li>
                  <li>• Ensure all information is accurate to avoid rejection</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Book for Donation
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
