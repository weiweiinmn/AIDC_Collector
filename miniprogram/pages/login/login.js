// pages/login/login.js - 手机号+密码登录
const api = require('../../utils/api')
const { showLoading, showError, formatDate } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    phone: '',
    password: '',
    loading: false,
    isLoggedIn: false,
    userStatus: '',
    loginTime: '',
    rejectReason: ''
  },

  onLoad() {
    this.checkCurrentStatus()
  },

  onShow() {
    this.checkCurrentStatus()
  },

  // 检查当前登录状态
  checkCurrentStatus() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) {
      this.setData({ isLoggedIn: false, userStatus: '' })
      return
    }

    if (userInfo.status === 'approved') {
      this.redirectToHome()
      return
    }

    this.setData({
      isLoggedIn: true,
      userStatus: userInfo.status || 'pending',
      loginTime: formatDate(userInfo.lastLoginAt || new Date(), 'YYYY-MM-DD HH:mm'),
      rejectReason: userInfo.rejectReason || ''
    })
  },

  // 输入事件
  onPhoneChange(e) {
    this.setData({ phone: e.detail.value || '' })
  },

  onPasswordChange(e) {
    this.setData({ password: e.detail.value || '' })
  },

  // 登录
  handleLogin() {
    if (this.data.loading) return

    const { phone, password } = this.data
    if (!phone.trim()) { showError('请输入手机号'); return }
    if (!/^1\d{10}$/.test(phone.trim())) { showError('手机号格式不正确'); return }
    if (!password) { showError('请输入密码'); return }

    this.setData({ loading: true })
    const hideLoading = showLoading('登录中...')

    api.login({ phone: phone.trim(), password }).then((userInfo) => {
      hideLoading()
      this.setData({ loading: false })

      // 保存用户信息
      app.setUserInfo(userInfo)

      if (userInfo.status === 'approved') {
        this.redirectToHome()
      } else {
        this.setData({
          isLoggedIn: true,
          userStatus: userInfo.status || 'pending',
          loginTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
          rejectReason: userInfo.rejectReason || ''
        })
      }
    }).catch((err) => {
      hideLoading()
      console.error('登录失败:', err)
      showError(err.message || '登录失败，请检查手机号和密码')
      this.setData({ loading: false })
    })
  },

  // 退出登录
  handleLogout() {
    app.clearUserInfo()
    this.setData({
      isLoggedIn: false,
      userStatus: '',
      loginTime: '',
      rejectReason: '',
      phone: '',
      password: ''
    })
  },

  redirectToHome() {
    wx.switchTab({
      url: '/pages/index/index',
      fail: () => {
        wx.redirectTo({ url: '/pages/index/index' })
      }
    })
  }
})
