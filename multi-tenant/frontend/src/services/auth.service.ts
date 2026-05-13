import { publicAxios } from './api-client'
import type { LoginResponse, RegisterDto, AuthTokens } from 'src/types'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await publicAxios.post<LoginResponse>('/auth/login', { email, password })
    return data
  },

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const { data } = await publicAxios.post<{ message: string }>('/auth/register', dto)
    return data
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await publicAxios.post<AuthTokens>('/auth/refresh', { refreshToken })
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await publicAxios.post('/auth/logout', { refreshToken }).catch(() => {})
  },
}
