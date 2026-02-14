/**
 * API 请求工具类
 * 连接火山云服务器 API
 */

// API 基础地址
const BASE_URL = 'https://lowato-hvac.com/api'

// 请求拦截器
function request<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as ApiResponse<T>)
        } else {
          reject({
            success: false,
            error: `请求失败: ${res.statusCode}`,
          })
        }
      },
      fail: (err) => {
        console.error('API 请求失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000,
        })
        reject({
          success: false,
          error: '网络请求失败',
        })
      },
    })
  })
}

// 获取产品列表
export function getProducts(): Promise<ApiResponse<PumpProduct[]>> {
  return request<PumpProduct[]>('/website/products', 'GET')
}

// 获取产品详情
export function getProductDetail(id: number): Promise<ApiResponse<PumpProduct>> {
  return request<PumpProduct>(`/website/products/${id}`, 'GET')
}

// 智能选型
export function selectPump(params: SelectionParams): Promise<ApiResponse<PumpProduct[]>> {
  return request<PumpProduct[]>('/website/selection', 'POST', params)
}

// 搜索产品
export function searchProducts(keyword: string): Promise<ApiResponse<PumpProduct[]>> {
  return request<PumpProduct[]>(`/website/products/search?keyword=${keyword}`, 'GET')
}

// 根据系列获取产品
export function getProductsBySeries(series: string): Promise<ApiResponse<PumpProduct[]>> {
  return request<PumpProduct[]>(`/website/products/series/${series}`, 'GET')
}

// 性能曲线数据
export function getPerformanceCurve(productId: number): Promise<ApiResponse<CurvePoint[]>> {
  return request<CurvePoint[]>(`/website/products/${productId}/curve`, 'GET')
}

// 获取所有系列
export function getSeriesList(): Promise<ApiResponse<string[]>> {
  return request<string[]>('/website/series', 'GET')
}

// 获取应用场景列表
export function getApplicationsList(): Promise<ApiResponse<string[]>> {
  return request<string[]>('/website/applications', 'GET')
}

// 获取流体类型列表
export function getFluidTypesList(): Promise<ApiResponse<string[]>> {
  return request<string[]>('/website/fluid-types', 'GET')
}

// 导出类型
export type { PumpProduct, SelectionParams, ApiResponse, CurvePoint }

// Mock 数据（用于开发测试）
export const mockProducts: PumpProduct[] = [
  {
    id: 1,
    model: 'AMT-40-125',
    name: 'AMT 立式多级离心泵',
    brand: 'Lovato',
    type: '立式多级泵',
    series: 'AMT',
    description: '高效节能立式多级离心泵，适用于工业给排水、增压系统等应用',
    max_flow_rate: 16,
    min_flow_rate: 0,
    max_head: 36,
    min_head: 0,
    rated_power: 1.5,
    rated_speed: 2900,
    efficiency: 72,
    voltage: '380V/3~',
    frequency: 50,
    current: 3.5,
    power_factor: 0.85,
    inlet_diameter: 40,
    outlet_diameter: 40,
    weight: 45,
    dimensions: '350×200×600',
    casing_material: '不锈钢304',
    impeller_material: '不锈钢304',
    seal_type: '机械密封',
    protection_level: 'IP54',
    insulation_class: 'F',
    applications: ['工业给排水', '增压系统', '消防系统'],
    fluid_types: ['清水', '轻污染水'],
    max_temperature: 80,
    min_temperature: -10,
    max_viscosity: 1,
    price: 5800,
    currency: 'CNY',
    in_stock: true,
    stock_quantity: 15,
    image_url: '/images/pump-amt-40-125.jpg',
    spec_sheet_url: '/specs/amt-40-125.pdf',
    manual_url: '/manuals/amt-40-125.pdf',
    match_score: 0,
    performance_curve: [
      { flowRate: 0, head: 36, efficiency: 0, power: 0.8 },
      { flowRate: 4, head: 35.5, efficiency: 45, power: 0.95 },
      { flowRate: 8, head: 34, efficiency: 58, power: 1.1 },
      { flowRate: 12, head: 32, efficiency: 68, power: 1.25 },
      { flowRate: 16, head: 29, efficiency: 72, power: 1.42 },
      { flowRate: 20, head: 25, efficiency: 70, power: 1.55 },
      { flowRate: 24, head: 20, efficiency: 62, power: 1.68 },
    ],
  },
  {
    id: 2,
    model: 'AMT-40-160',
    name: 'AMT 立式多级离心泵',
    brand: 'Lovato',
    type: '立式多级泵',
    series: 'AMT',
    description: '高扬程立式多级离心泵，适用于高层供水、远距离输送等应用',
    max_flow_rate: 16,
    min_flow_rate: 0,
    max_head: 54,
    min_head: 0,
    rated_power: 2.2,
    rated_speed: 2900,
    efficiency: 74,
    voltage: '380V/3~',
    frequency: 50,
    current: 5.2,
    power_factor: 0.86,
    inlet_diameter: 40,
    outlet_diameter: 40,
    weight: 55,
    dimensions: '380×220×650',
    casing_material: '不锈钢304',
    impeller_material: '不锈钢304',
    seal_type: '机械密封',
    protection_level: 'IP54',
    insulation_class: 'F',
    applications: ['高层供水', '远距离输送', '消防系统'],
    fluid_types: ['清水', '轻污染水'],
    max_temperature: 80,
    min_temperature: -10,
    max_viscosity: 1,
    price: 7200,
    currency: 'CNY',
    in_stock: true,
    stock_quantity: 10,
    image_url: '/images/pump-amt-40-160.jpg',
    spec_sheet_url: '/specs/amt-40-160.pdf',
    manual_url: '/manuals/amt-40-160.pdf',
    match_score: 0,
    performance_curve: [
      { flowRate: 0, head: 54, efficiency: 0, power: 1.2 },
      { flowRate: 4, head: 53.5, efficiency: 42, power: 1.4 },
      { flowRate: 8, head: 52, efficiency: 56, power: 1.65 },
      { flowRate: 12, head: 50, efficiency: 68, power: 1.9 },
      { flowRate: 16, head: 47, efficiency: 74, power: 2.15 },
      { flowRate: 20, head: 43, efficiency: 72, power: 2.4 },
      { flowRate: 24, head: 38, efficiency: 64, power: 2.65 },
    ],
  },
  {
    id: 3,
    model: 'AMT-40-200',
    name: 'AMT 立式多级离心泵',
    brand: 'Lovato',
    type: '立式多级泵',
    series: 'AMT',
    description: '超高扬程立式多级离心泵，适用于工业高压系统、锅炉供水等应用',
    max_flow_rate: 16,
    min_flow_rate: 0,
    max_head: 72,
    min_head: 0,
    rated_power: 3.0,
    rated_speed: 2900,
    efficiency: 75,
    voltage: '380V/3~',
    frequency: 50,
    current: 7.0,
    power_factor: 0.86,
    inlet_diameter: 40,
    outlet_diameter: 40,
    weight: 65,
    dimensions: '420×240×700',
    casing_material: '不锈钢304',
    impeller_material: '不锈钢304',
    seal_type: '机械密封',
    protection_level: 'IP54',
    insulation_class: 'F',
    applications: ['工业高压', '锅炉供水', '远距离输送'],
    fluid_types: ['清水', '轻污染水'],
    max_temperature: 80,
    min_temperature: -10,
    max_viscosity: 1,
    price: 9500,
    currency: 'CNY',
    in_stock: true,
    stock_quantity: 8,
    image_url: '/images/pump-amt-40-200.jpg',
    spec_sheet_url: '/specs/amt-40-200.pdf',
    manual_url: '/manuals/amt-40-200.pdf',
    match_score: 0,
    performance_curve: [
      { flowRate: 0, head: 72, efficiency: 0, power: 1.8 },
      { flowRate: 4, head: 71.5, efficiency: 40, power: 2.1 },
      { flowRate: 8, head: 70, efficiency: 54, power: 2.5 },
      { flowRate: 12, head: 68, efficiency: 66, power: 2.9 },
      { flowRate: 16, head: 65, efficiency: 75, power: 3.3 },
      { flowRate: 20, head: 61, efficiency: 73, power: 3.7 },
      { flowRate: 24, head: 56, efficiency: 66, power: 4.1 },
    ],
  },
]

/**
 * 使用 Mock 数据（当服务器不可用时）
 */
export function getMockProducts(): Promise<ApiResponse<PumpProduct[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: mockProducts,
      })
    }, 500)
  })
}

/**
 * Mock 智能选型
 */
export function mockSelectPump(params: SelectionParams): Promise<ApiResponse<PumpProduct[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 简单匹配逻辑
      const results = mockProducts.filter(pump => {
        const flowOk = pump.max_flow_rate >= params.required_flow_rate
        const headOk = pump.max_head >= params.required_head
        return flowOk && headOk
      }).map(pump => {
        // 计算匹配分数
        const flowRatio = pump.max_flow_rate / params.required_flow_rate
        const headRatio = pump.max_head / params.required_head
        const avgRatio = (flowRatio + headRatio) / 2
        const matchScore = Math.min(100, Math.round((1 - Math.abs(avgRatio - 1.2)) * 100))

        return {
          ...pump,
          match_score: matchScore,
        }
      }).sort((a, b) => b.match_score - a.match_score)

      resolve({
        success: true,
        data: results,
      })
    }, 500)
  })
}
