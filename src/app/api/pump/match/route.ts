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
  price: number;
  currency: string;
  in_stock: boolean;
  stock_quantity: number;
  image_url: string;
  spec_sheet_url: string;
  manual_url: string;
  match_score: number;
}

// 计算水泵性能曲线上的扬程
// 使用二次曲线模型：H = H_max - k * Q^2
function calculateHeadAtFlow(pump: any, flowRate: number): number {
  const maxHead = parseFloat(pump.max_head);
  const maxFlow = parseFloat(pump.max_flow_rate);
  const minFlow = parseFloat(pump.min_flow_rate || 0);
  
  // 关断点扬程（流量为0时的扬程），通常是最大扬程的1.2-1.3倍
  const shutOffHead = maxHead * 1.25;
  
  // 计算曲线系数
  // 当 Q = maxFlow 时，H = minHead
  // minHead = shutOffHead - k * maxFlow^2
  // k = (shutOffHead - minHead) / maxFlow^2
  const k = (shutOffHead - maxHead) / Math.pow(maxFlow, 2);
  
  // 计算指定流量下的扬程
  const head = shutOffHead - k * Math.pow(flowRate, 2);
  
  return Math.max(0, head);
}

// 匹配度计算函数 - 基于三线交叉点选型，遵循选大不选小原则
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

  // 三线交叉点选型原则：
  // 1. 流量参考线：用户需求流量
  // 2. 扬程参考线：用户需求扬程
  // 3. 性能曲线：水泵的H-Q性能曲线
  // 选型要求：在需求流量处，性能曲线扬程 >= 需求扬程（选大不选小）

  // 1. 检查需求流量是否在工作范围内 (权重: 40%)
  const inFlowRange = requiredFlow >= minFlow && requiredFlow <= maxFlow;
  
  if (!inFlowRange) {
    // 流量超出工作范围，直接返回0分
    return 0;
  }
  
  // 流量在范围内，给40分
  score += 40;

  // 2. 计算需求流量处的性能曲线扬程 (权重: 60%)
  const curveHead = calculateHeadAtFlow(pump, requiredFlow);
  
  // 遵循选大不选小原则
  // 曲线扬程必须 >= 需求扬程
  if (curveHead < requiredHead) {
    // 曲线扬程小于需求扬程，无法满足要求，返回0分
    return 0;
  }
  
  // 曲线扬程 >= 需求扬程，计算超出程度
  const headRatio = curveHead / requiredHead;
  
  // 理想情况：曲线扬程 = 需求扬程 (100%)
  // 允许范围：曲线扬程在需求扬程的100%-150%之间
  if (headRatio <= 1.05) {
    // 曲线扬程非常接近需求扬程（±5%），最佳选择
    score += 60;
  } else if (headRatio <= 1.15) {
    // 曲线扬程略微超出（5%-15%），优秀
    score += 55;
  } else if (headRatio <= 1.30) {
    // 曲线扬程超出（15%-30%），良好
    score += 45;
  } else if (headRatio <= 1.50) {
    // 曲线扬程较大超出（30%-50%），可用但效率可能降低
    score += 30;
  } else {
    // 曲线扬程严重超出（>50%），可用但不推荐
    score += 15;
  }

  // 3. 应用场景匹配 (额外加分: +5分)
  const pumpApplications = pump.applications || [];
  const pumpApplication = pump.application_type || pump.applicationType;
  
  if (pumpApplications.includes(params.application_type) || 
      pumpApplication === params.application_type) {
    score += 5;
  }

  // 4. 流体类型匹配 (额外加分: +3分)
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

    // 计算每个水泵的匹配度
    const pumpsWithScore = dbPumps.map((pump: any) => {
      // 解析基础数据
      const baseFlowRate = parseFloat(pump.flowRate);
      const baseHead = parseFloat(pump.head);
      
      // 基于性能曲线定义工作范围
      // 最大流量：通常为额定流量的1.5-2倍
      const maxFlow = baseFlowRate * 1.8;
      // 最小流量：通常为额定流量的0.3-0.5倍
      const minFlow = baseFlowRate * 0.4;
      
      // 最大扬程：关断点扬程（流量为0时）
      const maxHead = baseHead * 1.25;
      // 最小扬程：最大流量点的扬程
      const minHead = baseHead * 0.65;
      
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
        
        // 额定参数（仅作为性能参数图形的参考）
        rated_flow_rate: baseFlowRate,
        rated_head: baseHead,
        
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
    });

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
