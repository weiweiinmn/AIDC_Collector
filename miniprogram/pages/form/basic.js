// pages/form/basic.js - 添加机房表单（重设计版）
const api = require('../../utils/api')
const { showLoading, showSuccess, showError, showConfirm, getToday } = require('../../utils/util');

// ===== 采集区域 =====
const REGION_OPTIONS = [
  { value: 'china', label: '中国', provinces: [
    { name: '北京市', cities: ['东城区','西城区','朝阳区','丰台区','石景山区','海淀区','顺义区','通州区','大兴区','昌平区','房山区','其他'] },
    { name: '上海市', cities: ['浦东新区','徐汇区','长宁区','静安区','普陀区','杨浦区','闵行区','宝山区','嘉定区','金山区','松江区','青浦区','奉贤区','崇明区','其他'] },
    { name: '广东省', cities: ['广州市','深圳市','东莞市','佛山市','珠海市','中山市','惠州市','江门市','其他'] },
    { name: '江苏省', cities: ['南京市','苏州市','无锡市','南通市','常州市','其他'] },
    { name: '浙江省', cities: ['杭州市','宁波市','温州市','嘉兴市','绍兴市','其他'] },
    { name: '四川省', cities: ['成都市','绵阳市','德阳市','其他'] },
    { name: '山东省', cities: ['济南市','青岛市','烟台市','威海市','其他'] },
    { name: '福建省', cities: ['福州市','厦门市','泉州市','漳州市','其他'] },
    { name: '其他', cities: ['其他'] }
  ]},
  { value: 'thailand', label: '泰国', provinces: [
    { name: '曼谷', cities: ['素坤逸区','是隆区','暹罗区','乍都乍区','其他'] },
    { name: '春武里府', cities: ['芭堤雅','是拉差','邦盛','其他'] },
    { name: '北榄府', cities: ['邦纳','素坤逸107','其他'] },
    { name: '清迈府', cities: ['清迈市区','清道','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]},
  { value: 'malaysia', label: '马来西亚', provinces: [
    { name: '吉隆坡', cities: ['市中心','武吉免登','孟沙','其他'] },
    { name: '雪兰莪', cities: ['八打灵再也','莎阿南','梳邦','赛城','巴生','其他'] },
    { name: '柔佛', cities: ['新山','依斯干达公主城','其他'] },
    { name: '槟城', cities: ['乔治市','峇六拜','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]},
  { value: 'indonesia', label: '印尼', provinces: [
    { name: '雅加达', cities: ['中雅加达','南雅加达','西雅加达','东雅加达','北雅加达','其他'] },
    { name: '西爪哇', cities: ['万隆','茂物','勿加泗','其他'] },
    { name: '东爪哇', cities: ['泗水','其他'] },
    { name: '廖内群岛', cities: ['巴淡岛','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]},
  { value: 'philippines', label: '菲律宾', provinces: [
    { name: '马尼拉大都会', cities: ['马卡蒂','曼达卢永','帕赛','塔吉格','奎松市','其他'] },
    { name: '甲米地', cities: ['伊穆斯','达斯马里尼亚斯','其他'] },
    { name: '宿务省', cities: ['宿务市','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]},
  { value: 'japan', label: '日本', provinces: [
    { name: '东京都', cities: ['港区','新宿区','千代田区','中央区','涩谷区','品川区','其他'] },
    { name: '大阪府', cities: ['大阪市北区','大阪市中央区','其他'] },
    { name: '爱知县', cities: ['名古屋市','其他'] },
    { name: '福冈县', cities: ['福冈市','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]},
  { value: 'singapore', label: '新加坡', provinces: [
    { name: '市中心', cities: ['莱佛士坊','滨海湾','其他'] },
    { name: '西部', cities: ['裕廊','文礼','其他'] },
    { name: '东部', cities: ['樟宜','榜鹅','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]},
  { value: 'australia', label: '澳大利亚', provinces: [
    { name: '新南威尔士州', cities: ['悉尼','其他'] },
    { name: '维多利亚州', cities: ['墨尔本','其他'] },
    { name: '昆士兰州', cities: ['布里斯班','其他'] },
    { name: '西澳大利亚州', cities: ['珀斯','其他'] },
    { name: '其他', cities: ['其他地区'] }
  ]}
]

// 区域选项（用于 t-picker-item 的 options 属性）
const regionOptions = REGION_OPTIONS.map(r => ({
  label: r.label,
  value: r.value
}))

// 省份选项（根据选中区域动态更新）
const getProvinceOptions = (regionValue) => {
  const region = REGION_OPTIONS.find(r => r.value === regionValue)
  return region ? region.provinces.map(p => ({ label: p.name, value: p.name })) : []
}

// 城市选项（根据选中区域和省份动态更新）
const getCityOptions = (regionValue, provinceName) => {
  const region = REGION_OPTIONS.find(r => r.value === regionValue)
  if (!region) return []
  const province = region.provinces.find(p => p.name === provinceName)
  return province ? province.cities.map(c => ({ label: c, value: c })) : []
}

// 交付状态选项
const DELIVERY_STATUS_OPTIONS = ['新增', '已收录', '待核实', '已驳回']

Page({
  data: {
    mode: 'create',
    editId: '',

    // ===== 表单数据（与 WXML data-field 一一对应）=====
    form: {
      // 基础信息
      name: '',               // 机房名称（必填）
      country: '',            // 所属区域（必填）
      city: '',               // 城市（必填）
      province: '',           // 省/州
      zone: '',               // 园区/街道
      code: '',               // 机房编码
      ownership: '',          // 产权归属
      source: '',             // 信息来源
      liaison: '',            // 对接同事
      kycStatus: '',          // KYC状态
      kycRemark: '',          // KYC卡点/备注
      status: '',             // 机房状态
      notes: '',              // 备注

      // 快速信息
      availablePower: '',     // 可用电力 MW（必填）
      mainCoolingType: '',     // 制冷方式（必填）
      pueDesign: '',          // PUE设计值
      expandable: '',         // 是否可扩容（必填）
      expectedDelivery: '',   // 预计交付时间（YYYY-MM）
      visitDate: '',          // 拜访日期（YYYY-MM-DD）
      contactPerson: '',       // 联系人
      contactInfo: '',        // 联系电话

      // 机柜资源
      totalCabinets: '',      // 总机柜数
      availableCabinets: '',  // 当前可提供机柜
      maxCabinetPower: '',    // 机柜最高功率 kW/柜
      continuousCabinet: '',  // 连续布置
      physicalIsolation: '',  // 物理隔离

      // 电力系统
      mainsCapacity: '',      // 市电总容量 kVA
      expandablePower: '',    // 可扩容上限 MW
      transformerConfig: '',  // 变压器配置
      generatorRedundancy: '',// 柴发冗余
      upsConfig: '',          // UPS配置
      powerSLA: '',           // 电力SLA
      hasGenerator: '',       // 是否有机电

      // 制冷系统
      liquidCooling: '',      // 冷板液冷
      liquidCoolingPeriod: '',// 液冷改造周期
      cduEquipped: '',        // 是否配备CDU
      chilledWaterSupply: '', // 冷冻水供水温度
      chillerCount: '',       // 冷水机组数量

      // 交付与扩容
      delivery3m: '',         // 3个月可交付 MW
      delivery6m: '',         // 6个月可交付 MW
      powerUpgradeMonths: '', // 电力改造周期
      coolingUpgradeMonths: '',// 制冷改造周期
      liquidCabinetPower: '', // 液冷功率 kW/柜
      liquidCabinetCount: '', // 液冷机柜数

      // 网络与互联
      networkRoutes: '',      // 进线路由
      operatorCount: '',      // 运营商数量
      bareFiberSupport: '',   // 裸光纤支持
      support800g: '',        // 800G支持

      // 配套服务
      officeSeats: '',        // 工位数
      storageArea: '',        // 库房面积
      ops247: '',             // 7×24运维
      faultResponseHours: '',// 故障响应时间

      // 成本与报价
      billingMode: '',        // 电费模式
      oneTimeFee: '',         // 接入费
      cabinetPrice: '',       // 机柜单价

      // 照片
      photos: [],
    },

    // ===== Picker Options（单列选择器，columns 格式）=====
    pickerOptions: {
      mainCoolingType: [
        { label: '风冷', value: '风冷' },
        { label: '水冷', value: '水冷' },
        { label: '液冷', value: '液冷' },
        { label: '混合', value: '混合' },
      ],
      expandable: [
        { label: '可扩容', value: '可扩容' },
        { label: '不可扩容', value: '不可扩容' },
      ],
      continuousCabinet: [
        { label: '是', value: '是' },
        { label: '否', value: '否' },
      ],
      physicalIsolation: [
        { label: '是', value: '是' },
        { label: '否', value: '否' },
        { label: '改造可行', value: '改造可行' },
      ],
      transformerConfig: [
        { label: '2N', value: '2N' },
        { label: 'N+1', value: 'N+1' },
        { label: 'N', value: 'N' },
      ],
      upsConfig: [
        { label: '2N', value: '2N' },
        { label: '分布式', value: '分布式' },
        { label: '后备', value: '后备' },
      ],
      powerSLA: [
        { label: '99.99%', value: '99.99%' },
        { label: '99.999%', value: '99.999%' },
      ],
      hasGenerator: [
        { label: '是', value: '是' },
        { label: '否', value: '否' },
      ],
      liquidCooling: [
        { label: '标配', value: '标配' },
        { label: '可改造', value: '可改造' },
        { label: '无', value: '无' },
      ],
      cduEquipped: [
        { label: '是', value: '是' },
        { label: '否', value: '否' },
      ],
      bareFiberSupport: [
        { label: '支持', value: '支持' },
        { label: '不支持', value: '不支持' },
      ],
      support800g: [
        { label: '支持', value: '支持' },
        { label: '不支持', value: '不支持' },
        { label: '规划中', value: '规划中' },
      ],
      ops247: [
        { label: '有（独立）', value: '有（独立）' },
        { label: '有（共享）', value: '有（共享）' },
        { label: '无', value: '无' },
      ],
      billingMode: [
        { label: '包干', value: '包干' },
        { label: '按量', value: '按量' },
        { label: '混合', value: '混合' },
      ],
      ownership: [
        { label: '自有', value: '自有' },
        { label: '租赁', value: '租赁' },
      ],
      kycStatus: [
        { label: '未开始', value: '未开始' },
        { label: '进行中', value: '进行中' },
        { label: '待补充材料', value: '待补充材料' },
        { label: '已完成', value: '已完成' },
        { label: '已驳回', value: '已驳回' },
        { label: '不需要', value: '不需要' },
      ],
      status: [
        { label: '新增', value: '新增' },
        { label: '已收录', value: '已收录' },
        { label: '待核实', value: '待核实' },
        { label: '已驳回', value: '已驳回' },
      ],
    },

    // ===== 地区三级联动 =====
    regionOptions: regionOptions,    // 国家选项
    provinceOptions: [],             // 省/州选项（根据国家动态更新）
    cityOptions: [],                 // 城市选项（根据省/州动态更新）
    regionLabel: '',                 // 显示用地区标签

    // ===== 展开/折叠状态 =====
    expanded: false,                 // 展开全部字段
    openSections: {
      cabinets: false,   // 机柜资源
      power: false,       // 电力系统
      cooling: false,     // 制冷系统
      delivery: false,    // 交付与扩容
      network: false,     // 网络与互联
      service: false,     // 配套服务
      cost: false,        // 成本与报价
      basic: false,       // 基础信息
      photos: false,      // 现场照片
    },
    sectionFilledCount: {},  // 各模块已填字段计数

    // ===== 其他 =====
    imageGridConfig: { column: 3, width: 212, height: 212 },
    submitting: false,
  },

  // ==================== 生命周期 ====================

  onLoad(options) {
    // 初始化年月选择列（当前年前1年到后3年，每个月）
    const year = new Date().getFullYear()
    const cols = []
    for (let y = year - 1; y <= year + 3; y++) {
      for (let m = 1; m <= 12; m++) {
        cols.push({ label: `${y}年${String(m).padStart(2,'0')}月`, value: `${y}-${String(m).padStart(2,'0')}` })
      }
    }
    this.setData({ deliveryDateColumns: cols })

    if (options.id && options.mode === 'edit') {
      this.setData({ mode: 'edit', editId: options.id })
      wx.setNavigationBarTitle({ title: '编辑机房' })
      this.loadDetail(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '添加机房' })
      this.setData({ 'form.visitDate': getToday() })
    }
  },

  // ==================== 展开/折叠 ====================

  toggleExpand() {
    this.setData({ expanded: !this.data.expanded })
  },

  toggleSection(e) {
    const section = e.currentTarget.dataset.section
    const openSections = { ...this.data.openSections }
    openSections[section] = !openSections[section]
    this.setData({ openSections })
    if (openSections[section]) {
      this._updateSectionFilledCount(section)
    }
  },

  // 更新模块已填字段计数
  _updateSectionFilledCount(section) {
    const counts = { ...this.data.sectionFilledCount }
    const form = this.data.form
    const sectionFields = {
      cabinets: ['totalCabinets', 'availableCabinets', 'maxCabinetPower', 'continuousCabinet', 'physicalIsolation'],
      power: ['mainsCapacity', 'expandablePower', 'transformerConfig', 'generatorRedundancy', 'upsConfig', 'powerSLA', 'hasGenerator'],
      cooling: ['liquidCooling', 'liquidCoolingPeriod', 'cduEquipped', 'chilledWaterSupply', 'chillerCount'],
      delivery: ['delivery3m', 'delivery6m', 'powerUpgradeMonths', 'coolingUpgradeMonths', 'liquidCabinetPower', 'liquidCabinetCount'],
      network: ['networkRoutes', 'operatorCount', 'bareFiberSupport', 'support800g'],
      service: ['officeSeats', 'storageArea', 'ops247', 'faultResponseHours'],
      cost: ['billingMode', 'oneTimeFee', 'cabinetPrice'],
      basic: ['code', 'ownership', 'source', 'liaison', 'kycStatus', 'kycRemark', 'status', 'notes'],
    }
    const fields = sectionFields[section] || []
    counts[section] = fields.filter(f => form[f] !== '' && form[f] !== null && form[f] !== undefined).length
    this.setData({ sectionFilledCount: counts })
  },

  // ==================== 字段变更 ====================

  onFieldChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value || e.detail
    this.setData({ [`form.${field}`]: value })
    // 更新展开模块的已填计数
    Object.keys(this.data.openSections).forEach(section => {
      if (this.data.openSections[section]) {
        this._updateSectionFilledCount(section)
      }
    })
  },

  // ==================== 单列 Picker（通用）====================
  // 用于：制冷方式、是否可扩容、连续布置、物理隔离、变压器配置、UPS配置、
  // 电力SLA、是否有机电、冷板液冷、CDU、裸光纤、800G、运维、计费模式、产权、KYC、状态

  onSinglePickerChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({ [`form.${field}`]: value })
    // 更新展开模块的已填计数
    Object.keys(this.data.openSections).forEach(section => {
      if (this.data.openSections[section]) {
        this._updateSectionFilledCount(section)
      }
    })
  },

  // ==================== 地区三级联动 Picker ====================

  onRegionPickerConfirm(e) {
    // t-picker + t-picker-item 模式：e.detail.value = [国家值, 省/州值, 城市值]
    const values = e.detail.value || []
    const labels = e.detail.label || []
    const countryValue = values[0] || ''
    const countryLabel = labels[0] || ''
    const provinceValue = values[1] || ''
    const provinceLabel = labels[1] || ''
    const cityValue = values[2] || ''
    const cityLabel = labels[2] || ''
    
    // 更新省/州和城市选项
    const provinceOptions = getProvinceOptions(countryValue)
    const cityOptions = getCityOptions(countryValue, provinceValue)
    
    // 组合显示标签
    const regionLabel = [countryLabel, provinceLabel, cityLabel].filter(Boolean).join(' ')
    
    this.setData({
      'form.country': countryValue,
      'form.province': provinceValue,
      'form.city': cityValue,
      regionLabel: regionLabel,
      provinceOptions: provinceOptions,
      cityOptions: cityOptions
    })
  },

  // ==================== 日期 Picker ====================

  onDeliveryDateChange(e) {
    // 预计交付时间（YYYY-MM）
    const value = e.detail.value
    this.setData({ 'form.expectedDelivery': value })
  },

  onVisitDateChange(e) {
    // 拜访日期（YYYY-MM-DD）
    const value = e.detail.value
    this.setData({ 'form.visitDate': value })
  },

  // ==================== 照片 ====================

  onPhotoAdd(e) {
    const urls = e.detail.files.map(f => f.url)
    const existing = this.data.form.photos
    const photos = [...existing, ...urls].slice(0, 6)
    this.setData({ 'form.photos': photos })
  },

  onPhotoRemove(e) {
    const photos = [...this.data.form.photos]
    photos.splice(e.detail.index, 1)
    this.setData({ 'form.photos': photos })
  },

  // ==================== 加载编辑数据 ====================

  loadDetail(id) {
    const hideLoading = showLoading('加载中...')
    api.getDatacenterDetail(id).then(result => {
      hideLoading()
      const detail = (result && result.data !== undefined) ? result.data : result
      const form = {}
      Object.keys(this.data.form).forEach(key => {
        form[key] = (detail[key] !== undefined && detail[key] !== null) ? detail[key] : ''
      })
      form.photos = detail.photos || []

      // 设置区域标签和城市 columns
      if (detail.country) {
        const regionObj = REGION_OPTIONS.find(r => r.value === detail.country)
        const cityColumns = regionObj
          ? regionObj.cities.map(c => ({ label: c, value: c }))
          : []
        this.setData({
          regionLabel: regionObj ? regionObj.label : '',
          cityLabel: detail.city || '',
          cityColumns,
        })
      }

      this.setData({ form })
    }).catch(() => {
      hideLoading()
      showError('加载失败')
    })
  },

  // ==================== 校验 ====================

  validate() {
    const { name, country, city, availablePower, mainCoolingType, expandable } = this.data.form
    if (!name || !name.trim()) {
      showError('请输入机房名称')
      return false
    }
    if (!country) {
      showError('请选择所属区域')
      return false
    }
    if (!city) {
      showError('请选择城市')
      return false
    }
    if (!availablePower || !availablePower.trim()) {
      showError('请输入可用电力')
      return false
    }
    if (!mainCoolingType) {
      showError('请选择制冷方式')
      return false
    }
    if (!expandable) {
      showError('请选择是否可扩容')
      return false
    }
    return true
  },

  // ==================== 提交 ====================

  handleSubmit() {
    if (this.data.submitting) return
    if (!this.validate()) return

    const hideLoading = showLoading('提交中...')
    this.setData({ submitting: true })

    const submitData = { ...this.data.form }

    // 数值字段转换
    const numFields = [
      'totalCabinets', 'availableCabinets', 'maxCabinetPower',
      'mainsCapacity', 'availablePower', 'expandablePower',
      'generatorFuelHours', 'upsBatteryMinutes', 'liquidCoolingPeriod',
      'chilledWaterSupply', 'chillerCount',
      'delivery3m', 'delivery6m', 'powerUpgradeMonths', 'coolingUpgradeMonths',
      'liquidCabinetPower', 'liquidCabinetCount',
      'officeSeats', 'storageArea', 'faultResponseHours',
      'electricityPrice', 'cabinetPrice', 'liquidCoolingPrice',
      'oneTimeFee', 'pueDesign',
      'floorLoad', 'raisedFloorHeight', 'cargoWidth', 'cargoHeight', 'cargoLoad',
      'aisleWidth', 'networkRoutes', 'operatorCount',
    ]
    numFields.forEach(f => {
      const v = submitData[f]
      submitData[f] = (v !== '' && v !== null && !isNaN(v)) ? Number(v) : null
    })

    // 过滤空字符串为 null
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') submitData[key] = null
    })

    const action = this.data.mode === 'edit'
      ? api.updateDatacenter(this.data.editId, submitData)
      : api.createDatacenter(submitData)

    this.uploadPhotos().then(photoUrls => {
      if (photoUrls.length > 0) {
        submitData.photos = photoUrls
      }
      return action
    }).then(() => {
      hideLoading()
      showSuccess(this.data.mode === 'edit' ? '更新成功' : '机房信息已保存')
      setTimeout(() => { wx.navigateBack() }, 1500)
    }).catch(err => {
      hideLoading()
      this.setData({ submitting: false })
      showError(err.message || '提交失败')
    })
  },

  // ==================== 上传照片 ====================

  uploadPhotos() {
    const photos = this.data.form.photos
    if (!photos || photos.length === 0) return Promise.resolve([])
    // Mock模式：跳过实际上传，直接返回已有路径
    if (!wx.cloud) return Promise.resolve(photos)
    const tasks = photos.map(tempPath => {
      if (tempPath.startsWith('cloud://')) return Promise.resolve(tempPath)
      const cloudPath = `photos/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.jpg`
      return new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath, filePath: tempPath,
          success: r => resolve(r.fileID),
          fail: reject,
        })
      })
    })
    return Promise.all(tasks)
  },
})

