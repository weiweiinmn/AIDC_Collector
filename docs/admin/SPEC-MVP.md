# iDC Collector — MVP 开发计划

> 版本：v1.0（2026-04-06）
> 技术决策：微信云开发 + TDesign + 个人主体
> 状态：**待开发**

---

## 1. 技术架构

| 层级 | 方案 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生 + TDesign 组件库 | PRD 推荐，60+ 组件 |
| 后端 | 微信云开发（云函数 + 云数据库 + 云存储） | 19.9元/月，首月免费 |
| 管理后台 | 云后台/CMS（免开发） | 低代码管理界面，替代独立 Web 后台 |
| 数据库 | 云开发 NoSQL（MongoDB） | 集合 + 文档模式 |
| 认证 | 微信登录（云开发内置） | 个人主体可用 |
| 导出 | 云函数生成 Excel → 云存储 → 下载 | 使用 exceljs 库 |

### 为什么不用独立后台
- 原规格书建议 React Ant Design Pro 后台 → 需要服务器 + 域名 + 后端
- 云开发自带 CMS 内容管理和云后台，开箱即用，零额外成本
- 小团队低频使用场景，CMS 完全满足管理需求

### 成本
- 云开发基础套餐：19.9元/月（首月免费）
- 个人主体小程序：免费
- **总计：19.9元/月**

---

## 2. 数据库设计

### 2.1 users 集合

**管理员开通制**：所有用户必须由管理员手动开通，未开通用户无法使用小程序。

```json
{
  "_id": "自动",
  "_openid": "微信自动生成",
  "nickName": "张三",
  "avatarUrl": "https://...",
  "role": "collector",       // collector | admin
  "status": "pending",       // pending（待审核）| approved（已开通）| rejected（已拒绝）
  "approvedBy": "admin_openid",
  "approvedByName": "管理员姓名",
  "approvedAt": "2026-04-06T10:00:00Z",
  "rejectReason": "",        // 拒绝理由（status=rejected时）
  "team": "东南亚一区",       // 可选，后续扩展
  "createdAt": "2026-04-06T10:00:00Z",
  "lastLoginAt": "2026-04-06T10:00:00Z"
}
```

**权限控制规则**：
1. 微信登录后自动创建用户记录，`status = pending`
2. `status = pending/rejected` → 显示等待审核/已拒绝提示页，无法进入任何业务页面
3. `status = approved` → 正常使用
4. 管理员在云后台/CMS 中修改 `status` 为 `approved` 即开通
5. 禁止转发/分享小程序页面（onShareAppMessage 返回空）
6. 无账号用户看不到任何机房信息

### 2.2 datacenters 集合（核心）

字段定义依据 AIDC选址调研_V4.xlsx 调研问卷，9大类65个业务字段 + 系统字段。

```json
{
  "_id": "自动",
  "_openid": "录入人openid",

  // ===== 一、基础信息（5字段）=====
  "name": "Equinix SG2",                  // 数据中心名称
  "address": "新加坡 / 1 Genting Lane...", // 地址（国家/城市/园区）
  "ownership": "自有",                     // 产权归属：自有/租赁
  "expectedDelivery": "2026-06",          // 预计交付运营时间（年月）

  // ===== 二、机柜资源（6字段）=====
  "totalCabinets": 2000,                  // 总机柜数量（个）
  "availableCabinets": 300,               // 当前可提供机柜数量（个）
  "maxCabinetPower": 8,                   // 机柜最高可支撑功率（kW/柜）
  "continuousCabinets": "是",             // 能否连续布置机柜：是/否
  "physicalIsolation": "是",              // 是否支持物理隔离：是/否

  // ===== 三、电力系统（13字段）=====
  "mainsCapacity": 10000,                 // 市电总容量（kVA）
  "availablePower": 8,                    // 当前可用电力（MW）
  "expandablePower": 16,                  // 可扩容电力上限（MW）
  "transformerConfig": "2N",              // 变压器配置：2N/N+1/N
  "transformerCapacity": 2500,            // 单台变压器容量（kVA）
  "generatorRedundancy": "N+1",           // 柴发冗余等级：N+X(X=?)
  "generatorFuelHours": 24,               // 柴发储油时长（小时）
  "upsConfig": "2N",                      // UPS配置：2N/分布式/后备
  "upsBatteryMinutes": 15,                // UPS电池后备时间（分钟）
  "highDensityBusway": "是",              // 是否配备高密度母线：是/否
  "bbuSuperCapacitor": "是",              // 是否配备BBU/超级电容：是/否
  "powerSLA": "99.99%",                   // 电力可用性SLA：99.99%/99.999%

  // ===== 四、制冷系统（11字段）=====
  "mainCoolingType": "水冷",              // 主制冷方式
  "coldPlateLiquid": "是",                // 是否支持冷板式液冷：是/否
  "liquidCoolRetrofit": "是",             // 如无液冷能否改造：是/否/不适用
  "liquidCoolPeriod": 3,                  // 液冷改造周期（月）
  "hasCDU": "是",                         // 是否配备CDU：是/否
  "chilledWaterSupplyTemp": 18,           // 冷冻水供水温度（℃）
  "chilledWaterReturnTemp": 25,           // 冷冻水回水温度（℃）
  "endAirconRedundancy": "N+1",           // 末端空调冗余：N+X(X=?)
  "chillerCount": 4,                      // 冷水机组数量（台）
  "pueDesign": 1.3,                       // PUE设计值

  // ===== 五、承重与空间（8字段）=====
  "floorLoad": 1200,                      // 地板承重（kg/m²，要求≥1000）
  "raisedFloorHeight": 0.6,               // 架空地板高度（米，要求≥0.6）
  "freightElevatorWidth": 1.5,            // 货梯宽度（米）
  "freightElevatorHeight": 2.5,           // 货梯高度（米）
  "freightElevatorLoad": 3,               // 货梯承重（吨，要求≥2）
  "transportCorridorWidth": 2,            // 主运输通道宽度（米，要求≥1.5）
  "loadingDock": "是",                    // 卸货平台：是/否（18米货车直达）

  // ===== 六、网络与互联（6字段）=====
  "networkRoutes": 2,                     // 网络进线路由（路，独立物理路由）
  "ispCount": 3,                          // 运营商数量（家）
  "darkFiber": "是",                      // 裸光纤资源：是/否
  "support800G": "是",                    // 800G网络支持：是/否
  "supportRoCEIB": "是",                   // RoCE/IB支持：是/否

  // ===== 七、交付时间（7字段）=====
  "delivery3Months": 5,                   // 3个月内可交付（MW）
  "delivery6Months": 10,                  // 6个月可交付（MW）
  "existingLiquidPower": 0,               // 现有液冷机柜功率（kW/柜）
  "existingLiquidCount": 0,               // 现有液冷机柜数量（个）
  "powerRetrofitPeriod": 0,               // 电力改造周期（月）
  "coolingRetrofitPeriod": 0,             // 制冷改造周期（月）

  // ===== 八、配套服务（6字段）=====
  "officeSeats": 20,                      // 办公区工位数（工位）
  "storageArea": 200,                     // 库房面积（㎡）
  "ops24x7": "是",                        // 7x24运维值守：是/否
  "faultResponseTime": 2,                 // 故障响应时间（小时）
  "liquidCoolMaintenance": "是",          // 液冷维护能力：是/否

  // ===== 九、成本与报价（3字段）=====
  "electricityBilling": "按量",           // 电费计费模式：包干/按量
  "oneTimeFee": 50000,                    // 一次性接入费（元）
  "liquidCoolServiceFee": 500,            // 液冷服务费（元/柜/月）

  // ===== 补充信息 =====
  "photos": ["cloud://xxx.jpg"],          // 现场照片（最多6张）
  "notes": "",                            // 备注

  // ===== 考察状态 =====
  "status": "new",                        // new | visited | negotiating | contracted | rejected
  "visitDate": "2026-04-06",              // 拜访日期
  "contactPerson": "",                    // 联系人
  "contactInfo": "",                      // 联系方式

  // ===== 导入信息（Excel导入时记录）=====
  "importedById": "",                     // 导入人openid（Excel导入时有值）
  "importedByName": "",                   // 导入人姓名
  "importedAt": "",                       // 导入时间

  // ===== 系统字段 =====
  "createdBy": "openid",
  "createdByName": "张三",
  "createdAt": "2026-04-06T10:00:00Z",
  "updatedAt": "2026-04-06T10:00:00Z",
  "updatedBy": "openid",
  "updatedByName": "张三"
}
```

### 2.3 字段中英文映射（用于 Excel 导入导出列名）

| 英文 key | 中文列名 | 单位 |
|----------|---------|------|
| name | 数据中心名称 | |
| address | 地址（国家/城市/园区） | |
| ownership | 产权归属 | 自有/租赁 |
| expectedDelivery | 预计交付运营时间 | 年月 |
| totalCabinets | 总机柜数量 | 个 |
| availableCabinets | 当前可提供机柜数量 | 个 |
| maxCabinetPower | 机柜最高可支撑功率 | kW/柜 |
| continuousCabinets | 能否连续布置机柜 | |
| physicalIsolation | 是否支持物理隔离 | |
| mainsCapacity | 市电总容量 | kVA |
| availablePower | 当前可用电力 | MW |
| expandablePower | 可扩容电力上限 | MW |
| transformerConfig | 变压器配置 | 2N/N+1/N |
| transformerCapacity | 单台变压器容量 | kVA |
| generatorRedundancy | 柴发冗余等级 | N+X |
| generatorFuelHours | 柴发储油时长 | 小时 |
| upsConfig | UPS配置 | 2N/分布式/后备 |
| upsBatteryMinutes | UPS电池后备时间 | 分钟 |
| highDensityBusway | 是否配备高密度母线 | |
| bbuSuperCapacitor | 是否配备BBU/超级电容 | |
| powerSLA | 电力可用性SLA | |
| mainCoolingType | 主制冷方式 | |
| coldPlateLiquid | 是否支持冷板式液冷 | |
| liquidCoolRetrofit | 如无液冷能否改造 | |
| liquidCoolPeriod | 液冷改造周期 | 月 |
| hasCDU | 是否配备CDU | |
| chilledWaterSupplyTemp | 冷冻水供水温度 | ℃ |
| chilledWaterReturnTemp | 冷冻水回水温度 | ℃ |
| endAirconRedundancy | 末端空调冗余 | N+X |
| chillerCount | 冷水机组数量 | 台 |
| pueDesign | PUE设计值 | |
| floorLoad | 地板承重 | kg/m² |
| raisedFloorHeight | 架空地板高度 | 米 |
| freightElevatorWidth | 货梯宽度 | 米 |
| freightElevatorHeight | 货梯高度 | 米 |
| freightElevatorLoad | 货梯承重 | 吨 |
| transportCorridorWidth | 主运输通道宽度 | 米 |
| loadingDock | 卸货平台 | |
| networkRoutes | 网络进线路由 | 路 |
| ispCount | 运营商数量 | 家 |
| darkFiber | 裸光纤资源 | |
| support800G | 800G网络支持 | |
| supportRoCEIB | RoCE/IB支持 | |
| delivery3Months | 3个月内可交付 | MW |
| delivery6Months | 6个月可交付 | MW |
| existingLiquidPower | 现有液冷机柜功率 | kW/柜 |
| existingLiquidCount | 现有液冷机柜数量 | 个 |
| powerRetrofitPeriod | 电力改造周期 | 月 |
| coolingRetrofitPeriod | 制冷改造周期 | 月 |
| officeSeats | 办公区工位数 | 工位 |
| storageArea | 库房面积 | ㎡ |
| ops24x7 | 7x24运维值守 | |
| faultResponseTime | 故障响应时间 | 小时 |
| liquidCoolMaintenance | 液冷维护能力 | |
| electricityBilling | 电费计费模式 | 包干/按量 |
| oneTimeFee | 一次性接入费 | 元 |
| liquidCoolServiceFee | 液冷服务费 | 元/柜/月 |
| visitDate | 拜访日期 | |
| contactPerson | 联系人 | |
| contactInfo | 联系方式 | |
| notes | 备注 | |

### 2.3 editHistory 集合

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

---

## 3. 云函数设计

### 3.1 login
- 入参：无（自动获取 openid）
- 逻辑：查询/创建用户记录，返回用户信息含 role + status
- **新增**：如果用户不存在，创建 `status: 'pending'` 的记录
- **新增**：如果 `status !== 'approved'`，返回 `canUse: false`，前端拦截
- 权限：开放

### 3.2 getDatacenters
- 入参：{ page, pageSize, filters: { city, status }, keyword }
- 逻辑：分页查询，支持筛选
- 权限：**仅 status=approved 的用户可查**
- **保密**：未开通用户调用此函数直接拒绝

### 3.3 getDatacenterDetail
- 入参：{ id }
- 逻辑：查单条 + 最近修改历史
- 权限：**仅 status=approved 的用户可查**

### 3.4 createDatacenter
- 入参：机房基本信息（65个字段 + photos）
- 逻辑：校验必填项（name, address）→ 写入 datacenters → 返回 id
- 权限：collector, admin（且 status=approved）

### 3.5 updateDatacenter
- 入参：{ id, updates }
- 逻辑：查旧值 → 写入 editHistory → 更新 datacenters
- 权限：录入人本人或 admin（且 status=approved）

### 3.6 deleteDatacenter
- 入参：{ id }
- 逻辑：软删除（标记 _deleted: true）
- 权限：admin only

### 3.7 exportExcel
- 入参：{ filters, fields }
- 逻辑：查数据 → 用 exceljs 生成（含65个业务字段）→ 上传云存储 → 返回文件ID
- 导出模板：可导出空白模板（机房服务商填写用）或已有数据
- 权限：admin

### 3.8 importExcel
- 入参：{ fileId }（云存储中的 Excel 文件 ID）
- 逻辑：
  1. 从云存储下载 Excel
  2. 按字段映射表解析65个字段
  3. 逐条写入 datacenters 集合
  4. 每条记录自动填入 `importedById`、`importedByName`、`importedAt`
- **冲突处理**：同名机房（name相同）视为更新，其余视为新增
- 权限：collector, admin（且 status=approved）
- 返回：{ created: N, updated: M, errors: [...] }

### 3.9 uploadPhotos
- 入参：{ tempFilePaths }
- 逻辑：批量上传到云存储 → 返回 fileID 数组
- 权限：collector, admin（且 status=approved）

---

## 4. 页面开发清单（MVP）

| # | 页面 | 路径 | 优先级 | 说明 |
|---|------|------|--------|------|
| 1 | 登录/审核页 | pages/login/login | P0 | 微信授权 + 等待审核/已拒绝提示 |
| 2 | 首页 | pages/index/index | P0 | 采集统计 + 快速新建入口 |
| 3 | 新建采集 | pages/form/basic | P0 | 机房信息表单（9大类65字段） |
| 4 | 采集列表 | pages/list/list | P0 | 列表 + 筛选 + 搜索 |
| 5 | 记录详情 | pages/detail/detail | P0 | 查看 + 编辑 + 修改历史 |
| 6 | 导出页 | pages/export/export | P0 | 导出 Excel + 导出空白模板（管理员） |
| 7 | **导入页** | pages/import/import | P0 | **Excel 导入机房信息（新增）** |
| 8 | 设置 | pages/settings/settings | P0 | 个人信息 + 退出 |

**不做的页面（用云后台替代）**：
- ~~管理后台~~ → 用云开发 CMS/云后台
- ~~用户管理~~ → CMS 内置

---

## 5. 开发里程碑

### 阶段一：基础框架 + 登录（Day 1）
- [x] 初始化项目（微信开发者工具 + TDesign）
- [x] 配置云开发环境
- [x] 创建数据库集合（users, datacenters, editHistory）
- [x] 登录云函数 + 登录页
- [x] 全局状态管理（用户信息缓存）

### 阶段二：核心 CRUD（Day 2-3）
- [x] 新建采集页（表单 + 图片上传）
- [x] 采集列表页（分页 + 搜索）
- [x] 记录详情页（查看 + 编辑）
- [x] 修改历史记录
- [x] 云函数（CRUD 全套）

### 阶段三：导出 + 收尾（Day 4）
- [x] Excel 导出功能
- [x] 首页仪表盘（统计卡片）
- [x] 云后台/CMS 配置
- [x] 测试 + 修 bug

---

## 6. 项目结构

```
idc-collector/
├── miniprogram/
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── project.config.json
│   ├── sitemap.json
│   ├── pages/
│   │   ├── login/
│   │   ├── index/
│   │   ├── form/
│   │   ├── list/
│   │   ├── detail/
│   │   ├── export/
│   │   └── settings/
│   ├── components/
│   │   ├── dc-card/          # 机房卡片组件
│   │   ├── status-tag/       # 状态标签
│   │   ├── photo-upload/     # 图片上传组件
│   │   └── search-bar/       # 搜索栏
│   ├── utils/
│   │   ├── api.js            # 云函数调用封装
│   │   ├── auth.js           # 登录状态管理
│   │   └── util.js           # 通用工具
│   ├── styles/
│   │   └── theme.wxss        # TDesign 主题变量覆盖
│   └── miniprogram_npm/
│       └── tdesign-miniprogram/
├── cloudfunctions/
│   ├── login/
│   ├── getDatacenters/
│   ├── getDatacenterDetail/
│   ├── createDatacenter/
│   ├── updateDatacenter/
│   ├── deleteDatacenter/
│   ├── exportExcel/
│   └── uploadPhotos/
├── SPEC.md                   # 原始完整规格书
├── SPEC-MVP.md               # 本文件（MVP 开发计划）
├── GAP-ANALYSIS.md           # 差距分析
└── HANDOVER.md               # 交接文档
```

---

## 7. 设计规范（沿用 SPEC.md）

配色、字体、组件样式严格遵循 SPEC.md 第 3-5 节定义。
TDesign 主题变量覆盖以 theme.wxss 实现。
