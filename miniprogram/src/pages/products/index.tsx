import { Component } from 'react'
import { View, Text, Input, ScrollView, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { withRedux } from '@/store/withRedux'

import { getPumps, setFilters, setPage } from '@/store/modules/pump'
import { Pump } from '@/types'
import './index.scss'

interface Props {
  pumps: Pump[]
  total: number
  loading: boolean
  page: number
  pageSize: number
  filters: any
  getPumps: typeof getPumps
  setFilters: typeof setFilters
  setPage: typeof setPage
}

interface State {
  searchText: string
  typeIndex: number
  seriesIndex: number
  powerIndex: number
  types: string[]
  series: string[]
  powerRanges: string[]
  showFilter: boolean
}

const PUMP_TYPES = ['全部', '离心泵', '立式泵', '潜水泵']
const PUMP_SERIES = ['全部', 'Standard', 'Vertical', 'WQ']
const POWER_RANGES = ['全部', '0-5 kW', '5-10 kW', '10-20 kW', '20-50 kW', '50+ kW']

@connect(
  ({ pump }: RootState) => ({
    pumps: pump.pumps,
    total: pump.total,
    loading: pump.loading,
    page: pump.page,
    pageSize: pump.pageSize,
    filters: pump.filters,
  }),
  (dispatch: AppDispatch) => ({
    getPumps: (params: any) => dispatch(getPumps(params)),
    setFilters: (filters: any) => dispatch(setFilters(filters)),
    setPage: (page: number) => dispatch(setPage(page)),
  })
)
class Products extends Component<Props, State> {
  state: State = {
    searchText: '',
    typeIndex: 0,
    seriesIndex: 0,
    powerIndex: 0,
    types: PUMP_TYPES,
    series: PUMP_SERIES,
    powerRanges: POWER_RANGES,
    showFilter: false,
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '产品库',
    })
    this.loadPumps()
  }

  // 下拉刷新
  onPullDownRefresh = () => {
    this.props.setPage(1)
    this.loadPumps()
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  // 上拉加载更多
  onReachBottom = () => {
    const { pumps, total, page, pageSize } = this.props
    if (pumps.length < total && !this.props.loading) {
      this.props.setPage(page + 1)
      this.loadPumps()
    }
  }

  // 搜索
  handleSearch = (value: string) => {
    this.setState({ searchText: value })
    this.applyFilters()
  }

  // 类型筛选
  handleTypeChange = (e: any) => {
    this.setState({ typeIndex: e.detail.value })
    this.applyFilters()
  }

  // 系列筛选
  handleSeriesChange = (e: any) => {
    this.setState({ seriesIndex: e.detail.value })
    this.applyFilters()
  }

  // 功率筛选
  handlePowerChange = (e: any) => {
    this.setState({ powerIndex: e.detail.value })
    this.applyFilters()
  }

  // 应用筛选
  applyFilters = () => {
    const { searchText, typeIndex, seriesIndex, powerIndex } = this.state
    const filters: any = {}

    if (searchText) {
      filters.model = searchText
    }
    if (typeIndex > 0) {
      filters.pumpType = PUMP_TYPES[typeIndex]
    }
    if (seriesIndex > 0) {
      filters.series = PUMP_SERIES[seriesIndex]
    }
    if (powerIndex > 0) {
      const range = POWER_RANGES[powerIndex].split('-')
      if (range.length === 2) {
        filters.minPower = parseInt(range[0])
        filters.maxPower = parseInt(range[1])
      } else if (range[0] === '50+') {
        filters.minPower = 50
      }
    }

    this.props.setFilters(filters)
    this.props.setPage(1)
    this.loadPumps()
  }

  // 加载水泵列表
  loadPumps = () => {
    const { page, pageSize, filters } = this.props
    this.props.getPumps({
      skip: (page - 1) * pageSize,
      limit: pageSize,
      filters,
    })
  }

  // 查看详情
  handleViewDetail = (pump: Pump) => {
    // TODO: 跳转到产品详情页面
    Taro.showToast({
      title: '详情页面开发中',
      icon: 'none',
    })
  }

  // 切换筛选面板
  toggleFilter = () => {
    this.setState((prevState) => ({
      showFilter: !prevState.showFilter,
    }))
  }

  render() {
    const {
      pumps,
      total,
      loading,
      page,
      pageSize,
    } = this.props
    const {
      searchText,
      typeIndex,
      seriesIndex,
      powerIndex,
      types,
      series,
      powerRanges,
      showFilter,
    } = this.state

    return (
      <ScrollView
        scrollY
        className='products-page'
        onPullDownRefresh={this.onPullDownRefresh}
        onReachBottom={this.onReachBottom}
      >
        {/* 搜索栏 */}
        <View className='search-bar'>
          <View className='search-input-wrapper'>
            <Text className='search-icon'>🔍</Text>
            <Input
              className='search-input'
              placeholder='搜索型号或名称'
              value={searchText}
              onInput={(e) => this.handleSearch(e.detail.value)}
            />
            {searchText && (
              <Text
                className='clear-icon'
                onClick={() => this.handleSearch('')}
              >
                ✕
              </Text>
            )}
          </View>
          <View className='filter-btn' onClick={this.toggleFilter}>
            <Text>筛选</Text>
            <Text className='filter-arrow'>{showFilter ? '▲' : '▼'}</Text>
          </View>
        </View>

        {/* 筛选面板 */}
        {showFilter && (
          <View className='filter-panel'>
            <View className='filter-item'>
              <Text className='filter-label'>水泵类型</Text>
              <Picker
                mode='selector'
                range={types}
                value={typeIndex}
                onChange={this.handleTypeChange}
              >
                <View className='picker-view'>
                  <Text>{types[typeIndex]}</Text>
                  <Text className='picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>

            <View className='filter-item'>
              <Text className='filter-label'>产品系列</Text>
              <Picker
                mode='selector'
                range={series}
                value={seriesIndex}
                onChange={this.handleSeriesChange}
              >
                <View className='picker-view'>
                  <Text>{series[seriesIndex]}</Text>
                  <Text className='picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>

            <View className='filter-item'>
              <Text className='filter-label'>功率范围</Text>
              <Picker
                mode='selector'
                range={powerRanges}
                value={powerIndex}
                onChange={this.handlePowerChange}
              >
                <View className='picker-view'>
                  <Text>{powerRanges[powerIndex]}</Text>
                  <Text className='picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>
          </View>
        )}

        {/* 结果统计 */}
        <View className='result-info'>
          <Text className='result-text'>共找到 {total} 款产品</Text>
        </View>

        {/* 产品列表 */}
        <View className='product-list'>
          {loading && pumps.length === 0 ? (
            <View className='loading'>
              <Text>加载中...</Text>
            </View>
          ) : pumps.length === 0 ? (
            <View className='empty'>
              <Text className='empty-icon'>📦</Text>
              <Text className='empty-text'>暂无产品</Text>
              <Text className='empty-desc'>尝试调整筛选条件</Text>
            </View>
          ) : (
            pumps.map((pump) => (
              <View
                key={pump.id}
                className='product-card'
                onClick={() => this.handleViewDetail(pump)}
              >
                <View className='product-header'>
                  <Text className='product-model'>{pump.model}</Text>
                  <View className='product-type-badge'>
                    <Text className='badge-text'>{pump.type}</Text>
                  </View>
                </View>

                <Text className='product-name'>{pump.name}</Text>
                <Text className='product-description'>{pump.description}</Text>

                <View className='product-params'>
                  <View className='param-item'>
                    <Text className='param-label'>流量:</Text>
                    <Text className='param-value'>
                      {pump.min_flow_rate}-{pump.max_flow_rate} m³/h
                    </Text>
                  </View>
                  <View className='param-item'>
                    <Text className='param-label'>扬程:</Text>
                    <Text className='param-value'>
                      {pump.min_head}-{pump.max_head} m
                    </Text>
                  </View>
                  <View className='param-item'>
                    <Text className='param-label'>功率:</Text>
                    <Text className='param-value'>{pump.rated_power} kW</Text>
                  </View>
                  <View className='param-item'>
                    <Text className='param-label'>效率:</Text>
                    <Text className='param-value'>{pump.efficiency}%</Text>
                  </View>
                </View>

                <View className='product-footer'>
                  <View className='product-price'>
                    <Text className='price-label'>价格:</Text>
                    <Text className='price-value'>¥{pump.price}</Text>
                  </View>
                  {pump.in_stock ? (
                    <View className='stock-badge'>
                      <Text className='stock-text'>有货</Text>
                    </View>
                  ) : (
                    <View className='stock-badge stock-badge--out'>
                      <Text className='stock-text'>缺货</Text>
                    </View>
                  )}
                  <Text className='view-arrow'>查看详情 ›</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 加载更多 */}
        {loading && pumps.length > 0 && (
          <View className='loading-more'>
            <Text>加载更多...</Text>
          </View>
        )}

        {/* 没有更多 */}
        {!loading && pumps.length >= total && total > 0 && (
          <View className='no-more'>
            <Text>没有更多了</Text>
          </View>
        )}
      </ScrollView>
    )
  }
}

export default withRedux(Products)

