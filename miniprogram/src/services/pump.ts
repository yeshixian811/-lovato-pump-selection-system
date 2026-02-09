import { get, post, del } from './request'
import { Pump, PumpPerformanceCurve, SelectionParams, SelectionResult, ApiResponse } from '@/types'

// 获取水泵列表
export const getPumps = (params: {
  skip?: number
  limit?: number
  filters?: any
}): Promise<ApiResponse<{ pumps: Pump[]; total: number }>> => {
  return get('/pumps', params)
}

// 获取水泵详情
export const getPumpById = (id: number): Promise<ApiResponse<Pump>> => {
  return get(`/pumps/${id}`)
}

// 获取水泵性能曲线
export const getPumpPerformance = (id: number): Promise<ApiResponse<PumpPerformanceCurve[]>> => {
  return get(`/pumps/${id}/performance`)
}

// 水泵选型
export const matchPump = (params: SelectionParams): Promise<ApiResponse<SelectionResult[]>> => {
  return post('/pump/match', params)
}

// 创建水泵（管理员）
export const createPump = (data: Partial<Pump>): Promise<ApiResponse<Pump>> => {
  return post('/pumps', data)
}

// 更新水泵（管理员）
export const updatePump = (id: number, data: Partial<Pump>): Promise<ApiResponse<Pump>> => {
  return post(`/pumps/${id}`, data)
}

// 删除水泵（管理员）
export const deletePump = (id: number): Promise<ApiResponse> => {
  return del(`/pumps/${id}`)
}

// 批量删除水泵（管理员）
export const batchDeletePumps = (ids: number[]): Promise<ApiResponse> => {
  return post('/pumps/batch-delete', { ids })
}

// 初始化性能曲线（管理员）
export const initPerformance = (id: number): Promise<ApiResponse> => {
  return post(`/pumps/init-performance`, { id })
}

// 重新生成性能曲线（管理员）
export const regeneratePerformance = (id: number): Promise<ApiResponse> => {
  return post(`/pumps/regenerate-performance`, { id })
}

// 获取选型推荐
export const getSelectedPumps = (params: any): Promise<ApiResponse<Pump[]>> => {
  return get('/pumps/select', params)
}
