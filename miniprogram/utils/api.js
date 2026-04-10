// utils/api.js - 云函数调用封装
const cloud = wx.cloud

// TODO: 正式上线时设为 false，删除 mock/ 目录
const MOCK_MODE = true

// Mock 数据
const { DEMO_DATACENTERS } = require('../mock/data')
const { DEMO_HISTORY } = require('../mock/history')

/**
 * 调用云函数
 */
const callFunction = (name, data = {}) => {
  if (MOCK_MODE) {
    return mockCallFunction(name, data)
  }
  return new Promise((resolve, reject) => {
    cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.code === 0) {
          resolve(res.result.data)
        } else if (res.result && res.result.code !== undefined) {
          reject(new Error(res.result.message || '操作失败'))
        } else {
          resolve(res.result)
        }
      },
      fail: (err) => {
        console.error(`[云函数 ${name}] 调用失败:`, err)
        reject(new Error(err.errMsg || '网络错误，请稍后重试'))
      }
    })
  })
}

/**
 * Mock 云函数路由
 */
function mockCallFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        switch (name) {
          case 'getDatacenters':
            resolve(mockGetDatacenters(data))
            break
          case 'getDatacenterDetail':
            resolve(mockGetDatacenterDetail(data))
            break
          case 'login':
            resolve(mockLogin(data))
            break
          case 'changePassword':
            resolve(mockChangePassword(data))
            break
          case 'createDatacenter':
            resolve(mockCreateDatacenter(data))
            break
          case 'updateDatacenter':
            resolve(mockUpdateDatacenter(data))
            break
          case 'deleteDatacenter':
            resolve(mockDeleteDatacenter(data))
            break
          default:
            resolve(null)
        }
      } catch (err) {
        reject(err)
      }
    }, 300)
  })
}

// ---- Mock helpers ----

function _todayStart() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}
function _monthStart() {
  const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d
}

function mockGetDatacenters(params = {}) {
  let list = [...DEMO_DATACENTERS]

  // 编辑历史查询
  if (params.historyOf) {
    return DEMO_HISTORY.filter(h => h.datacenterId === params.historyOf)
  }

  // 关键词搜索
  if (params.keyword && params.keyword.trim()) {
    const kw = params.keyword.trim().toLowerCase()
    list = list.filter(item =>
      (item.name && item.name.toLowerCase().includes(kw)) ||
      (item.address && item.address.toLowerCase().includes(kw))
    )
  }
  // 状态筛选
  if (params.status) {
    list = list.filter(item => item.status === params.status)
  }
  // 区域筛选
  if (params.region) {
    list = list.filter(item => item.region === params.region)
  }

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = list.length
  const todayCount = DEMO_DATACENTERS.filter(
    item => new Date(item.createdAt) >= _todayStart()
  ).length
  const monthCount = DEMO_DATACENTERS.filter(
    item => new Date(item.createdAt) >= _monthStart()
  ).length

  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize

  return {
    list: list.slice(start, start + pageSize),
    total,
    todayCount,
    monthCount,
    myCount: total
  }
}

function mockGetDatacenterDetail(params = {}) {
  const item = DEMO_DATACENTERS.find(d => d._id === params.id)
  if (!item) throw new Error('机房不存在')
  return item
}

function mockLogin(data) {
  // Mock: 任何手机号+密码123456都能登录
  const mockUser = {
    _id: 'mock-admin-001',
    name: 'Willis',
    phone: '18621322945',
    role: 'admin',
    status: 'approved',
    needChangePassword: false,
    region: 'southeast_asia'
  }
  return mockUser
}

function mockChangePassword() {
  return { success: true }
}

let _localDatacenters = [...DEMO_DATACENTERS]
let _nextId = 100

function mockCreateDatacenter(data) {
  const newId = `local-${_nextId++}`
  const now = new Date().toISOString()
  const user = getApp().globalData.userInfo || {}
  const record = {
    _id: newId,
    ...data,
    _openid: user._id || 'mock-admin-001',
    createdBy: user._id || 'mock-admin-001',
    createdByName: user.name || 'Willis',
    createdAt: now,
    updatedAt: now,
    updatedBy: user._id || 'mock-admin-001',
    updatedByName: user.name || 'Willis',
    _deleted: false,
    visitDate: data.visitDate || '',
    contactPerson: data.contactPerson || '',
    contactInfo: data.contactInfo || '',
    notes: data.notes || '',
    photos: data.photos || [],
    status: data.status || 'new',
    importedById: null,
    importedByName: null,
    importedAt: null,
  }
  _localDatacenters.unshift(record)
  return record
}

function mockUpdateDatacenter(data) {
  const { id, updates } = data
  const idx = _localDatacenters.findIndex(d => d._id === id)
  if (idx === -1) throw new Error('机房不存在')
  const now = new Date().toISOString()
  const user = getApp().globalData.userInfo || {}
  _localDatacenters[idx] = {
    ..._localDatacenters[idx],
    ...updates,
    updatedAt: now,
    updatedBy: user._id || 'mock-admin-001',
    updatedByName: user.name || 'Willis',
  }
  return _localDatacenters[idx]
}

function mockDeleteDatacenter(id) {
  const idx = _localDatacenters.findIndex(d => d._id === id)
  if (idx !== -1) {
    _localDatacenters[idx]._deleted = true
  }
  return { success: true }
}

// ---- 对外 API ----

// 登录（手机号+密码）
const login = (data) => callFunction('login', data)

// 修改密码
const changePassword = (data) => callFunction('changePassword', data)

// 管理员重置密码
const resetPassword = (data) => callFunction('resetPassword', data)

// 获取用户列表
const getUsers = () => callFunction('getUsers')

// 更新用户状态
const updateUserStatus = (data) => callFunction('updateUserStatus', data)

// 获取机房列表
const getDatacenters = (params) => callFunction('getDatacenters', params)

// 获取机房详情
const getDatacenterDetail = (id) => callFunction('getDatacenterDetail', { id })

// 创建机房
const createDatacenter = (data) => callFunction('createDatacenter', data)

// 更新机房
const updateDatacenter = (id, updates) => callFunction('updateDatacenter', { id, updates })

// 删除机房
const deleteDatacenter = (id) => callFunction('deleteDatacenter', { id })

// 导出 Excel
const exportExcel = (params) => callFunction('exportExcel', params)

// 导入 Excel
const importExcel = (fileId) => callFunction('importExcel', { fileId })

// 管理员导入 Excel
const adminImportExcel = (data) => callFunction('adminImportExcel', data)

module.exports = {
  callFunction,
  login,
  changePassword,
  resetPassword,
  getUsers,
  updateUserStatus,
  getDatacenters,
  getDatacenterDetail,
  createDatacenter,
  updateDatacenter,
  deleteDatacenter,
  exportExcel,
  importExcel,
  adminImportExcel
}
