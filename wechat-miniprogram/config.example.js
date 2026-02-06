/**
 * 小程序配置文件
 *
 * 使用说明：
 * 1. 复制此文件为 config.js
 * 2. 修改配置项为您的实际值
 * 3. 在 app.js 和 pages/index/index.js 中引入此配置
 */

module.exports = {
  // 微信小程序 AppID（必填）
  // 获取方式：登录微信公众平台 → 开发 → 开发管理 → 开发设置
  appid: 'wx1234567890abcdef',

  // 业务域名（必填，必须是 HTTPS）
  // 注意：需要先在微信公众平台配置业务域名
  baseUrl: 'https://your-domain.com',

  // 开发环境配置（仅用于开发，生产环境必须使用 HTTPS）
  development: {
    urlCheck: false,  // 开发阶段关闭域名校验
    baseUrl: 'https://your-ngrok-url.ngrok.io'  // ngrok 本地测试 URL
  },

  // 生产环境配置
  production: {
    urlCheck: true,   // 生产环境开启域名校验
    baseUrl: 'https://your-domain.com'
  },

  // 功能配置
  features: {
    // 是否启用微信登录
    enableWechatLogin: false,

    // 是否启用分享功能
    enableShare: true,

    // 是否启用消息推送
    enableMessage: false
  },

  // 分享配置
  share: {
    title: '洛瓦托水泵选型 - 智能选型工具',
    path: '/pages/index/index',
    imageUrl: '/assets/share-image.png'
  }
};
