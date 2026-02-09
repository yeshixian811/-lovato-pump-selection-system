import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { withRedux } from '@/store/withRedux'

import { clearHistory, removeHistoryItem } from '@/store/modules/selection'
import { SelectionHistory } from '@/types'
import './index.scss'

interface Props {
  history: SelectionHistory[]
  loading: boolean
  clearHistory: typeof clearHistory
  removeHistoryItem: typeof removeHistoryItem
}

interface State {}

@connect(
  ({ selection }: RootState) => ({
    history: selection.history,
    loading: selection.loading,
  }),
  (dispatch: AppDispatch) => ({
    clearHistory: () => dispatch(clearHistory()),
    removeHistoryItem: (id: string) => dispatch(removeHistoryItem(id)),
  })
)
class History extends Component<Props, State> {
  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '选型历史',
    })
  }

  // 查看历史记录详情
  handleViewHistory = (historyItem: SelectionHistory) => {
    Taro.navigateTo({
      url: `/pages/selection/index?fromHistory=true`,
    })
  }

  // 删除历史记录
  handleDeleteHistory = (e: any, id: string) => {
    e.stopPropagation()

    Taro.showModal({
      title: '提示',
      content: '确定要删除这条历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.props.removeHistoryItem(id)
          Taro.showToast({
            title: '已删除',
            icon: 'success',
          })
        }
      },
    })
  }

  // 清空所有历史
  handleClearAll = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.props.clearHistory()
          Taro.showToast({
            title: '已清空',
            icon: 'success',
          })
        }
      },
    })
  }

  // 格式化时间
  formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const month = 30 * day

    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`
    } else if (diff < month) {
      return `${Math.floor(diff / day)}天前`
    } else {
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    }
  }

  // 格式化日期时间
  formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }

  render() {
    const { history, loading } = this.props

    if (loading) {
      return (
        <View className='history-page'>
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        </View>
      )
    }

    return (
      <ScrollView scrollY className='history-page'>
        {/* 操作栏 */}
        {history.length > 0 && (
          <View className='action-bar'>
            <Text className='history-count'>共 {history.length} 条记录</Text>
            <Button className='clear-btn' onClick={this.handleClearAll}>
              清空全部
            </Button>
          </View>
        )}

        {/* 历史记录列表 */}
        {history.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📝</Text>
            <Text className='empty-title'>暂无选型历史</Text>
            <Text className='empty-desc'>进行选型后，记录会显示在这里</Text>
            <Button
              className='empty-btn'
              onClick={() => {
                Taro.switchTab({
                  url: '/pages/selection/index',
                })
              }}
            >
              去选型
            </Button>
          </View>
        ) : (
          <View className='history-list'>
            {history.map((item) => (
              <View
                key={item.id}
                className='history-item'
                onClick={() => this.handleViewHistory(item)}
              >
                <View className='history-header'>
                  <View className='history-time-wrapper'>
                    <Text className='history-time'>
                      {this.formatTime(item.timestamp)}
                    </Text>
                    <Text className='history-date'>
                      {this.formatDateTime(item.timestamp)}
                    </Text>
                  </View>
                  <View
                    className='delete-btn'
                    onClick={(e) => this.handleDeleteHistory(e, item.id)}
                  >
                    <Text className='delete-icon'>🗑️</Text>
                  </View>
                </View>

                <View className='history-params'>
                  <View className='param-item'>
                    <Text className='param-label'>流量:</Text>
                    <Text className='param-value'>
                      {item.params.required_flow_rate} m³/h
                    </Text>
                  </View>
                  <View className='param-item'>
                    <Text className='param-label'>扬程:</Text>
                    <Text className='param-value'>
                      {item.params.required_head} m
                    </Text>
                  </View>
                  <View className='param-item'>
                    <Text className='param-label'>应用类型:</Text>
                    <Text className='param-value'>{item.params.application_type}</Text>
                  </View>
                  <View className='param-item'>
                    <Text className='param-label'>流体类型:</Text>
                    <Text className='param-value'>{item.params.fluid_type}</Text>
                  </View>
                </View>

                <View className='history-footer'>
                  <Text className='result-count'>
                    匹配到 {item.results.length} 个产品
                  </Text>
                  <Text className='view-text'>查看详情 ›</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    )
  }
}

export default withRedux(History)

