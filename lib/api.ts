const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  }

  // Auth endpoints
  async register(userData: {
    name: string
    email: string
    password: string
    role: string
    institution?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    return this.handleResponse(response)
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    return this.handleResponse(response)
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Book endpoints
  async getBooks(params?: { status?: string; userId?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.userId) searchParams.append("userId", params.userId)

    const response = await fetch(`${API_BASE_URL}/api/books?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createBook(bookData: {
    title: string
    author: string
    isbn?: string
    subject: string
    mrp: number
    condition: string
    description?: string
    images?: string[]
  }) {
    const response = await fetch(`${API_BASE_URL}/api/books`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookData),
    })
    return this.handleResponse(response)
  }

  async verifyBook(bookId: string, approved: boolean) {
    const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/verify`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ approved }),
    })
    return this.handleResponse(response)
  }

  async purchaseBook(bookId: string) {
    const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/purchase`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // User endpoints
  async getUsers(role?: string) {
    const searchParams = new URLSearchParams()
    if (role) searchParams.append("role", role)

    const response = await fetch(`${API_BASE_URL}/api/users?${searchParams}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }
}

export const api = new ApiClient()

// ------------------------
//  Named helper functions
// ------------------------

/**
 * Auth helpers
 */
export const signUp = api.register.bind(api)
export const signIn = api.login.bind(api)
export const getCurrentUser = api.getCurrentUser.bind(api)
export function signOut() {
  localStorage.removeItem("token")
  // Optional: redirect to home/login
  if (typeof window !== "undefined") window.location.href = "/"
}

/**
 * User helpers
 */
export const getUsers = api.getUsers.bind(api)

/**
 * Book helpers
 */
export const getBooks = api.getBooks.bind(api)
export const createBook = api.createBook.bind(api)
export const verifyBook = api.verifyBook.bind(api)
export const purchaseBook = api.purchaseBook.bind(api)
