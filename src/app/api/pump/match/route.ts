import { NextRequest, NextResponse } from 'next/server';
import { pumpManager } from '@/storage/database/pumpManager';

interface SelectionParams {
  required_flow_rate: number;
  required_head: number;
  application_type: string;
  fluid_type: string;
  pump_type: string;
  preferred_power?: number; // 可选参数
}

interface Pump {
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
}

// 计算水泵性能曲线上的扬程
// 使用二次曲线模型：H = shutOffHead - k * Q^2
// 其中 shutOffHead 是流量为0时的扬程，maxFlow 是最大流量
function calculateHeadAtFlow(pump: any, flowRate: number): number {
  const maxHead = parseFloat(pump.max_head);
  const maxFlow = parseFloat(pump.max_flow_rate);
  const minFlow = parseFloat(pump.min_flow_rate || 0);

  // 关断点扬程（流量为0时的扬程），通常是最大扬程的1.2-1.3倍
  const shutOffHead = maxHead * 1.25;

  // 计算曲线系数
  // 当 Q = maxFlow 时，H = 0（简化假设）
  // 0 = shutOffHead - k * maxFlow^2
  // k = shutOffHead / maxFlow^2
  const k = shutOffHead / Math.pow(maxFlow, 2);

  // 计算指定流量下的扬程
  const head = shutOffHead - k * Math.pow(flowRate, 2);

  // 确保扬程不为负
  return Math.max(0, head);
}

// 匹配度计算函数 - 参考格兰富选型算法
function calculateMatchScore(
  pump: any,
  params: SelectionParams
): number {
  let score = 0;
  const maxScore = 100;

  const requiredFlow = params.required_flow_rate;
  const requiredHead = params.required_head;
  
  const maxFlow = parseFloat(pump.max_flow_rate);
  const minFlow = parseFloat(pump.min_flow_rate || maxFlow * 0.3);
  const maxHead = parseFloat(pump.max_head);
  const minHead = parseFloat(pump.min_head || maxHead * 0.6);
  const efficiency = parseFloat(pump.efficiency);

  // 格兰富选型算法原则：
  // 1. 连续运行范围：工作点必须在[minFlow, maxFlow]范围内
  // 2. 性能曲线匹配：在需求流量处，曲线扬程 >= 需求扬程
  // 3. 最佳效率区间（BEP）：优先选择在最大流量60%-120%范围内运行的水泵
  // 4. 效率优先：在满足需求的前提下，优先选择效率高的水泵
  // 5. 合理余量：扬程余量控制在5%-20%之间

  // 步骤1：检查需求点是否在连续运行范围内
  if (requiredFlow < minFlow || requiredFlow > maxFlow) {
    // 超出连续运行范围，直接返回0分
    return 0;
  }
  // 满足连续运行范围，给20分基础分
  score += 20;

  // 步骤2：计算需求流量处的性能曲线扬程
  const curveHead = calculateHeadAtFlow(pump, requiredFlow);
  
  // 步骤3：性能曲线必须满足扬程要求
  if (curveHead < requiredHead) {
    // 曲线扬程小于需求扬程，无法满足要求，返回0分
    return 0;
  }
  
  // 步骤4：评估扬程匹配度（权重: 35%）
  // 格兰富推荐：扬程余量5%-20%为最佳选择
  const headRatio = curveHead / requiredHead;
  
  if (headRatio <= 1.05) {
    // 扬程余量0-5%，非常接近需求，最佳选择
    score += 35;
  } else if (headRatio <= 1.10) {
    // 扬程余量5-10%，优秀选择
    score += 33;
  } else if (headRatio <= 1.20) {
    // 扬程余量10-20%，良好选择（格兰富推荐范围）
    score += 30;
  } else if (headRatio <= 1.30) {
    // 扬程余量20-30%，可用但略高
    score += 22;
  } else if (headRatio <= 1.50) {
    // 扬程余量30-50%，可用但不推荐
    score += 12;
  } else {
    // 扬程余量>50%，过大，勉强可用
    score += 5;
  }

  // 步骤5：评估工作点是否在最佳效率区间（权重: 35%）
  // 格兰富最佳效率区间（BEP）：最大流量的60%-120%
  if (maxFlow > 0) {
    const flowRatio = requiredFlow / maxFlow;
    
    if (flowRatio >= 0.6 && flowRatio <= 1.2) {
      // 工作点在最佳效率区间内，最佳选择
      score += 35;
    } else if (flowRatio >= 0.5 && flowRatio <= 1.3) {
      // 工作点在允许运行区间内，良好选择
      score += 28;
    } else if (flowRatio >= 0.4 && flowRatio <= 1.4) {
      // 工作点在边缘运行区间，可用
      score += 18;
    } else {
      // 工作点超出推荐范围，勉强可用
      score += 8;
    }
  } else {
    // 无最大流量数据，默认给中等分数
    score += 20;
  }

  // 步骤6：效率值评分（权重: 10%）
  // 优先选择效率高的水泵
  if (efficiency >= 80) {
    // 效率极高，优秀
    score += 10;
  } else if (efficiency >= 75) {
    // 效率高，良好
    score += 8;
  } else if (efficiency >= 65) {
    // 效率中等，可用
    score += 5;
  } else {
    // 效率偏低，勉强可用
    score += 2;
  }

  // 步骤7：应用场景匹配（额外加分: +5分）
  const pumpApplications = pump.applications || [];
  const pumpApplication = pump.application_type || pump.applicationType;
  
  if (pumpApplications.includes(params.application_type) || 
      pumpApplication === params.application_type) {
    score += 5;
  }

  // 步骤8：流体类型匹配（额外加分: +3分）
  const pumpFluidTypes = pump.fluid_types || [];
  
  if (pumpFluidTypes.includes(params.fluid_type) ||
      pumpFluidTypes.includes('清水') && params.fluid_type.includes('水')) {
    score += 3;
  }

  return Math.min(Math.round(score * 10) / 10, maxScore);
}

export async function POST(request: NextRequest) {
  try {
    const params: SelectionParams = await request.json();

    // 验证参数
    if (!params.required_flow_rate || !params.required_head) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 使用 PumpManager 查询水泵
    const dbPumps = await pumpManager.getPumps({
      limit: 100,
      filters: {
        pumpType: params.pump_type === 'all' ? undefined : params.pump_type,
        applicationType: params.application_type,
      },
    });

    // 计算每个水泵的匹配度，并获取真实性能曲线数据
    const pumpsWithScore = await Promise.all(
      dbPumps.map(async (pump: any) => {
        // 解析基础数据
        const baseFlowRate = parseFloat(pump.flowRate);
        const baseHead = parseFloat(pump.head);
        
        // 基于性能曲线定义工作范围
        // baseFlowRate 和 baseHead 是实际的最大流量和最大扬程
        const maxFlow = baseFlowRate; // 实际最大流量
        const minFlow = baseFlowRate * 0.3; // 最小流量，通常为最大流量的30%
        
        const maxHead = baseHead; // 实际最大扬程
        const minHead = baseHead * 0.6; // 最小扬程，通常为最大扬程的60%
        
        // 获取真实的性能曲线数据
        const performancePoints = await pumpManager.getPumpPerformancePoints(pump.id);
        
        // 转换为前端期望的格式
        const formattedPump: any = {
          id: pump.id,
          model: pump.model,
          name: pump.name,
          brand: pump.brand,
          type: pump.pumpType,
          series: pump.pumpType,
          description: pump.description,
          
          // 性能曲线范围（用于选型匹配）
          max_flow_rate: maxFlow,
          min_flow_rate: minFlow,
          max_head: maxHead,
          min_head: minHead,
          
          // 真实性能曲线数据
          performance_curve: performancePoints,
          
          rated_power: parseFloat(pump.power),
          rated_speed: pump.speed || 2900,
          efficiency: pump.efficiency ? parseFloat(pump.efficiency) : 75,
          voltage: '380V',
          frequency: 50,
          current: 15,
          power_factor: 0.85,
          inlet_diameter: pump.inletDiameter || 50,
          outlet_diameter: pump.outletDiameter || 40,
          weight: pump.weight ? parseFloat(pump.weight) : 100,
          dimensions: '500x400x600',
          casing_material: pump.material || '铸铁',
          impeller_material: pump.material || '不锈钢',
          seal_type: '机械密封',
          protection_level: 'IP55',
          insulation_class: 'F',
          applications: pump.applicationType ? [pump.applicationType] : [],
          fluid_types: pump.material ? [pump.material] : [],
          max_temperature: pump.maxTemperature ? parseFloat(pump.maxTemperature) : 80,
          min_temperature: 0,
          max_viscosity: 10,
          price: pump.price ? parseFloat(pump.price) : 5000,
          currency: 'CNY',
          in_stock: true,
          stock_quantity: 10,
          image_url: pump.imageUrl || '',
          spec_sheet_url: '',
          manual_url: '',
          match_score: 0,
        };

        // 计算匹配度
        formattedPump.match_score = calculateMatchScore(formattedPump, params);

        return formattedPump;
      })
    );

    // 按匹配度排序
    pumpsWithScore.sort((a: any, b: any) => b.match_score - a.match_score);

    // 返回所有匹配的水泵（match_score > 0 表示符合选型要求）
    const filteredPumps = pumpsWithScore.filter((p: any) => p.match_score > 0);

    return NextResponse.json({
      pumps: filteredPumps,
      total: filteredPumps.length,
    });

  } catch (error: any) {
    console.error('Pump matching error:', error);
    return NextResponse.json(
      { error: error.message || '选型失败' },
      { status: 500 }
    );
  }
}
