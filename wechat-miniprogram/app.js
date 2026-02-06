// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('洛瓦托水泵选型小程序启动');

    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息：', res);
      }
    });
  },

  onShow() {
    // 小程序显示时执行
    console.log('小程序显示');
  },

  onHide() {
    // 小程序隐藏时执行
    console.log('小程序隐藏');
  },

  globalData: {
    systemInfo: null,
    baseUrl: 'https://your-domain.com' // 请替换为您的实际域名
  }
});
