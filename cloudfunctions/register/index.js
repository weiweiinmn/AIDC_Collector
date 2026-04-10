// 云函数：register - 管理员注册新用户
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { phone, password, name, role } = event

  if (!phone || !password || !name) {
    return { code: 1, message: '手机号、密码和姓名为必填项' }
  }

  if (!/^1\d{10}$/.test(phone)) {
    return { code: 1, message: '手机号格式不正确' }
  }

  if (password.length < 6) {
    return { code: 1, message: '密码至少6位' }
  }

  try {
    // 验证操作者是管理员
    const adminRes = await db.collection('users').where({ _openid: OPENID, role: 'admin', status: 'approved' }).get()
    if (adminRes.data.length === 0) {
      return { code: 1, message: '仅管理员可注册新用户' }
    }

    // 检查手机号是否已注册
    const existRes = await db.collection('users').where({ phone }).get()
    if (existRes.data.length > 0) {
      return { code: 1, message: '该手机号已注册' }
    }

    const now = new Date().toISOString()
    const newUser = {
      phone,
      password,
      name,
      role: role || 'collector',
      status: 'approved', // 管理员创建的用户直接开通
      createdBy: OPENID,
      createdAt: now,
      lastLoginAt: null,
      _openid: '' // 手机号登录不需要openid
    }

    const res = await db.collection('users').add({ data: newUser })

    return {
      code: 0,
      data: {
        id: res._id,
        ...newUser,
        password: undefined
      }
    }
  } catch (err) {
    console.error('[register] 错误:', err)
    return { code: 1, message: '注册失败: ' + (err.message || '') }
  }
}
