// pages/settings/settings.js
const api = require('../../utils/api')
const app = getApp()

Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} })
  },

  goChangePassword() {
    wx.navigateTo({ url: '/pages/settings/changePassword' })
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录才能使用',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          app.clearUserInfo()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
