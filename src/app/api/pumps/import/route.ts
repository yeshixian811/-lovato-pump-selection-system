import { NextRequest, NextResponse } from "next/server";
import { pumpManager } from "@/storage/database";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 读取文件
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "buffer" });

    // 获取第一个工作表
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // 转换为 JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 解析并保存数据
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i] as any;

        // 映射字段（支持中文和英文列名）
        const pumpData = {
          name: row["产品名称"] || row["name"] || row["Name"],
          model: row["产品型号"] || row["型号"] || row["model"] || row["Model"],
          brand: row["品牌"] || row["brand"] || row["Brand"],
          pumpType: row["泵类型"] || row["pumpType"] || row["Pump Type"] || row["类型"],
          material: row["材质"] || row["material"] || row["Material"],
          installationType: row["安装方式"] || row["installationType"] || row["Installation Type"],
          motorType: row["电机类型"] || row["motorType"] || row["Motor Type"],
          flowRate: row["流量"] || row["flowRate"] || row["Flow Rate"] || row["最大流量"] || row["额定流量"],
          head: row["扬程"] || row["head"] || row["Head"] || row["最大扬程"] || row["额定扬程"],
          maxFlow: row["最大流量"] || row["maxFlow"] || row["Max Flow"],
          maxHead: row["最大扬程"] || row["maxHead"] || row["Max Head"],
          power: row["功率"] || row["power"] || row["Power"] || row["额定功率"],
          efficiency: row["效率"] || row["efficiency"] || row["Efficiency"],
          speed: row["转速"] || row["speed"] || row["Speed"] || row["额定转速"],
          inletDiameter: row["进口直径"] || row["inletDiameter"] || row["Inlet Diameter"],
          outletDiameter: row["出口直径"] || row["outletDiameter"] || row["Outlet Diameter"],
          maxTemperature: row["最高温度"] || row["maxTemperature"] || row["Max Temperature"],
          maxPressure: row["最高压力"] || row["maxPressure"] || row["Max Pressure"],
          maxSolidSize: row["最大固体颗粒"] || row["maxSolidSize"] || row["Max Solid Size"],
          applicationType: row["应用类型"] || row["applicationType"] || row["Application Type"] || row["应用场景"],
          description: row["描述"] || row["description"] || row["Description"] || row["产品描述"],
          features: row["特性"] || row["features"] || row["Features"],
          price: row["价格"] || row["price"] || row["Price"],
          weight: row["重量"] || row["weight"] || row["Weight"],
          imageUrl: row["图片"] || row["imageUrl"] || row["Image URL"] || row["图片URL"],
        };

        await pumpManager.createPump(pumpData);
        results.success++;
      } catch (error) {
        console.error(`Error importing row ${i + 1}:`, error);
        results.failed++;
        results.errors.push(`第 ${i + 1} 行导入失败`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing pumps:", error);
    return NextResponse.json(
      { error: "Failed to import pumps" },
      { status: 500 }
    );
  }
}
