// 云函数：getUsers - 获取用户列表（管理员）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 验证管理员身份
    const adminRes = await db.collection('users').where({ _openid: OPENID, role: 'admin', status: 'approved' }).get()
    if (adminRes.data.length === 0) {
      return { code: 1, message: '仅管理员可查看用户列表' }
    }

    const res = await db.collection('users').orderBy('createdAt', 'desc').get()

    // 过滤掉密码字段
    const users = res.data.map(user => {
      const { password, ...safeUser } = user
      return safeUser
    })

    return { code: 0, data: users }
  } catch (err) {
    console.error('[getUsers] 错误:', err)
    return { code: 1, message: '获取用户列表失败: ' + (err.message || '') }
  }
}
