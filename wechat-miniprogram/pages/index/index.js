// pages/index/index.js
const app = getApp()

Page({
  data: {
    webviewUrl: 'https://your-domain.com' // 请替换为您的实际域名
  },

  onLoad(options) {
    console.log('页面加载', options);

    // 从全局配置获取 URL
    const baseUrl = app.globalData.baseUrl;

    // 如果有传入的 URL 参数，优先使用
    if (options.url) {
      this.setData({
        webviewUrl: decodeURIComponent(options.url)
      });
    } else if (baseUrl !== 'https://your-domain.com') {
      // 如果已配置全局域名，使用全局域名
      this.setData({
        webviewUrl: baseUrl
      });
    } else {
      // 默认使用本地开发环境（仅用于开发）
      // 生产环境必须配置为 HTTPS 域名
      console.warn('请配置正确的业务域名');
    }

    console.log('WebView URL:', this.data.webviewUrl);
  },

  onReady() {
    console.log('页面渲染完成');
  },

  onShow() {
    console.log('页面显示');
  },

  onHide() {
    console.log('页面隐藏');
  },

  onUnload() {
    console.log('页面卸载');
  },

  // 监听网页向小程序 postMessage 消息
  handleMessage(e) {
    console.log('收到网页消息：', e.detail.data);
    // 可以在这里处理网页发送过来的消息
    const data = e.detail.data[0];

    if (data) {
      switch (data.action) {
        case 'login':
          // 处理登录逻辑
          break;
        case 'share':
          // 处理分享逻辑
          break;
        default:
          console.log('未知操作：', data.action);
      }
    }
  },

  // 处理网页加载错误
  handleError(e) {
    console.error('网页加载错误：', e);
    wx.showToast({
      title: '加载失败，请检查网络',
      icon: 'none',
      duration: 2000
    });
  },

  // 处理网页加载完成
  handleLoad() {
    console.log('网页加载完成');
  }
});
