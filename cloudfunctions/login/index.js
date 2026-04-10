// 云函数：login - 手机号+密码登录
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, password } = event

  if (!phone || !password) {
    return { code: 1, message: '请输入手机号和密码' }
  }

  // 手机号格式校验
  if (!/^1\d{10}$/.test(phone)) {
    return { code: 1, message: '手机号格式不正确' }
  }

  try {
    // 查询用户
    const userRes = await db.collection('users').where({ phone }).get()
    const user = userRes.data.length > 0 ? userRes.data[0] : null

    if (!user) {
      return { code: 1, message: '该手机号未注册，请联系管理员开通账号' }
    }

    // 验证密码（简单比对，生产环境应使用bcrypt等加密）
    if (user.password !== password) {
      return { code: 1, message: '密码错误' }
    }

    // 检查用户状态
    if (user.status === 'disabled') {
      return { code: 1, message: '账号已被停用，请联系管理员' }
    }

    // 更新最后登录时间
    const now = new Date().toISOString()
    await db.collection('users').doc(user._id).update({
      data: { lastLoginAt: now }
    })

    // 记录登录日志
    try {
      await db.collection('loginLogs').add({
        data: {
          userId: user._id,
          phone: user.phone,
          name: user.name,
          loginAt: now,
          success: true
        }
      })
    } catch (e) {
      console.error('记录登录日志失败:', e)
    }

    // 返回用户信息（不含密码）
    const { password: _, ...userInfo } = user
    return {
      code: 0,
      data: {
        ...userInfo,
        lastLoginAt: now
      }
    }
  } catch (err) {
    console.error('[login] 错误:', err)
    return { code: 1, message: '登录失败: ' + (err.message || '') }
  }
}
