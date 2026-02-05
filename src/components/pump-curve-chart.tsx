"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";

interface PumpCurveChartProps {
  pumpFlow: string; // 水泵额定流量 m³/h
  pumpHead: string; // 水泵额定扬程 m
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
  // 基于额定点生成性能曲线
  // 关闭扬程（Q=0）约为额定点扬程的 1.3 倍
  // 最大流量约为额定点流量的 1.5 倍
  const generateCurveData = () => {
    const data = [];
    // 从0到1.5倍额定流量
    const maxFlow = pumpFlowNum * 1.5;
    const step = maxFlow / 30;

    // 使用二次函数生成曲线：H = a*x^2 + b*x + c
    // 其中 x = Q / Q_rated（相对流量）
    // 条件：
    // 1. Q=0 时，H = 1.3 * H_rated（关闭扬程）
    // 2. Q=Q_rated 时，H = H_rated（额定点）
    // 3. Q=1.5*Q_rated 时，H = 0（最大流量点）
    const H_rated = pumpHeadNum;
    const a = -1.1333 * H_rated;
    const b = 0.8333 * H_rated;
    const c = 1.3 * H_rated;

    for (let flow = 0; flow <= maxFlow; flow += step) {
      const x = flow / pumpFlowNum; // 相对流量
      let head = a * x * x + b * x + c;

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

          {/* 水泵额定点（最佳工作点） */}
          <ReferenceDot
            x={pumpFlowNum}
            y={pumpHeadNum}
            r={6}
            fill="#16a34a"
            stroke="white"
            strokeWidth={2}
            label={{ value: "额定点", position: "top", offset: 5 }}
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
