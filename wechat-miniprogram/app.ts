// 小程序入口文件

App<IAppOption>({
  globalData: {
    userInfo: null,
    favorites: [],
    apiUrl: 'https://lowato-hvac.com/api'
  },

  onLaunch(options) {
    console.log('小程序启动', options)

    // 检查更新
    this.checkUpdate()

    // 加载收藏数据
    this.loadFavorites()

    // 初始化云开发（可选）
    this.initCloud()
  },

  onShow(options) {
    console.log('小程序显示', options)
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(error) {
    console.error('小程序错误', error)
    // 可以在这里上报错误到服务器
  },

  /**
   * 检查小程序更新
   */
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新结果:', res.hasUpdate)
      })

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: '更新失败',
          content: '新版本下载失败，请检查网络后重试',
          showCancel: false
        })
      })
    }
  },

  /**
   * 加载收藏数据
   */
  loadFavorites() {
    try {
      const favorites = wx.getStorageSync('favorites') || []
      this.globalData.favorites = favorites
      console.log('加载收藏数据:', favorites.length)
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  },

  /**
   * 保存收藏数据
   */
  saveFavorites() {
    try {
      wx.setStorageSync('favorites', this.globalData.favorites)
    } catch (error) {
      console.error('保存收藏失败:', error)
    }
  },

  /**
   * 添加收藏
   */
  addFavorite(product: any) {
    const exists = this.globalData.favorites.find((item: any) => item.id === product.id)
    if (!exists) {
      this.globalData.favorites.push({
        ...product,
        addTime: new Date().toISOString()
      })
      this.saveFavorites()
      return true
    }
    return false
  },

  /**
   * 移除收藏
   */
  removeFavorite(productId: number) {
    const index = this.globalData.favorites.findIndex((item: any) => item.id === productId)
    if (index > -1) {
      this.globalData.favorites.splice(index, 1)
      this.saveFavorites()
      return true
    }
    return false
  },

  /**
   * 检查是否已收藏
   */
  isFavorite(productId: number): boolean {
    return this.globalData.favorites.some((item: any) => item.id === productId)
  },

  /**
   * 初始化云开发
   */
  initCloud() {
    // 如果需要使用云开发，可以在这里初始化
    // wx.cloud.init({
    //   env: 'your-env-id',
    //   traceUser: true
    // })
  }
})
