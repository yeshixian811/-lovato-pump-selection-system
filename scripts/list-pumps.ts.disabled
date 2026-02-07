import { getDb } from "coze-coding-dev-sdk";

async function main() {
  const db = await getDb();

  console.log("查询所有水泵信息...\n");

  const result = await db.execute(`
    SELECT id, name, model, brand, pump_type, flow_rate, head, power, created_at
    FROM pumps
    ORDER BY created_at
  `);

  console.log(`总共 ${result.rows.length} 个水泵：\n`);
  
  result.rows.forEach((pump: any, index: number) => {
    console.log(`${index + 1}. ${pump.model} - ${pump.name}`);
    console.log(`   品牌: ${pump.brand}`);
    console.log(`   类型: ${pump.pump_type || '-'}`);
    console.log(`   流量: ${pump.flow_rate} m³/h`);
    console.log(`   扬程: ${pump.head} m`);
    console.log(`   功率: ${pump.power} kW`);
    console.log(`   创建时间: ${pump.created_at}`);
    console.log(`   ID: ${pump.id}`);
    console.log('');
  });
}

main().catch(console.error);
