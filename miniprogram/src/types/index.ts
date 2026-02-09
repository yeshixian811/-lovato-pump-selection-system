// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscriptionTier: 'free' | 'basic' | 'pro';
  subscriptionStatus: 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 水泵产品类型
export interface Pump {
  id: number;
  model: string;
  name: string;
  brand: string;
  type: 'centrifugal' | 'vertical' | 'submersible';
  series: string;
  description: string;
  max_flow_rate: number;
  min_flow_rate: number;
  max_head: number;
  min_head: number;
  rated_power: number;
  rated_speed: number;
  efficiency: number;
  voltage: string;
  frequency: number;
  current: number;
  power_factor: number;
  inlet_diameter: number;
  outlet_diameter: number;
  weight: number;
  dimensions: string;
  casing_material: string;
  impeller_material: string;
  seal_type: string;
  protection_level: string;
  insulation_class: string;
  applications: string[];
  fluid_types: string[];
  max_temperature: number;
  min_temperature: number;
  max_viscosity: number;
  price: number;
  currency: string;
  in_stock: boolean;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
  spec_sheet_url?: string;
  manual_url?: string;
  sort_order: number;
  view_count: number;
  selection_count: number;
  created_at: string;
  updated_at: string;
  match_score?: number; // 匹配度分数（选型时）
}

// 水泵性能曲线数据点
export interface PumpPerformanceCurve {
  id: number;
  pump_id: number;
  flow_rate: number;
  head: number;
  power: number;
  efficiency: number;
  npsh: number;
  created_at: string;
}

// 选型参数
export interface SelectionParams {
  required_flow_rate: number;
  required_head: number;
  application_type: string;
  fluid_type: string;
  pump_type: string;
  preferred_power?: number;
}

// 选型结果
export interface SelectionResult {
  pump: Pump;
  performance_curves: PumpPerformanceCurve[];
  match_score: number;
  curve_head_at_required_flow: number;
  head_ratio: number;
  flow_ratio: number;
  efficiency_score: number;
  application_match: boolean;
  fluid_match: boolean;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// 订阅计划类型
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: {
    maxSelections: number | null;
    historyRetention: number;
    exportFormats: string[];
    supportPriority: string;
    apiAccess: boolean;
    maxUsers: number;
  };
  is_active: boolean;
}

// 使用统计
export interface UsageStats {
  user_id: string;
  selection_count: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}
