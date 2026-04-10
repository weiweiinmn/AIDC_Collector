// 云函数：updateDatacenter - 更新机房记录
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, updates } = event

  if (!id) return { code: 1, message: '缺少机房ID' }
  if (!updates || Object.keys(updates).length === 0) return { code: 1, message: '没有需要更新的内容' }

  try {
    // 获取用户信息
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    const userName = userRes.data.length > 0 ? userRes.data[0].name : '未知'

    // 获取原始数据用于对比
    const original = await db.collection('datacenters').doc(id).get()
    if (original.data._deleted) return { code: 1, message: '该记录已被删除' }

    const now = new Date().toISOString()
    const updateData = {
      ...updates,
      updatedAt: now,
      updatedBy: OPENID,
      updatedByName: userName
    }

    await db.collection('datacenters').doc(id).update({ data: updateData })

    // 记录编辑历史
    try {
      const changes = {}
      for (const [key, value] of Object.entries(updates)) {
        const oldValue = original.data[key]
        if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
          changes[key] = { from: oldValue, to: value }
        }
      }
      if (Object.keys(changes).length > 0) {
        await db.collection('editHistory').add({
          data: {
            datacenterId: id,
            action: 'update',
            operatorId: OPENID,
            operatorName: userName,
            changes,
            createdAt: now
          }
        })
      }
    } catch (e) {
      console.error('记录编辑历史失败:', e)
    }

    return { code: 0, data: { message: '更新成功' } }
  } catch (err) {
    console.error('[updateDatacenter] 错误:', err)
    return { code: 1, message: '更新失败: ' + (err.message || '') }
  }
}
