import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SelectionParams {
  required_flow_rate: number;
  required_head: number;
  application_type: string;
  fluid_type: string;
  pump_type: string;
  preferred_power: number;
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
  if (params.required_flow_rate >= pump.min_flow_rate &&
      params.required_flow_rate <= pump.max_flow_rate) {
    // 完全在范围内
    const flowRange = pump.max_flow_rate - pump.min_flow_rate;
    const flowPosition = (params.required_flow_rate - pump.min_flow_rate) / flowRange;
    // 优选在流量范围中间的产品
    const flowScore = 35 * (1 - Math.abs(flowPosition - 0.5) * 0.5);
    score += flowScore;
  } else {
    // 超出范围，给予部分分数
    if (params.required_flow_rate < pump.min_flow_rate) {
      const diff = pump.min_flow_rate - params.required_flow_rate;
      score += Math.max(0, 35 - (diff / pump.min_flow_rate) * 20);
    } else {
      const diff = params.required_flow_rate - pump.max_flow_rate;
      score += Math.max(0, 35 - (diff / pump.max_flow_rate) * 20);
    }
  }

  // 2. 扬程匹配 (权重: 35%)
  if (params.required_head >= pump.min_head &&
      params.required_head <= pump.max_head) {
    // 完全在范围内
    const headRange = pump.max_head - pump.min_head;
    const headPosition = (params.required_head - pump.min_head) / headRange;
    const headScore = 35 * (1 - Math.abs(headPosition - 0.5) * 0.5);
    score += headScore;
  } else {
    // 超出范围，给予部分分数
    if (params.required_head < pump.min_head) {
      const diff = pump.min_head - params.required_head;
      score += Math.max(0, 35 - (diff / pump.min_head) * 20);
    } else {
      const diff = params.required_head - pump.max_head;
      score += Math.max(0, 35 - (diff / pump.max_head) * 20);
    }
  }

  // 3. 功率匹配 (权重: 15%)
  const powerDiff = Math.abs(pump.rated_power - params.preferred_power);
  const powerScore = Math.max(0, 15 - (powerDiff / params.preferred_power) * 10);
  score += powerScore;

  // 4. 应用场景匹配 (权重: 10%)
  if (pump.applications && Array.isArray(pump.applications)) {
    if (pump.applications.includes(params.application_type)) {
      score += 10;
    } else {
      // 部分匹配
      score += 5;
    }
  }

  // 5. 流体类型匹配 (权重: 5%)
  if (pump.fluid_types && Array.isArray(pump.fluid_types)) {
    if (pump.fluid_types.includes(params.fluid_type)) {
      score += 5;
    } else {
      // 部分匹配
      score += 2;
    }
  }

  return Math.min(Math.round(score * 10) / 10, maxScore);
}

// 执行 SQL 查询
function executeSQLQuery(sql: string): any[] {
  try {
    const projectRoot = process.env.COZE_WORKSPACE_PATH || process.cwd();
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'lovato_pump_selection';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';

    const command = `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -A -F '|' -c "${sql}"`;
    const output = execSync(command, { encoding: 'utf-8' });

    if (!output.trim()) {
      return [];
    }

    const rows = output.trim().split('\n');
    return rows.map(row => {
      const values = row.split('|');
      return values;
    });
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw error;
  }
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

    // 构建 SQL 查询
    let sql = `
      SELECT
        id, model, name, brand, type, series, description,
        max_flow_rate, min_flow_rate, max_head, min_head,
        rated_power, rated_speed, efficiency,
        voltage, frequency, current, power_factor,
        inlet_diameter, outlet_diameter, weight, dimensions,
        casing_material, impeller_material, seal_type,
        protection_level, insulation_class,
        applications, fluid_types,
        max_temperature, min_temperature, max_viscosity,
        price, currency, in_stock, stock_quantity,
        image_url, spec_sheet_url, manual_url
      FROM pumps
      WHERE is_active = true
    `;

    // 添加类型筛选
    if (params.pump_type) {
      sql += ` AND type = '${params.pump_type}'`;
    }

    // 添加库存筛选
    sql += ` AND in_stock = true`;

    // 排序：按流量范围匹配度
    sql += ` ORDER BY ABS(max_flow_rate - ${params.required_flow_rate}) ASC`;

    // 限制结果数量
    sql += ` LIMIT 20`;

    // 执行查询
    const rows = executeSQLQuery(sql);

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        pumps: [],
        total: 0,
      });
    }

    // 转换数据并计算匹配度
    const pumps: Pump[] = rows.map((row: any[], index: number) => {
      const pump: any = {
        id: parseInt(row[0]),
        model: row[1],
        name: row[2],
        brand: row[3],
        type: row[4],
        series: row[5],
        description: row[6],
        max_flow_rate: parseFloat(row[7]) || 0,
        min_flow_rate: parseFloat(row[8]) || 0,
        max_head: parseFloat(row[9]) || 0,
        min_head: parseFloat(row[10]) || 0,
        rated_power: parseFloat(row[11]) || 0,
        rated_speed: parseInt(row[12]) || 0,
        efficiency: parseFloat(row[13]) || 0,
        voltage: row[14],
        frequency: parseInt(row[15]) || 0,
        current: parseFloat(row[16]) || 0,
        power_factor: parseFloat(row[17]) || 0,
        inlet_diameter: parseFloat(row[18]) || 0,
        outlet_diameter: parseFloat(row[19]) || 0,
        weight: parseFloat(row[20]) || 0,
        dimensions: row[21],
        casing_material: row[22],
        impeller_material: row[23],
        seal_type: row[24],
        protection_level: row[25],
        insulation_class: row[26],
        applications: row[27] ? row[27].split(',') : [],
        fluid_types: row[28] ? row[28].split(',') : [],
        max_temperature: parseFloat(row[29]) || 0,
        min_temperature: parseFloat(row[30]) || 0,
        max_viscosity: parseFloat(row[31]) || 0,
        price: parseFloat(row[32]) || 0,
        currency: row[33],
        in_stock: row[34] === 't',
        stock_quantity: parseInt(row[35]) || 0,
        image_url: row[36],
        spec_sheet_url: row[37],
        manual_url: row[38],
      };

      // 计算匹配度
      pump.match_score = calculateMatchScore(pump, params);

      return pump;
    });

    // 按匹配度排序
    pumps.sort((a, b) => b.match_score - a.match_score);

    // 只返回匹配度 > 50 的结果
    const filteredPumps = pumps.filter(p => p.match_score > 50);

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
