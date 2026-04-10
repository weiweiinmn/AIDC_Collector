// 云函数：importExcel - 从 Excel 文件导入机房信息
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 中英文映射表（Excel列名 → 数据库字段key）
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

// 需要转为数字的字段
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
  const { fileId } = event

  if (!fileId) {
    return { code: 1, message: '缺少文件ID' }
  }

  try {
    // 1. 获取导入人信息
    const userRes = await db.collection('users').where({ _openid: OPENID }).get()
    const userName = userRes.data.length > 0 ? (userRes.data[0].nickName || '未知') : '未知'

    // 2. 从云存储下载 Excel 文件
    const fileRes = await cloud.downloadFile({ fileID: fileId })
    const buffer = fileRes.fileContent

    // 3. 使用 exceljs 解析（需要云函数安装 exceljs 依赖）
    const XLSX = require('exceljs')
    const workbook = new XLSX.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.worksheets[0]
    if (!sheet) {
      return { code: 1, message: 'Excel 文件为空' }
    }

    // 4. 读取表头映射
    const rows = []
    const headerMap = {} // 列索引 → 字段key

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // 第一行为标题"类别"、"问题"、"填答"、"单位"、"说明"
        // 跳过
        return
      }
      if (rowNumber === 2) {
        // 第二行为表头
        row.eachCell((cell, colNumber) => {
          const val = String(cell.value || '').trim()
          if (FIELD_MAP[val]) {
            headerMap[colNumber] = FIELD_MAP[val]
          }
        })
        return
      }

      // 第三行开始是数据（跳过大类标题行）
      if (rowNumber < 4) return

      // 检查是否是大类标题行（只有第一列有值，如"一、基础信息"）
      const firstCell = row.getCell(1)
      const secondCell = row.getCell(2)
      if (firstCell.value && !secondCell.value) {
        // 这是类别标题行，跳过
        return
      }

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

      if (hasData) {
        rows.push(rowData)
      }
    })

    // 5. 写入数据库
    let created = 0
    let updated = 0
    const errors = []
    const now = new Date()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.name) {
        errors.push({ row: i + 3, message: '缺少数据中心名称' })
        continue
      }

      try {
        // 数字字段转换
        NUMERIC_FIELDS.forEach(field => {
          if (row[field] !== undefined && row[field] !== '') {
            row[field] = Number(row[field])
            if (isNaN(row[field])) row[field] = null
          } else {
            row[field] = null
          }
        })

        // 检查同名机房是否已存在
        const existing = await db.collection('datacenters').where({
          name: row.name,
          _deleted: { neq: true }
        }).get()

        const record = {
          ...row,
          status: 'new',
          importedById: OPENID,
          importedByName: userName,
          importedAt: now.toISOString()
        }

        if (existing.data.length > 0) {
          // 更新现有记录
          await db.collection('datacenters').doc(existing.data[0]._id).update({
            data: {
              ...record,
              updatedAt: now.toISOString(),
              updatedBy: OPENID,
              updatedByName: userName
            }
          })
          updated++
        } else {
          // 新增记录
          await db.collection('datacenters').add({
            data: {
              ...record,
              createdBy: OPENID,
              createdByName: userName,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              updatedBy: OPENID,
              updatedByName: userName,
              _deleted: false
            }
          })
          created++
        }
      } catch (err) {
        errors.push({ row: i + 3, message: err.message || '写入失败' })
      }
    }

    return {
      code: 0,
      data: {
        created,
        updated,
        errors,
        importedByName: userName
      }
    }
  } catch (err) {
    console.error('[importExcel] 错误:', err)
    return { code: 1, message: '导入失败: ' + (err.message || '') }
  }
}
