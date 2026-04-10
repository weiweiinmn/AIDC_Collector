// pages/settings/changePassword/changePassword.js
const api = require('../../../utils/api')
const { showLoading, showSuccess, showError } = require('../../../utils/util')
const app = getApp()

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    submitting: false
  },

  onOldPasswordChange(e) {
    this.setData({ oldPassword: e.detail.value || '' })
  },

  onNewPasswordChange(e) {
    this.setData({ newPassword: e.detail.value || '' })
  },

  onConfirmPasswordChange(e) {
    this.setData({ confirmPassword: e.detail.value || '' })
  },

  handleSubmit() {
    if (this.data.submitting) return

    const { oldPassword, newPassword, confirmPassword } = this.data
    if (!oldPassword) { showError('请输入原密码'); return }
    if (!newPassword) { showError('请输入新密码'); return }
    if (newPassword.length < 6) { showError('新密码至少6位'); return }
    if (newPassword !== confirmPassword) { showError('两次输入的新密码不一致'); return }

    const userInfo = app.globalData.userInfo || {}
    const hideLoading = showLoading('修改中...')
    this.setData({ submitting: true })

    api.changePassword({
      phone: userInfo.phone,
      oldPassword,
      newPassword
    }).then(() => {
      hideLoading()
      this.setData({ submitting: false, oldPassword: '', newPassword: '', confirmPassword: '' })
      showSuccess('密码修改成功')
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(err => {
      hideLoading()
      this.setData({ submitting: false })
      showError(err.message || '修改失败')
    })
  }
})
