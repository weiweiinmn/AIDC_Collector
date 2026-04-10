// 云函数：changePassword - 用户修改密码
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, oldPassword, newPassword } = event

  if (!phone || !oldPassword || !newPassword) {
    return { code: 1, message: '请填写完整信息' }
  }

  if (newPassword.length < 6) {
    return { code: 1, message: '新密码至少6位' }
  }

  try {
    // 查找用户
    const userRes = await db.collection('users').where({ phone }).get()
    const user = userRes.data.length > 0 ? userRes.data[0] : null

    if (!user) {
      return { code: 1, message: '用户不存在' }
    }

    // 验证旧密码
    if (user.password !== oldPassword) {
      return { code: 1, message: '原密码错误' }
    }

    // 更新密码
    await db.collection('users').doc(user._id).update({
      data: {
        password: newPassword,
        updatedAt: new Date().toISOString()
      }
    })

    return { code: 0, data: { message: '密码修改成功' } }
  } catch (err) {
    console.error('[changePassword] 错误:', err)
    return { code: 1, message: '修改密码失败: ' + (err.message || '') }
  }
}
