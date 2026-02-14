// 产品库页面
import { mockProducts } from '../../utils/api'

Page({
  data: {
    loading: false,
    products: [] as any[],
    keyword: '',
    filterSeries: '',
    sortBy: 'default',
    seriesList: ['全部', 'AMT'],
  },

  onLoad(options: any) {
    console.log('产品库加载', options)
    this.loadProducts()
  },

  /**
   * 加载产品列表
   */
  async loadProducts() {
    this.setData({ loading: true })

    try {
      const response = await mockProducts()
      if (response.success && response.data) {
        this.setData({
          products: response.data,
        })
      }
    } catch (error) {
      console.error('加载产品失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 搜索关键词变化
   */
  onSearchInput(e: any) {
    this.setData({
      keyword: e.detail.value,
    })
  },

  /**
   * 系列筛选
   */
  onSeriesFilter(e: any) {
    this.setData({
      filterSeries: e.detail.value,
    })
  },

  /**
   * 排序方式
   */
  onSortChange(e: any) {
    this.setData({
      sortBy: e.detail.value,
    })
  },

  /**
   * 获取筛选后的产品列表
   */
  getFilteredProducts() {
    let products = [...this.data.products]

    // 关键词搜索
    if (this.data.keyword) {
      const keyword = this.data.keyword.toLowerCase()
      products = products.filter(p =>
        p.model.toLowerCase().includes(keyword) ||
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
      )
    }

    // 系列筛选
    if (this.data.filterSeries && this.data.filterSeries !== '全部') {
      products = products.filter(p => p.series === this.data.filterSeries)
    }

    // 排序
    switch (this.data.sortBy) {
      case 'flow':
        products.sort((a, b) => b.max_flow_rate - a.max_flow_rate)
        break
      case 'head':
        products.sort((a, b) => b.max_head - a.max_head)
        break
      case 'power':
        products.sort((a, b) => a.rated_power - b.rated_power)
        break
      default:
        // 默认按 ID 排序
        products.sort((a, b) => a.id - b.id)
    }

    return products
  },

  /**
   * 查看产品详情
   */
  onProductDetail(e: any) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`,
    })
  },
})
