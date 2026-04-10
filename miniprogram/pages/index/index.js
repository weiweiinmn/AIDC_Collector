// pages/index/index.js
const api = require('../../utils/api')
const { requireApproved, requireAdmin } = require('../../utils/auth')
const { formatDate, STATUS_OPTIONS } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    userInfo: {},
    isAdmin: false,
    stats: { total: 0, today: 0, mine: 0 },
    recentList: []
  },

  onLoad() {
    // if (!requireApproved()) return  // TODO: 登录功能完成后恢复
    this.initPage()
  },

  onShow() {
    if (app.globalData.isLoggedIn) {
      this.initPage()
    }
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  initPage() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      userInfo,
      isAdmin: app.globalData.role === 'admin'
    })
    this.loadData()
  },

  loadData() {
    return api.getDatacenters({ page: 1, pageSize: 5 }).then((result) => {
      const list = (result.list || []).map(item => {
        const statusObj = STATUS_OPTIONS.find(s => s.value === (item.status || 'new'))
        return {
          ...item,
          visitDate: formatDate(item.visitDate),
          statusText: statusObj ? statusObj.label : '新发现'
        }
      })

      this.setData({
        'stats.total': result.total || 0,
        'stats.today': result.monthCount || 0,
        'stats.mine': result.myCount || 0,
        recentList: list
      })
    }).catch(err => {
      console.error('加载数据失败:', err)
    })
  },

  // 跳转
  goForm() {
    wx.navigateTo({ url: '/pages/form/basic' })
  },

  goList() {
    wx.switchTab({ url: '/pages/list/list' })
  },

  goExport() {
    if (!requireAdmin()) return
    wx.navigateTo({ url: '/pages/export/export' })
  },

  goImport() {
    wx.navigateTo({ url: '/pages/import/import' })
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goSettings() {
    wx.switchTab({ url: '/pages/settings/settings' })
  },

  handleScan() {
    // 预留扫码录入
    wx.showToast({ title: '扫码录入开发中', icon: 'none' })
  }
})
