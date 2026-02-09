import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { withRedux } from '@/store/withRedux'

import { getPumpById, getPumpPerformance } from '@/store/modules/pump'
import { SelectionResult } from '@/types'
import PerformanceChart from '@/components/PerformanceChart'
import './index.scss'

interface Props {
  selectedPump: SelectionResult | null
  currentPump: any
  loading: boolean
  getPumpById: typeof getPumpById
  getPumpPerformance: typeof getPumpPerformance
}

interface State {
  pumpId: number
  performanceData: any[]
  loading: boolean
  favorited: boolean
}

@connect(
  ({ pump }: RootState) => ({
    selectedPump: pump.selectedPump,
    currentPump: pump.currentPump,
    loading: pump.loading,
  }),
  (dispatch: AppDispatch) => ({
    getPumpById: (id: number) => dispatch(getPumpById(id)),
    getPumpPerformance: (id: number) => dispatch(getPumpPerformance(id)),
  })
)
class Result extends Component<Props, State> {
  state: State = {
    pumpId: 0,
    performanceData: [],
    loading: false,
    favorited: false,
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '选型结果详情',
    })

    // 从路由参数获取水泵 ID
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}

    const pumpId = parseInt(options.pumpId as string)

    if (pumpId) {
      this.setState({ pumpId })
      this.loadPumpDetail(pumpId)
    } else if (this.props.selectedPump) {
      // 从 Redux 获取选型结果
      this.setState({
        pumpId: this.props.selectedPump.pump.id,
      })
      this.loadPumpDetail(this.props.selectedPump.pump.id)
    } else {
      Taro.showToast({
        title: '参数错误',
        icon: 'none',
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }

  loadPumpDetail = async (pumpId: number) => {
    try {
      this.setState({ loading: true })

      // 获取水泵详情
      await this.props.getPumpById(pumpId)

      // 获取性能曲线数据
      const performanceResponse = await getPumpPerformance(pumpId)
      if (performanceResponse.success && performanceResponse.data) {
        this.setState({ performanceData: performanceResponse.data })
      }
    } catch (error) {
      console.error('加载水泵详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  // 收藏
  handleFavorite = () => {
    this.setState((prevState) => ({
      favorited: !prevState.favorited,
    }))
    Taro.showToast({
      title: this.state.favorited ? '已取消收藏' : '已收藏',
      icon: 'success',
    })
  }

  // 分享
  handleShare = () => {
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none',
    })
  }

  // 查看产品详情
  handleViewProduct = () => {
    Taro.showToast({
      title: '产品详情页面开发中',
      icon: 'none',
    })
  }

  // 联系客服
  handleContact = () => {
    Taro.showToast({
      title: '联系客服功能开发中',
      icon: 'none',
    })
  }

  render() {
    const { selectedPump, currentPump } = this.props
    const { pumpId, performanceData, loading, favorited } = this.state

    // 使用选型结果中的数据或从 Redux 获取的数据
    const pump = selectedPump?.pump || currentPump
    const params = selectedPump || {}

    if (loading || !pump) {
      return (
        <View className='result-page'>
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        </View>
      )
    }

    return (
      <ScrollView scrollY className='result-page'>
        {/* 水泵基本信息 */}
        <View className='pump-info'>
          <View className='info-header'>
            <Text className='pump-model'>{pump.model}</Text>
            <View
              className='favorite-btn'
              onClick={this.handleFavorite}
            >
              <Text className={`favorite-icon ${favorited ? 'active' : ''}`}>
                {favorited ? '❤️' : '🤍'}
              </Text>
            </View>
          </View>
          <Text className='pump-name'>{pump.name}</Text>
          <Text className='pump-brand'>{pump.brand} · {pump.series}</Text>
          <Text className='pump-description'>{pump.description}</Text>
        </View>

        {/* 性能曲线图表 */}
        {performanceData.length > 0 && params.pump && (
          <PerformanceChart
            data={performanceData}
            requiredFlowRate={params.required_flow_rate || 0}
            requiredHead={params.required_head || 0}
            maxFlowRate={pump.max_flow_rate}
            maxHead={pump.max_head}
            pumpName={`${pump.model} 性能曲线`}
          />
        )}

        {/* 匹配度分析 */}
        {params.match_score !== undefined && (
          <View className='match-analysis'>
            <View className='section-header'>
              <Text className='section-title'>匹配度分析</Text>
              <View className='match-score'>
                <Text className='score-value'>{params.match_score.toFixed(0)}</Text>
                <Text className='score-unit'>分</Text>
              </View>
            </View>

            <View className='analysis-items'>
              <View className='analysis-item'>
                <Text className='analysis-label'>流量匹配:</Text>
                <Text className='analysis-value analysis-value--good'>
                  ✓ {params.flow_ratio !== undefined ? (params.flow_ratio * 100).toFixed(0) + '%' : '-'}
                </Text>
              </View>
              <View className='analysis-item'>
                <Text className='analysis-label'>扬程匹配:</Text>
                <Text className='analysis-value analysis-value--good'>
                  ✓ {params.head_ratio !== undefined ? (params.head_ratio * 100).toFixed(0) + '%' : '-'}
                </Text>
              </View>
              <View className='analysis-item'>
                <Text className='analysis-label'>效率评分:</Text>
                <Text className='analysis-value analysis-value--good'>
                  ✓ {params.efficiency_score !== undefined ? params.efficiency_score.toFixed(0) + '分' : '-'}
                </Text>
              </View>
              {params.application_match !== undefined && (
                <View className='analysis-item'>
                  <Text className='analysis-label'>应用场景:</Text>
                  <Text
                    className={`analysis-value ${params.application_match ? 'analysis-value--good' : 'analysis-value--normal'}`}
                  >
                    {params.application_match ? '✓ 匹配' : '○ 不匹配'}
                  </Text>
                </View>
              )}
              {params.fluid_match !== undefined && (
                <View className='analysis-item'>
                  <Text className='analysis-label'>流体类型:</Text>
                  <Text
                    className={`analysis-value ${params.fluid_match ? 'analysis-value--good' : 'analysis-value--normal'}`}
                  >
                    {params.fluid_match ? '✓ 匹配' : '○ 不匹配'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 详细参数 */}
        <View className='detail-params'>
          <View className='section-header'>
            <Text className='section-title'>详细参数</Text>
          </View>

          <View className='param-groups'>
            <View className='param-group'>
              <Text className='group-title'>性能参数</Text>
              <View className='param-items'>
                <View className='param-item'>
                  <Text className='param-label'>最大流量:</Text>
                  <Text className='param-value'>{pump.max_flow_rate} m³/h</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>最小流量:</Text>
                  <Text className='param-value'>{pump.min_flow_rate} m³/h</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>最大扬程:</Text>
                  <Text className='param-value'>{pump.max_head} m</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>最小扬程:</Text>
                  <Text className='param-value'>{pump.min_head} m</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>额定功率:</Text>
                  <Text className='param-value'>{pump.rated_power} kW</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>额定转速:</Text>
                  <Text className='param-value'>{pump.rated_speed} rpm</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>效率:</Text>
                  <Text className='param-value'>{pump.efficiency}%</Text>
                </View>
              </View>
            </View>

            <View className='param-group'>
              <Text className='group-title'>电气参数</Text>
              <View className='param-items'>
                <View className='param-item'>
                  <Text className='param-label'>电压:</Text>
                  <Text className='param-value'>{pump.voltage}</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>频率:</Text>
                  <Text className='param-value'>{pump.frequency} Hz</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>电流:</Text>
                  <Text className='param-value'>{pump.current} A</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>功率因数:</Text>
                  <Text className='param-value'>{pump.power_factor}</Text>
                </View>
              </View>
            </View>

            <View className='param-group'>
              <Text className='group-title'>物理参数</Text>
              <View className='param-items'>
                <View className='param-item'>
                  <Text className='param-label'>进口直径:</Text>
                  <Text className='param-value'>{pump.inlet_diameter} mm</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>出口直径:</Text>
                  <Text className='param-value'>{pump.outlet_diameter} mm</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>重量:</Text>
                  <Text className='param-value'>{pump.weight} kg</Text>
                </View>
                <View className='param-item'>
                  <Text className='param-label'>尺寸:</Text>
                  <Text className='param-value'>{pump.dimensions}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 价格信息 */}
        <View className='price-info'>
          <View className='price-label'>参考价格</View>
          <View className='price-value'>¥{pump.price}</View>
          <View className='price-note'>* 实际价格以询价为准</View>
        </View>

        {/* 底部操作栏 */}
        <View className='bottom-actions'>
          <Button className='action-btn action-btn--secondary' onClick={this.handleContact}>
            联系客服
          </Button>
          <Button className='action-btn action-btn--primary' onClick={this.handleShare}>
            分享给朋友
          </Button>
        </View>
      </ScrollView>
    )
  }
}

export default withRedux(Result)

