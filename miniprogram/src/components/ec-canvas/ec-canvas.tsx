import React from 'react'
import Taro from '@tarojs/taro'
import WxCanvas from './wx-canvas'
import * as echarts from './echarts'

let ctx

function compareVersion(v1: any, v2: any) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

const EcCanvas: React.FC<any> = (props) => {
  const { canvasId, ec } = props

  const [state, setState] = React.useState({
    isUseNewCanvas: false
  })

  React.useEffect(() => {
    if (!ec) {
      console.warn('组件需传入 ec 对象')
      return
    }

    const version = Taro.getSystemInfoSync().SDKVersion
    const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0

    setState({ isUseNewCanvas: canUseNewCanvas })
  }, [])

  return (
    <View style={{ width: ec.width, height: ec.height }}>
      {state.isUseNewCanvas ? (
        <canvas type="2d" id={canvasId} canvasId={canvasId} style={{ width: ec.width, height: ec.height }} />
      ) : (
        <canvas canvasId={canvasId} style={{ width: ec.width, height: ec.height }} />
      )}
    </View>
  )
}

export default EcCanvas
