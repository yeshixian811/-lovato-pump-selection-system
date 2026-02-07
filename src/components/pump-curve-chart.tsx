"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";

interface PumpCurveChartProps {
  pumpFlow: string; // 水泵最大流量 m³/h
  pumpHead: string; // 水泵最大扬程 m
  pumpMaxFlow?: string | null; // 水泵最大流量 m³/h（可选）- 已废弃
  pumpMaxHead?: string | null; // 水泵最大扬程 m（可选）- 已废弃
  userFlow: string; // 用户需求流量 m³/h
  userHead: string; // 用户需求扬程 m
}

export default function PumpCurveChart({ pumpFlow, pumpHead, pumpMaxFlow, pumpMaxHead, userFlow, userHead }: PumpCurveChartProps) {
  // 解析数值
  const pumpFlowNum = parseFloat(pumpFlow);
  const pumpHeadNum = parseFloat(pumpHead);
  const userFlowNum = parseFloat(userFlow);
  const userHeadNum = parseFloat(userHead);

  // 解析可选的最大流量和最大扬程
  const pumpMaxFlowNum = pumpMaxFlow ? parseFloat(pumpMaxFlow) : null;
  const pumpMaxHeadNum = pumpMaxHead ? parseFloat(pumpMaxHead) : null;

  // 生成模拟的 Q-H 曲线数据
  // 基于最大点生成性能曲线
  // 关闭扬程（Q=0）约为最大扬程的 1.3 倍
  // 如果有最大流量和最大扬程参数，则使用它们；否则使用默认估计值
  const generateCurveData = () => {
    const data = [];

    // 确定最大流量（优先使用提供的参数，否则估计为 1.5 倍最大流量）
    const maxFlow = pumpMaxFlowNum || pumpFlowNum * 1.5;

    // 确定关闭扬程（Q=0）
    // 如果有最大扬程参数，使用它；否则估计为 1.3 倍最大扬程
    const shutOffHead = pumpMaxHeadNum || pumpHeadNum * 1.3;

    // 按照用户要求：流量以0.1 m³/h为单位分配，扬程以0.1米为单位分配
    const flowStep = 0.1; // 流量步长 0.1 m³/h
    const headStep = 0.1; // 扬程步长 0.1 m

    // 使用二次函数生成曲线：H = a*x^2 + b*x + c
    // 其中 x = Q / Q_max（相对流量）
    // 条件：
    // 1. Q=0 时，H = shutOffHead（关闭扬程）
    // 2. Q=Q_max 时，H = H_max（最大点）
    // 3. Q=maxFlow 时，H = 0（最大流量点）
    const H_max = pumpHeadNum;
    const Q_max_base = pumpFlowNum;
    const Q_max = maxFlow;
    const H_0 = shutOffHead;

    // 计算二次函数系数
    // H = a*x^2 + b*x + c
    // 其中 x = Q / Q_rated
    // 在 x=0 时：c = H_0
    // 在 x=1 时：a + b + c = H_rated
    // 在 x=Q_max/Q_rated 时：a*(Q_max/Q_rated)^2 + b*(Q_max/Q_rated) + c = 0

    const c = H_0;
    const x_max = Q_max / Q_rated;

    // 解方程组：
    // a + b + c = H_rated
    // a*x_max^2 + b*x_max + c = 0

    // 从第一个方程：b = H_rated - a - c
    // 代入第二个方程：a*x_max^2 + (H_rated - a - c)*x_max + c = 0
    // a*x_max^2 - a*x_max + H_max*x_max - c*x_max + c = 0
    // a*(x_max^2 - x_max) = c*x_max - H_max*x_max - c
    // a = (c*x_max - H_max*x_max - c) / (x_max^2 - x_max)

    const a = (c * x_max - H_max * x_max - c) / (x_max * x_max - x_max);
    const b = H_max - a - c;

    // 以流量为自变量，从0到最大流量，以0.1 m³/h为步长
    for (let flow = 0; flow <= maxFlow; flow += flowStep) {
      const x = flow / Q_max_base; // 相对流量
      let head = a * x * x + b * x + c;

      // 确保扬程不为负
      head = Math.max(0, head);

      // 将扬程四舍五入到0.1米精度
      const roundedHead = Math.round(head / headStep) * headStep;

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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
