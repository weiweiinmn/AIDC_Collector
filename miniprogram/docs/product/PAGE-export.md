# 数据导出

## 1. 文档信息

- **所属系统**：AIDC Collector 管理后台
- **页面名称**：数据导出
- **路由**：`/export`
- **相关文档**：
  - [PRODUCT-STRUCTURE.md](./PRODUCT-STRUCTURE.md) — 整体架构
  - [COMPONENT-sidebar.md](./COMPONENT-sidebar.md) — 左边栏组件
  - [PAGE-import.md](./PAGE-import.md) — 数据导入（参考）

---

## 2. 页面定位与功能概述

数据导出模块用于将系统中的机房、客户、设备等数据导出为 Excel/CSV 文件，满足离线分析、备份和汇报需求。支持按筛选条件导出和定时导出。

---

## 3. 用户角色与权限

| 角色 | 访问权限 | 导出权限 |
|------|---------|---------|
| admin | ✅ | ✅ |
| manager | ✅ | ✅ |
| viewer | ❌（菜单不显示） | — |

---

## 4. 功能清单

### P0

| 功能 | 说明 |
|------|------|
| 选择导出类型 | 下拉选择：机房 / 客户 / 设备 / 操作日志 |
| 筛选条件 | 自动带入当前列表页筛选条件（可选调整） |
| 字段选择 | 勾选需要导出的字段（默认全选） |
| 文件格式 | 支持 .xlsx / .csv |
| 执行导出 | 后台生成文件，完成后自动下载 |
| 导出记录 | 展示历史导出记录（含时间、类型、条数、操作人） |

### P1

| 功能 | 说明 |
|------|------|
| 定时导出 | 配置定时导出任务（每日/每周/每月） |
| 导出模板 | 保存常用筛选条件为导出模板，一键使用 |
| 下载记录 | 记录中提供历史文件下载链接（保留30天） |
| 大数据量分片 | > 10000 条自动拆分为多个文件 |

### P2

| 功能 | 说明 |
|------|------|
| 导出订阅 | 设置导出后自动发送邮件/微信通知 |
| 导出到云盘 | 直接导出到腾讯云 COS / 阿里云 OSS |
| API 导出 | 提供导出 API 接口供第三方系统调用 |

---

## 5. 交互流程

### 5.1 快速导出（当前列表）

```
在机房/客户列表页 → 点击「导出当前页/导出全部」
  → 自动带入当前筛选条件
  → 弹窗确认：显示筛选条件和预计条数
  → 选择格式（.xlsx / .csv）
  → 点击确认 → 后台生成 → 自动下载
  → Toast：「导出成功，共 X 条」
```

### 5.2 高级导出

```
进入导出页面 /export
  → 选择导出类型（机房/客户/设备/日志）
  → 配置筛选条件（时间范围、状态、城市等）
  → 勾选导出字段
  → 选择文件格式
  → 点击「开始导出」
    → 显示处理进度（0% → 100%）
    → 完成 → 自动下载 + 记录到导出历史
```

### 5.3 定时导出配置

```
点击「定时导出」→「新建任务」
  → 填写：任务名称、导出类型、筛选条件、频率（每天/每周/每月）
  → 设置通知渠道（站内/邮件）
  → 保存 → 定时任务生效
  → 定时执行后记录到导出历史
```

---

## 6. 字段定义

### 6.1 导出任务字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 任务唯一标识 |
| name | string | 任务名称 |
| export_type | enum | datacenter / client / device / logs |
| filters | json | 筛选条件 |
| fields | array | 导出字段列表 |
| format | enum | xlsx / csv |
| total_count | int | 导出条数 |
| file_url | string | 文件下载地址 |
| status | enum | pending / processing / completed / failed |
| created_at | datetime | 创建时间 |
| completed_at | datetime | 完成时间 |
| created_by | string | 创建人 |

### 6.2 定时导出任务字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 任务唯一标识 |
| name | string | 任务名称 |
| export_type | enum | 同上 |
| filters | json | 筛选条件 |
| format | enum | xlsx / csv |
| schedule | enum | daily / weekly / monthly |
| schedule_time | string | 执行时间，如 "09:00" |
| schedule_days | string | weekly 时选择工作日 |
| notification | enum | none / email / wechat |
| status | enum | enabled / disabled |
| last_run_at | datetime | 最近执行时间 |
| last_run_status | enum | success / failed |

---

## 7. 导出文件命名规范

```
格式：{类型}_{筛选摘要}_{日期时间}.{格式}
示例：
  datacenter_beijing_normal_20260408_143020.xlsx
  client_all_20260408.xlsx
  logs_30days_20260408.csv
```

---

## 8. 验收标准

1. ✅ 单次导出上限：50,000 条数据；超出时提示拆分导出
2. ✅ 导出字段必须包含 ID（唯一标识）
3. ✅ 导出过程中页面可继续操作，不阻塞
4. ✅ 导出历史保留 30 天，可重新下载
5. ✅ 所有导出记录到操作日志（action = export）
6. ✅ 文件编码统一 UTF-8 with BOM（确保 Excel 打开无乱码）
7. ✅ 超时限制：导出任务超过 5 分钟自动超时提示
8. ✅ 定时导出邮件/通知支持配置
9. ✅ 非授权用户不可访问导出功能
