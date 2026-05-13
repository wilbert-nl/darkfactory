import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Public instance — no auth header
export const publicAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Authenticated instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Token injection — set by auth store after login
let _getAccessToken: (() => string | null) | null = null
let _refreshTokens: (() => Promise<string | null>) | null = null
let _logout: (() => void) | null = null

export function configureApiClient(opts: {
  getAccessToken: () => string | null
  refreshTokens: () => Promise<string | null>
  logout: () => void
}) {
  _getAccessToken = opts.getAccessToken
  _refreshTokens = opts.refreshTokens
  _logout = opts.logout
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getAccessToken?.()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh queue to prevent parallel refresh calls
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            } else {
              reject(error)
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await _refreshTokens?.()
        processQueue(newToken ?? null)
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch {
        processQueue(null)
        _logout?.()
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
