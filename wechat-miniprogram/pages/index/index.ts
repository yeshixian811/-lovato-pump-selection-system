// 首页
import { mockProducts } from '../../utils/api'

Page({
  data: {
    loading: false,
    featuredProducts: [] as any[],
    banners: [
      {
        id: 1,
        title: '智能选型系统',
        description: '快速找到最适合的水泵型号',
        image: '/images/banner-selection.jpg',
        action: 'selection',
      },
      {
        id: 2,
        title: 'AMT 系列产品',
        description: '高效节能立式多级离心泵',
        image: '/images/banner-amt.jpg',
        action: 'products',
      },
      {
        id: 3,
        title: '专业解决方案',
        description: '为您量身定制选型方案',
        image: '/images/banner-solution.jpg',
        action: 'contact',
      },
    ],
  },

  onLoad(options: any) {
    console.log('首页加载', options)
    this.loadFeaturedProducts()
  },

  onShow() {
    console.log('首页显示')
  },

  onPullDownRefresh() {
    this.loadFeaturedProducts()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  /**
   * 加载精选产品
   */
  async loadFeaturedProducts() {
    this.setData({ loading: true })

    try {
      // 使用 Mock 数据
      const products = await mockProducts()
      if (products.success && products.data) {
        this.setData({
          featuredProducts: products.data.slice(0, 3),
        })
      }
    } catch (error) {
      console.error('加载产品失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * Banner 点击
   */
  onBannerTap(e: any) {
    const action = e.currentTarget.dataset.action
    switch (action) {
      case 'selection':
        wx.switchTab({
          url: '/pages/selection/selection',
        })
        break
      case 'products':
        wx.switchTab({
          url: '/pages/products/products',
        })
        break
      case 'contact':
        wx.navigateTo({
          url: '/pages/about/about',
        })
        break
    }
  },

  /**
   * 产品卡片点击
   */
  onProductTap(e: any) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`,
    })
  },

  /**
   * 快速选型按钮
   */
  onQuickSelection() {
    wx.switchTab({
      url: '/pages/selection/selection',
    })
  },

  /**
   * 查看所有产品
   */
  onViewAllProducts() {
    wx.switchTab({
      url: '/pages/products/products',
    })
  },

  /**
   * 联系我们
   */
  onContact() {
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
})
