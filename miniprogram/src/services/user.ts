import { post, get } from './request'
import { User, LoginRequest, RegisterRequest, ApiResponse } from '@/types'

// 登录
export const login = (credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
  return post('/auth/login', credentials)
}

// 注册
export const register = (credentials: RegisterRequest): Promise<ApiResponse<User>> => {
  return post('/auth/register', credentials)
}

// 登出
export const logout = (): Promise<ApiResponse> => {
  return post('/auth/logout')
}

// 获取当前用户信息
export const getUserInfo = (): Promise<ApiResponse<User>> => {
  return get('/user/me')
}

// 获取订阅状态
export const getSubscriptionStatus = (): Promise<ApiResponse<any>> => {
  return get('/subscription/status')
}

// 获取使用统计
export const getUsageStats = (): Promise<ApiResponse<any>> => {
  return get('/usage/stats')
}
