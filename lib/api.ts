// Types
interface User {
  _id: string
  name: string
  email: string
  role: "student" | "manager" | "admin"
  points: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface Book {
  _id: string
  title: string
  author: string
  isbn: string
  subject: string
  condition: "excellent" | "good" | "fair" | "poor"
  mrp: number
  pointsPrice: number
  description?: string
  images: string[]
  donorId: string
  status: "pending" | "verified" | "sold" | "rejected"
  verifiedBy?: string
  verifiedAt?: string
  purchasedBy?: string
  purchasedAt?: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role?: "student" | "manager" | "admin"
}

interface CreateBookData {
  title: string
  author: string
  isbn: string
  subject: string
  condition: "excellent" | "good" | "fair" | "poor"
  mrp: number
  description?: string
  images?: string[]
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "/api"

    // Initialize token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth methods
  async signIn(credentials: LoginData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data?.token) {
      this.token = response.data.token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token)
      }
    }

    return response
  }

  async signUp(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.success && response.data?.token) {
      this.token = response.data.token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token)
      }
    }

    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me")
  }

  signOut(): void {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  // User methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/users")
  }

  // Book methods
  async getBooks(): Promise<ApiResponse<Book[]>> {
    return this.request<Book[]>("/books")
  }

  async createBook(bookData: CreateBookData): Promise<ApiResponse<Book>> {
    return this.request<Book>("/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    })
  }

  async verifyBook(bookId: string, approved: boolean): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/books/${bookId}/verify`, {
      method: "POST",
      body: JSON.stringify({ approved }),
    })
  }

  async purchaseBook(bookId: string): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/books/${bookId}/purchase`, {
      method: "POST",
    })
  }
}

// Create singleton instance
const apiClient = new ApiClient()

// Named exports for backward compatibility
export const signIn = (credentials: LoginData) => apiClient.signIn(credentials)
export const signUp = (userData: RegisterData) => apiClient.signUp(userData)
export const getCurrentUser = () => apiClient.getCurrentUser()
export const signOut = () => apiClient.signOut()
export const getUsers = () => apiClient.getUsers()
export const getBooks = () => apiClient.getBooks()
export const createBook = (bookData: CreateBookData) => apiClient.createBook(bookData)
export const verifyBook = (bookId: string, approved: boolean) => apiClient.verifyBook(bookId, approved)
export const purchaseBook = (bookId: string) => apiClient.purchaseBook(bookId)

// Export the client instance as well
export default apiClient

// Export types
export type { User, Book, ApiResponse, LoginData, RegisterData, CreateBookData }
