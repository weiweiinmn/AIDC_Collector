// utils/auth.js - 登录状态管理（手机号+密码登录 + 管理员开通制）
const app = getApp()

/**
 * 检查登录状态，未登录则跳转登录页
 * @returns {boolean} 是否已登录
 */
const requireAuth = () => {
  if (!app.globalData.isLoggedIn) {
    wx.redirectTo({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}

/**
 * 检查用户是否已开通（管理员审批通过）
 * 未开通用户跳转到登录页显示等待提示
 * @returns {boolean} 是否已开通
 */
const requireApproved = () => {
  if (!requireAuth()) return false
  if (app.globalData.userStatus !== 'approved') {
    wx.redirectTo({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}

/**
 * 要求管理员权限
 * @returns {boolean} 是否为管理员且已开通
 */
const requireAdmin = () => {
  if (!requireApproved()) return false
  if (app.globalData.role !== 'admin') {
    wx.showToast({
      title: '需要管理员权限',
      icon: 'none'
    })
    return false
  }
  return true
}

module.exports = {
  requireAuth,
  requireApproved,
  requireAdmin
}
