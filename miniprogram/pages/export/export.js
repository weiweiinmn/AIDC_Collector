// pages/export/export.js - 导出页（含空白模板 + 完整数据导出 + 导入入口）
const api = require('../../utils/api')
const { requireAdmin, showLoading, showSuccess, showError, formatDate } = require('../../utils/util')
const app = getApp()

// 完整导出字段（对应 Excel 调研问卷的65个业务字段）
const ALL_EXPORT_FIELDS = [
  { key: 'name', label: '数据中心名称' },
  { key: 'address', label: '地址（国家/城市/园区）' },
  { key: 'ownership', label: '产权归属' },
  { key: 'expectedDelivery', label: '预计交付运营时间' },
  { key: 'totalCabinets', label: '总机柜数量' },
  { key: 'availableCabinets', label: '当前可提供机柜数量' },
  { key: 'maxCabinetPower', label: '机柜最高可支撑功率' },
  { key: 'continuousCabinets', label: '能否连续布置机柜' },
  { key: 'physicalIsolation', label: '是否支持物理隔离' },
  { key: 'mainsCapacity', label: '市电总容量' },
  { key: 'availablePower', label: '当前可用电力' },
  { key: 'expandablePower', label: '可扩容电力上限' },
  { key: 'transformerConfig', label: '变压器配置' },
  { key: 'transformerCapacity', label: '单台变压器容量' },
  { key: 'generatorRedundancy', label: '柴发冗余等级' },
  { key: 'generatorFuelHours', label: '柴发储油时长' },
  { key: 'upsConfig', label: 'UPS配置' },
  { key: 'upsBatteryMinutes', label: 'UPS电池后备时间' },
  { key: 'highDensityBusway', label: '是否配备高密度母线' },
  { key: 'bbuSuperCapacitor', label: '是否配备BBU/超级电容' },
  { key: 'powerSLA', label: '电力可用性SLA' },
  { key: 'mainCoolingType', label: '主制冷方式' },
  { key: 'coldPlateLiquid', label: '是否支持冷板式液冷' },
  { key: 'liquidCoolRetrofit', label: '如无液冷能否改造' },
  { key: 'liquidCoolPeriod', label: '液冷改造周期' },
  { key: 'hasCDU', label: '是否配备CDU' },
  { key: 'chilledWaterSupplyTemp', label: '冷冻水供水温度' },
  { key: 'chilledWaterReturnTemp', label: '冷冻水回水温度' },
  { key: 'endAirconRedundancy', label: '末端空调冗余' },
  { key: 'chillerCount', label: '冷水机组数量' },
  { key: 'pueDesign', label: 'PUE设计值' },
  { key: 'floorLoad', label: '地板承重' },
  { key: 'raisedFloorHeight', label: '架空地板高度' },
  { key: 'freightElevatorWidth', label: '货梯宽度' },
  { key: 'freightElevatorHeight', label: '货梯高度' },
  { key: 'freightElevatorLoad', label: '货梯承重' },
  { key: 'transportCorridorWidth', label: '主运输通道宽度' },
  { key: 'loadingDock', label: '卸货平台' },
  { key: 'networkRoutes', label: '网络进线路由' },
  { key: 'ispCount', label: '运营商数量' },
  { key: 'darkFiber', label: '裸光纤资源' },
  { key: 'support800G', label: '800G网络支持' },
  { key: 'supportRoCEIB', label: 'RoCE/IB支持' },
  { key: 'delivery3Months', label: '3个月内可交付' },
  { key: 'delivery6Months', label: '6个月可交付' },
  { key: 'existingLiquidPower', label: '现有液冷机柜功率' },
  { key: 'existingLiquidCount', label: '现有液冷机柜数量' },
  { key: 'powerRetrofitPeriod', label: '电力改造周期' },
  { key: 'coolingRetrofitPeriod', label: '制冷改造周期' },
  { key: 'officeSeats', label: '办公区工位数' },
  { key: 'storageArea', label: '库房面积' },
  { key: 'ops24x7', label: '7x24运维值守' },
  { key: 'faultResponseTime', label: '故障响应时间' },
  { key: 'liquidCoolMaintenance', label: '液冷维护能力' },
  { key: 'electricityBilling', label: '电费计费模式' },
  { key: 'oneTimeFee', label: '一次性接入费' },
  { key: 'liquidCoolServiceFee', label: '液冷服务费' },
  { key: 'visitDate', label: '拜访日期' },
  { key: 'contactPerson', label: '联系人' },
  { key: 'contactInfo', label: '联系方式' },
  { key: 'notes', label: '备注' },
  { key: 'createdByName', label: '录入人' },
  { key: 'importedByName', label: '导入人' },
  { key: 'createdAt', label: '创建时间' }
]

Page({
  data: {
    total: 0,
    thisMonth: 0,
    todayCount: 0,
    exporting: false,
    exportingTemplate: false,
    exportHistory: [],
    exportFields: ALL_EXPORT_FIELDS
  },

  onLoad() {
    if (!requireAdmin()) return
    this.loadStats()
  },

  loadStats() {
    api.getDatacenters({ page: 1, pageSize: 1 }).then(result => {
      this.setData({
        total: result.total || 0,
        thisMonth: result.monthCount || 0,
        todayCount: result.todayCount || 0
      })
    })
  },

  // 导出完整数据
  handleExport() {
    if (this.data.exporting) return
    const hideLoading = showLoading('生成 Excel 中...')
    this.setData({ exporting: true })

    api.exportExcel({
      fields: this.data.exportFields.map(f => f.key)
    }).then(result => {
      hideLoading()
      this.setData({ exporting: false })
      this.downloadAndOpen(result.fileId, `机房数据_${formatDate(new Date(), 'YYYYMMDD')}.xlsx`)
      this.addHistory(result.fileId, `机房数据_${formatDate(new Date(), 'YYYYMMDD')}.xlsx`)
    }).catch(err => {
      hideLoading()
      this.setData({ exporting: false })
      showError('导出失败: ' + (err.message || ''))
    })
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

  // 跳转到导入页
  goToImport() {
    wx.navigateTo({ url: '/pages/import/import' })
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

  // 添加导出历史
  addHistory(fileId, fileName) {
    const history = [...this.data.exportHistory]
    history.unshift({
      fileId,
      fileName,
      time: formatDate(new Date(), 'MM-DD HH:mm')
    })
    this.setData({ exportHistory: history.slice(0, 5) })
  },

  // 重新下载历史文件
  handleDownload(e) {
    const fileId = e.currentTarget.dataset.fileid
    const fileName = e.currentTarget.dataset.filename
    const hideLoading = showLoading('下载中...')
    wx.cloud.downloadFile({
      fileID: fileId,
      success: (res) => {
        hideLoading()
        wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          fileType: 'xlsx'
        })
      },
      fail: () => {
        hideLoading()
        showError('下载失败')
      }
    })
  }
})
