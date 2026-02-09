export default class WxCanvas {
  constructor(ctx, canvasId, isNew, canvasNode) {
    this.ctx = ctx
    this.canvasId = canvasId
    this.chart = null
    this.isNew = isNew

    if (isNew) {
      this.canvasNode = canvasNode
    } else {
      this._initStyle(ctx)
    }

    this._initEvent()
  }

  getContext(contextType) {
    if (contextType === '2d') {
      return this.ctx
    } else {
      return null
    }
  }

  // 添加 canvasContext 兼容方法
  setChart(chart) {
    this.chart = chart
  }

  addEventListener() {
    // 微信小程序不支持 addEventListener
  }

  removeEventListener() {
    // 微信小程序不支持 removeEventListener
  }

  _initStyle(ctx) {
    const styles = ['fillStyle', 'strokeStyle', 'globalAlpha',
      'textAlign', 'textBaseline', 'shadow', 'lineWidth',
      'lineCap', 'lineJoin', 'fontSize', 'font'
    ]

    styles.forEach(style => {
      Object.defineProperty(this, style, {
        get: function() {
          return this.ctx[style]
        },
        set: function(value) {
          this.ctx[style] = value
        }
      })
    })

    ctx.createRadialGradient = () => {
      return ctx.createCircularGradient(arguments)
    }
  }

  _initEvent() {
    // 微信小程序 canvas 事件
    this.event = {}
    const eventNames = [{
      wxName: 'touchStart',
      name: 'mousedown'
    }, {
      wxName: 'touchMove',
      name: 'mousemove'
    }, {
      wxName: 'touchEnd',
      name: 'mouseup'
    }]

    eventNames.forEach(name => {
      this.event[name.name] = (e) => {
        const touch = e.mp.touches[0]
        this.chart._zr.handler.dispatch(name, {
          zrX: name.wxName === 'tap' ? touch.clientX : touch.x,
          zrY: name.wxName === 'tap' ? touch.clientY : touch.y
        })
      }
    })
  }

  set width(w) {
    if (this.canvasNode) this.canvasNode.width = w
  }

  set height(h) {
    if (this.canvasNode) this.canvasNode.height = h
  }

  get width() {
    if (this.canvasNode)
      return this.canvasNode.width
    return 0
  }

  get height() {
    if (this.canvasNode)
      return this.canvasNode.height
    return 0
  }
}
