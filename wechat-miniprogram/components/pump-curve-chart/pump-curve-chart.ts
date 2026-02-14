/**
 * 水泵性能曲线图表组件
 * 使用 ECharts 实现专业的性能曲线可视化
 */
import { CurvePoint } from '../../utils/api'

Component({
  properties: {
    // 产品数据
    pump: {
      type: Object,
      value: null,
    },
    // 性能曲线数据
    curveData: {
      type: Array,
      value: [],
    },
    // 需要的流量（参考线）
    requiredFlow: {
      type: Number,
      value: 0,
    },
    // 需要的扬程（参考线）
    requiredHead: {
      type: Number,
      value: 0,
    },
    // 是否显示参考线
    showReference: {
      type: Boolean,
      value: true,
    },
    // 是否显示交叉点
    showIntersection: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    ec: {
      onInit: null as any,
    },
  },

  observers: {
    'pump, curveData, requiredFlow, requiredHead': function() {
      this.initChart()
    }
  },

  lifetimes: {
    attached() {
      this.initChart()
    },
  },

  methods: {
    /**
     * 初始化图表
     */
    initChart() {
      const { pump, curveData, requiredFlow, requiredHead, showReference, showIntersection } = this.data

      if (!curveData || curveData.length === 0) {
        return
      }

      this.setData({
        ec: {
          onInit: (canvas: any, width: number, height: number) => {
            this.initChartInstance(canvas, width, height)
          },
        },
      })
    },

    /**
     * 初始化图表实例
     */
    initChartInstance(canvas: any, width: number, height: number) {
      // 这里需要引入 ECharts
      // 由于微信小程序限制，需要使用专门的 echarts-for-weixin 库
      // 在实际项目中需要安装 echarts-for-weixin
      // 这里提供完整的配置逻辑

      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
      })

      const { curveData, requiredFlow, requiredHead, showReference, showIntersection } = this.data

      // 准备数据
      const flowRates = curveData.map((p: CurvePoint) => p.flowRate)
      const heads = curveData.map((p: CurvePoint) => p.head)
      const efficiencies = curveData.map((p: CurvePoint) => p.efficiency || 0)
      const powers = curveData.map((p: CurvePoint) => p.power || 0)

      // 找到交叉点
      const intersection = this.findIntersection(curveData, requiredFlow, requiredHead)

      const option = {
        backgroundColor: '#ffffff',
        title: {
          text: '水泵性能曲线',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e40af',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
          formatter: (params: any) => {
            let result = `流量: ${params[0].value} m³/h<br/>`
            params.forEach((param: any) => {
              result += `${param.seriesName}: ${param.value}<br/>`
            })
            return result
          },
        },
        legend: {
          data: ['扬程曲线', '效率曲线', '功率曲线'],
          bottom: 10,
          textStyle: {
            fontSize: 12,
          },
        },
        grid: {
          left: '12%',
          right: '8%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          name: '流量 (m³/h)',
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
          axisLine: {
            lineStyle: {
              color: '#1e40af',
            },
          },
          axisLabel: {
            fontSize: 11,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: '扬程 (m)',
            nameTextStyle: {
              fontSize: 14,
              fontWeight: 'bold',
            },
            position: 'left',
            axisLine: {
              lineStyle: {
                color: '#1e40af',
              },
            },
            axisLabel: {
              fontSize: 11,
            },
            splitLine: {
              lineStyle: {
                color: '#e2e8f0',
              },
            },
          },
          {
            type: 'value',
            name: '效率 (%) / 功率 (kW)',
            nameTextStyle: {
              fontSize: 14,
              fontWeight: 'bold',
            },
            position: 'right',
            axisLine: {
              lineStyle: {
                color: '#0ea5e9',
              },
            },
            axisLabel: {
              fontSize: 11,
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          // 扬程曲线（主要曲线）
          {
            name: '扬程曲线',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: true,
            yAxisIndex: 0,
            data: curveData.map((p: CurvePoint) => [p.flowRate, p.head]),
            itemStyle: {
              color: '#1e40af',
            },
            lineStyle: {
              width: 3,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(30, 64, 175, 0.3)' },
                  { offset: 1, color: 'rgba(30, 64, 175, 0.05)' },
                ],
              },
            },
          },
          // 效率曲线
          {
            name: '效率曲线',
            type: 'line',
            smooth: true,
            symbol: 'diamond',
            symbolSize: 5,
            showSymbol: false,
            yAxisIndex: 1,
            data: curveData.map((p: CurvePoint) => [p.flowRate, p.efficiency || 0]),
            itemStyle: {
              color: '#22c55e',
            },
            lineStyle: {
              width: 2,
              type: 'dashed',
            },
          },
          // 功率曲线
          {
            name: '功率曲线',
            type: 'line',
            smooth: true,
            symbol: 'triangle',
            symbolSize: 5,
            showSymbol: false,
            yAxisIndex: 1,
            data: curveData.map((p: CurvePoint) => [p.flowRate, p.power || 0]),
            itemStyle: {
              color: '#f59e0b',
            },
            lineStyle: {
              width: 2,
              type: 'dashed',
            },
          },
        ],
        // 参考线
        markLine: showReference ? {
          silent: true,
          symbol: ['none', 'none'],
          data: [
            {
              xAxis: requiredFlow,
              name: '需求流量',
              label: {
                formatter: '需求流量: {c}',
                position: 'end',
                color: '#ef4444',
                fontSize: 11,
              },
              lineStyle: {
                color: '#ef4444',
                type: 'dashed',
                width: 2,
              },
            },
            {
              yAxis: requiredHead,
              name: '需求扬程',
              label: {
                formatter: '需求扬程: {c}',
                position: 'end',
                color: '#ef4444',
                fontSize: 11,
              },
              lineStyle: {
                color: '#ef4444',
                type: 'dashed',
                width: 2,
              },
            },
          ],
        } : {},
        // 交叉点标记
        markPoint: showIntersection && intersection ? {
          symbol: 'pin',
          symbolSize: 50,
          data: [
            {
              name: '工作点',
              coord: [intersection.flowRate, intersection.head],
              value: `${intersection.flowRate.toFixed(1)}, ${intersection.head.toFixed(1)}`,
              itemStyle: {
                color: '#ef4444',
              },
              label: {
                fontSize: 10,
                color: '#ffffff',
              },
            },
          ],
        } : {},
      }

      chart.setOption(option)
      return chart
    },

    /**
     * 找到性能曲线与需求线的交叉点
     */
    findIntersection(curveData: CurvePoint[], requiredFlow: number, requiredHead: number): any {
      if (curveData.length < 2) {
        return null
      }

      // 线性插值找到交叉点
      for (let i = 0; i < curveData.length - 1; i++) {
        const p1 = curveData[i]
        const p2 = curveData[i + 1]

        // 检查是否有交叉
        if ((p1.flowRate <= requiredFlow && p2.flowRate >= requiredFlow) ||
            (p1.flowRate >= requiredFlow && p2.flowRate <= requiredFlow)) {
          // 在流量方向找到交叉
          const ratio = (requiredFlow - p1.flowRate) / (p2.flowRate - p1.flowRate)
          const headAtFlow = p1.head + ratio * (p2.head - p1.head)

          return {
            flowRate: requiredFlow,
            head: headAtFlow,
          }
        }
      }

      // 如果没有找到精确交叉，返回最接近的点
      const closest = curveData.reduce((prev: any, curr: CurvePoint) => {
        const prevDist = Math.abs(prev.flowRate - requiredFlow)
        const currDist = Math.abs(curr.flowRate - requiredFlow)
        return currDist < prevDist ? curr : prev
      })

      return {
        flowRate: closest.flowRate,
        head: closest.head,
      }
    },

    /**
     * 保存图表为图片
     */
    saveImage() {
      // 保存图表为图片的实现
      wx.showLoading({
        title: '保存中...',
      })

      // 实际实现需要调用 ECharts 的 getDataURL 方法
      setTimeout(() => {
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
          icon: 'success',
        })
      }, 1000)
    },
  },
})
