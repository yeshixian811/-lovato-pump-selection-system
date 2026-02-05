import { NextRequest, NextResponse } from "next/server";
import { pumpManager } from "@/storage/database";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const pumps = await pumpManager.getPumps({ limit: 10000 });

    // 准备数据
    const data = pumps.map((pump) => ({
      产品名称: pump.name,
      产品型号: pump.model,
      品牌: pump.brand,
      流量: pump.flowRate,
      扬程: pump.head,
      功率: pump.power,
      效率: pump.efficiency,
      转速: pump.speed,
      进口直径: pump.inletDiameter,
      出口直径: pump.outletDiameter,
      应用类型: pump.applicationType,
      描述: pump.description,
      价格: pump.price,
      创建时间: pump.createdAt,
    }));

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "产品库");

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // 返回文件
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=pump-products-${new Date().toISOString().split("T")[0]}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error exporting pumps:", error);
    return NextResponse.json(
      { error: "Failed to export pumps" },
      { status: 500 }
    );
  }
}
