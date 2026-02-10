"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts";

interface PumpCurveChartProps {
  pumpFlow: string | number; // 水泵最大流量 m³/h
  pumpHead: string | number; // 水泵最大扬程 m
  pumpMaxFlow?: string | number | null; // 水泵最大流量 m³/h（可选）- 已废弃
  pumpMaxHead?: string | number | null; // 水泵最大扬程 m（可选）- 已废弃
  userFlow: string | number | null; // 用户需求流量 m³/h
  userHead: string | number | null; // 用户需求扬程 m
}

export default function PumpCurveChart({ pumpFlow, pumpHead, pumpMaxFlow, pumpMaxHead, userFlow, userHead }: PumpCurveChartProps) {
  // 解析数值
  const pumpFlowNum = parseFloat(String(pumpFlow));
  const pumpHeadNum = parseFloat(String(pumpHead));
  const userFlowNum = userFlow ? parseFloat(String(userFlow)) : 0;
  const userHeadNum = userHead ? parseFloat(String(userHead)) : 0;

  // 解析可选的最大流量和最大扬程
  const pumpMaxFlowNum = pumpMaxFlow ? parseFloat(String(pumpMaxFlow)) : null;
  const pumpMaxHeadNum = pumpMaxHead ? parseFloat(String(pumpMaxHead)) : null;

  // 生成模拟的 Q-H 曲线数据
  // 基于最大点生成性能曲线
  // 关断点扬程（Q=0时的扬程）是水泵性能曲线的数学模型参数
  // 使用二次曲线模型：H = shutOffHead - k * Q^2
  // 当 Q = maxFlow 时，H = 0（最大流量点扬程为0）
  const generateCurveData = () => {
    const data = [];

    // pumpFlow 和 pumpHead 严格对应实际的最大流量和最大扬程
    const maxFlow = pumpFlowNum;
    const maxHead = pumpHeadNum;

    // 关断点扬程（Q=0时的扬程）= 实际最大扬程
    const shutOffHead = pumpMaxHeadNum || maxHead;

    // 按照用户要求：流量以0.1 m³/h为单位分配，扬程以0.1米为单位分配
    const flowStep = 0.1; // 流量步长 0.1 m³/h
    const headStep = 0.1; // 扬程步长 0.1 m

    // 使用二次曲线模型：H = shutOffHead - k * Q^2
    // 当 Q = maxFlow 时，H = 0
    // 0 = shutOffHead - k * maxFlow^2
    // k = shutOffHead / maxFlow^2
    const k = shutOffHead / (maxFlow * maxFlow);

    // 以流量为自变量，从0到最大流量，以0.1 m³/h为步长
    for (let flow = 0; flow <= maxFlow; flow += flowStep) {
      const head = shutOffHead - k * flow * flow;

      // 确保扬程不为负
      const adjustedHead = Math.max(0, head);

      // 将扬程四舍五入到0.1米精度
      const roundedHead = Math.round(adjustedHead / headStep) * headStep;

      data.push({
        flow: Number(flow.toFixed(1)),
        head: Number(roundedHead.toFixed(1)),
      });
    }
    return data;
  };

  const curveData = generateCurveData();

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={curveData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="flow"
            label={{ value: "流量 (m³/h)", position: "insideBottom", offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: "扬程 (m)", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [value, name === "head" ? "扬程 (m)" : name]}
            labelFormatter={(label) => `流量: ${label} m³/h`}
          />
          <Legend />

          {/* 水泵 Q-H 曲线 */}
          <Line
            type="monotone"
            dataKey="head"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="性能曲线"
          />

          {/* 水泵最大点（最大流量点） */}
          <ReferenceDot
            x={pumpFlowNum}
            y={pumpHeadNum}
            r={5}
            fill="#16a34a"
            stroke="white"
            strokeWidth={1}
            label={{ value: "最大点", position: "top", offset: 5, fontSize: 12, fill: "#16a34a" }}
            isFront={true}
          />

          {/* 用户需求工作点 */}
          <ReferenceDot
            x={userFlowNum}
            y={userHeadNum}
            r={5}
            fill="#dc2626"
            stroke="white"
            strokeWidth={1}
            label={{ value: "需求点", position: "top", offset: 5, fontSize: 12, fill: "#dc2626" }}
            isFront={true}
          />

          {/* 恒压参考线 - 10米 */}
          <ReferenceLine
            y={10}
            stroke="#8b5cf6"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            label={{ value: "10m", position: "right", fontSize: 10, fill: "#8b5cf6" }}
          />

          {/* 恒压参考线 - 8米 */}
          <ReferenceLine
            y={8}
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            label={{ value: "8m", position: "right", fontSize: 10, fill: "#f59e0b" }}
          />

          {/* 恒压参考线 - 6米 */}
          <ReferenceLine
            y={6}
            stroke="#ec4899"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            label={{ value: "6m", position: "right", fontSize: 10, fill: "#ec4899" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
