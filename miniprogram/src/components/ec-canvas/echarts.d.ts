declare module './echarts' {
  interface EChartsOption {
    title?: any
    tooltip?: any
    grid?: any
    xAxis?: any
    yAxis?: any
    series?: any
    legend?: any
  }

  class ECharts {
    setOption(option: EChartsOption, notMerge?: boolean, lazyUpdate?: boolean): void
    resize(width?: number | { width?: number; height?: number }, height?: number): void
    clear(): void
    dispose(): void
    on(eventName: string, handler: Function): void
    off(eventName: string, handler?: Function): void
  }

  export default ECharts
}
