// pages/detail/detail.js - 机房详情页
const api = require('../../utils/api')
const { showLoading, showSuccess, showError, showConfirm, formatDate, STATUS_OPTIONS } = require('../../utils/util')
const app = getApp()

// 每个类别的字段 key，用于判断该类别是否有数据
const SECTION_FIELDS = {
  2: ['totalCabinets', 'availableCabinets', 'maxCabinetPower', 'continuousCabinets', 'physicalIsolation'],
  3: ['mainsCapacity', 'availablePower', 'expandablePower', 'transformerConfig', 'transformerCapacity', 'generatorRedundancy', 'generatorFuelHours', 'upsConfig', 'upsBatteryMinutes', 'highDensityBusway', 'bbuSuperCapacitor', 'powerSLA'],
  4: ['mainCoolingType', 'coldPlateLiquid', 'liquidCoolRetrofit', 'hasCDU', 'chilledWaterSupplyTemp', 'chilledWaterReturnTemp', 'endAirconRedundancy', 'chillerCount', 'pueDesign'],
  5: ['floorLoad', 'raisedFloorHeight', 'freightElevatorWidth', 'freightElevatorHeight', 'freightElevatorLoad', 'transportCorridorWidth', 'loadingDock'],
  6: ['networkRoutes', 'ispCount', 'darkFiber', 'support800G', 'supportRoCEIB'],
  7: ['delivery3Months', 'delivery6Months', 'existingLiquidPower', 'existingLiquidCount', 'powerRetrofitPeriod', 'coolingRetrofitPeriod'],
  8: ['officeSeats', 'storageArea', 'ops24x7', 'faultResponseTime', 'liquidCoolMaintenance'],
  9: ['electricityBilling', 'oneTimeFee', 'liquidCoolServiceFee']
}

Page({
  data: {
    id: '',
    detail: null,
    editHistory: [],
    statusLabel: '',
    loading: true,
    isAdmin: false,
    canEdit: false,
    // 各类别是否有数据
    hasSection2: false, hasSection3: false, hasSection4: false,
    hasSection5: false, hasSection6: false, hasSection7: false,
    hasSection8: false, hasSection9: false
  },

  onLoad(options) {
    const id = options.id
    if (!id) { showError('缺少参数'); return }

    // 当前用户身份
    const isAdmin = app.globalData.role === 'admin'
    const userId = app.globalData.userInfo && app.globalData.userInfo._id
    this.setData({ id, isAdmin })

    this.loadDetail(id, isAdmin, userId)
  },

  loadDetail(id, isAdmin, userId) {
    this.setData({ loading: true })
    Promise.all([
      api.getDatacenterDetail(id),
      api.callFunction('getDatacenters', { historyOf: id })
    ]).then(([detail, historyResult]) => {
      // 判断编辑权限：本人（createdBy 匹配）或管理员
      const canEdit = isAdmin || detail.createdBy === userId

      const statusObj = STATUS_OPTIONS.find(s => s.value === (detail.status || 'new'))
      const editHistory = (historyResult || []).map(h => ({
        ...h,
        updatedAt: formatDate(h.updatedAt, 'YYYY-MM-DD HH:mm')
      }))

      // 计算各类别是否有数据
      const sectionFlags = {}
      for (const [num, fields] of Object.entries(SECTION_FIELDS)) {
        sectionFlags[`hasSection${num}`] = fields.some(f =>
          detail[f] !== undefined && detail[f] !== null && detail[f] !== ''
        )
      }

      // 格式化导入时间
      if (detail.importedAt) {
        detail.importedAt = formatDate(detail.importedAt, 'YYYY-MM-DD HH:mm')
      }

      this.setData({
        detail: {
          ...detail,
          createdAt: formatDate(detail.createdAt, 'YYYY-MM-DD HH:mm')
        },
        editHistory,
        statusLabel: statusObj ? statusObj.label : '新发现',
        loading: false,
        canEdit,
        ...sectionFlags
      })
    }).catch(err => {
      this.setData({ loading: false })
      showError('加载失败')
      console.error(err)
    })
  },

  // 预览照片
  previewPhoto(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.detail.photos || []
    if (urls.length === 0) return
    wx.previewImage({
      current: urls[index],
      urls: urls
    })
  },

  // 跳转编辑页
  handleEdit() {
    if (!this.data.canEdit) {
      showError('您没有编辑权限')
      return
    }
    wx.navigateTo({
      url: `/pages/form/basic?id=${this.data.id}&mode=edit`
    })
  },

  // 删除记录（仅管理员）
  handleDelete() {
    showConfirm('确定要删除这条记录吗？此操作不可恢复。').then(confirmed => {
      if (!confirmed) return
      const hideLoading = showLoading('删除中...')
      api.deleteDatacenter(this.data.id).then(() => {
        hideLoading()
        showSuccess('已删除')
        setTimeout(() => wx.navigateBack(), 1500)
      }).catch(err => {
        hideLoading()
        showError('删除失败')
      })
    })
  },

  // 禁止分享（数据安全）
  onShareAppMessage() {
    return false
  }
})
