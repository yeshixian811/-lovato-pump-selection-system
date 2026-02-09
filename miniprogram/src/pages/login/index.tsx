import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState } from '@/store'
import { User } from '@/types'
import './index.scss'

interface Props {
  user: User | null
  isLogged: boolean
}

@connect(({ user }: RootState) => ({
  user: user.user,
  isLogged: user.isLogged,
}))
class Login extends Component<Props> {
  state = {
    email: '',
    password: '',
    loading: false,
  }

  handleInputChange = (field: string, value: string) => {
    this.setState({ [field]: value })
  }

  handleLogin = () => {
    const { email, password } = this.state
    if (!email || !password) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none',
      })
      return
    }

    // TODO: 调用登录 API
    Taro.showToast({
      title: '登录功能开发中',
      icon: 'none',
    })
  }

  handleRegister = () => {
    Taro.navigateTo({
      url: '/pages/register/index',
    })
  }

  render() {
    const { email, password, loading } = this.state

    return (
      <ScrollView scrollY className='login-page'>
        <View className='login-container'>
          <Text className='login-title'>登录</Text>
          <Text className='login-desc'>欢迎回到洛瓦托水泵选型系统</Text>

          <View className='form-group'>
            <Text className='form-label'>邮箱</Text>
            <View className='form-input-wrapper'>
              <Text className='input-icon'>📧</Text>
              <Input
                className='form-input'
                placeholder='请输入邮箱'
                value={email}
                onInput={(e) => this.handleInputChange('email', e.detail.value)}
              />
            </View>
          </View>

          <View className='form-group'>
            <Text className='form-label'>密码</Text>
            <View className='form-input-wrapper'>
              <Text className='input-icon'>🔒</Text>
              <Input
                className='form-input'
                type='password'
                placeholder='请输入密码'
                value={password}
                onInput={(e) => this.handleInputChange('password', e.detail.value)}
              />
            </View>
          </View>

          <Button className='login-btn' loading={loading} onClick={this.handleLogin}>
            登录
          </Button>

          <View className='login-footer'>
            <Text className='footer-text'>还没有账号？</Text>
            <Text className='footer-link' onClick={this.handleRegister}>
              立即注册
            </Text>
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default Login
