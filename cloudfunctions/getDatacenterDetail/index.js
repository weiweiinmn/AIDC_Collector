// 云函数：getDatacenterDetail - 获取机房详情
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event
  if (!id) return { code: 1, message: '缺少机房ID' }

  try {
    const res = await db.collection('datacenters').doc(id).get()
    if (res.data._deleted) return { code: 1, message: '该机房记录已被删除' }
    return { code: 0, data: res.data }
  } catch (err) {
    console.error('[getDatacenterDetail] 错误:', err)
    return { code: 1, message: '获取机房详情失败: ' + (err.message || '') }
  }
}
