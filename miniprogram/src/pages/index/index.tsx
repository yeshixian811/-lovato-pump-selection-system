import { Component } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState } from '@/store'
import { withRedux } from '@/store/withRedux'

import { User } from '@/types'
import './index.scss'

interface Props {
  user: User | null
  isLogged: boolean
}

interface State {
  loading: boolean
}

@connect(({ user }: RootState) => ({
  user: user.user,
  isLogged: user.isLogged,
}))
class Index extends Component<Props, State> {
  state: State = {
    loading: false,
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '洛瓦托水泵选型',
    })
  }

  // 快速选型
  handleQuickSelection = () => {
    Taro.navigateTo({
      url: '/pages/selection/index',
    })
  }

  // 查看产品
  handleViewProducts = () => {
    Taro.switchTab({
      url: '/pages/products/index',
    })
  }

  // 查看个人中心
  handleViewProfile = () => {
    if (this.props.isLogged) {
      Taro.switchTab({
        url: '/pages/profile/index',
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/index',
      })
    }
  }

  render() {
    const { user, isLogged } = this.props

    return (
      <ScrollView scrollY className='index-page'>
        {/* 头部 */}
        <View className='header'>
          <View className='header-content'>
            <Image
              className='logo'
              src='/assets/logo.png'
              mode='aspectFit'
            />
            <View className='header-right'>
              <Text className='header-title'>洛瓦托</Text>
              <Text className='header-subtitle'>精准输配 冷暖随心</Text>
            </View>
          </View>
        </View>

        {/* 欢迎语 */}
        <View className='welcome-section'>
          <Text className='welcome-text'>
            {isLogged ? `欢迎回来，${user?.name || '用户'}` : '智能水泵选型系统'}
          </Text>
          <Text className='welcome-desc'>
            快速、精准、高效 - 智能匹配最合适的水泵产品
          </Text>
        </View>

        {/* 统计数据 */}
        <View className='stats-section'>
          <View className='stat-item'>
            <Text className='stat-value'>100+</Text>
            <Text className='stat-label'>产品型号</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>99%</Text>
            <Text className='stat-label'>匹配准确率</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>24/7</Text>
            <Text className='stat-label'>在线服务</Text>
          </View>
        </View>

        {/* 核心功能 */}
        <View className='features-section'>
          <View className='section-header'>
            <Text className='section-title'>核心功能</Text>
          </View>

          <View className='feature-list'>
            <View className='feature-item' onClick={this.handleQuickSelection}>
              <View className='feature-icon feature-icon--selection'>
                <Text className='feature-icon-text'>🎯</Text>
              </View>
              <View className='feature-info'>
                <Text className='feature-name'>智能选型</Text>
                <Text className='feature-desc'>
                  根据流量和扬程参数，智能匹配最合适的水泵
                </Text>
              </View>
              <View className='feature-arrow'>›</View>
            </View>

            <View className='feature-item' onClick={this.handleViewProducts}>
              <View className='feature-icon feature-icon--products'>
                <Text className='feature-icon-text'>📦</Text>
              </View>
              <View className='feature-info'>
                <Text className='feature-name'>产品库</Text>
                <Text className='feature-desc'>
                  浏览所有水泵产品，查看详细参数和性能曲线
                </Text>
              </View>
              <View className='feature-arrow'>›</View>
            </View>

            <View className='feature-item' onClick={this.handleViewProfile}>
              <View className='feature-icon feature-icon--profile'>
                <Text className='feature-icon-text'>👤</Text>
              </View>
              <View className='feature-info'>
                <Text className='feature-name'>{isLogged ? '我的账户' : '登录注册'}</Text>
                <Text className='feature-desc'>
                  {isLogged ? '查看账户信息和订阅状态' : '登录后享受更多功能'}
                </Text>
              </View>
              <View className='feature-arrow'>›</View>
            </View>
          </View>
        </View>

        {/* 产品系列 */}
        <View className='series-section'>
          <View className='section-header'>
            <Text className='section-title'>产品系列</Text>
            <Text className='section-more' onClick={this.handleViewProducts}>
              查看全部
            </Text>
          </View>

          <View className='series-list'>
            <View className='series-item'>
              <View className='series-icon'>🔄</View>
              <Text className='series-name'>离心泵系列</Text>
              <Text className='series-count'>10款</Text>
            </View>
            <View className='series-item'>
              <View className='series-icon'>⬆️</View>
              <Text className='series-name'>立式泵系列</Text>
              <Text className='series-count'>8款</Text>
            </View>
            <View className='series-item'>
              <View className='series-icon'>💧</View>
              <Text className='series-name'>潜水泵系列</Text>
              <Text className='series-count'>8款</Text>
            </View>
          </View>
        </View>

        {/* 底部提示 */}
        <View className='footer'>
          <Text className='footer-text'>© 2026 洛瓦托水泵选型系统</Text>
        </View>
      </ScrollView>
    )
  }
}

export default withRedux(Index)

