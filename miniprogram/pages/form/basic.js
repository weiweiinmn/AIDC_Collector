// pages/form/basic.js - 采集表单（9大类65字段）
const api = require('../../utils/api')
const { requireApproved, showLoading, showSuccess, showError, showConfirm, getToday, REGION_OPTIONS } = require('../../utils/util')

// 选项常量
const YES_NO_OPTIONS = ['是', '否']
const OWNERSHIP_OPTIONS = ['自有', '租赁']
const TRANSFORMER_OPTIONS = ['2N', 'N+1', 'N']
const UPS_OPTIONS = ['2N', '分布式', '后备']
const BILLING_OPTIONS = ['包干', '按量']
const RETROFIT_OPTIONS = ['是', '否', '不适用']

Page({
  data: {
    mode: 'create',  // create | edit
    editId: '',
    form: {
      // 采集区域
      region: '',
      // 一、基础信息
      name: '',
      address: '',
      ownership: '',
      expectedDelivery: '',
      // 二、机柜资源
      totalCabinets: '',
      availableCabinets: '',
      maxCabinetPower: '',
      continuousCabinets: '',
      physicalIsolation: '',
      // 三、电力系统
      mainsCapacity: '',
      availablePower: '',
      expandablePower: '',
      transformerConfig: '',
      transformerCapacity: '',
      generatorRedundancy: '',
      generatorFuelHours: '',
      upsConfig: '',
      upsBatteryMinutes: '',
      highDensityBusway: '',
      bbuSuperCapacitor: '',
      powerSLA: '',
      // 四、制冷系统
      mainCoolingType: '',
      coldPlateLiquid: '',
      liquidCoolRetrofit: '',
      liquidCoolPeriod: '',
      hasCDU: '',
      chilledWaterSupplyTemp: '',
      chilledWaterReturnTemp: '',
      endAirconRedundancy: '',
      chillerCount: '',
      pueDesign: '',
      // 五、承重与空间
      floorLoad: '',
      raisedFloorHeight: '',
      freightElevatorWidth: '',
      freightElevatorHeight: '',
      freightElevatorLoad: '',
      transportCorridorWidth: '',
      loadingDock: '',
      // 六、网络与互联
      networkRoutes: '',
      ispCount: '',
      darkFiber: '',
      support800G: '',
      supportRoCEIB: '',
      // 七、交付时间
      delivery3Months: '',
      delivery6Months: '',
      existingLiquidPower: '',
      existingLiquidCount: '',
      powerRetrofitPeriod: '',
      coolingRetrofitPeriod: '',
      // 八、配套服务
      officeSeats: '',
      storageArea: '',
      ops24x7: '',
      faultResponseTime: '',
      liquidCoolMaintenance: '',
      // 九、成本与报价
      electricityBilling: '',
      oneTimeFee: '',
      liquidCoolServiceFee: '',
      // 补充
      visitDate: '',
      contactPerson: '',
      contactInfo: '',
      notes: '',
      photos: []
    },
    // 各类别的选择器选项
    pickerOptions: {
      ownership: OWNERSHIP_OPTIONS,
      continuousCabinets: YES_NO_OPTIONS,
      physicalIsolation: YES_NO_OPTIONS,
      transformerConfig: TRANSFORMER_OPTIONS,
      upsConfig: UPS_OPTIONS,
      highDensityBusway: YES_NO_OPTIONS,
      bbuSuperCapacitor: YES_NO_OPTIONS,
      coldPlateLiquid: YES_NO_OPTIONS,
      liquidCoolRetrofit: RETROFIT_OPTIONS,
      hasCDU: YES_NO_OPTIONS,
      loadingDock: YES_NO_OPTIONS,
      darkFiber: YES_NO_OPTIONS,
      support800G: YES_NO_OPTIONS,
      supportRoCEIB: YES_NO_OPTIONS,
      ops24x7: YES_NO_OPTIONS,
      liquidCoolMaintenance: YES_NO_OPTIONS,
      electricityBilling: BILLING_OPTIONS
    },
    // 需要显示单位的字段
    unitFields: {
      totalCabinets: '个',
      availableCabinets: '个',
      maxCabinetPower: 'kW/柜',
      mainsCapacity: 'kVA',
      availablePower: 'MW',
      expandablePower: 'MW',
      transformerCapacity: 'kVA',
      generatorFuelHours: '小时',
      upsBatteryMinutes: '分钟',
      liquidCoolPeriod: '月',
      chilledWaterSupplyTemp: '℃',
      chilledWaterReturnTemp: '℃',
      chillerCount: '台',
      floorLoad: 'kg/m²',
      raisedFloorHeight: '米',
      freightElevatorWidth: '米',
      freightElevatorHeight: '米',
      freightElevatorLoad: '吨',
      transportCorridorWidth: '米',
      networkRoutes: '路',
      ispCount: '家',
      delivery3Months: 'MW',
      delivery6Months: 'MW',
      existingLiquidPower: 'kW/柜',
      existingLiquidCount: '个',
      powerRetrofitPeriod: '月',
      coolingRetrofitPeriod: '月',
      officeSeats: '工位',
      storageArea: '㎡',
      faultResponseTime: '小时',
      oneTimeFee: '元',
      liquidCoolServiceFee: '元/柜/月'
    },
    imageGridConfig: { column: 3, width: 212, height: 212 },
    submitting: false,
    currentPickerField: '',
    // 区域选择器
    regionOptions: REGION_OPTIONS.map(r => ({ label: r.label, value: r.value })),
    regionLabel: ''
  },

  onLoad(options) {
    // if (!requireApproved()) return  // TODO: 登录功能完成后恢复
    if (options.id && options.mode === 'edit') {
      this.setData({ mode: 'edit', editId: options.id })
      wx.setNavigationBarTitle({ title: '编辑机房信息' })
      this.loadDetail(options.id)
    } else {
      this.setData({ 'form.visitDate': getToday() })
    }
  },

  // 加载编辑数据
  loadDetail(id) {
    const hideLoading = showLoading('加载中...')
    api.getDatacenterDetail(id).then(result => {
      // 兼容 mock（直接返回对象）和真实 API（返回 {code, data} 结构）
      const detail = (result && result.data !== undefined) ? result.data : result
      hideLoading()
      // 将详情数据填充到表单
      const form = {}
      Object.keys(this.data.form).forEach(key => {
        form[key] = detail[key] !== undefined && detail[key] !== null ? detail[key] : ''
      })
      form.photos = detail.photos || []
      // 设置区域标签
      if (detail.region) {
        const regionObj = REGION_OPTIONS.find(r => r.value === detail.region)
        this.setData({ regionLabel: regionObj ? regionObj.label : '' })
      }
      // 初始化 picker 选项（编辑模式下显示已有值）
      this.setData({
        'pickerOptions.ownership': OWNERSHIP_OPTIONS,
        'pickerOptions.continuousCabinets': YES_NO_OPTIONS,
        'pickerOptions.physicalIsolation': YES_NO_OPTIONS,
        'pickerOptions.transformerConfig': TRANSFORMER_OPTIONS,
        'pickerOptions.upsConfig': UPS_OPTIONS,
        'pickerOptions.highDensityBusway': YES_NO_OPTIONS,
        'pickerOptions.bbuSuperCapacitor': YES_NO_OPTIONS,
        'pickerOptions.coldPlateLiquid': YES_NO_OPTIONS,
        'pickerOptions.liquidCoolRetrofit': RETROFIT_OPTIONS,
        'pickerOptions.hasCDU': YES_NO_OPTIONS,
        'pickerOptions.loadingDock': YES_NO_OPTIONS,
        'pickerOptions.darkFiber': YES_NO_OPTIONS,
        'pickerOptions.support800G': YES_NO_OPTIONS,
        'pickerOptions.supportRoCEIB': YES_NO_OPTIONS,
        'pickerOptions.ops24x7': YES_NO_OPTIONS,
        'pickerOptions.liquidCoolMaintenance': YES_NO_OPTIONS,
        'pickerOptions.electricityBilling': BILLING_OPTIONS
      })
      this.setData({ form })
    }).catch(err => {
      hideLoading()
      showError('加载失败')
    })
  },

  // 字段变更
  onFieldChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value || e.detail
    this.setData({ [`form.${field}`]: value })
  },

  // 选择器点击
  onPickerTap(e) {
    const field = e.currentTarget.dataset.field
    const options = this.data.pickerOptions[field]
    if (options) {
      this.setData({ currentPickerField: field })
      this.selectComponent(`#picker-${field}`) &&
        this.selectComponent(`#picker-${field}`).show()
    }
  },

  // 选择器确认
  onPickerConfirm(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({ [`form.${field}`]: value })
  },

  // 区域选择器
  onRegionTap() {
    this.selectComponent('#picker-region') && this.selectComponent('#picker-region').show()
  },

  onRegionConfirm(e) {
    const value = e.detail.value
    const regionObj = REGION_OPTIONS.find(r => r.value === value)
    this.setData({
      'form.region': value,
      regionLabel: regionObj ? regionObj.label : ''
    })
  },

  // 图片添加
  onPhotoAdd(e) {
    const tempFiles = e.detail.files.map(f => f.url)
    const photos = [...this.data.form.photos, ...tempFiles]
    if (photos.length > 6) {
      showError('最多上传6张照片')
      return
    }
    this.setData({ 'form.photos': photos })
  },

  // 图片移除
  onPhotoRemove(e) {
    const index = e.detail.index
    const photos = [...this.data.form.photos]
    photos.splice(index, 1)
    this.setData({ 'form.photos': photos })
  },

  // 表单校验
  validate() {
    const { name, address } = this.data.form
    if (!name.trim()) { showError('请输入数据中心名称'); return false }
    if (!address.trim()) { showError('请输入地址'); return false }
    return true
  },

  // 提交
  handleSubmit() {
    if (this.data.submitting) return
    if (!this.validate()) return

    const hideLoading = showLoading('提交中...')
    this.setData({ submitting: true })

    const submitData = { ...this.data.form }
    // 数值字段转换
    const numFields = [
      'totalCabinets', 'availableCabinets', 'maxCabinetPower',
      'mainsCapacity', 'availablePower', 'expandablePower', 'transformerCapacity',
      'generatorFuelHours', 'upsBatteryMinutes', 'liquidCoolPeriod',
      'chilledWaterSupplyTemp', 'chilledWaterReturnTemp', 'chillerCount',
      'floorLoad', 'raisedFloorHeight', 'freightElevatorWidth', 'freightElevatorHeight',
      'freightElevatorLoad', 'transportCorridorWidth', 'networkRoutes', 'ispCount',
      'delivery3Months', 'delivery6Months', 'existingLiquidPower', 'existingLiquidCount',
      'powerRetrofitPeriod', 'coolingRetrofitPeriod', 'officeSeats', 'storageArea',
      'faultResponseTime', 'oneTimeFee', 'liquidCoolServiceFee', 'pueDesign'
    ]
    numFields.forEach(f => {
      if (submitData[f] !== '' && submitData[f] !== null) {
        submitData[f] = Number(submitData[f])
      } else {
        submitData[f] = null
      }
    })

    const submitAction = this.data.mode === 'edit'
      ? api.updateDatacenter(this.data.editId, submitData)
      : api.createDatacenter(submitData)

    // 先上传照片，再提交数据
    this.uploadPhotos().then(photoUrls => {
      submitData.photos = photoUrls
      return submitAction
    }).then(() => {
      hideLoading()
      showSuccess(this.data.mode === 'edit' ? '更新成功' : '采集记录已保存')
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(err => {
      hideLoading()
      console.error('提交失败:', err)
      showError(err.message || '提交失败，请重试')
      this.setData({ submitting: false })
    })
  },

  // 上传照片到云存储
  uploadPhotos() {
    const photos = this.data.form.photos
    if (!photos || photos.length === 0) return Promise.resolve([])

    const uploadTasks = photos.map(tempPath => {
      return new Promise((resolve, reject) => {
        if (tempPath.startsWith('cloud://')) {
          resolve(tempPath)
          return
        }
        const cloudPath = `photos/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${tempPath.split('.').pop()}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempPath,
          success: (res) => resolve(res.fileID),
          fail: (err) => reject(err)
        })
      })
    })
    return Promise.all(uploadTasks)
  }
})
