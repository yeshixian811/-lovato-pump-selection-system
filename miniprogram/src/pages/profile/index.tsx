import { Component } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { withRedux } from '@/store/withRedux'

import { logout } from '@/store/modules/user'
import './index.scss'

interface Props {
  user: any
  loading: boolean
  logout: typeof logout
}

interface State {}

interface MenuItem {
  icon: string
  title: string
  subtitle?: string
  action: string
  badge?: number
}

const MENU_ITEMS: MenuItem[] = [
  {
    icon: '📝',
    title: '选型历史',
    subtitle: '查看您的选型记录',
    action: 'history',
  },
  {
    icon: '❤️',
    title: '我的收藏',
    subtitle: '收藏的水泵产品',
    action: 'favorite',
  },
  {
    icon: '⚙️',
    title: '设置',
    subtitle: '应用设置和偏好',
    action: 'settings',
  },
  {
    icon: '📞',
    title: '联系客服',
    subtitle: '获取帮助和支持',
    action: 'contact',
  },
  {
    icon: 'ℹ️',
    title: '关于我们',
    subtitle: '关于洛瓦托水泵',
    action: 'about',
  },
]

@connect(
  ({ user }: RootState) => ({
    user: user.user,
    loading: user.loading,
  }),
  (dispatch: AppDispatch) => ({
    logout: () => dispatch(logout()),
  })
)
class Profile extends Component<Props, State> {
  // 菜单项点击
  handleMenuClick = (item: MenuItem) => {
    switch (item.action) {
      case 'history':
        this.goToHistory()
        break
      case 'favorite':
        this.goToFavorites()
        break
      case 'settings':
        this.goToSettings()
        break
      case 'contact':
        this.contactSupport()
        break
      case 'about':
        this.showAbout()
        break
      default:
        break
    }
  }

  // 登录
  handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index',
    })
  }

  // 登出
  handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.props.logout()
          Taro.showToast({
            title: '已退出登录',
            icon: 'success',
          })
        }
      },
    })
  }

  // 查看选型历史
  goToHistory = () => {
    Taro.navigateTo({
      url: '/pages/history/index',
    })
  }

  // 查看我的收藏
  goToFavorites = () => {
    Taro.showToast({
      title: '我的收藏功能开发中',
      icon: 'none',
    })
  }

  // 设置
  goToSettings = () => {
    Taro.showToast({
      title: '设置功能开发中',
      icon: 'none',
    })
  }

  // 联系客服
  contactSupport = () => {
    Taro.showToast({
      title: '联系客服功能开发中',
      icon: 'none',
    })
  }

  // 关于我们
  showAbout = () => {
    Taro.showModal({
      title: '关于洛瓦托水泵',
      content: '洛瓦托水泵选型系统\n\n版本：1.0.0\n\n为您提供专业的水泵选型服务。',
      showCancel: false,
      confirmText: '知道了',
    })
  }

  render() {
    const { user, loading } = this.props

    return (
      <View className='profile-page'>
        {/* 用户信息区 */}
        <View className='user-section'>
          {user ? (
            <View className='user-info'>
              <View className='avatar-wrapper'>
                <Image
                  className='avatar'
                  src={user.avatar || 'https://via.placeholder.com/120'}
                  mode='aspectFill'
                />
              </View>
              <View className='user-details'>
                <Text className='user-name'>{user.name || user.email}</Text>
                <Text className='user-email'>{user.email}</Text>
                {user.phone && (
                  <Text className='user-phone'>{user.phone}</Text>
                )}
              </View>
              <Button className='logout-btn' onClick={this.handleLogout}>
                退出登录
              </Button>
            </View>
          ) : (
            <View className='login-prompt'>
              <View className='avatar-wrapper'>
                <Image
                  className='avatar avatar--default'
                  src='https://via.placeholder.com/120'
                  mode='aspectFill'
                />
              </View>
              <View className='login-text'>
                <Text className='login-title'>未登录</Text>
                <Text className='login-desc'>登录后查看更多信息</Text>
              </View>
              <Button className='login-btn' onClick={this.handleLogin}>
                立即登录
              </Button>
            </View>
          )}
        </View>

        {/* 统计数据 */}
        {user && (
          <View className='stats-section'>
            <View className='stat-item'>
              <Text className='stat-value'>0</Text>
              <Text className='stat-label'>选型次数</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>0</Text>
              <Text className='stat-label'>收藏产品</Text>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <Text className='stat-value'>0</Text>
              <Text className='stat-label'>浏览历史</Text>
            </View>
          </View>
        )}

        {/* 菜单列表 */}
        <View className='menu-section'>
          {MENU_ITEMS.map((item, index) => (
            <View
              key={index}
              className='menu-item'
              onClick={() => this.handleMenuClick(item)}
            >
              <View className='menu-icon'>{item.icon}</View>
              <View className='menu-content'>
                <View className='menu-title-wrapper'>
                  <Text className='menu-title'>{item.title}</Text>
                  {item.badge && item.badge > 0 && (
                    <View className='menu-badge'>
                      <Text className='badge-text'>{item.badge}</Text>
                    </View>
                  )}
                </View>
                {item.subtitle && (
                  <Text className='menu-subtitle'>{item.subtitle}</Text>
                )}
              </View>
              <View className='menu-arrow'>›</View>
            </View>
          ))}
        </View>

        {/* 底部信息 */}
        <View className='footer-info'>
          <Text className='footer-text'>洛瓦托水泵选型系统 v1.0.0</Text>
          <Text className='footer-text'>© 2024 Lovato Pumps</Text>
        </View>
      </View>
    )
  }
}

export default withRedux(Profile)

