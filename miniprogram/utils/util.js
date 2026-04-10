// utils/util.js - 通用工具函数

/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} fmt - 格式，如 'YYYY-MM-DD HH:mm'
 */
const formatDate = (date, fmt = 'YYYY-MM-DD') => {
  if (!date) return ''
  const d = new Date(date)
  const o = {
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return fmt
}

/**
 * 获取今天日期字符串 YYYY-MM-DD
 */
const getToday = () => {
  return formatDate(new Date(), 'YYYY-MM-DD')
}

/**
 * 显示成功提示
 */
const showSuccess = (title = '操作成功') => {
  wx.showToast({ title, icon: 'success' })
}

/**
 * 显示错误提示
 */
const showError = (title = '操作失败') => {
  wx.showToast({ title, icon: 'none' })
}

/**
 * 显示加载中
 * @returns {function} 关闭加载的函数
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
  return () => wx.hideLoading()
}

/**
 * 确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmColor: '#1E3A5F',
      success: (res) => resolve(res.confirm)
    })
  })
}

// Tier 等级选项
const TIER_OPTIONS = ['Tier I', 'Tier II', 'Tier III', 'Tier IV']

// 制冷方式选项
const COOLING_OPTIONS = ['风冷', '水冷', '液冷', '混合']

// 机房状态选项
const STATUS_OPTIONS = [
  { value: 'new', label: '新发现' },
  { value: 'visited', label: '已考察' },
  { value: 'negotiating', label: '洽谈中' },
  { value: 'contracted', label: '已签约' },
  { value: 'rejected', label: '已排除' }
]

// 采集区域选项
const REGION_OPTIONS = [
  { value: 'southeast_asia', label: '东南亚', children: [
    { value: 'singapore', label: '新加坡' },
    { value: 'malaysia', label: '马来西亚' },
    { value: 'thailand', label: '泰国' },
    { value: 'indonesia', label: '印度尼西亚' },
    { value: 'vietnam', label: '越南' },
    { value: 'philippines', label: '菲律宾' },
    { value: 'india', label: '印度' }
  ]},
  { value: 'japan', label: '日本', children: [
    { value: 'tokyo', label: '东京' },
    { value: 'osaka', label: '大阪' }
  ]},
  { value: 'europe', label: '欧洲' },
  { value: 'australia', label: '澳洲' }
]

// 区域扁平列表（用于筛选）
const REGION_FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'southeast_asia', label: '东南亚' },
  { value: 'japan', label: '日本' },
  { value: 'europe', label: '欧洲' },
  { value: 'australia', label: '澳洲' }
]

module.exports = {
  formatDate,
  getToday,
  showSuccess,
  showError,
  showLoading,
  showConfirm,
  TIER_OPTIONS,
  COOLING_OPTIONS,
  STATUS_OPTIONS,
  REGION_OPTIONS,
  REGION_FILTER_OPTIONS
}
