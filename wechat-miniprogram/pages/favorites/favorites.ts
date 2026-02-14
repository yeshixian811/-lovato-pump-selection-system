// 收藏页面
import { getApp } from '../../app'

Page({
  data: {
    favorites: [] as any[],
  },

  onShow() {
    this.loadFavorites()
  },

  /**
   * 加载收藏列表
   */
  loadFavorites() {
    const app = getApp()
    if (app && app.globalData.favorites) {
      this.setData({
        favorites: app.globalData.favorites,
      })
    }
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

  /**
   * 取消收藏
   */
  onRemoveFavorite(e: any) {
    const productId = e.currentTarget.dataset.id
    const app = getApp()

    if (app) {
      app.removeFavorite(productId)
      this.loadFavorites()
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
      })
    }
  },
})
