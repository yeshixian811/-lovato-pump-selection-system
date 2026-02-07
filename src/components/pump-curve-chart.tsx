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

    // pumpFlow 和 pumpHead 现在是实际的最大流量和最大扬程
    const maxFlow = pumpFlowNum;
    const maxHead = pumpHeadNum;

    // 估计关闭扬程（Q=0时的扬程）通常为最大扬程的 1.2-1.3 倍
    const shutOffHead = pumpMaxHeadNum || maxHead * 1.25;

    // 按照用户要求：流量以0.1 m³/h为单位分配，扬程以0.1米为单位分配
    const flowStep = 0.1; // 流量步长 0.1 m³/h
    const headStep = 0.1; // 扬程步长 0.1 m

    // 使用二次函数生成曲线：H = a*x^2 + b*x + c
    // 其中 x = Q / Q_max（相对流量）
    // 条件：
    // 1. Q=0 时，H = shutOffHead（关闭扬程）
    // 2. Q=Q_max 时，H = maxHead（最大扬程点）
    // 3. Q=maxFlow 时，H = 0（最大流量点，这里 maxFlow = Q_max）
    const H_max = maxHead;
    const Q_max_base = maxFlow;
    const Q_max = maxFlow;
    const H_0 = shutOffHead;

    // 计算二次函数系数
    // H = a*x^2 + b*x + c
    // 其中 x = Q / Q_max
    // 在 x=0 时：c = H_0
    // 在 x=1 时：a + b + c = H_max
    // 由于 Q_max = maxFlow，曲线在 Q=Q_max 时扬程为0，所以：
    // a*1^2 + b*1 + c = 0
    // a + b + c = 0

    const c = H_0;

    // 解方程组：
    // a + b + c = H_max
    // a + b + c = 0
    // 这两个方程矛盾，所以我们需要调整条件
    // 实际上，最大流量点（Q=Q_max）的扬程不应该为0，而应该是某个值
    // 让我们假设最大流量点的扬程为 0（这是简化的假设）
    // 那么我们有：
    // a + b + c = H_max (在某个中间点，比如 Q=Q_max*0.6)
    // a*(1)^2 + b*(1) + c = 0 (在 Q=Q_max)

    // 让我们使用简化的三次函数或分段函数
    // 这里使用分段线性近似：
    // 在 0 <= Q <= Q_max*0.6: 扬程线性下降
    // 在 Q_max*0.6 < Q <= Q_max: 扬程快速下降到0

    // 以流量为自变量，从0到最大流量，以0.1 m³/h为步长
    for (let flow = 0; flow <= maxFlow; flow += flowStep) {
      const x = flow / maxFlow; // 相对流量
      let head: number;

      if (x <= 0.6) {
        // 在最大流量60%以下：扬程线性下降
        head = shutOffHead - (shutOffHead - maxHead) * (x / 0.6);
      } else {
        // 在最大流量60%以上：扬程快速下降到0
        head = maxHead * (1 - (x - 0.6) / 0.4);
      }

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
