"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";

interface PumpCurveChartProps {
  pumpFlow: string; // 水泵流量 m³/h
  pumpHead: string; // 水泵扬程 m
  userFlow: string; // 用户需求流量 m³/h
  userHead: string; // 用户需求扬程 m
}

export default function PumpCurveChart({ pumpFlow, pumpHead, userFlow, userHead }: PumpCurveChartProps) {
  // 解析数值
  const pumpFlowNum = parseFloat(pumpFlow);
  const pumpHeadNum = parseFloat(pumpHead);
  const userFlowNum = parseFloat(userFlow);
  const userHeadNum = parseFloat(userHead);

  // 生成模拟的 Q-H 曲线数据
  // 水泵的流量-扬程曲线通常呈下降趋势
  const generateCurveData = () => {
    const data = [];
    // 从0到1.5倍标称流量
    const maxFlow = pumpFlowNum * 1.5;
    const step = maxFlow / 20;

    for (let flow = 0; flow <= maxFlow; flow += step) {
      // 使用二次函数模拟曲线：H = H_max * (1 - (Q / Q_max)^2)
      // 这是一个简化的模型，实际水泵曲线需要更复杂的公式
      let head = pumpHeadNum * (1 - 0.3 * (flow / pumpFlowNum) - 0.7 * Math.pow(flow / pumpFlowNum, 2));

      // 确保扬程不为负
      head = Math.max(0, head);

      data.push({
        flow: Number(flow.toFixed(2)),
        head: Number(head.toFixed(2)),
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

          {/* 水泵工作点 */}
          <ReferenceDot
            x={pumpFlowNum}
            y={pumpHeadNum}
            r={6}
            fill="#16a34a"
            stroke="white"
            strokeWidth={2}
            label={{ value: "水泵点", position: "top", offset: 5 }}
          />

          {/* 用户需求工作点 */}
          <ReferenceDot
            x={userFlowNum}
            y={userHeadNum}
            r={6}
            fill="#dc2626"
            stroke="white"
            strokeWidth={2}
            label={{ value: "需求点", position: "top", offset: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
