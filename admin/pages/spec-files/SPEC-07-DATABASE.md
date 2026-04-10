# 7. 数据库设计

> 来源：SPEC-FULL.md | 编号：7
> 完整规格书请参考：[SPEC-FULL.md](./SPEC-FULL.md)

---

## 7. 数据库设计

### 7.1 users 集合（用户表）

```json
{
  "_id": "自动",
  "_openid": "微信自动生成（兼容）",

  // ===== 认证信息（改造重点）=====
  "phone": "13800138000",                  // 手机号（登录凭证，唯一索引）
  "passwordHash": "bcrypt_hash_string",     // 密码哈希（bcrypt加密）
  "needChangePassword": true,               // 是否需要修改密码（首次登录后改false）

  // ===== 用户信息 =====
  "name": "张三",                           // 姓名（用于水印显示）
  "role": "collector",                      // collector | admin
  "status": "approved",                     // pending | approved | disabled | rejected

  // ===== 开通信息 =====
  "approvedBy": "admin_openid",
  "approvedByName": "管理员姓名",
  "approvedAt": "2026-04-06T10:00:00Z",
  "rejectReason": "",                       // 拒绝理由
  "initialPassword": false,                 // 是否已使用过初始密码

  // ===== 系统字段 =====
  "createdAt": "2026-04-06T10:00:00Z",
  "lastLoginAt": "2026-04-06T10:00:00Z",
  "lastLoginIp": ""
}
```

**索引**：
- `phone`：唯一索引（登录查询）
- `status`：普通索引（后台筛选）

### 7.2 datacenters 集合（机房主表）

```json
{
  "_id": "自动",
  "_openid": "录入人openid",

  // ===== 区域信息（扩展重点）=====
  "region": "southeast_asia",              // 大区：southeast_asia | japan | europe | australia
  "country": "新加坡",                      // 国家（欧洲/澳洲为"欧洲"/"澳洲"）
  "city": "新加坡",                         // 城市

  // ===== 一、基础信息（5字段）=====
  "name": "Equinix SG2",
  "address": "新加坡 / 1 Genting Lane...",
  "ownership": "自有",
  "expectedDelivery": "2026-06",

  // ===== 二、机柜资源（6字段）=====
  "totalCabinets": 2000,
  "availableCabinets": 300,
  "maxCabinetPower": 8,
  "continuousCabinets": "是",
  "physicalIsolation": "是",

  // ===== 三、电力系统（12字段）=====
  "mainsCapacity": 10000,
  "availablePower": 8,
  "expandablePower": 16,
  "transformerConfig": "2N",
  "transformerCapacity": 2500,
  "generatorRedundancy": "N+1",
  "generatorFuelHours": 24,
  "upsConfig": "2N",
  "upsBatteryMinutes": 15,
  "highDensityBusway": "是",
  "bbuSuperCapacitor": "是",
  "powerSLA": "99.99%",

  // ===== 四、制冷系统（10字段）=====
  "mainCoolingType": "水冷",
  "coldPlateLiquid": "是",
  "liquidCoolRetrofit": "是",
  "liquidCoolPeriod": 3,
  "hasCDU": "是",
  "chilledWaterSupplyTemp": 18,
  "chilledWaterReturnTemp": 25,
  "endAirconRedundancy": "N+1",
  "chillerCount": 4,
  "pueDesign": 1.3,

  // ===== 五、承重与空间（8字段）=====
  "floorLoad": 1200,
  "raisedFloorHeight": 0.6,
  "freightElevatorWidth": 1.5,
  "freightElevatorHeight": 2.5,
  "freightElevatorLoad": 3,
  "transportCorridorWidth": 2,
  "loadingDock": "是",

  // ===== 六、网络与互联（6字段）=====
  "networkRoutes": 2,
  "ispCount": 3,
  "darkFiber": "是",
  "support800G": "是",
  "supportRoCEIB": "是",

  // ===== 七、交付时间（7字段）=====
  "delivery3Months": 5,
  "delivery6Months": 10,
  "existingLiquidPower": 0,
  "existingLiquidCount": 0,
  "powerRetrofitPeriod": 0,
  "coolingRetrofitPeriod": 0,

  // ===== 八、配套服务（5字段）=====
  "officeSeats": 20,
  "storageArea": 200,
  "ops24x7": "是",
  "faultResponseTime": 2,
  "liquidCoolMaintenance": "是",

  // ===== 九、成本与报价（3字段）=====
  "electricityBilling": "按量",
  "oneTimeFee": 50000,
  "liquidCoolServiceFee": 500,

  // ===== 补充信息 =====
  "photos": ["cloud://xxx.jpg"],
  "notes": "",

  // ===== 考察状态 =====
  "status": "new",                         // new | visited | negotiating | contracted | rejected
  "visitDate": "2026-04-06",
  "contactPerson": "",
  "contactInfo": "",

  // ===== 导入信息 =====
  "importedById": "",
  "importedByName": "",
  "importedAt": "",

  // ===== 系统字段 =====
  "createdBy": "openid",
  "createdByName": "张三",
  "createdAt": "2026-04-06T10:00:00Z",
  "updatedAt": "2026-04-06T10:00:00Z",
  "updatedBy": "openid",
  "updatedByName": "张三",
  "_deleted": false                        // 软删除标记
}
```

**索引**：
- `name`：普通索引（搜索）
- `region + country + city`：组合索引（区域筛选）
- `status`：普通索引（状态筛选）
- `createdBy`：普通索引（按采集人筛选）
- `_deleted`：普通索引（过滤已删除）

### 7.3 editHistory 集合（修改历史）

```json
{
  "_id": "自动",
  "datacenterId": "关联的机房ID",
  "field": "name",
  "oldValue": "旧值",
  "newValue": "新值",
  "updatedBy": "openid",
  "updatedByName": "张三",
  "updatedAt": "2026-04-06T10:00:00Z"
}
```

### 7.4 importLogs 集合（导入日志）🆕

**PM补充** — 记录每次 Excel 导入的完整日志，便于追溯和审计。

```json
{
  "_id": "自动",
  "operatorId": "openid",
  "operatorName": "张三",
  "operatorPhone": "13800138000",
  "source": "mobile",                      // mobile（手机端）| admin（后台）
  "assigneeId": "openid",                  // 归属人ID（后台导入时有值）
  "assigneeName": "李四",                  // 归属人姓名
  "fileName": "机房数据_20260406.xlsx",
  "totalRows": 50,                         // Excel 总行数
  "created": 30,                           // 新建记录数
  "updated": 15,                           // 更新记录数
  "failed": 5,                             // 失败记录数
  "errors": [                              // 失败详情
    { "row": 3, "reason": "机房名称为空" },
    { "row": 7, "reason": "电力容量格式错误" }
  ],
  "createdAt": "2026-04-06T10:00:00Z"
}
```

### 7.5 loginLogs 集合（登录日志）🆕

**PM补充** — 记录用户登录行为，便于安全审计。

```json
{
  "_id": "自动",
  "userId": "用户ID",
  "phone": "13800138000",
  "loginAt": "2026-04-06T10:00:00Z",
  "ip": "",
  "platform": "ios",                       // ios | android | devtools
  "success": true
}
```

---

