# 操作日志

## 1. 文档信息

- **所属系统**：AIDC Collector 管理后台
- **页面名称**：操作日志
- **路由**：`/logs`
- **相关文档**：
  - [PRODUCT-STRUCTURE.md](./PRODUCT-STRUCTURE.md) — 整体架构
  - [COMPONENT-sidebar.md](./COMPONENT-sidebar.md) — 左边栏组件
  - [COMPONENT-table.md](./COMPONENT-table.md) — 表格组件

---

## 2. 页面定位与功能概述

操作日志模块用于记录和审计系统中所有用户的写操作行为，帮助管理员追踪数据变更历史、定位问题根因、满足合规审计需求。

---

## 3. 用户角色与权限

| 角色 | 查看权限 | 导出权限 | 删除权限 |
|------|---------|---------|---------|
| admin | ✅ 全部日志 | ✅ | ✅ |
| manager | ✅ 全部日志 | ✅ | ❌ |
| viewer | ✅ 仅自己操作 | ❌ | ❌ |

> viewer 角色默认只展示自己账号的操作日志。

---

## 4. 功能清单

### P0

| 功能 | 说明 |
|------|------|
| 日志列表 | 表格展示所有操作日志 |
| 时间范围筛选 | 快捷选项：今天/近7天/近30天/自定义范围 |
| 操作人筛选 | 下拉选择操作人（admin可见全部） |
| 操作类型筛选 | 全部/新增/编辑/删除/登录/导出 |
| 操作对象筛选 | 按机房名称/客户名称搜索 |
| 查看详情 | 展开变更前后对比（编辑类操作） |

### P1

| 功能 | 说明 |
|------|------|
| 导出日志 | 导出当前筛选结果为 Excel/CSV |
| 操作类型统计 | 顶部卡片统计各操作类型的数量 |
| 高频操作者 | 展示操作次数最多的成员 TOP5 |

### P2

| 功能 | 说明 |
|------|------|
| 日志告警规则 | 设置关键词告警（如批量删除） |
| 自动报表 | 定期发送日志汇总邮件 |

---

## 5. 字段定义

### 5.1 日志列表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 日志唯一标识 |
| timestamp | datetime | 操作时间，精确到秒 |
| operator | string | 操作人姓名 + 角色标签 |
| action | enum | create / update / delete / login / logout / export / import / other |
| action_label | string | 操作类型中文标签，如「编辑机房」 |
| target_type | enum | datacenter / client / user / rack / contract / settings |
| target_id | int | 操作对象ID |
| target_name | string | 操作对象名称 |
| before_value | json | 变更前的值（JSON，仅编辑/删除） |
| after_value | json | 变更后的值（JSON，仅编辑/新增） |
| ip_address | string | 操作人 IP 地址 |
| user_agent | string | 浏览器/客户端信息 |
| status | enum | success / failed |
| error_message | string | 失败原因（仅失败时） |

### 5.2 操作类型枚举

| action | action_label |
|--------|--------------|
| create | 新建 |
| update | 编辑 |
| delete | 删除 |
| login | 登录 |
| logout | 登出 |
| export | 数据导出 |
| import | 数据导入 |
| enable | 启用 |
| disable | 禁用 |
| reset_password | 重置密码 |

---

## 6. 交互流程

### 6.1 查看详情

```
点击操作行的「查看详情」→ 展开详情面板
  → 编辑类操作：显示 before_value → after_value 对比（红色删除/绿色新增）
  → 新增类操作：仅显示 after_value
  → 删除类操作：仅显示 before_value，红色高亮
  → 再次点击收起
```

### 6.2 时间范围筛选

```
点击时间筛选器 → 展开快捷选项 + 日历选择器
  → 选择快捷选项（今天/近7天/近30天/自定义）
  → 自动刷新列表，并保留其他筛选条件
```

### 6.3 导出日志

```
点击「导出」→ 确认弹窗，显示筛选条件和预计条数
  → 确认：后台生成文件，完成后自动下载
  → 文件名格式：aidc_logs_YYYYMMDD_HHmmss.xlsx
```

---

## 7. 验收标准

1. ✅ 日志实时写入，不做批量延迟
2. ✅ 日志不可删除或修改（append-only）
3. ✅ 详情对比使用 diff 样式，变更字段一目了然
4. ✅ 敏感操作（如删除）红色高亮显示
5. ✅ 时间默认按最近操作排序
6. ✅ 导出文件包含所有日志字段
7. ✅ viewer 只能看自己的日志（后端强制过滤）
8. ✅ 分页默认50条（日志量大）
9. ✅ 系统登录/登出自动记录，无需手动触发
