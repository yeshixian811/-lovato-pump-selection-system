// 关于我们页面

Page({
  data: {
    company: {
      name: '洛瓦托水泵',
      description: '专业水泵解决方案提供商',
      phone: '400-XXX-XXXX',
      email: 'contact@lovato-pump.com',
      address: '广东省深圳市南山区科技园',
    },
  },

  onLoad(options: any) {
    console.log('关于页面加载', options)
  },

  /**
   * 拨打电话
   */
  onCallPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.company.phone,
    })
  },

  /**
   * 复制邮箱
   */
  onCopyEmail() {
    wx.setClipboardData({
      data: this.data.company.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success',
        })
      },
    })
  },

  /**
   * 打开地图
   */
  onOpenLocation() {
    wx.openLocation({
      latitude: 22.5311,
      longitude: 114.0579,
      name: this.data.company.name,
      address: this.data.company.address,
    })
  },

  /**
   * 访问官网
   */
  onVisitWebsite() {
    wx.navigateTo({
      url: '/pages/webview/webview?url=https://lowato-hvac.com',
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '洛瓦托水泵 - 专业水泵选型系统',
      path: '/pages/index/index',
      imageUrl: '/images/share-logo.jpg',
    }
  },
})
