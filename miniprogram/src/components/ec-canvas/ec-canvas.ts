import WxCanvas from './wx-canvas'
import * as echarts from './echarts'

let ctx

function compareVersion(v1, v2) {
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

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },

    ec: {
      type: Object
    }
  },

  data: {
    isUseNewCanvas: false
  },

  ready: function () {
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-pie" canvas-id="mychart-pie" ec="{{ ec }}"></ec-canvas>')
      return
    }

    if (!this.data.ec.lazyLoad) {
      this.init()
    }
  },

  methods: {
    init: function (callback) {
      const version = Taro.getSystemInfoSync().SDKVersion

      const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0
      const isUseNewCanvas = this.data.isUseNewCanvas

      if (isUseNewCanvas && !canUseNewCanvas) {
        console.error('微信基础库版本过低，需大于等于 2.9.0。请升级微信客户端或使用旧版 canvas。')
        return
      }

      this.setData({ isUseNewCanvas: canUseNewCanvas })

      if (typeof callback === 'function') {
        this.chart = callback(echarts, {
          width: this.data.ec.width,
          height: this.data.ec.height,
        })
      }
      else if (this.data.ec.onInit) {
        this.chart = this.data.ec.onInit(echarts, {
          width: this.data.ec.width,
          height: this.data.ec.height,
        })
      }

      return this.chart
    },

    canvasToTempFilePath: function (opt) {
      if (this.data.isUseNewCanvas) {
        return this.data.ec.canvas.toTempFilePath(opt)
      } else {
        return Taro.canvasToTempFilePath({
          canvasId: this.properties.canvasId,
          ...opt
        }, this)
      }
    },

    touchStart: function (e) {
      if (this.data.ec.onTouchStart) {
        this.data.ec.onTouchStart(e)
      }
      if (this.chart) {
        this.chart.getZr().handler.dispatch('mousedown', {
          zrX: e.touches[0].x,
          zrY: e.touches[0].y
        })
      }
    },

    touchMove: function (e) {
      if (this.data.ec.onTouchMove) {
        this.data.ec.onTouchMove(e)
      }
      if (this.chart) {
        this.chart.getZr().handler.dispatch('mousemove', {
          zrX: e.touches[0].x,
          zrY: e.touches[0].y
        })
      }
    },

    touchEnd: function (e) {
      if (this.data.ec.onTouchEnd) {
        this.data.ec.onTouchEnd(e)
      }
      if (this.chart) {
        this.chart.getZr().handler.dispatch('mouseup', {
          zrX: e.changedTouches[0].x,
          zrY: e.changedTouches[0].y
        })
      }
    }
  }
})
