// 产品详情页面
import { mockProducts, PumpProduct } from '../../utils/api'
import { getApp } from '../../app'

Page({
  data: {
    loading: true,
    productId: 0,
    requiredFlow: 0,
    requiredHead: 0,
    product: null as PumpProduct | null,
    isFavorite: false,
  },

  onLoad(options: any) {
    console.log('产品详情加载', options)
    this.setData({
      productId: parseInt(options.id) || 0,
      requiredFlow: parseFloat(options.flow) || 0,
      requiredHead: parseFloat(options.head) || 0,
    })
    this.loadProduct()
  },

  onShow() {
    // 检查收藏状态
    this.checkFavoriteStatus()
  },

  /**
   * 加载产品详情
   */
  async loadProduct() {
    this.setData({ loading: true })

    try {
      const response = await mockProducts()
      if (response.success && response.data) {
        const product = response.data.find(p => p.id === this.data.productId)
        if (product) {
          this.setData({ product })
          wx.setNavigationBarTitle({
            title: product.model,
          })
        }
      }
    } catch (error) {
      console.error('加载产品失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 检查收藏状态
   */
  checkFavoriteStatus() {
    const app = getApp()
    if (app && app.globalData.favorites) {
      const isFav = app.globalData.favorites.some((item: any) => item.id === this.data.productId)
      this.setData({ isFavorite: isFav })
    }
  },

  /**
   * 添加/取消收藏
   */
  onToggleFavorite() {
    const app = getApp()
    if (!app || !this.data.product) return

    if (this.data.isFavorite) {
      // 取消收藏
      app.removeFavorite(this.data.productId)
      this.setData({ isFavorite: false })
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
      })
    } else {
      // 添加收藏
      const success = app.addFavorite(this.data.product)
      if (success) {
        this.setData({ isFavorite: true })
        wx.showToast({
          title: '已收藏',
          icon: 'success',
        })
      } else {
        wx.showToast({
          title: '已收藏过',
          icon: 'none',
        })
      }
    }
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    if (!this.data.product) return {}

    return {
      title: `${this.data.product.model} - ${this.data.product.name}`,
      path: `/pages/product-detail/product-detail?id=${this.data.productId}`,
      imageUrl: this.data.product.image_url,
    }
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack()
  },

  /**
   * 联系客服
   */
  onContact() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-XXX-XXXX\n\n工作日：9:00-18:00',
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-XXX-XXXX',
          })
        }
      },
    })
  },

  /**
   * 下载规格书
   */
  onDownloadSpec() {
    if (!this.data.product) return
    wx.showToast({
      title: '下载中...',
      icon: 'loading',
    })
    // 实际下载逻辑
    setTimeout(() => {
      wx.showToast({
        title: '下载成功',
        icon: 'success',
      })
    }, 1000)
  },

  /**
   * 开始选型
   */
  onStartSelection() {
    if (!this.data.product) return
    wx.switchTab({
      url: '/pages/selection/selection',
    })
  },
})
