import Taro from '@tarojs/taro'
import { ApiResponse } from '@/types'

// API 基础配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

// 请求拦截器
const request = async <T = any>(
  url: string,
  options: Taro.request.Option = {}
): Promise<ApiResponse<T>> => {
  // 获取 token
  const token = Taro.getStorageSync('token')

  // 合并请求配置
  const config: Taro.request.Option = {
    url: `${API_BASE_URL}${url}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.header,
    },
    ...options,
  }

  // 如果是 POST/PUT 请求，确保数据正确序列化
  if (config.method !== 'GET' && config.data) {
    config.data = JSON.stringify(config.data)
  }

  try {
    const response = await Taro.request(config)

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data as ApiResponse<T>
    } else if (response.statusCode === 401) {
      // 未授权，清除登录信息并跳转到登录页
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('user')
      Taro.redirectTo({
        url: '/pages/login/index',
      })
      return {
        success: false,
        error: '登录已过期，请重新登录',
      }
    } else {
      return {
        success: false,
        error: response.data?.error || `请求失败 (${response.statusCode})`,
      }
    }
  } catch (error: any) {
    console.error('请求错误:', error)
    return {
      success: false,
      error: error.message || '网络请求失败',
    }
  }
}

// GET 请求
export const get = <T = any>(url: string, params?: any): Promise<ApiResponse<T>> => {
  return request<T>(url, {
    method: 'GET',
    data: params,
  })
}

// POST 请求
export const post = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return request<T>(url, {
    method: 'POST',
    data,
  })
}

// PUT 请求
export const put = <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return request<T>(url, {
    method: 'PUT',
    data,
  })
}

// DELETE 请求
export const del = <T = any>(url: string): Promise<ApiResponse<T>> => {
  return request<T>(url, {
    method: 'DELETE',
  })
}

export default request
