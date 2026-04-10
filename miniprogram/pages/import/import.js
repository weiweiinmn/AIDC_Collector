// pages/import/import.js - Excel 导入机房信息
const api = require('../../utils/api')
const { requireApproved, showLoading, showSuccess, showError, showConfirm, formatDate } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    fileId: '',          // 云存储文件 ID
    tempFilePath: '',    // 本地临时文件路径
    fileName: '',        // 显示文件名
    fileSize: '',        // 显示文件大小
    exportingTemplate: false,
    importing: false,
    importResult: null   // { created, updated, errors, importedByName, importedAt }
  },

  onLoad() {
    // if (!requireApproved()) return  // TODO: 登录功能完成后恢复
  },

  // 导出空白模板
  handleExportTemplate() {
    if (this.data.exportingTemplate) return
    const hideLoading = showLoading('生成模板中...')
    this.setData({ exportingTemplate: true })

    api.exportExcel({ templateOnly: true }).then(result => {
      hideLoading()
      this.setData({ exportingTemplate: false })
      this.downloadAndOpen(result.fileId, 'AIDC调研问卷_空白模板.xlsx')
    }).catch(err => {
      hideLoading()
      this.setData({ exportingTemplate: false })
      showError('导出模板失败: ' + (err.message || ''))
    })
  },

  // 选择文件
  handleChooseFile() {
    const that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['.xlsx', '.xls'],
      success(res) {
        const file = res.tempFiles[0]
        that.setData({
          tempFilePath: file.path,
          fileName: file.name,
          fileSize: that.formatFileSize(file.size)
        })
        that.uploadFile(file.path)
      },
      fail() {
        // 用户取消
      }
    })
  },

  // 移除已选文件
  handleRemoveFile(e) {
    e.stopPropagation()
    this.setData({
      fileId: '',
      tempFilePath: '',
      fileName: '',
      fileSize: '',
      importResult: null
    })
  },

  // 上传文件到云存储
  uploadFile(tempFilePath) {
    const hideLoading = showLoading('上传文件中...')
    const cloudPath = `imports/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.xlsx`

    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (res) => {
        hideLoading()
        this.setData({ fileId: res.fileID })
        showSuccess('文件上传成功')
      },
      fail: (err) => {
        hideLoading()
        console.error('上传失败:', err)
        showError('文件上传失败')
        this.setData({ tempFilePath: '', fileName: '', fileSize: '' })
      }
    })
  },

  // 执行导入
  handleImport() {
    if (this.data.importing) return
    const fileId = this.data.fileId
    if (!fileId) {
      showError('请先选择文件')
      return
    }

    showConfirm('确定要导入此文件中的机房信息吗？同名的机房记录将被更新。').then(confirmed => {
      if (!confirmed) return

      const hideLoading = showLoading('导入中，请稍候...')
      this.setData({ importing: true, importResult: null })

      api.importExcel(fileId).then(result => {
        hideLoading()
        this.setData({
          importing: false,
          importResult: {
            created: result.created || 0,
            updated: result.updated || 0,
            errors: result.errors || [],
            importedByName: result.importedByName || app.globalData.userInfo.nickName,
            importedAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm')
          }
        })
        showSuccess(`导入完成：新增${result.created || 0}条，更新${result.updated || 0}条`)
      }).catch(err => {
        hideLoading()
        this.setData({ importing: false })
        showError('导入失败: ' + (err.message || ''))
      })
    })
  },

  // 下载并打开文件
  downloadAndOpen(fileId, defaultName) {
    wx.cloud.downloadFile({
      fileID: fileId,
      success: (res) => {
        wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          fileType: 'xlsx'
        })
      },
      fail: () => showError('打开文件失败')
    })
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
})
