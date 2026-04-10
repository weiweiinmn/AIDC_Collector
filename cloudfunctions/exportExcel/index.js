// 云函数：exportExcel - 导出Excel（完整数据或空白模板）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 导出字段定义
const EXPORT_FIELDS = [
  { key: 'name', label: '数据中心名称' },
  { key: 'address', label: '地址（国家/城市/园区）' },
  { key: 'region', label: '采集区域' },
  { key: 'ownership', label: '产权归属' },
  { key: 'expectedDelivery', label: '预计交付运营时间' },
  { key: 'totalCabinets', label: '总机柜数量' },
  { key: 'availableCabinets', label: '当前可提供机柜数量' },
  { key: 'maxCabinetPower', label: '机柜最高可支撑功率' },
  { key: 'continuousCabinets', label: '能否连续布置机柜' },
  { key: 'physicalIsolation', label: '是否支持物理隔离' },
  { key: 'mainsCapacity', label: '市电总容量' },
  { key: 'availablePower', label: '当前可用电力' },
  { key: 'expandablePower', label: '可扩容电力上限' },
  { key: 'transformerConfig', label: '变压器配置' },
  { key: 'transformerCapacity', label: '单台变压器容量' },
  { key: 'generatorRedundancy', label: '柴发冗余等级' },
  { key: 'generatorFuelHours', label: '柴发储油时长' },
  { key: 'upsConfig', label: 'UPS配置' },
  { key: 'upsBatteryMinutes', label: 'UPS电池后备时间' },
  { key: 'highDensityBusway', label: '是否配备高密度母线' },
  { key: 'bbuSuperCapacitor', label: '是否配备BBU/超级电容' },
  { key: 'powerSLA', label: '电力可用性SLA' },
  { key: 'mainCoolingType', label: '主制冷方式' },
  { key: 'coldPlateLiquid', label: '是否支持冷板式液冷' },
  { key: 'liquidCoolRetrofit', label: '如无液冷能否改造' },
  { key: 'liquidCoolPeriod', label: '液冷改造周期' },
  { key: 'hasCDU', label: '是否配备CDU' },
  { key: 'chilledWaterSupplyTemp', label: '冷冻水供水温度' },
  { key: 'chilledWaterReturnTemp', label: '冷冻水回水温度' },
  { key: 'endAirconRedundancy', label: '末端空调冗余' },
  { key: 'chillerCount', label: '冷水机组数量' },
  { key: 'pueDesign', label: 'PUE设计值' },
  { key: 'floorLoad', label: '地板承重' },
  { key: 'raisedFloorHeight', label: '架空地板高度' },
  { key: 'freightElevatorWidth', label: '货梯宽度' },
  { key: 'freightElevatorHeight', label: '货梯高度' },
  { key: 'freightElevatorLoad', label: '货梯承重' },
  { key: 'transportCorridorWidth', label: '主运输通道宽度' },
  { key: 'loadingDock', label: '卸货平台' },
  { key: 'networkRoutes', label: '网络进线路由' },
  { key: 'ispCount', label: '运营商数量' },
  { key: 'darkFiber', label: '裸光纤资源' },
  { key: 'support800G', label: '800G网络支持' },
  { key: 'supportRoCEIB', label: 'RoCE/IB支持' },
  { key: 'delivery3Months', label: '3个月内可交付' },
  { key: 'delivery6Months', label: '6个月可交付' },
  { key: 'existingLiquidPower', label: '现有液冷机柜功率' },
  { key: 'existingLiquidCount', label: '现有液冷机柜数量' },
  { key: 'powerRetrofitPeriod', label: '电力改造周期' },
  { key: 'coolingRetrofitPeriod', label: '制冷改造周期' },
  { key: 'officeSeats', label: '办公区工位数' },
  { key: 'storageArea', label: '库房面积' },
  { key: 'ops24x7', label: '7x24运维值守' },
  { key: 'faultResponseTime', label: '故障响应时间' },
  { key: 'liquidCoolMaintenance', label: '液冷维护能力' },
  { key: 'electricityBilling', label: '电费计费模式' },
  { key: 'oneTimeFee', label: '一次性接入费' },
  { key: 'liquidCoolServiceFee', label: '液冷服务费' },
  { key: 'visitDate', label: '拜访日期' },
  { key: 'contactPerson', label: '联系人' },
  { key: 'contactInfo', label: '联系方式' },
  { key: 'notes', label: '备注' },
  { key: 'status', label: '状态' },
  { key: 'createdByName', label: '录入人' },
  { key: 'createdAt', label: '创建时间' }
]

// 区域映射
const REGION_MAP = {
  southeast_asia: '东南亚',
  japan: '日本',
  europe: '欧洲',
  australia: '澳洲'
}

// 状态映射
const STATUS_MAP = {
  new: '新发现', visited: '已考察', negotiating: '洽谈中',
  contracted: '已签约', rejected: '已排除'
}

exports.main = async (event, context) => {
  const { fields, templateOnly } = event

  try {
    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('机房数据')

    // 写表头
    const headerRow = EXPORT_FIELDS.map(f => f.label)
    sheet.addRow(headerRow)
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }

    if (!templateOnly) {
      // 查询所有未删除的机房数据
      let records = []
      const batchSize = 100
      let lastRecord = null

      while (true) {
        let query = db.collection('datacenters').where({ _deleted: _.neq(true) }).orderBy('createdAt', 'desc').limit(batchSize)
        if (lastRecord) query = query.startAfter(lastRecord.createdAt)

        const res = await query.get()
        records = records.concat(res.data)
        if (res.data.length < batchSize) break
        lastRecord = res.data[res.data.length - 1]
      }

      // 写数据行
      records.forEach(record => {
        const row = EXPORT_FIELDS.map(f => {
          let val = record[f.key]
          if (f.key === 'region' && val) val = REGION_MAP[val] || val
          if (f.key === 'status' && val) val = STATUS_MAP[val] || val
          return val !== null && val !== undefined ? val : ''
        })
        sheet.addRow(row)
      })
    }

    // 列宽自适应
    sheet.columns.forEach((col, i) => {
      col.width = Math.max(12, headerRow[i] ? headerRow[i].length * 2.5 : 12)
    })

    // 生成文件并上传
    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = templateOnly
      ? `AIDC调研问卷_空白模板.xlsx`
      : `机房数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    const cloudPath = `exports/${Date.now()}-${fileName}`

    const uploadRes = await cloud.uploadFile({
      cloudPath,
      fileContent: Buffer.from(buffer)
    })

    return {
      code: 0,
      data: { fileId: uploadRes.fileID, fileName }
    }
  } catch (err) {
    console.error('[exportExcel] 错误:', err)
    return { code: 1, message: '导出失败: ' + (err.message || '') }
  }
}
