// 云函数：resetPassword - 管理员重置用户密码
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { userId, newPassword } = event

  if (!userId || !newPassword) {
    return { code: 1, message: '用户ID和新密码为必填项' }
  }

  if (newPassword.length < 6) {
    return { code: 1, message: '新密码至少6位' }
  }

  try {
    // 验证操作者是管理员
    const adminRes = await db.collection('users').where({ _openid: OPENID, role: 'admin', status: 'approved' }).get()
    if (adminRes.data.length === 0) {
      return { code: 1, message: '仅管理员可重置密码' }
    }

    // 更新密码
    await db.collection('users').doc(userId).update({
      data: {
        password: newPassword,
        updatedAt: new Date().toISOString()
      }
    })

    return { code: 0, data: { message: '密码重置成功' } }
  } catch (err) {
    console.error('[resetPassword] 错误:', err)
    return { code: 1, message: '重置密码失败: ' + (err.message || '') }
  }
}
