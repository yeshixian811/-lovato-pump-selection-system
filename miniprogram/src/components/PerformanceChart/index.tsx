import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import * as echarts from '../../../components/ec-canvas/echarts'
import { PumpPerformanceCurve } from '@/types'
import './index.scss'

interface Props {
  data: PumpPerformanceCurve[]
  requiredFlowRate: number
  requiredHead: number
  maxFlowRate: number
  maxHead: number
  pumpName?: string
}

interface State {
  ec: any
}

let chart: any = null

export default class PerformanceChart extends Component<Props, State> {
  state: State = {
    ec: {
      onInit: this.initChart.bind(this),
    },
  }

  componentDidMount() {
    // 延迟加载，确保组件完全挂载
    setTimeout(() => {
      this.initChart(this.getEcCanvasNode())
    }, 100)
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.requiredFlowRate !== this.props.requiredFlowRate ||
      prevProps.requiredHead !== this.props.requiredHead
    ) {
      this.updateChart()
    }
  }

  componentWillUnmount() {
    if (chart) {
      chart.dispose()
      chart = null
    }
  }

  getEcCanvasNode = () => {
    // 这里需要获取 ec-canvas 组件实例
    return null
  }

  initChart = (canvas: any, width: number, height: number) => {
    if (!canvas) {
      return
    }

    chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: Taro.getSystemInfoSync().pixelRatio,
    })

    this.updateChart()
  }

  updateChart = () => {
    if (!chart) {
      return
    }

    const { data, requiredFlowRate, requiredHead, maxFlowRate, maxHead } = this.props

    // 准备数据
    const flowData = data.map((item) => item.flow_rate)
    const headData = data.map((item) => item.head)

    // 计算需求流量处的曲线扬程
    const curveHeadAtRequiredFlow = this.calculateHeadAtFlow(requiredFlowRate, data)

    // 配置图表
    const option = {
      backgroundColor: '#ffffff',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (params: any) => {
          const param = params[0]
          return `
            流量: ${param.value[0]} m³/h<br/>
            扬程: ${param.value[1]} m
          `
        },
      },
      grid: {
        left: '10%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: '流量 (m³/h)',
        nameTextStyle: {
          fontSize: 12,
          color: '#6b7280',
        },
        axisLabel: {
          fontSize: 10,
          color: '#9ca3af',
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        splitLine: {
          show: false,
        },
        min: 0,
        max: Math.ceil(maxFlowRate * 1.1),
      },
      yAxis: {
        type: 'value',
        name: '扬程 (m)',
        nameTextStyle: {
          fontSize: 12,
          color: '#6b7280',
        },
        axisLabel: {
          fontSize: 10,
          color: '#9ca3af',
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
          },
        },
        min: 0,
        max: Math.ceil(maxHead * 1.1),
      },
      series: [
        // 性能曲线
        {
          name: '性能曲线',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: '#2563eb',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(37, 99, 235, 0.3)' },
                { offset: 1, color: 'rgba(37, 99, 235, 0.05)' },
              ],
            },
          },
          data: data.map((item) => [item.flow_rate, item.head]),
        },
        // 需求点（流量参考线）
        {
          name: '需求流量',
          type: 'line',
          symbol: 'none',
          itemStyle: {
            color: '#ef4444',
          },
          lineStyle: {
            type: 'dashed',
            width: 1,
          },
          data: [
            [requiredFlowRate, 0],
            [requiredFlowRate, curveHeadAtRequiredFlow],
          ],
        },
        // 需求点（扬程参考线）
        {
          name: '需求扬程',
          type: 'line',
          symbol: 'none',
          itemStyle: {
            color: '#f59e0b',
          },
          lineStyle: {
            type: 'dashed',
            width: 1,
          },
          data: [
            [0, requiredHead],
            [requiredFlowRate, requiredHead],
          ],
        },
        // 需求点标记
        {
          name: '需求点',
          type: 'scatter',
          symbolSize: 12,
          itemStyle: {
            color: '#10b981',
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          data: [[requiredFlowRate, curveHeadAtRequiredFlow]],
        },
        // 实际需求点标记
        {
          name: '实际需求',
          type: 'scatter',
          symbolSize: 12,
          itemStyle: {
            color: '#ef4444',
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          data: [[requiredFlowRate, requiredHead]],
        },
      ],
    }

    chart.setOption(option)
  }

  // 计算需求流量处的曲线扬程
  calculateHeadAtFlow = (
    flowRate: number,
    data: PumpPerformanceCurve[]
  ): number => {
    if (data.length === 0) return 0

    // 找到最接近的数据点
    let closestPoint = data[0]
    let minDiff = Math.abs(flowRate - data[0].flow_rate)

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(flowRate - data[i].flow_rate)
      if (diff < minDiff) {
        minDiff = diff
        closestPoint = data[i]
      }
    }

    return closestPoint.head
  }

  render() {
    const { pumpName } = this.props
    const curveHeadAtRequiredFlow = this.calculateHeadAtFlow(
      this.props.requiredFlowRate,
      this.props.data
    )

    const headRatio = curveHeadAtRequiredFlow / this.props.requiredHead

    return (
      <View className='performance-chart'>
        <View className='chart-header'>
          <Text className='chart-title'>{pumpName || '性能曲线'}</Text>
        </View>

        <View className='chart-container'>
          <ec-canvas id='mychart-dom-pie' canvas-id='mychart-pie' ec={this.state.ec}></ec-canvas>
        </View>

        <View className='chart-legend'>
          <View className='legend-item'>
            <View className='legend-dot legend-dot--curve'></View>
            <Text className='legend-text'>性能曲线</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot legend-dot--required-flow'></View>
            <Text className='legend-text'>需求流量</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot legend-dot--required-head'></View>
            <Text className='legend-text'>需求扬程</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot legend-dot--curve-point'></View>
            <Text className='legend-text'>曲线扬程</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot legend-dot--required-point'></View>
            <Text className='legend-text'>实际需求</Text>
          </View>
        </View>

        <View className='chart-info'>
          <View className='info-item'>
            <Text className='info-label'>需求流量:</Text>
            <Text className='info-value'>
              {this.props.requiredFlowRate} m³/h
            </Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>需求扬程:</Text>
            <Text className='info-value'>{this.props.requiredHead} m</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>曲线扬程:</Text>
            <Text className='info-value info-value--highlight'>
              {curveHeadAtRequiredFlow.toFixed(2)} m
            </Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>扬程余量:</Text>
            <Text
              className={`info-value info-value--${headRatio >= 1 ? 'good' : 'bad'}`}
            >
              {headRatio >= 1 ? '+' : ''}
              {((headRatio - 1) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    )
  }
}
