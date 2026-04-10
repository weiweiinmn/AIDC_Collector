// 云函数：adminImportExcel - 管理员导入Excel（可选归属人）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 字段映射（复用 importExcel 的映射表）
const FIELD_MAP = {
  '数据中心名称': 'name',
  '地址（国家/城市/园区）': 'address',
  '产权归属': 'ownership',
  '预计交付运营时间': 'expectedDelivery',
  '总机柜数量': 'totalCabinets',
  '当前可提供机柜数量': 'availableCabinets',
  '机柜最高可支撑功率': 'maxCabinetPower',
  '能否连续布置机柜': 'continuousCabinets',
  '是否支持物理隔离': 'physicalIsolation',
  '市电总容量': 'mainsCapacity',
  '当前可用电力': 'availablePower',
  '可扩容电力上限': 'expandablePower',
  '变压器配置': 'transformerConfig',
  '单台变压器容量': 'transformerCapacity',
  '柴发冗余等级': 'generatorRedundancy',
  '柴发储油时长': 'generatorFuelHours',
  'UPS配置': 'upsConfig',
  'UPS电池后备时间': 'upsBatteryMinutes',
  '是否配备高密度母线': 'highDensityBusway',
  '是否配备BBU/超级电容': 'bbuSuperCapacitor',
  '电力可用性SLA': 'powerSLA',
  '主制冷方式': 'mainCoolingType',
  '是否支持冷板式液冷': 'coldPlateLiquid',
  '如无液冷能否改造': 'liquidCoolRetrofit',
  '液冷改造周期': 'liquidCoolPeriod',
  '是否配备CDU': 'hasCDU',
  '冷冻水供水温度': 'chilledWaterSupplyTemp',
  '冷冻水回水温度': 'chilledWaterReturnTemp',
  '末端空调冗余': 'endAirconRedundancy',
  '冷水机组数量': 'chillerCount',
  'PUE设计值': 'pueDesign',
  '地板承重': 'floorLoad',
  '架空地板高度': 'raisedFloorHeight',
  '货梯宽度': 'freightElevatorWidth',
  '货梯高度': 'freightElevatorHeight',
  '货梯承重': 'freightElevatorLoad',
  '主运输通道宽度': 'transportCorridorWidth',
  '卸货平台': 'loadingDock',
  '网络进线路由': 'networkRoutes',
  '运营商数量': 'ispCount',
  '裸光纤资源': 'darkFiber',
  '800G网络支持': 'support800G',
  'RoCE/IB支持': 'supportRoCEIB',
  '3个月内可交付': 'delivery3Months',
  '6个月可交付': 'delivery6Months',
  '现有液冷机柜功率': 'existingLiquidPower',
  '现有液冷机柜数量': 'existingLiquidCount',
  '电力改造周期': 'powerRetrofitPeriod',
  '制冷改造周期': 'coolingRetrofitPeriod',
  '办公区工位数': 'officeSeats',
  '库房面积': 'storageArea',
  '7×24运维值守': 'ops24x7',
  '故障响应时间': 'faultResponseTime',
  '液冷维护能力': 'liquidCoolMaintenance',
  '电费计费模式': 'electricityBilling',
  '一次性接入费': 'oneTimeFee',
  '液冷服务费': 'liquidCoolServiceFee',
  '拜访日期': 'visitDate',
  '联系人': 'contactPerson',
  '联系方式': 'contactInfo',
  '备注': 'notes'
}

const NUMERIC_FIELDS = [
  'totalCabinets', 'availableCabinets', 'maxCabinetPower',
  'mainsCapacity', 'availablePower', 'expandablePower', 'transformerCapacity',
  'generatorFuelHours', 'upsBatteryMinutes', 'liquidCoolPeriod',
  'chilledWaterSupplyTemp', 'chilledWaterReturnTemp', 'chillerCount',
  'floorLoad', 'raisedFloorHeight', 'freightElevatorWidth', 'freightElevatorHeight',
  'freightElevatorLoad', 'transportCorridorWidth', 'networkRoutes', 'ispCount',
  'delivery3Months', 'delivery6Months', 'existingLiquidPower', 'existingLiquidCount',
  'powerRetrofitPeriod', 'coolingRetrofitPeriod', 'officeSeats', 'storageArea',
  'faultResponseTime', 'oneTimeFee', 'liquidCoolServiceFee', 'pueDesign'
]

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { fileId, assigneeId, conflictStrategy } = event

  if (!fileId) return { code: 1, message: '缺少文件ID' }

  // 默认冲突策略：overwrite
  const strategy = conflictStrategy || 'overwrite'

  try {
    // 验证管理员身份
    const adminRes = await db.collection('users').where({ _openid: OPENID, role: 'admin', status: 'approved' }).get()
    if (adminRes.data.length === 0) return { code: 1, message: '仅管理员可使用此功能' }

    const admin = adminRes.data[0]

    // 获取归属人信息
    let assigneeName = admin.name
    let assigneeOpenId = OPENID
    if (assigneeId) {
      const assigneeRes = await db.collection('users').doc(assigneeId).get()
      assigneeName = assigneeRes.data.name
      assigneeOpenId = assigneeRes.data._openid || OPENID
    }

    // 下载 Excel
    const fileRes = await cloud.downloadFile({ fileID: fileId })
    const buffer = fileRes.fileContent
    const XLSX = require('exceljs')
    const workbook = new XLSX.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.worksheets[0]
    if (!sheet) return { code: 1, message: 'Excel 文件为空' }

    // 解析数据
    const rows = []
    const headerMap = {}

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      if (rowNumber === 2) {
        row.eachCell((cell, colNumber) => {
          const val = String(cell.value || '').trim()
          if (FIELD_MAP[val]) headerMap[colNumber] = FIELD_MAP[val]
        })
        return
      }
      if (rowNumber < 4) return

      const firstCell = row.getCell(1)
      const secondCell = row.getCell(2)
      if (firstCell.value && !secondCell.value) return

      const rowData = {}
      let hasData = false
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (headerMap[colNumber]) {
          const val = cell.value
          if (val !== null && val !== undefined && val !== '') {
            rowData[headerMap[colNumber]] = typeof val === 'object' ? (val.text || val.result || String(val)) : String(val)
            hasData = true
          }
        }
      })
      if (hasData) rows.push(rowData)
    })

    // 写入数据库
    let created = 0, updated = 0, skipped = 0
    const errors = []
    const now = new Date()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.name) {
        errors.push({ row: i + 3, message: '缺少数据中心名称' })
        continue
      }

      try {
        NUMERIC_FIELDS.forEach(field => {
          if (row[field] !== undefined && row[field] !== '') {
            row[field] = Number(row[field])
            if (isNaN(row[field])) row[field] = null
          } else {
            row[field] = null
          }
        })

        const existing = await db.collection('datacenters').where({
          name: row.name, _deleted: { neq: true }
        }).get()

        const record = {
          ...row,
          status: 'new',
          importedById: assigneeOpenId,
          importedByName: assigneeName,
          importedAt: now.toISOString()
        }

        if (existing.data.length > 0) {
          if (strategy === 'skip') {
            skipped++
            continue
          } else if (strategy === 'create') {
            // 作为新记录创建
            await db.collection('datacenters').add({
              data: {
                ...record,
                createdBy: OPENID,
                createdByName: admin.name,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                updatedBy: OPENID,
                updatedByName: admin.name,
                _deleted: false
              }
            })
            created++
          } else {
            // overwrite（默认）
            await db.collection('datacenters').doc(existing.data[0]._id).update({
              data: {
                ...record,
                updatedAt: now.toISOString(),
                updatedBy: OPENID,
                updatedByName: admin.name
              }
            })
            updated++
          }
        } else {
          await db.collection('datacenters').add({
            data: {
              ...record,
              createdBy: OPENID,
              createdByName: admin.name,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              updatedBy: OPENID,
              updatedByName: admin.name,
              _deleted: false
            }
          })
          created++
        }
      } catch (err) {
        errors.push({ row: i + 3, message: err.message || '写入失败' })
      }
    }

    // 记录导入日志
    try {
      await db.collection('importLogs').add({
        data: {
          fileId,
          fileName: event.fileName || '未知文件',
          adminId: OPENID,
          adminName: admin.name,
          assigneeId: assigneeId || null,
          assigneeName: assigneeName,
          conflictStrategy: strategy,
          created, updated, skipped,
          errorCount: errors.length,
          importedAt: now.toISOString()
        }
      })
    } catch (e) {
      console.error('记录导入日志失败:', e)
    }

    return {
      code: 0,
      data: { created, updated, skipped, errors, importedByName: assigneeName }
    }
  } catch (err) {
    console.error('[adminImportExcel] 错误:', err)
    return { code: 1, message: '导入失败: ' + (err.message || '') }
  }
}
