// pages/detail/detail.js
const api = require('../../utils/api')
const { requireApproved, requireAdmin, showLoading, showSuccess, showError, showConfirm, formatDate, STATUS_OPTIONS } = require('../../utils/util')
const app = getApp()

// 每个类别的字段 key，用于判断该类别是否有数据
const SECTION_FIELDS = {
  2: ['totalCabinets', 'availableCabinets', 'maxCabinetPower', 'continuousCabinets', 'physicalIsolation'],
  3: ['mainsCapacity', 'availablePower', 'expandablePower', 'transformerConfig', 'transformerCapacity', 'generatorRedundancy', 'generatorFuelHours', 'upsConfig', 'upsBatteryMinutes', 'highDensityBusway', 'bbuSuperCapacitor', 'powerSLA'],
  4: ['mainCoolingType', 'coldPlateLiquid', 'liquidCoolRetrofit', 'liquidCoolPeriod', 'hasCDU', 'chilledWaterSupplyTemp', 'chilledWaterReturnTemp', 'endAirconRedundancy', 'chillerCount', 'pueDesign'],
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
    // 各类别是否有数据
    hasSection2: false, hasSection3: false, hasSection4: false,
    hasSection5: false, hasSection6: false, hasSection7: false,
    hasSection8: false, hasSection9: false
  },

  onLoad(options) {
    // if (!requireApproved()) return  // TODO: 登录功能完成后恢复
    const id = options.id
    if (!id) { showError('缺少参数'); return }
    this.setData({ id, isAdmin: app.globalData.role === 'admin' })
    this.loadDetail(id)
  },

  loadDetail(id) {
    this.setData({ loading: true })
    Promise.all([
      api.getDatacenterDetail(id),
      api.callFunction('getDatacenters', { historyOf: id })
    ]).then(([detail, historyResult]) => {
      const statusObj = STATUS_OPTIONS.find(s => s.value === (detail.status || 'new'))
      const editHistory = (historyResult || []).map(h => ({
        ...h,
        updatedAt: formatDate(h.updatedAt, 'YYYY-MM-DD HH:mm')
      }))

      // 计算各类别是否有数据
      const sectionFlags = {}
      for (const [num, fields] of Object.entries(SECTION_FIELDS)) {
        sectionFlags[`hasSection${num}`] = fields.some(f => detail[f] !== undefined && detail[f] !== null && detail[f] !== '')
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
        ...sectionFlags
      })
    }).catch(err => {
      this.setData({ loading: false })
      showError('加载失败')
      console.error(err)
    })
  },

  previewPhoto(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.detail.photos[index],
      urls: this.data.detail.photos
    })
  },

  handleEdit() {
    wx.navigateTo({
      url: `/pages/form/basic?id=${this.data.id}&mode=edit`
    })
  },

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
