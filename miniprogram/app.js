// app.js - AIDC Collector 应用入口
App({
  onLaunch() {
    // 初始化云开发（正式上线时取消注释）
    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     env: 'your-env-id',
    //     traceUser: true
    //   })
    // }
    console.log('[AIDC Collector] 应用启动')
  },

  onShow() {
    // 全局禁止分享（数据安全）
    wx.hideShareMenu({ menus: ['shareTimeline', 'shareAppMessage'] })
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    role: '',       // collector | admin
    userStatus: '', // pending | approved | disabled
  },

  // 检查登录状态，未登录则跳转登录页
  checkLogin() {
    // Mock 模式：自动填充测试用户，跳过登录页
    // 正式上线时删除此块
    const mockUser = {
      _id: 'mock-admin-001',
      name: 'Willis',
      phone: '18621322945',
      role: 'admin',
      status: 'approved',
      needChangePassword: false,
      region: 'southeast_asia'
    }
    this.setUserInfo(mockUser)
    return

    // 正式登录检查
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true
    this.globalData.role = userInfo.role || 'collector'
    this.globalData.userStatus = userInfo.status || 'pending'
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true
    this.globalData.role = userInfo.role || 'collector'
    this.globalData.userStatus = userInfo.status || 'pending'
    wx.setStorageSync('userInfo', userInfo)
  },

  // 清除登录状态
  clearUserInfo() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    this.globalData.role = ''
    this.globalData.userStatus = ''
    wx.removeStorageSync('userInfo')
  },

  // 判断是否为管理员
  isAdmin() {
    return this.globalData.role === 'admin'
  },

  // 判断用户是否已开通（status === 'approved'）
  isApproved() {
    return this.globalData.userStatus === 'approved'
  }
})
