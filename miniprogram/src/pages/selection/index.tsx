import { Component } from 'react'
import { View, Text, Input, Button, ScrollView, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { withRedux } from '@/store/withRedux'

import { matchPump, setSelectedPump } from '@/store/modules/selection'
import { SelectionParams, SelectionResult } from '@/types'
import './index.scss'

interface Props {
  loading: boolean
  error: string | null
  results: SelectionResult[]
  params: SelectionParams | null
  selectedPump: SelectionResult | null
  matchPump: typeof matchPump
  setSelectedPump: typeof setSelectedPump
}

interface State {
  flowRate: string
  head: string
  applicationTypeIndex: number
  fluidTypeIndex: number
  pumpTypeIndex: number
  applicationTypes: string[]
  fluidTypes: string[]
  pumpTypes: string[]
}

const APPLICATION_TYPES = ['供水', '工业', '灌溉', '排水', '空调', '消防']
const FLUID_TYPES = ['清水', '污水', '化学液体', '热水', '海水']
const PUMP_TYPES = ['离心泵', '立式泵', '潜水泵']

@connect(
  ({ selection }: RootState) => ({
    loading: selection.loading,
    error: selection.error,
    results: selection.results,
    params: selection.params,
    selectedPump: selection.selectedPump,
  }),
  (dispatch: AppDispatch) => ({
    matchPump: (params: SelectionParams) => dispatch(matchPump(params)),
    setSelectedPump: (pump: SelectionResult) => dispatch(setSelectedPump(pump)),
  })
)
class Selection extends Component<Props, State> {
  state: State = {
    flowRate: '',
    head: '',
    applicationTypeIndex: 0,
    fluidTypeIndex: 0,
    pumpTypeIndex: 0,
    applicationTypes: APPLICATION_TYPES,
    fluidTypes: FLUID_TYPES,
    pumpTypes: PUMP_TYPES,
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '水泵选型',
    })
  }

  // 输入变化
  handleInputChange = (field: 'flowRate' | 'head', value: string) => {
    // 只允许输入数字和小数点
    const cleanedValue = value.replace(/[^\d.]/g, '')
    // 确保只有一个小数点
    const parts = cleanedValue.split('.')
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanedValue

    this.setState({
      [field]: finalValue,
    })
  }

  // 选择器变化
  handlePickerChange = (field: 'applicationTypeIndex' | 'fluidTypeIndex' | 'pumpTypeIndex', e: any) => {
    this.setState({
      [field]: e.detail.value,
    })
  }

  // 开始选型
  handleStartSelection = () => {
    const { flowRate, head, applicationTypeIndex, fluidTypeIndex, pumpTypeIndex } = this.state

    // 验证输入
    if (!flowRate || !head) {
      Taro.showToast({
        title: '请输入流量和扬程',
        icon: 'none',
      })
      return
    }

    const params: SelectionParams = {
      required_flow_rate: parseFloat(flowRate),
      required_head: parseFloat(head),
      application_type: APPLICATION_TYPES[applicationTypeIndex],
      fluid_type: FLUID_TYPES[fluidTypeIndex],
      pump_type: PUMP_TYPES[pumpTypeIndex],
    }

    this.props.matchPump(params)
  }

  // 查看详情
  handleViewDetail = (result: SelectionResult) => {
    this.props.setSelectedPump(result)
    Taro.navigateTo({
      url: `/pages/result/index?pumpId=${result.pump.id}`,
    })
  }

  render() {
    const {
      flowRate,
      head,
      applicationTypeIndex,
      fluidTypeIndex,
      pumpTypeIndex,
      applicationTypes,
      fluidTypes,
      pumpTypes,
    } = this.state
    const { loading, error, results, params } = this.props

    return (
      <ScrollView scrollY className='selection-page'>
        {/* 参数输入区 */}
        <View className='input-section'>
          <View className='section-title'>
            <Text className='title-text'>选型参数</Text>
            <Text className='title-desc'>请填写您的需求参数</Text>
          </View>

          <View className='form-group'>
            <Text className='form-label'>流量 (m³/h) *</Text>
            <Input
              className='form-input'
              type='digit'
              placeholder='请输入流量'
              value={flowRate}
              onInput={(e) => this.handleInputChange('flowRate', e.detail.value)}
            />
          </View>

          <View className='form-group'>
            <Text className='form-label'>扬程 (m) *</Text>
            <Input
              className='form-input'
              type='digit'
              placeholder='请输入扬程'
              value={head}
              onInput={(e) => this.handleInputChange('head', e.detail.value)}
            />
          </View>

          <View className='form-group'>
            <Text className='form-label'>应用类型</Text>
            <Picker
              mode='selector'
              range={applicationTypes}
              value={applicationTypeIndex}
              onChange={(e) => this.handlePickerChange('applicationTypeIndex', e)}
            >
              <View className='picker-view'>
                <Text>{applicationTypes[applicationTypeIndex]}</Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>

          <View className='form-group'>
            <Text className='form-label'>流体类型</Text>
            <Picker
              mode='selector'
              range={fluidTypes}
              value={fluidTypeIndex}
              onChange={(e) => this.handlePickerChange('fluidTypeIndex', e)}
            >
              <View className='picker-view'>
                <Text>{fluidTypes[fluidTypeIndex]}</Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>

          <View className='form-group'>
            <Text className='form-label'>水泵类型</Text>
            <Picker
              mode='selector'
              range={pumpTypes}
              value={pumpTypeIndex}
              onChange={(e) => this.handlePickerChange('pumpTypeIndex', e)}
            >
              <View className='picker-view'>
                <Text>{pumpTypes[pumpTypeIndex]}</Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>

          <Button className='submit-btn' onClick={this.handleStartSelection}>
            开始选型
          </Button>
        </View>

        {/* 选型结果 */}
        {params && (
          <View className='results-section'>
            <View className='section-title'>
              <Text className='title-text'>选型结果</Text>
              <Text className='title-desc'>
                找到 {results.length} 个匹配产品
              </Text>
            </View>

            {loading ? (
              <View className='loading'>
                <Text>选型中...</Text>
              </View>
            ) : error ? (
              <View className='error'>
                <Text>{error}</Text>
              </View>
            ) : results.length === 0 ? (
              <View className='empty'>
                <Text className='empty-icon'>🔍</Text>
                <Text className='empty-text'>未找到匹配产品</Text>
                <Text className='empty-desc'>请尝试调整参数范围</Text>
              </View>
            ) : (
              <View className='result-list'>
                {results.map((result, index) => (
                  <View key={result.pump.id} className='result-item' onClick={() => this.handleViewDetail(result)}>
                    <View className='result-header'>
                      <Text className='result-model'>{result.pump.model}</Text>
                      <Text className='result-match'>匹配度: {result.match_score.toFixed(0)}%</Text>
                    </View>
                    <Text className='result-name'>{result.pump.name}</Text>
                    <View className='result-params'>
                      <View className='param-item'>
                        <Text className='param-label'>流量:</Text>
                        <Text className='param-value'>
                          {result.pump.min_flow_rate}-{result.pump.max_flow_rate} m³/h
                        </Text>
                      </View>
                      <View className='param-item'>
                        <Text className='param-label'>扬程:</Text>
                        <Text className='param-value'>
                          {result.pump.min_head}-{result.pump.max_head} m
                        </Text>
                      </View>
                      <View className='param-item'>
                        <Text className='param-label'>功率:</Text>
                        <Text className='param-value'>{result.pump.rated_power} kW</Text>
                      </View>
                    </View>
                    <View className='result-footer'>
                      <Text className='result-price'>¥{result.pump.price}</Text>
                      <Text className='result-arrow'>查看详情 ›</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    )
  }
}

export default withRedux(Selection)

