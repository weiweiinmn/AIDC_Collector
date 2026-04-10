# 附录 A：字段中英文映射表（65个业务字段）

> 来源：SPEC-FULL.md | 编号：附录 A：字段中英文映射表（65个业务字段）
> 完整规格书请参考：[SPEC-FULL.md](./SPEC-FULL.md)

---

## 附录 A：字段中英文映射表（65个业务字段）

| # | 英文 key | 中文列名 | 分类 | 单位 |
|---|----------|---------|------|------|
| 1 | name | 数据中心名称 | 基础信息 | |
| 2 | address | 地址（国家/城市/园区） | 基础信息 | |
| 3 | ownership | 产权归属 | 基础信息 | 自有/租赁 |
| 4 | expectedDelivery | 预计交付运营时间 | 基础信息 | 年月 |
| 5 | totalCabinets | 总机柜数量 | 机柜资源 | 个 |
| 6 | availableCabinets | 当前可提供机柜数量 | 机柜资源 | 个 |
| 7 | maxCabinetPower | 机柜最高可支撑功率 | 机柜资源 | kW/柜 |
| 8 | continuousCabinets | 能否连续布置机柜 | 机柜资源 | |
| 9 | physicalIsolation | 是否支持物理隔离 | 机柜资源 | |
| 10 | mainsCapacity | 市电总容量 | 电力系统 | kVA |
| 11 | availablePower | 当前可用电力 | 电力系统 | MW |
| 12 | expandablePower | 可扩容电力上限 | 电力系统 | MW |
| 13 | transformerConfig | 变压器配置 | 电力系统 | 2N/N+1/N |
| 14 | transformerCapacity | 单台变压器容量 | 电力系统 | kVA |
| 15 | generatorRedundancy | 柴发冗余等级 | 电力系统 | N+X |
| 16 | generatorFuelHours | 柴发储油时长 | 电力系统 | 小时 |
| 17 | upsConfig | UPS配置 | 电力系统 | 2N/分布式/后备 |
| 18 | upsBatteryMinutes | UPS电池后备时间 | 电力系统 | 分钟 |
| 19 | highDensityBusway | 是否配备高密度母线 | 电力系统 | |
| 20 | bbuSuperCapacitor | 是否配备BBU/超级电容 | 电力系统 | |
| 21 | powerSLA | 电力可用性SLA | 电力系统 | |
| 22 | mainCoolingType | 主制冷方式 | 制冷系统 | |
| 23 | coldPlateLiquid | 是否支持冷板式液冷 | 制冷系统 | |
| 24 | liquidCoolRetrofit | 如无液冷能否改造 | 制冷系统 | |
| 25 | liquidCoolPeriod | 液冷改造周期 | 制冷系统 | 月 |
| 26 | hasCDU | 是否配备CDU | 制冷系统 | |
| 27 | chilledWaterSupplyTemp | 冷冻水供水温度 | 制冷系统 | ℃ |
| 28 | chilledWaterReturnTemp | 冷冻水回水温度 | 制冷系统 | ℃ |
| 29 | endAirconRedundancy | 末端空调冗余 | 制冷系统 | N+X |
| 30 | chillerCount | 冷水机组数量 | 制冷系统 | 台 |
| 31 | pueDesign | PUE设计值 | 制冷系统 | |
| 32 | floorLoad | 地板承重 | 承重与空间 | kg/m² |
| 33 | raisedFloorHeight | 架空地板高度 | 承重与空间 | 米 |
| 34 | freightElevatorWidth | 货梯宽度 | 承重与空间 | 米 |
| 35 | freightElevatorHeight | 货梯高度 | 承重与空间 | 米 |
| 36 | freightElevatorLoad | 货梯承重 | 承重与空间 | 吨 |
| 37 | transportCorridorWidth | 主运输通道宽度 | 承重与空间 | 米 |
| 38 | loadingDock | 卸货平台 | 承重与空间 | |
| 39 | networkRoutes | 网络进线路由 | 网络与互联 | 路 |
| 40 | ispCount | 运营商数量 | 网络与互联 | 家 |
| 41 | darkFiber | 裸光纤资源 | 网络与互联 | |
| 42 | support800G | 800G网络支持 | 网络与互联 | |
| 43 | supportRoCEIB | RoCE/IB支持 | 网络与互联 | |
| 44 | delivery3Months | 3个月内可交付 | 交付时间 | MW |
| 45 | delivery6Months | 6个月可交付 | 交付时间 | MW |
| 46 | existingLiquidPower | 现有液冷机柜功率 | 交付时间 | kW/柜 |
| 47 | existingLiquidCount | 现有液冷机柜数量 | 交付时间 | 个 |
| 48 | powerRetrofitPeriod | 电力改造周期 | 交付时间 | 月 |
| 49 | coolingRetrofitPeriod | 制冷改造周期 | 交付时间 | 月 |
| 50 | officeSeats | 办公区工位数 | 配套服务 | 工位 |
| 51 | storageArea | 库房面积 | 配套服务 | ㎡ |
| 52 | ops24x7 | 7x24运维值守 | 配套服务 | |
| 53 | faultResponseTime | 故障响应时间 | 配套服务 | 小时 |
| 54 | liquidCoolMaintenance | 液冷维护能力 | 配套服务 | |
| 55 | electricityBilling | 电费计费模式 | 成本与报价 | 包干/按量 |
| 56 | oneTimeFee | 一次性接入费 | 成本与报价 | 元 |
| 57 | liquidCoolServiceFee | 液冷服务费 | 成本与报价 | 元/柜/月 |
| 58 | visitDate | 拜访日期 | 考察信息 | |
| 59 | contactPerson | 联系人 | 考察信息 | |
| 60 | contactInfo | 联系方式 | 考察信息 | |
| 61 | status | 考察状态 | 考察信息 | |
| 62 | region | 大区 | 区域 | |
| 63 | country | 国家 | 区域 | |
| 64 | city | 城市 | 区域 | |
| 65 | notes | 备注 | 补充信息 | |

---

