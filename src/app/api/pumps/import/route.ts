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

        // 映射字段
        const pumpData = {
          name: row["产品名称"] || row["name"],
          model: row["产品型号"] || row["model"],
          brand: row["品牌"] || row["brand"],
          flowRate: row["流量"] || row["flowRate"],
          head: row["扬程"] || row["head"],
          power: row["功率"] || row["power"],
          efficiency: row["效率"] || row["efficiency"],
          speed: row["转速"] || row["speed"],
          inletDiameter: row["进口直径"] || row["inletDiameter"],
          outletDiameter: row["出口直径"] || row["outletDiameter"],
          applicationType: row["应用类型"] || row["applicationType"],
          description: row["描述"] || row["description"],
          price: row["价格"] || row["price"],
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
