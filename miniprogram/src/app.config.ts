export default {
  pages: [
    'pages/index/index',
    'pages/selection/index',
    'pages/products/index',
    'pages/login/index',
    'pages/profile/index',
    'pages/result/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2563eb',
    navigationBarTitleText: '洛瓦托水泵选型',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: false
  },
  tabBar: {
    color: '#718096',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/selection/index',
        text: '选型',
        iconPath: 'assets/icons/selection.png',
        selectedIconPath: 'assets/icons/selection-active.png'
      },
      {
        pagePath: 'pages/products/index',
        text: '产品',
        iconPath: 'assets/icons/products.png',
        selectedIconPath: 'assets/icons/products-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  },
  usingComponents: {},
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于提供更好的服务'
    }
  }
}
