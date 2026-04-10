// components/watermark/watermark.js - 全局水印组件
const app = getApp()

Component({
  properties: {},

  data: {
    watermarkStyle: ''
  },

  lifetimes: {
    attached() {
      this.generateWatermark()
    }
  },

  pageLifetimes: {
    show() {
      this.generateWatermark()
    }
  },

  methods: {
    generateWatermark() {
      const userInfo = app.globalData.userInfo
      if (!userInfo) return

      const name = userInfo.name || ''
      const phone = userInfo.phone || ''
      const text = `${name} ${phone}`

      if (!text.trim()) return

      try {
        // 使用离屏 Canvas 生成水印图片，转 base64 作为 CSS background-image
        const dpr = 2
        const w = 240
        const h = 100

        const canvas = wx.createOffscreenCanvas({ type: '2d', width: w * dpr, height: h * dpr })
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)

        ctx.font = '13px sans-serif'
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.translate(w / 2, h / 2)
        ctx.rotate(-18 * Math.PI / 180)
        ctx.textAlign = 'center'
        ctx.fillText(text, 0, 0)

        const dataUrl = canvas.toDataURL()
        const style = `background-image: url(${dataUrl}); background-repeat: repeat;`
        this.setData({ watermarkStyle: style })
      } catch (e) {
        console.error('水印生成失败:', e)
        // 降级方案：使用纯文本水印
        const encoded = encodeURIComponent(text)
        this.setData({
          watermarkStyle: ``
        })
      }
    }
  }
})
