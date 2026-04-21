# AIDC Collector — 完整功能规格书

> 版本：v3.0（2026-04-06）
> 基于：SPEC-MVP.md v1.0 + SPEC.md v2.0 升级
> 技术决策：微信小程序原生 + TDesign + 微信云开发
> 管理后台：云后台/CMS
> 状态：**待开发**

---

## 1. 产品概述

### 1.1 产品信息

| 项目 | 内容 |
|------|------|
| **产品名称** | AIDC Collector（AI算力机房采集助手） |
| **产品定位** | 算力机房商务拓展团队的外勤数据采集与管理工具 |
| **目标用户** | 算力机房商务拓展团队（5-20人规模） |
| **核心价值** | 替代纸质表格和零散 Excel，让外勤人员用手机快速采集机房信息，汇总到后台统一管理、对比、导出 |

### 1.2 核心价值主张

1. **现场快录**：手机端 2 分钟内完成基础信息录入
2. **数据统一**：全团队数据集中管理，告别碎片化 Excel
3. **可追溯**：全页水印 + 操作留痕，防止数据外泄
4. **区域覆盖**：东南亚 + 日本 + 欧洲 + 澳洲，全球机房一盘棋

### 1.3 与 MVP 版本的核心差异

| 变更项 | MVP 版本 | 本版本 |
|--------|---------|--------|
| 产品名称 | iDC Collector | **AIDC Collector** |
| 登录方式 | 微信授权登录 | **手机号 + 密码** |
| 采集区域 | 东南亚各国 | **东南亚 + 日本 + 欧洲 + 澳洲** |
| 数据安全 | 禁止分享 + 权限控制 | **全页水印 + 禁止分享 + 权限控制** |
| 后台布局 | 仪表盘为主 | **机房列表为主，看板缩小** |
| 后台导入 | 无 | **Excel 导入 + 选择归属人** |
| 密码管理 | 无 | **管理员重置密码** |

---

## 2. 用户体系

### 2.1 登录方式改造

**旧方案**：微信授权登录（自动获取 openid）
**新方案**：手机号 + 密码登录（无需手机验证码）

#### 登录流程

```
用户输入手机号 + 密码
    ↓
云函数 login 验证
    ↓
验证成功 → 检查 status
    ├── status = 'approved' → 进入首页
    ├── status = 'pending'  → 提示"账号待管理员开通"
    ├── status = 'disabled' → 提示"账号已停用，请联系管理员"
    └── 用户不存在 → 提示"未注册，请联系管理员开通"
```

#### 设计理由
- 团队人数少（5-20人），不需要复杂的验证码流程
- 忘记密码直接联系管理员重置，简单高效
- 管理员开通制确保只有授权人员才能使用

### 2.2 用户角色

| 角色 | 标识 | 说明 | 权限范围 |
|------|------|------|----------|
| **管理员** | `admin` | 团队负责人 | 全部功能 + 后台管理 + 用户管理 |
| **采集员** | `collector` | 一线商务拓展人员 | 前台采集/查看/编辑/导入导出 |

### 2.3 用户开通与权限控制

**管理员开通制**（保留 MVP 方案）：
1. 管理员在云后台/CMS 手动创建用户记录
2. 创建时设置：手机号、初始密码、姓名、角色
3. 用户首次使用默认密码登录后，引导修改密码
4. 未开通用户无法使用小程序任何业务功能

**权限控制规则**：
1. `status = pending` → 显示"等待开通"提示页
2. `status = disabled` → 显示"已停用"提示页
3. `status = approved` → 正常使用
4. 禁止转发/分享小程序页面（`onShareAppMessage` 返回空）
5. 无账号用户看不到任何机房信息

### 2.4 密码管理

| 操作 | 触发者 | 说明 |
|------|--------|------|
| **首次登录改密** | 用户 | 首次登录强制修改初始密码 |
| **修改密码** | 用户 | 设置页 → 修改密码（需验证旧密码） |
| **重置密码** | 管理员 | 云后台 → 用户管理 → 重置密码（重置为默认密码或自定义） |

### 2.5 用户状态枚举

| 状态 | 标识 | 说明 |
|------|------|------|
| 待开通 | `pending` | 已创建，等待管理员审核 |
| 已开通 | `approved` | 正常使用 |
| 已停用 | `disabled` | 被管理员停用 |
| 已拒绝 | `rejected` | 管理员拒绝开通 |

---

## 3. 采集区域

### 3.1 区域规划

采集区域从"东南亚"扩展为"亚太 + 欧洲 + 澳洲"，覆盖全球主要算力市场。

| 大区 | 子区域/国家 | 状态 |
|------|------------|------|
| **东南亚** | 新加坡、马来西亚（吉隆坡）、泰国（曼谷）、印尼（雅加达）、越南（胡志明/河内）、菲律宾（马尼拉）、缅甸（仰光） | ✅ 已有 |
| **日本** | 东京、大阪 | 🆕 新增 |
| **欧洲** | 欧洲（暂不细分国家） | 🆕 新增 |
| **澳洲** | 澳洲（暂不细分国家） | 🆕 新增 |

### 3.2 区域数据结构

机房记录新增 `region` 字段，标识所属大区：

```json
{
  "region": "southeast_asia",  // 大区标识
  "country": "新加坡",          // 国家（东南亚细分国家，欧洲/澳洲为"欧洲"/"澳洲"）
  "city": "新加坡"              // 城市
}
```

### 3.3 区域枚举值

```javascript
const REGIONS = {
  southeast_asia: { label: '东南亚', countries: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾', '缅甸'] },
  japan:          { label: '日本',   countries: ['日本'] },
  europe:         { label: '欧洲',   countries: ['欧洲'] },
  australia:      { label: '澳洲',   countries: ['澳洲'] }
};

const CITIES = {
  '东南亚': ['新加坡', '吉隆坡', '曼谷', '雅加达', '胡志明市', '河内', '马尼拉', '仰光'],
  '日本':   ['东京', '大阪'],
  '欧洲':   ['欧洲（不细分）'],
  '澳洲':   ['澳洲（不细分）']
};
```

### 3.4 表单联动

- 选择大区 → 联动加载对应城市列表
- 东南亚：显示各国城市
- 日本：显示东京、大阪
- 欧洲/澳洲：城市固定为"欧洲（不细分）"/"澳洲（不细分）"

---

## 4. 前台功能（小程序端）

### 4.1 登录页

**路径**：`pages/login/login`

| 元素 | 说明 |
|------|------|
| 手机号输入框 | 11位手机号 |
| 密码输入框 | 密码输入，可切换明文/密文 |
| 登录按钮 | 验证后进入首页 |
| 联系管理员 | 提示"如需开通账号请联系管理员"，显示管理员联系方式 |

**异常提示**：
- 手机号格式不正确
- 密码错误
- 账号待开通
- 账号已停用

**首次登录**：密码为初始密码时，强制跳转修改密码页

### 4.2 首页

**路径**：`pages/index/index`

**设计原则**：简洁实用，突出核心功能入口，减少装饰性元素。

| 区域 | 内容 |
|------|------|
| 顶部 | 用户姓名 + 当前采集区域 |
| 统计栏 | 3个关键数字：总机房数 / 本月新增 / 待跟进 |
| 操作入口 | 2个大按钮：新建采集 / 扫码采集 |
| 最近记录 | 最近5条采集记录（卡片列表，点击进入详情） |
| 底部Tab | 首页 / 列表 / 我的 |

**设计说明**：
- 不做复杂的数据看板（看板是后台的事）
- 首页追求"打开就能干活"的效率
- 统计栏只放3个最关键数字，一目了然

### 4.3 机房采集表单

**路径**：`pages/form/basic`

**字段分组**：9大类65个业务字段 + 考察信息 + 补充信息

#### 表单设计原则
- 外勤场景：优先展示必填字段和常用字段
- 分步填写：按9大类分步/分组，减少单页信息量
- 智能默认：拜访日期默认今天，区域默认上一次选择
- 草稿保存：未提交时自动保存草稿，避免数据丢失

#### 字段分组明细

| 步骤 | 分类 | 字段数 | 必填字段 |
|------|------|--------|----------|
| 1 | 基础信息 | 5 | 名称、地址 |
| 2 | 机柜资源 | 6 | 总机柜数 |
| 3 | 电力系统 | 12 | 市电总容量 |
| 4 | 制冷系统 | 10 | 主制冷方式 |
| 5 | 承重与空间 | 8 | 无（外勤可后续补充） |
| 6 | 网络与互联 | 6 | 无 |
| 7 | 交付时间 | 7 | 无 |
| 8 | 配套服务 | 5 | 无 |
| 9 | 成本与报价 | 3 | 无 |
| + | 考察状态 | 3 | 拜访日期 |
| + | 补充信息 | 2+ | 无 |

**表单快捷操作**：
- 上一步 / 下一步
- 保存草稿
- 提交（仅要求必填字段完整）
- 拍照上传（最多6张现场照片）

### 4.4 采集列表

**路径**：`pages/list/list`

**核心功能**：搜索 + 筛选 + 分页 + 排序

#### 列表展示

每条记录显示：
- 机房名称
- 城市 / 区域标签
- 考察状态标签（新拜访 / 已考察 / 谈判中 / 已签约 / 已放弃）
- 电力容量（MW）
- 可用机柜数
- 录入人
- 更新时间

#### 筛选功能

| 维度 | 类型 | 说明 |
|------|------|------|
| 关键词 | 文本搜索 | 搜索机房名称/地址/联系人 |
| 区域 | 多选 | 东南亚/日本/欧洲/澳洲 |
| 国家 | 多选 | 区域联动 |
| 城市 | 多选 | 国家联动 |
| 考察状态 | 多选 | 新拜访/已考察/谈判中/已签约/已放弃 |
| 录入人 | 多选 | 按采集人筛选 |
| 拜访日期 | 日期范围 | 开始~结束 |
| 电力范围 | 数值范围 | 最小~最大 MW |

#### 快速筛选 Chips

列表顶部横向滚动：
- 全部
- 我的记录
- 未考察
- 已考察
- 本月新增

#### 排序

支持按以下字段排序：
- 更新时间（默认，最新在前）
- 拜访日期
- 电力容量（大→小）
- 机柜数量（大→小）

#### 分页

- 每页 20 条
- 上拉加载更多
- 显示总数

### 4.5 记录详情

**路径**：`pages/detail/detail`

#### 信息展示

按9大类分组展示，每组可折叠/展开：
1. 基础信息
2. 机柜资源
3. 电力系统
4. 制冷系统
5. 承重与空间
6. 网络与互联
7. 交付时间
8. 配套服务
9. 成本与报价
10. 考察信息（拜访日期、联系人、状态）
11. 补充信息（照片、备注）

#### 操作按钮

| 按钮 | 权限 | 说明 |
|------|------|------|
| 编辑 | 本人或管理员 | 进入编辑模式 |
| 删除 | 管理员 | 二次确认后软删除 |
| 导出本条 | 所有用户 | 导出该机房数据为 Excel |

#### 修改历史

详情页底部折叠区域：
- 显示最近 10 条修改记录
- 每条：修改人 + 时间 + 变更字段摘要
- 点击展开查看修改前后对比

### 4.6 Excel 导入（手机端）

**路径**：`pages/import/import`

**功能说明**：采集员可在手机端导入机房服务商提供的 Excel 表格。

#### 导入流程

```
选择 Excel 文件（微信文件选择器）
    ↓
选择模板类型
    ├── 完整数据导入（65个业务字段）
    └── 基础信息导入（仅基础字段）
    ↓
预览解析结果
    ├── 成功解析 N 条
    ├── 字段映射异常 M 条
    └── 重复数据 K 条（按名称匹配）
    ↓
确认导入
    ↓
显示导入结果
    ├── 成功创建 X 条
    ├── 成功更新 Y 条
    └── 失败 Z 条（附错误原因）
```

#### 冲突处理

- 同名机房（name 相同）→ 默认为更新已有记录
- 可选择跳过 / 覆盖 / 新建

#### 导入记录

每条导入的记录自动标记：
- `importedById`：导入人 openid
- `importedByName`：导入人姓名
- `importedAt`：导入时间

### 4.7 Excel 导出

**路径**：`pages/export/export`

#### 导出类型

| 类型 | 说明 | 权限 |
|------|------|------|
| **完整数据导出** | 导出全部机房数据（65个业务字段） | 管理员 |
| **筛选数据导出** | 按当前筛选条件导出 | 管理员 |
| **空白模板导出** | 导出空白 Excel 模板（给机房服务商填写） | 所有用户 |

#### 导出流程

```
选择导出类型
    ↓
（如筛选导出）设置筛选条件
    ↓
点击导出
    ↓
云函数生成 Excel → 上传云存储
    ↓
返回文件链接 → 用户下载/转发
```

### 4.8 设置页

**路径**：`pages/settings/settings`

| 功能 | 说明 |
|------|------|
| 个人信息 | 姓名、手机号（只读）、角色 |
| 修改密码 | 旧密码 + 新密码 + 确认密码 |
| 关于 | 版本号、管理员联系方式 |
| 退出登录 | 清除本地缓存，返回登录页 |

### 4.9 水印功能（全局）

**PM补充功能** — 全页面覆盖用户水印，防止截图外泄。

#### 实现方案

- 使用 Canvas 绘制水印，转 Base64 后作为页面背景
- 水印内容：`用户姓名 手机号`
- 水印样式：半透明、平铺、旋转 -15°
- 水印颜色：`rgba(0, 0, 0, 0.06)`
- 水印字号：14px
- 水印间距：每 200px 一个

#### 覆盖范围

- 所有前台页面（登录页除外，因为未登录时没有用户信息）
- 包含列表页、详情页、表单页、设置页等

#### 实现方式

1. 全局自定义组件 `watermark`，在 `app.js` 中注册
2. 每个页面底部引入 `<watermark />` 组件
3. 组件自动从全局状态获取当前用户信息，绘制水印
4. 水印 Canvas 层设为 `pointer-events: none`，不影响页面交互

#### 注意事项

- 登录页不显示水印（无用户信息）
- 水印信息从服务端获取，不可篡改
- 截图后水印信息可追溯至具体用户

---

## 5. 后台功能（云后台/CMS）

### 5.1 后台定位

**核心理念**：后台是"数据管理中枢"，不是"数据看板"。

**布局优先级**：
1. **主要功能**：统一机房列表管理（全量数据，可编辑/删除）
2. **次要功能**：数据看板（缩小，只放关键统计数字）
3. **辅助功能**：用户管理、Excel导入、数据导出

### 5.2 机房列表管理（核心）

**PM重新设计** — 这是后台最重要的功能，取代"数据看板"的主位。

#### 列表展示

全量机房数据表格，支持：
- 分页浏览（每页 50 条）
- 列筛选（按区域/国家/城市/状态筛选）
- 关键词搜索
- 排序（按任意字段）
- 内联编辑（直接在表格中修改字段值）
- 批量操作（批量删除、批量改状态）
- 单条查看详情
- 单条删除（软删除）

#### Excel 导入（后台版）

**新增功能** — 管理员在后台批量导入 Excel。

与手机端导入的区别：
- **归属人选择**：导入时可选择该批次数据属于哪位同事采集
- **批量导入**：支持大文件（单次最多 500 条）
- **预览模式**：导入前预览前 10 条数据
- **冲突策略选择**：跳过 / 覆盖 / 新建 / 逐条确认

#### 导入流程

```
管理员点击"Excel导入"
    ↓
上传 Excel 文件
    ↓
选择归属人（从已开通用户中选择）
    ↓
选择冲突策略（跳过/覆盖/新建）
    ↓
预览前 10 条解析结果
    ↓
确认导入
    ↓
显示结果（成功/更新/失败统计）
```

### 5.3 数据看板（缩小）

**PM重新设计** — 看板不占主要面积，仅展示关键统计数字。

看板内容（精简为 4 个数字）：

| 指标 | 说明 |
|------|------|
| 总机房数 | 已录入的机房总数 |
| 本月新增 | 本月新录入的机房数 |
| 已考察 | 已完成现场考察的机房数 |
| 谈判中 | 考察状态为"谈判中"的机房数 |

**位置**：后台页面顶部，一条窄条，不占太多空间。

**不做的事**：
- ❌ 不做饼图、柱状图等复杂图表
- ❌ 不做趋势折线图
- ❌ 不做区域分布地图
- 理由：团队规模小，看一眼数字就够，不需要可视化分析

### 5.4 用户管理

| 功能 | 说明 |
|------|------|
| 查看用户列表 | 所有用户（含待开通/已停用） |
| 新增用户 | 填写手机号、姓名、角色、设置初始密码 |
| 开通账号 | 将 pending 状态改为 approved |
| 停用账号 | 将 approved 改为 disabled |
| 重置密码 | 重置为默认密码或自定义新密码 |
| 修改角色 | collector ↔ admin |
| 查看登录记录 | 最近登录时间 |

### 5.5 数据导出

| 类型 | 说明 |
|------|------|
| 全量导出 | 导出所有机房数据为 Excel |
| 筛选导出 | 按条件筛选后导出 |
| 按区域导出 | 按大区/国家导出 |
| 按采集人导出 | 导出指定同事的所有采集数据 |

---

## 6. 数据安全

### 6.1 全页水印

| 维度 | 说明 |
|------|------|
| 水印内容 | 用户姓名 + 手机号 |
| 水印样式 | 半透明、平铺、旋转 -15° |
| 覆盖范围 | 小程序所有业务页面 |
| 技术方案 | Canvas 绘制 → Base64 → 页面背景 |
| 防截屏 | 水印嵌入页面渲染，截图自动携带 |
| 可追溯 | 通过水印信息可定位到具体用户 |

### 6.2 访问控制

| 安全措施 | 说明 |
|----------|------|
| 管理员开通制 | 未开通用户无法使用，看不到任何机房数据 |
| 手机号+密码 | 替代微信登录，账号与手机号绑定 |
| 权限分层 | admin / collector，不同角色不同权限 |
| 禁止分享 | `onShareAppMessage` 返回空，禁止转发小程序 |
| 禁止截图提示 | 敏感页面弹出"禁止截图"提示（安卓可行，iOS限制） |

### 6.3 数据可追溯

| 追溯维度 | 实现方式 |
|----------|----------|
| 谁录入的 | `createdBy` + `createdByName` 字段 |
| 谁修改的 | `editHistory` 集合记录每次修改 |
| 谁导入的 | `importedById` + `importedByName` + `importedAt` |
| 何时操作 | 服务端时间戳，不可篡改 |
| 截图追溯 | 全页水印含用户身份信息 |

### 6.4 导入数据安全

- 导入时必须指定归属人，所有导入记录可追溯到具体操作者
- 导入记录独立标记（`importedById`），与手动录入区分
- 导入冲突处理有日志，可审计

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

## 8. 云函数设计

### 8.1 login — 登录

**改造重点**：从微信登录改为手机号+密码登录

- **入参**：`{ phone, password }`
- **逻辑**：
  1. 查询 users 集合，匹配 phone
  2. 用 bcrypt 验证密码
  3. 检查 status
  4. 记录登录日志
  5. 返回用户信息 + token
- **权限**：开放
- **返回**：
  - `success: true, user: { name, role, status, phone, needChangePassword }`
  - `success: false, error: "手机号或密码错误" / "账号待开通" / "账号已停用"`

### 8.2 register — 首次注册/开通

**新增** — 管理员在后台创建用户时调用

- **入参**：`{ phone, name, role, initialPassword }`
- **逻辑**：
  1. 检查手机号是否已注册
  2. bcrypt 加密密码
  3. 创建用户记录，`status: 'pending'`
- **权限**：admin only
- **返回**：`{ success: true, userId }`

### 8.3 changePassword — 修改密码

**新增** — 用户修改自己的密码

- **入参**：`{ oldPassword, newPassword }`
- **逻辑**：
  1. 验证旧密码
  2. 更新为新密码（bcrypt 加密）
  3. 设置 `needChangePassword: false`
- **权限**：已登录用户
- **返回**：`{ success: true }`

### 8.4 resetPassword — 管理员重置密码

**新增** — 管理员重置其他用户的密码

- **入参**：`{ userId, newPassword }`
- **逻辑**：
  1. 验证调用者为 admin
  2. 更新目标用户密码
  3. 设置 `needChangePassword: true`
- **权限**：admin only
- **返回**：`{ success: true }`

### 8.5 getDatacenters — 查询机房列表

- **入参**：`{ page, pageSize, filters, keyword, sortBy, sortOrder }`
- **逻辑**：分页查询，支持区域/国家/城市/状态等多维筛选
- **权限**：approved 用户
- **返回**：`{ list: [], total, page, pageSize }`

### 8.6 getDatacenterDetail — 查询机房详情

- **入参**：`{ id }`
- **逻辑**：查单条 + 最近修改历史
- **权限**：approved 用户

### 8.7 createDatacenter — 新建机房记录

- **入参**：机房基本信息（65个字段 + photos）
- **逻辑**：校验必填项（name, address）→ 写入 datacenters → 返回 id
- **权限**：collector, admin（且 status=approved）

### 8.8 updateDatacenter — 更新机房记录

- **入参**：`{ id, updates }`
- **逻辑**：查旧值 → 写入 editHistory → 更新 datacenters
- **权限**：录入人本人或 admin（且 status=approved）

### 8.9 deleteDatacenter — 删除机房记录

- **入参**：`{ id }`
- **逻辑**：软删除（标记 `_deleted: true`）
- **权限**：admin only

### 8.10 exportExcel — 导出 Excel

- **入参**：`{ type, filters, fields }`
  - `type`: "all" | "filtered" | "template" | "single"
- **逻辑**：
  - 查数据 → 用 exceljs 生成 Excel → 上传云存储 → 返回文件ID
  - template 类型：生成空白模板
  - single 类型：导出单条记录
- **权限**：admin（template 类型所有用户可用）
- **返回**：`{ fileId, fileName }`

### 8.11 importExcel — Excel 导入（手机端）

- **入参**：`{ fileId }`（云存储中的 Excel 文件 ID）
- **逻辑**：
  1. 从云存储下载 Excel
  2. 按字段映射表解析 65 个字段
  3. 逐条写入 datacenters 集合
  4. 自动填入 `importedById`、`importedByName`、`importedAt`
  5. 写入 importLogs 记录
- **冲突处理**：同名机房视为更新，其余视为新增
- **权限**：collector, admin（且 status=approved）
- **返回**：`{ created: N, updated: M, failed: K, errors: [...] }`

### 8.12 adminImportExcel — Excel 导入（后台版）🆕

**新增** — 管理员在后台导入 Excel，支持指定归属人

- **入参**：`{ fileId, assigneeId, conflictStrategy }`
  - `assigneeId`: 归属人用户 ID
  - `conflictStrategy`: "skip" | "overwrite" | "create"
- **逻辑**：
  1. 从云存储下载 Excel
  2. 解析数据
  3. 按 conflictStrategy 处理冲突
  4. 写入 datacenters，标记 importedById/importedByName/importedAt
  5. **归属人标记**：`createdBy`/`createdByName` 设为归属人信息
  6. 写入 importLogs
- **权限**：admin only
- **返回**：`{ created: N, updated: M, failed: K, errors: [...] }`

### 8.13 uploadPhotos — 上传照片

- **入参**：`{ tempFilePaths }`
- **逻辑**：批量上传到云存储 → 返回 fileID 数组
- **权限**：collector, admin（且 status=approved）

### 8.14 getUsers — 获取用户列表 🆕

**新增** — 管理员查看/管理用户

- **入参**：`{ status, role, keyword }`
- **权限**：admin only
- **返回**：用户列表（脱敏手机号）

### 8.15 updateUserStatus — 更新用户状态 🆕

**新增** — 管理员开通/停用用户

- **入参**：`{ userId, status, rejectReason? }`
- **权限**：admin only

---

## 9. 页面清单

### 9.1 前台页面（小程序端）

| # | 页面 | 路径 | 说明 |
|---|------|------|------|
| 1 | 登录页 | `pages/login/login` | 手机号+密码登录 |
| 2 | 修改密码页 | `pages/login/change-password` | 首次登录强制 / 设置页入口 |
| 3 | 首页 | `pages/index/index` | 统计栏 + 操作入口 + 最近记录 |
| 4 | 新建采集 | `pages/form/basic` | 9大类65字段表单（分步） |
| 5 | 编辑采集 | `pages/form/basic?id=xxx` | 复用新建页，预填数据 |
| 6 | 采集列表 | `pages/list/list` | 搜索+筛选+分页+排序 |
| 7 | 记录详情 | `pages/detail/detail` | 分组展示+修改历史 |
| 8 | 导入页 | `pages/import/import` | Excel导入（手机端） |
| 9 | 导出页 | `pages/export/export` | Excel导出（完整数据/筛选/模板） |
| 10 | 设置页 | `pages/settings/settings` | 个人信息+修改密码+退出 |

**全局组件**：

| 组件 | 路径 | 说明 |
|------|------|------|
| 水印 | `components/watermark/watermark` | 全页面水印覆盖 |
| 机房卡片 | `components/dc-card/dc-card` | 列表项卡片 |
| 状态标签 | `components/status-tag/status-tag` | 考察状态标签 |
| 图片上传 | `components/photo-upload/photo-upload` | 现场照片上传 |
| 搜索栏 | `components/search-bar/search-bar` | 搜索组件 |
| 筛选面板 | `components/filter-panel/filter-panel` | 多维筛选弹窗 |
| 区域选择器 | `components/region-picker/region-picker` | 大区→国家→城市联动 |

### 9.2 后台功能模块（云后台/CMS）

| # | 模块 | 说明 |
|---|------|------|
| 1 | **机房列表**（核心） | 全量数据表格，内联编辑，筛选，排序，批量操作 |
| 2 | **Excel 导入** | 上传 Excel + 选择归属人 + 预览 + 确认导入 |
| 3 | **数据看板**（精简） | 4个关键统计数字（顶部窄条） |
| 4 | **用户管理** | 开通/停用/重置密码/改角色 |
| 5 | **数据导出** | 全量/筛选/按区域/按采集人导出 |
| 6 | **导入日志** | 查看历史导入记录及详情 |

---

## 10. PM 补充功能

以下是 PM 根据产品定位和团队使用场景，自行设计补充的功能。

### 10.1 数据模板标准化 🆕

**功能**：提供标准化的 Excel 模板，确保各采集员和机房服务商填写的数据格式一致。

- **空白模板**：9大类65字段的空白 Excel，含字段说明和填写规范
- **示例模板**：预填一条示例数据的 Excel，供新采集员参考
- **下载入口**：设置页、导出页、后台均可下载

**理由**：多人在不同地区采集，数据格式不统一会导致后台管理混乱。

### 10.2 机房对比功能 🆕

**功能**：选择 2-4 个机房进行横向对比，生成对比表。

- **对比维度**：电力、制冷、机柜、价格、交付时间等关键字段
- **对比方式**：列表页勾选 → 点击"对比" → 进入对比页
- **导出对比**：对比结果可导出为 Excel

**理由**：商务拓展团队经常需要向客户/领导对比不同机房，手动对 Excel 效率低。

**优先级**：P1（重要，MVP 后迭代）

### 10.3 数据补全提醒 🆕

**功能**：自动识别信息不完整的机房记录，提醒采集员补充。

- **补全规则**：
  - 必填字段为空 → 标记为"待完善"
  - 核心字段（电力、制冷、机柜）为空 → 标记为"信息不足"
- **提醒方式**：
  - 首页显示"N 条记录待完善"提示
  - 列表页用橙色标签标记"待完善"
- **不做的事**：不做定时推送提醒（避免打扰），仅在用户打开小程序时展示

**理由**：外勤人员往往只填基础信息，详细数据需要后续补充，需要有机制推动数据完整性。

**优先级**：P1

### 10.4 操作日志审计 🆕

**功能**：记录关键操作的完整日志，管理员可查看。

- **记录内容**：
  - 登录/登出
  - 数据创建/修改/删除
  - Excel 导入/导出
  - 用户开通/停用/密码重置
- **日志存储**：loginLogs + importLogs + editHistory 集合
- **查看方式**：云后台可按时间/操作人/操作类型筛选日志

**理由**：数据安全的核心能力，出问题时可追溯。

**优先级**：P0（与 MVP 同步实现）

### 10.5 数据字段别名映射 🆕

**功能**：支持 Excel 导入时自动识别不同列名的同一字段。

**场景**：不同机房服务商提供的 Excel 列名可能不同：
- "总机柜数" / "机柜总数" / "Total Cabinets" → 映射到 `totalCabinets`
- "电力容量" / "总电力" / "Power Capacity" → 映射到 `mainsCapacity`

**实现**：在云函数中维护一份别名映射表，导入时自动匹配。

**理由**：实际业务中，不同来源的 Excel 格式千差万别，逐列手动匹配效率太低。

**优先级**：P1

### 10.6 离线草稿 🆕

**功能**：无网络时采集的数据自动保存为草稿，联网后同步。

- **实现**：
  - 表单输入时，每 30 秒自动保存到本地 Storage
  - 用户主动保存草稿
  - 联网后自动检测本地草稿，提示"有未提交的草稿，是否上传？"
- **限制**：
  - 草稿仅保存文本数据，照片需联网后上传
  - 草稿有效期 7 天，过期自动清理

**理由**：外勤人员常在信号差的机房现场工作，断网时数据丢失是痛点。

**优先级**：P1

### 10.7 批量操作（列表页）🆕

**功能**：列表页支持批量选择和批量操作。

- **批量操作类型**：
  - 批量修改考察状态
  - 批量分配归属人
  - 批量删除（管理员）
- **交互**：长按进入多选模式 → 勾选 → 底部弹出操作栏
- **权限**：管理员可批量删除；采集员可批量改自己录入的记录状态

**理由**：管理员常需要批量处理数据，逐条操作效率低。

**优先级**：P2

### 10.8 版本兼容说明

以下功能来自原始 SPEC.md v2.0，本次评估后决定处理方式：

| 原功能 | 处理方式 | 理由 |
|--------|----------|------|
| Agent 辅助信息抓取 | **暂不实现** | 技术复杂度高，需第三方 API，超出 MVP 范围 |
| 字段级权限矩阵（4级角色） | **简化为2级** | 团队仅5-20人，admin/collector 足够 |
| 客户预留/跟进 | **暂不实现** | 产品定位为"采集工具"，非 CRM |
| 预设筛选保存 | **保留** | 实用功能，开发成本低 |
| 分享链接 | **不做** | 数据安全要求禁止外发 |
| 照片标注 | **暂不实现** | 开发成本高，MVP 不需要 |

---

## 11. 开发里程碑规划

### 阶段一：基础框架 + 登录改造（Day 1-2）

- [ ] 项目改名 iDC → AIDC（全局替换）
- [ ] 手机号+密码登录云函数
- [ ] 登录页重构
- [ ] 修改密码页
- [ ] 管理员创建用户流程
- [ ] 全局水印组件开发
- [ ] TDesign npm 安装与配置

### 阶段二：核心采集功能（Day 3-5）

- [ ] 采集表单（9大类65字段，分步）
- [ ] 区域选择器（东南亚+日本+欧洲+澳洲）
- [ ] 采集列表（搜索+筛选+分页）
- [ ] 记录详情（分组展示+编辑）
- [ ] 修改历史
- [ ] CRUD 云函数全套

### 阶段三：导入导出（Day 6-7）

- [ ] Excel 导入（手机端）
- [ ] Excel 导出（完整数据+空白模板）
- [ ] 云函数：importExcel + exportExcel
- [ ] importLogs 日志记录

### 阶段四：后台配置（Day 8）

- [ ] 云开发 CMS 配置
- [ ] 机房列表管理（核心）
- [ ] 数据看板（精简，4个数字）
- [ ] 用户管理
- [ ] 后台 Excel 导入（带归属人选择）
- [ ] 导入日志查看

### 阶段五：收尾测试（Day 9-10）

- [ ] 全页面水印覆盖测试
- [ ] 权限控制测试
- [ ] 导入导出测试
- [ ] 数据安全测试
- [ ] Bug 修复

---

## 12. 技术架构

### 12.1 架构总览

| 层级 | 方案 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生 + TDesign 组件库 | PRD 推荐，60+ 组件 |
| 后端 | 微信云开发（云函数 + 云数据库 + 云存储） | 19.9元/月，首月免费 |
| 管理后台 | 云后台/CMS（免开发） | 低代码管理界面 |
| 数据库 | 云开发 NoSQL（MongoDB） | 集合 + 文档模式 |
| 认证 | 手机号 + 密码（自定义） | 替代微信登录 |
| 密码加密 | bcrypt | 云函数端加密验证 |
| Excel处理 | exceljs | 导入导出 |
| 存储 | 微信云存储 | 照片 + Excel 文件 |

### 12.2 成本

- 云开发基础套餐：19.9元/月（首月免费）
- 个人主体小程序：免费
- **总计：19.9元/月**

### 12.3 项目结构

```
idc-collector/
├── miniprogram/
│   ├── app.js                          # 全局逻辑
│   ├── app.json                        # 页面配置
│   ├── app.wxss                        # 全局样式
│   ├── project.config.json
│   ├── sitemap.json
│   ├── pages/
│   │   ├── login/                      # 登录页
│   │   ├── index/                      # 首页
│   │   ├── form/                       # 采集表单
│   │   ├── list/                       # 采集列表
│   │   ├── detail/                     # 记录详情
│   │   ├── import/                     # Excel导入
│   │   ├── export/                     # Excel导出
│   │   └── settings/                   # 设置页
│   ├── components/
│   │   ├── watermark/                  # 水印组件 🆕
│   │   ├── dc-card/                    # 机房卡片
│   │   ├── status-tag/                 # 状态标签
│   │   ├── photo-upload/               # 图片上传
│   │   ├── search-bar/                 # 搜索栏
│   │   ├── filter-panel/               # 筛选面板
│   │   └── region-picker/              # 区域选择器 🆕
│   ├── utils/
│   │   ├── api.js                      # 云函数调用封装
│   │   ├── auth.js                     # 登录状态管理（改造）
│   │   ├── watermark.js                # 水印绘制工具 🆕
│   │   └── util.js                     # 通用工具
│   ├── styles/
│   │   └── theme.wxss                  # TDesign 主题变量
│   └── miniprogram_npm/
│       └── tdesign-miniprogram/
├── cloudfunctions/
│   ├── login/                          # 登录（改造）
│   ├── register/                       # 注册 🆕
│   ├── changePassword/                 # 修改密码 🆕
│   ├── resetPassword/                  # 重置密码 🆕
│   ├── getDatacenters/                 # 查询列表
│   ├── getDatacenterDetail/            # 查询详情
│   ├── createDatacenter/               # 新建
│   ├── updateDatacenter/               # 更新
│   ├── deleteDatacenter/               # 删除
│   ├── exportExcel/                    # 导出Excel
│   ├── importExcel/                    # 导入Excel（手机端）
│   ├── adminImportExcel/               # 导入Excel（后台版）🆕
│   ├── uploadPhotos/                   # 上传照片
│   ├── getUsers/                       # 获取用户列表 🆕
│   └── updateUserStatus/               # 更新用户状态 🆕
├── SPEC.md                             # 原始规格书
├── SPEC-MVP.md                         # MVP开发计划
├── SPEC-FULL.md                        # 本文件（完整功能规格书）
├── GAP-ANALYSIS.md                     # 差距分析
└── HANDOVER.md                         # 交接文档
```

---

## 13. 设计规范

配色、字体、组件样式沿用 SPEC.md 定义：

- **主色**：#1E3A5F（深海军蓝）
- **强调色**：#E8843C（暖铜橙）
- **风格**：瑞士国际主义 × 现代企业 SaaS
- **字体**：DM Sans + PingFang SC
- **组件**：TDesign 微信小程序组件库

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

## 附录 B：变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-04-06 | MVP 开发计划（SPEC-MVP.md） |
| v2.0 | 2026-04-06 | 完整规格书（SPEC.md），增加采集人追踪、字段权限、考察状态、客户预留、组合筛选 |
| v3.0 | 2026-04-06 | 本版本。产品改名 AIDC、手机号+密码登录、采集区域扩展、全页水印、后台重构、Excel导入归属人、PM补充功能 |
