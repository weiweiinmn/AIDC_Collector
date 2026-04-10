// 云函数：updateUserStatus - 更新用户状态（管理员开通/停用）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { userId, status, rejectReason } = event

  if (!userId || !status) return { code: 1, message: '缺少必要参数' }
  if (!['approved', 'disabled'].includes(status)) return { code: 1, message: '状态值无效' }

  try {
    // 验证管理员身份
    const adminRes = await db.collection('users').where({ _openid: OPENID, role: 'admin', status: 'approved' }).get()
    if (adminRes.data.length === 0) {
      return { code: 1, message: '仅管理员可执行此操作' }
    }

    const admin = adminRes.data[0]
    const now = new Date().toISOString()

    const updateData = {
      status,
      updatedAt: now,
      updatedBy: OPENID,
      updatedByName: admin.name
    }

    if (rejectReason) updateData.rejectReason = rejectReason
    if (status === 'approved') updateData.rejectReason = ''

    await db.collection('users').doc(userId).update({ data: updateData })

    return { code: 0, data: { message: status === 'approved' ? '已开通' : '已停用' } }
  } catch (err) {
    console.error('[updateUserStatus] 错误:', err)
    return { code: 1, message: '操作失败: ' + (err.message || '') }
  }
}
