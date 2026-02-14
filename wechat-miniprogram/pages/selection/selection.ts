// 智能选型页面
import { mockSelectPump, SelectionParams } from '../../utils/api'

Page({
  data: {
    loading: false,
    selected: false,
    selectionParams: {
      required_flow_rate: 10,
      required_head: 20,
      application_type: '工业给排水',
      fluid_type: '清水',
      pump_type: '立式多级泵',
    } as SelectionParams,
    applicationTypes: ['工业给排水', '增压系统', '消防系统', '高层供水', '远距离输送', '锅炉供水'],
    fluidTypes: ['清水', '轻污染水'],
    pumpTypes: ['立式多级泵', '卧式离心泵', '管道泵'],
    results: [] as any[],
    selectedProduct: null as any,
    showResult: false,
  },

  onLoad(options: any) {
    console.log('选型页面加载', options)
  },

  /**
   * 流量滑块变化
   */
  onFlowSliderChange(e: any) {
    this.setData({
      'selectionParams.required_flow_rate': e.detail.value,
    })
  },

  /**
   * 扬程滑块变化
   */
  onHeadSliderChange(e: any) {
    this.setData({
      'selectionParams.required_head': e.detail.value,
    })
  },

  /**
   * 应用类型选择
   */
  onApplicationTypeChange(e: any) {
    this.setData({
      'selectionParams.application_type': this.data.applicationTypes[e.detail.value],
    })
  },

  /**
   * 流体类型选择
   */
  onFluidTypeChange(e: any) {
    this.setData({
      'selectionParams.fluid_type': this.data.fluidTypes[e.detail.value],
    })
  },

  /**
   * 水泵类型选择
   */
  onPumpTypeChange(e: any) {
    this.setData({
      'selectionParams.pump_type': this.data.pumpTypes[e.detail.value],
    })
  },

  /**
   * 开始选型
   */
  async onSelection() {
    const { selectionParams } = this.data

    if (selectionParams.required_flow_rate <= 0 || selectionParams.required_head <= 0) {
      wx.showToast({
        title: '请输入有效的参数',
        icon: 'none',
      })
      return
    }

    this.setData({ loading: true })

    try {
      const response = await mockSelectPump(selectionParams)
      if (response.success && response.data) {
        this.setData({
          results: response.data,
          showResult: true,
          selected: true,
        })

        if (response.data.length === 0) {
          wx.showToast({
            title: '未找到匹配产品',
            icon: 'none',
          })
        } else {
          wx.showToast({
            title: `找到 ${response.data.length} 个匹配产品`,
            icon: 'success',
          })
        }
      }
    } catch (error) {
      console.error('选型失败:', error)
      wx.showToast({
        title: '选型失败，请重试',
        icon: 'none',
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 查看产品详情
   */
  onProductDetail(e: any) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}&flow=${this.data.selectionParams.required_flow_rate}&head=${this.data.selectionParams.required_head}`,
    })
  },

  /**
   * 重置选型
   */
  onReset() {
    this.setData({
      selectionParams: {
        required_flow_rate: 10,
        required_head: 20,
        application_type: '工业给排水',
        fluid_type: '清水',
        pump_type: '立式多级泵',
      } as SelectionParams,
      results: [],
      showResult: false,
      selected: false,
    })
  },

  /**
   * 返回首页
   */
  onBack() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
})
