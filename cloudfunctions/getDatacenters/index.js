// 云函数：getDatacenters - 获取机房列表（分页、搜索、筛选）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { page = 1, pageSize = 20, keyword = '', status = '', region = '' } = event

  try {
    // 构建查询条件
    const where = { _deleted: _.neq(true) }

    // 关键词搜索（name/address 模糊匹配）
    if (keyword && keyword.trim()) {
      const kw = keyword.trim()
      where.name = db.RegExp({ regexp: kw, options: 'i' })
      delete where.name
      where._or = [
        { name: db.RegExp({ regexp: kw, options: 'i' }) },
        { address: db.RegExp({ regexp: kw, options: 'i' }) }
      ]
    }

    if (status) where.status = status
    if (region) where.region = region

    // 总数
    const countRes = await db.collection('datacenters').where(where).count()
    const total = countRes.total

    // 分页查询
    const skip = (page - 1) * pageSize
    const listRes = await db.collection('datacenters')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 统计 todayCount
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCountRes = await db.collection('datacenters').where({
      _deleted: _.neq(true),
      createdAt: _.gte(todayStart.toISOString())
    }).count()

    // 统计 monthCount
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthCountRes = await db.collection('datacenters').where({
      _deleted: _.neq(true),
      createdAt: _.gte(monthStart.toISOString())
    }).count()

    // 统计 myCount
    const myCountRes = await db.collection('datacenters').where({
      _deleted: _.neq(true),
      _or: [
        { createdBy: OPENID },
        { importedById: OPENID }
      ]
    }).count()

    return {
      code: 0,
      data: {
        list: listRes.data,
        total,
        todayCount: todayCountRes.total,
        monthCount: monthCountRes.total,
        myCount: myCountRes.total
      }
    }
  } catch (err) {
    console.error('[getDatacenters] 错误:', err)
    return { code: 1, message: '获取机房列表失败: ' + (err.message || '') }
  }
}
