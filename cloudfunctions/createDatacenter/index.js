// 云函数：createDatacenter - 创建机房记录
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const data = event

  if (!data.name || !data.name.trim()) {
    return { code: 1, message: '请输入数据中心名称' }
  }

  try {
    // 获取用户信息
    const userRes = await db.collection('users').where({ phone: data._callerPhone || '' }).get()
    const userName = userRes.data.length > 0 ? userRes.data[0].name : '未知'

    const now = new Date().toISOString()
    const record = {
      ...data,
      status: data.status || 'new',
      createdBy: OPENID,
      createdByName: userName,
      importedById: null,
      importedByName: null,
      importedAt: null,
      createdAt: now,
      updatedAt: now,
      updatedBy: OPENID,
      updatedByName: userName,
      _deleted: false
    }

    // 清理不需要存入数据库的字段
    delete record._callerPhone
    delete record.photos // 照片由前端单独上传

    const res = await db.collection('datacenters').add({ data: record })

    // 记录编辑历史
    try {
      await db.collection('editHistory').add({
        data: {
          datacenterId: res._id,
          action: 'create',
          operatorId: OPENID,
          operatorName: userName,
          changes: {},
          createdAt: now
        }
      })
    } catch (e) {
      console.error('记录编辑历史失败:', e)
    }

    return {
      code: 0,
      data: { id: res._id, ...record }
    }
  } catch (err) {
    console.error('[createDatacenter] 错误:', err)
    return { code: 1, message: '创建失败: ' + (err.message || '') }
  }
}
