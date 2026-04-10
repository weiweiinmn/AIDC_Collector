// 云函数：deleteDatacenter - 软删除机房记录
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  if (!id) return { code: 1, message: '缺少机房ID' }

  try {
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    const userName = userRes.data.length > 0 ? userRes.data[0].name : '未知'

    await db.collection('datacenters').doc(id).update({
      data: {
        _deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: OPENID,
        deletedByName: userName
      }
    })

    return { code: 0, data: { message: '已删除' } }
  } catch (err) {
    console.error('[deleteDatacenter] 错误:', err)
    return { code: 1, message: '删除失败: ' + (err.message || '') }
  }
}
