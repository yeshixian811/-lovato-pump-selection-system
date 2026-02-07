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

// 匹配度计算函数
function calculateMatchScore(
  pump: any,
  params: SelectionParams
): number {
  let score = 0;
  const maxScore = 100;

  // 1. 流量匹配 (权重: 35%)
  const minFlow = parseFloat(pump.min_flow_rate || pump.flowRate);
  const maxFlow = parseFloat(pump.max_flow_rate || pump.maxFlow || pump.flowRate * 1.5);
  
  if (params.required_flow_rate >= minFlow && params.required_flow_rate <= maxFlow) {
    // 完全在范围内
    const flowRange = maxFlow - minFlow;
    const flowPosition = (params.required_flow_rate - minFlow) / flowRange;
    const flowScore = 35 * (1 - Math.abs(flowPosition - 0.5) * 0.5);
    score += flowScore;
  } else {
    // 超出范围，给予部分分数
    if (params.required_flow_rate < minFlow) {
      const diff = minFlow - params.required_flow_rate;
      score += Math.max(0, 35 - (diff / minFlow) * 20);
    } else {
      const diff = params.required_flow_rate - maxFlow;
      score += Math.max(0, 35 - (diff / maxFlow) * 20);
    }
  }

  // 2. 扬程匹配 (权重: 35%)
  const minHead = parseFloat(pump.min_head || pump.head);
  const maxHead = parseFloat(pump.max_head || pump.maxHead || pump.head * 1.3);
  
  if (params.required_head >= minHead && params.required_head <= maxHead) {
    const headRange = maxHead - minHead;
    const headPosition = (params.required_head - minHead) / headRange;
    const headScore = 35 * (1 - Math.abs(headPosition - 0.5) * 0.5);
    score += headScore;
  } else {
    if (params.required_head < minHead) {
      const diff = minHead - params.required_head;
      score += Math.max(0, 35 - (diff / minHead) * 20);
    } else {
      const diff = params.required_head - maxHead;
      score += Math.max(0, 35 - (diff / maxHead) * 20);
    }
  }

  // 3. 功率匹配 (权重: 15%) - 可选
  if (params.preferred_power && params.preferred_power > 0) {
    const ratedPower = parseFloat(pump.power || pump.rated_power);
    const powerDiff = Math.abs(ratedPower - params.preferred_power);
    const powerScore = Math.max(0, 15 - (powerDiff / params.preferred_power) * 10);
    score += powerScore;
  } else {
    // 如果没有提供功率偏好，给予部分分数
    score += 7.5;
  }

  // 4. 应用场景匹配 (权重: 10%)
  const pumpApplication = pump.application_type || pump.applicationType;
  if (pumpApplication && pumpApplication === params.application_type) {
    score += 10;
  } else {
    score += 5;
  }

  // 5. 流体类型匹配 (权重: 5%)
  const pumpFluid = pump.material; // 简化：使用材质作为流体类型参考
  if (pumpFluid) {
    score += 5;
  } else {
    score += 2;
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
      // 转换为前端期望的格式
      const formattedPump: any = {
        id: pump.id,
        model: pump.model,
        name: pump.name,
        brand: pump.brand,
        type: pump.pumpType,
        series: pump.pumpType,
        description: pump.description,
        max_flow_rate: parseFloat(pump.maxFlow || pump.flowRate) * 1.5,
        min_flow_rate: parseFloat(pump.flowRate) * 0.5,
        max_head: parseFloat(pump.maxHead || pump.head) * 1.3,
        min_head: parseFloat(pump.head) * 0.7,
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

    // 只返回匹配度 > 50 的结果
    const filteredPumps = pumpsWithScore.filter((p: any) => p.match_score > 50);

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
