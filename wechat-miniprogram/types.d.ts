// TypeScript 类型定义

interface IAppOption {
  globalData: {
    userInfo: any;
    favorites: any[];
    apiUrl: string;
  };
  onLaunch(options: any): void;
  onShow(options: any): void;
  onHide(): void;
  onError(error: any): void;
  checkUpdate(): void;
  loadFavorites(): void;
  saveFavorites(): void;
  addFavorite(product: any): boolean;
  removeFavorite(productId: number): boolean;
  isFavorite(productId: number): boolean;
  initCloud(): void;
}

// 水泵产品类型
interface PumpProduct {
  id: number;
  model: string;
  name: string;
  brand: string;
  type: string;
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
  price: number | null;
  currency: string | null;
  in_stock: boolean;
  stock_quantity: number;
  image_url: string;
  spec_sheet_url: string;
  manual_url: string;
  match_score: number;
  performance_curve?: Array<{
    flowRate: number;
    head: number;
    power?: number;
    efficiency?: number;
  }>;
}

// 选型参数
interface SelectionParams {
  required_flow_rate: number;
  required_head: number;
  application_type: string;
  fluid_type: string;
  pump_type: string;
}

// API 响应
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 性能曲线数据点
interface CurvePoint {
  flowRate: number;
  head: number;
  efficiency?: number;
  power?: number;
  npshr?: number;
}

// 性能曲线配置
interface CurveConfig {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: CurvePoint[];
  referenceLine?: {
    value: number;
    label: string;
    color: string;
  };
  intersectionPoints?: Array<{
    flowRate: number;
    head: number;
    label: string;
  }>;
}

// 图表主题
interface EChartsTheme {
  color: string[];
  backgroundColor: string;
  textStyle: {
    color: string;
    fontFamily: string;
  };
  title: {
    textStyle: {
      color: string;
    };
  };
  grid: {
    borderColor: string;
  };
}

// 页面数据
interface PageData {
  loading: boolean;
  products: PumpProduct[];
  selectedProduct: PumpProduct | null;
  selectionParams: SelectionParams;
  searchKeyword: string;
  filterSeries: string;
  sortBy: string;
}

// 组件数据
interface ComponentData {
  loading: boolean;
  chartConfig: CurveConfig | null;
}
