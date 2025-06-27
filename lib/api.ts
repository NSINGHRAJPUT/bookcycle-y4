// API client for BookCycle platform
class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
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
        throw new Error(data.error || "An error occurred")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth methods
  async signUp(userData: {
    name: string
    email: string
    password: string
    role: "student" | "manager" | "admin"
    studentId?: string
  }) {
    const data = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (data.token) {
      this.token = data.token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token)
      }
    }

    return data
  }

  async signIn(credentials: { email: string; password: string }) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (data.token) {
      this.token = data.token
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token)
      }
    }

    return data
  }

  async getCurrentUser() {
    return this.request("/api/auth/me")
  }

  signOut() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  // User methods
  async getUsers() {
    return this.request("/api/users")
  }

  // Book methods
  async getBooks() {
    return this.request("/api/books")
  }

  async createBook(bookData: {
    title: string
    author: string
    isbn: string
    condition: "excellent" | "good" | "fair"
    subject: string
    mrp: number
    description?: string
    images?: string[]
  }) {
    return this.request("/api/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    })
  }

  async verifyBook(bookId: string, status: "verified" | "rejected", rejectionReason?: string) {
    return this.request(`/api/books/${bookId}/verify`, {
      method: "POST",
      body: JSON.stringify({ status, rejectionReason }),
    })
  }

  async purchaseBook(bookId: string) {
    return this.request(`/api/books/${bookId}/purchase`, {
      method: "POST",
    })
  }
}

// Create a singleton instance
const apiClient = new ApiClient()

// Named exports for compatibility
export const signUp = (userData: Parameters<ApiClient["signUp"]>[0]) => apiClient.signUp(userData)
export const signIn = (credentials: Parameters<ApiClient["signIn"]>[0]) => apiClient.signIn(credentials)
export const getCurrentUser = () => apiClient.getCurrentUser()
export const signOut = () => apiClient.signOut()
export const getUsers = () => apiClient.getUsers()
export const getBooks = () => apiClient.getBooks()
export const createBook = (bookData: Parameters<ApiClient["createBook"]>[0]) => apiClient.createBook(bookData)
export const verifyBook = (bookId: string, status: "verified" | "rejected", rejectionReason?: string) =>
  apiClient.verifyBook(bookId, status, rejectionReason)
export const purchaseBook = (bookId: string) => apiClient.purchaseBook(bookId)

// Default export
export default apiClient
