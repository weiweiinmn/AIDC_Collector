# AIDC Collector 小程序端 — 产品开发文档

> 版本：v1.0 | 日期：2026-04-10
> 用途：引导 UI/UX 设计师和前后端架构师开发小程序端
> 定位：面向算力机房商务拓展团队的外勤数据采集工具（移动端）
> 关联：管理后台见 `admin/pages/spec-files/SPEC-05-ADMIN.md`

---

## 一、产品定位

### 1.1 一句话定位

**移动端外勤采集工具**：让商务拓展人员在机房现场，用手机 2 分钟完成基础信息录入，数据自动汇总到后台统一管理。

### 1.2 核心用户画像

| 维度 | 描述 |
|------|------|
| **身份** | 商务拓展人员（Collector） |
| **场景** | 机房现场出差，拿着手机一边看一边填 |
| **痛点** | 纸质表格混乱、Excel 版本不统一、团队数据碎片化 |
| **诉求** | 打开就能录、数据不丢失、提交后不操心 |
| **网络状况** | 现场信号弱，经常断网 |
| **使用时段** | 工作日白天，随时可能使用 |

### 1.3 与管理后台的关系

```
┌─────────────────────────────────────────┐
│              小程序端（本文档）              │
│   采集员在外：用手机录入、查看、导入导出        │
│   特点：快、简单、移动优先                   │
└──────────────────┬──────────────────────┘
                   │ 同一套数据库（微信云开发）
┌──────────────────▼──────────────────────┐
│             管理后台（admin/）              │
│   管理员在办公室：管理数据、做统计、开通账号    │
│   特点：全、准、功能全                      │
└─────────────────────────────────────────┘
```

### 1.4 设计哲学

**"打开就能干活" — 效率优先，装饰靠边。**

小程序端不追求数据看板或复杂分析，只做一件事：**又快又准地采集数据**。

---

## 二、设计规范

### 2.1 设计风格

**瑞士国际主义 × 现代企业 SaaS × 移动端适配**

灵感参考：Linear（桌面端）的专业感，微信原生小程序的交互直觉，移动端的数据密度控制。

**核心原则：**
- 信息密度适中，不拥挤也不空洞
- 左对齐内容，操作按钮明显但不抢眼
- 状态标签醒目，数据字段清晰
- 少用 Emoji，专业图标库代替

### 2.2 色彩系统

```css
/* ===== 品牌色 ===== */
--primary:       #1E3A5F;   /* 深海军蓝：信任、专业、沉稳（导航/标题/主要按钮）*/
--primary-light: #2C5282;
--primary-dark:  #152A45;
--accent:        #E8843C;    /* 暖铜橙：关键操作、高亮、行动 CTA */

/* ===== 状态色 ===== */
--success:       #2D9E6C;   /* 深青绿：成功、已完成 */
--success-bg:    #ECFDF5;
--warning:       #D97706;   /* 琥珀：警告、待跟进 */
--warning-bg:    #FFFBEB;
--danger:        #DC2626;   /* 纯红：错误、危险、删除 */
--danger-bg:     #FEF2F2;
--info:          #1E3A5F;   /* 同主色：信息提示 */

/* ===== 中性色 ===== */
--text-primary:   #111827;   /* 标题/正文 */
--text-secondary: #4B5563;   /* 辅助文字 */
--text-muted:     #9CA3AF;   /* 占位/禁用 */
--border:         #E5E7EB;
--bg-page:       #F9FAFB;   /* 页面背景 */
--bg-card:       #FFFFFF;   /* 卡片背景 */

/* ===== 考察状态标签 ===== */
.status-new         { color: #1E3A5F; background: #EBF4FF; }    /* 新拜访 */
.status-visited     { color: #2D9E6C; background: #ECFDF5; }    /* 已考察 */
.status-negotiating { color: #D97706; background: #FFFBEB; }    /* 谈判中 */
.status-contracted  { color: #7C3AED; background: #F5F3FF; }    /* 已签约 */
.status-rejected    { color: #9CA3AF; background: #F3F4F6; }    /* 已放弃 */
```

**暗色主题**：由管理后台 `shared.css` 的 `theme-light` 机制提供，小程序端不做独立暗色版。

### 2.3 字体系统

```css
/* 主字体：微信原生优先，保证在各机型渲染一致性 */
--font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;

/* 字号阶梯（移动端更需层次感）*/
--text-xs:   10px;   /* 标签角标 */
--text-sm:   12px;   /* 辅助说明 */
--text-base: 14px;   /* 正文（基准）*/
--text-lg:   16px;   /* 卡片标题 */
--text-xl:   18px;   /* 页面主标题 */
--text-2xl:  20px;   /* 大标题数字 */
```

### 2.4 圆角与间距

```css
--radius-sm:  4px;   /* 标签、小按钮 */
--radius-md:  8px;   /* 卡片、输入框（主力）*/
--radius-lg:  12px;  /* 模态框、大卡片 */
--radius-xl:  16px;  /* 底部弹层 */

/* 间距基准：4px */
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;
--space-4: 16px; --space-5: 20px; --space-6: 24px;
```

### 2.5 动效规范

- 页面切换：微信原生 slide-up / fade（300ms）
- 弹层：slide-up 从底部（250ms ease-out）
- 按钮反馈：scale(0.97) + 背景色加深（150ms）
- 加载态：骨架屏（skeleton）优于 loading 菊花
- **禁止**：入场动画、装饰性动效、滚动视差

### 2.6 图标规范

- 使用 TDesign 组件库内置图标（`tdesign-miniprogram/icon/icon`）
- 图标颜色跟随文字色，默认 `#4B5563`
- 常用图标映射：
  - 首页：`home`
  - 列表：`view-list`
  - 新增/添加：`add`
  - 编辑：`edit`
  - 删除：`delete`
  - 搜索：`search`
  - 设置：`setting`
  - 导出：`download`
  - 导入：`upload`
  - 筛选：`filter`
  - 照片：`image`
  - 机房：`server`
  - 区域：`location`
  - 状态：`check-circle` / `error-circle`

---

## 三、信息架构

### 3.1 页面清单

| # | 页面路径 | 功能 | 优先级 |
|---|---------|------|--------|
| 1 | `pages/login/login` | 手机号 + 密码登录 | P0 |
| 2 | `pages/index/index` | 首页（操作入口 + 统计 + 最近记录） | P0 |
| 3 | `pages/list/list` | 机房列表（搜索/筛选/排序） | P0 |
| 4 | `pages/detail/detail` | 机房详情（字段分组展示） | P0 |
| 5 | `pages/form/basic` | 采集表单（9步填写） | P0 |
| 6 | `pages/import/import` | Excel 导入（预览/确认） | P1 |
| 7 | `pages/export/export` | 数据导出（筛选导出/模板下载） | P1 |
| 8 | `pages/settings/settings` | 设置（个人信息/密码/退出） | P0 |
| 9 | `pages/settings/changePassword` | 修改密码（首次登录强制/主动） | P0 |
| 10 | `pages/settings/logs` | 操作日志（查看自己操作记录） | P2 |
| 11 | `pages/compare/compare` | 机房对比（2-4条记录横向对比） | P1 |

### 3.2 底部 Tab 导航

```
┌──────┬──────┬──────┐
│ 首页  │ 列表  │  我的  │
│ home │ list │ user │
└──────┴──────┴──────┘
```

- 首页 Tab：仪表盘入口 + 快捷操作
- 列表 Tab：全部机房列表 + 搜索筛选
- 我的 Tab：个人信息 + 设置 + 退出

### 3.3 页面跳转关系图

```
login ──(登录成功)──┐
                    │
                 index (首页)
                    │
         ┌──────────┼──────────┐
         │          │          │
      list      form        settings
         │          │          │
      detail   (提交后)       logs / changePassword
         │                     │
      compare                  │
```

---

## 四、功能规格

### 4.1 登录（pages/login）

**路由**：`/pages/login/login`

**功能**：
1. 手机号输入（11位，微信键盘，`input type="number"`）
2. 密码输入（密文显示，带眼睛图标切换明文）
3. 登录按钮（点击后显示 loading 状态，禁止重复提交）
4. 联系管理员提示（文案 + 点击拨打/复制）

**业务流程**：

```
用户输入手机号 + 密码
        ↓
   云函数 login(phone, password)
        ↓
    ┌───┴───┐
   成功     失败
    │       │
检查status  提示错误
  ┌─┴─┬───┐ │
 pending/  提示
 disabled  错误
  提示
```

**错误提示**：

| 场景 | 提示文案 |
|------|---------|
| 手机号格式错误 | 请输入正确的11位手机号 |
| 密码为空 | 请输入密码 |
| 密码错误 | 密码错误，请重新输入 |
| 账号待开通 | 账号待管理员开通，请联系管理员 |
| 账号已停用 | 账号已停用，请联系管理员 |
| 网络错误 | 网络异常，请检查网络后重试 |

**首次登录强制改密**：若 `needChangePassword === true`，登录成功后直接跳转至修改密码页，禁止跳过。

---

### 4.2 首页（pages/index）

**路由**：`/pages/index/index`
**Tab**：底部 Tab 第1项

**页面结构**：

```
┌─────────────────────────────────┐
│  [状态栏]                        │
├─────────────────────────────────┤
│  姓名    当前区域 [切换▼]          │ ← 顶部用户信息栏
├─────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐      │
│  │ 总数 │  │本月  │  │待跟进│      │ ← 统计卡片（3个数字）
│  │ 128 │  │ +12  │  │  8   │      │
│  └─────┘  └─────┘  └─────┘      │
├─────────────────────────────────┤
│  [+ 新建采集]    [📷 扫码采集]    │ ← 主操作区（两个大按钮）
├─────────────────────────────────┤
│  最近记录                    全部 │ ← 列表标题
│  ┌─────────────────────────────┐ │
│  │ Equinix SG2     [新拜访]     │ │
│  │ 新加坡 · 10MW · 可用300柜     │ │
│  │ 张三 · 2026-04-06            │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │ ....                        │ │
│  └─────────────────────────────┘ │
│                                  │
├─────────────────────────────────┤
│  [首页]      [列表]      [我的]   │ ← TabBar
└─────────────────────────────────┘
```

**数据说明**：
- 总数：当前用户有权限查看的机房总数（collector 只能看自己的 + 管理员分配的）
- 本月新增：本月新创建的机房数
- 待跟进：`status = 'new'` 且超过 3 天未更新的记录数

**操作逻辑**：
- 点击"新建采集" → 跳转 `pages/form/basic`
- 点击"扫码采集" → 调用微信 `scanCode` API，扫描后自动填充基础信息（机房名称、地址）
- 点击卡片 → 跳转 `pages/detail/detail?id=xxx`
- 点击"全部" → 跳转列表页

---

### 4.3 机房列表（pages/list）

**路由**：`/pages/list/list`
**Tab**：底部 Tab 第2项

**页面结构**：

```
┌─────────────────────────────────┐
│  [搜索框：搜索机房名称/地址/联系人] │ ← 吸顶搜索栏
├─────────────────────────────────┤
│  [全部][我的][未考察][已签约][本月]│ ← 快捷筛选 Chips（横向滚动）
├─────────────────────────────────┤
│  [区域▼] [国家▼] [状态▼] [更多▼] │ ← 筛选栏
├─────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │ Equinix SG2  [新拜访]       │ │ ← 列表项
│  │ 新加坡 · 10MW · 可用机柜300  │ │
│  │ 张三 · 更新于今天 14:30      │ │
│  └─────────────────────────────┘ │
│  ....                            │
│  ....                            │
│  ──────── 上拉加载更多 ────────   │
├─────────────────────────────────┤
│  [首页]      [列表]      [我的]   │
└─────────────────────────────────┘
```

**筛选维度**：

| 维度 | 类型 | 说明 |
|------|------|------|
| 关键词 | 文本搜索 | 匹配 name / address / contactPerson |
| 区域 | 单选 | 东南亚 / 日本 / 欧洲 / 澳洲 |
| 国家 | 单选 | 联动区域（选完区域后刷新选项） |
| 城市 | 单选 | 联动国家 |
| 考察状态 | 多选 | 新拜访 / 已考察 / 谈判中 / 已签约 / 已放弃 |
| 录入人 | 单选 | 查看团队成员列表 |
| 拜访日期 | 日期范围 | 开始 ~ 结束 |
| 电力范围 | 数值滑块 | 最小 ~ 最大 MW |

**排序**：
- 更新时间（默认，最新在前）
- 拜访日期
- 电力容量（大→小）
- 机柜数量（大→小）

**列表项显示字段**：
- 机房名称（加粗）
- 状态标签
- 城市 + 区域标签
- 电力容量 + 可用机柜数
- 录入人 + 更新时间

**长按交互**（V1.1+）：
长按列表项 → 显示操作菜单（查看 / 编辑 / 删除，仅本人或管理员）

**分页**：
- 每页 20 条
- 上拉触底加载
- 显示总数：`共 128 条记录`

---

### 4.4 机房详情（pages/detail）

**路由**：`/pages/detail/detail?id=xxx`

**页面结构**：

```
┌─────────────────────────────────┐
│  [← 返回]   Equinix SG2    [编辑]│ ← 导航栏
├─────────────────────────────────┤
│  [状态标签]  拜访日期: 2026-04-06│ ← 状态信息栏
├─────────────────────────────────┤
│  ▼ 一、基础信息                  │ ← 可折叠区块
│    名称: Equinix SG2             │
│    地址: 新加坡 xxx              │
│    所有权: 自有                  │
│    预计交付: 2026-06             │
│  ▶ 二、机柜资源（展开）           │
│  ▶ 三、电力系统                  │
│  ▶ 四、制冷系统                  │
│  ▶ 五、承重与空间                │
│  ▶ 六、网络与互联                │
│  ▶ 七、交付时间                  │
│  ▶ 八、配套服务                  │
│  ▶ 九、成本与报价                │
│  ▶ 十、补充信息（照片/备注）      │
├─────────────────────────────────┤
│  [导出本条]    [查看修改历史]     │ ← 底部操作
├─────────────────────────────────┤
│  [首页]      [列表]      [我的]   │
└─────────────────────────────────┘
```

**编辑规则**：
- 本人或管理员：显示"编辑"按钮
- 其他采集员：隐藏编辑按钮
- 删除：仅管理员可见，需二次确认

**照片展示**：
- 横向滚动，最多 6 张
- 点击全屏预览，支持左右滑动
- 照片加载失败显示占位图

**修改历史**（V1.1+）：
底部折叠区域，显示最近 10 条修改记录：
- 格式：修改人 + 时间 + 变更字段摘要
- 点击展开：显示每个字段的旧值 → 新值对比

---

### 4.5 采集表单（pages/form/basic）

**路由**：`/pages/form/basic`（新建） 或 `/pages/form/basic?id=xxx`（编辑）

**设计原则**：
- 外勤场景：必填字段优先，常用字段靠前
- 分步填写：按9大类分步，减少单屏信息量
- 智能默认：拜访日期默认今天，区域默认上一次选择
- 草稿保存：未提交时每30秒自动保存草稿到本地 Storage

**步骤结构**（共9步 + 考察信息 + 补充信息）：

| 步骤 | 分类 | 字段数 | 说明 |
|------|------|--------|------|
| 1 | 基础信息 | 5 | 名称、地址、所有权、预计交付（必填：名称） |
| 2 | 机柜资源 | 6 | 机柜总数、可用数、最大功率等 |
| 3 | 电力系统 | 12 | 市电容量、UPS配置、发电机等 |
| 4 | 制冷系统 | 10 | 主制冷方式、PUE值等 |
| 5 | 承重与空间 | 8 | 楼板承重、货梯规格等 |
| 6 | 网络与互联 | 6 | ISP数量、DDoS防护等 |
| 7 | 交付时间 | 7 | 3/6/12个月可交付数量等 |
| 8 | 配套服务 | 5 | 办公位、24x7运维等 |
| 9 | 成本与报价 | 3 | 电费计费方式、一次性费用等 |
| 10 | 考察信息 | 3 | 拜访日期（必填）、联系人、状态 |
| 11 | 补充信息 | 2 | 照片（最多6张）、备注 |

**字段组件映射**：

| 字段类型 | 组件 | 示例 |
|---------|------|------|
| 单行文本 | `t-input` | 名称、地址、城市 |
| 多行文本 | `t-textarea` | 备注 |
| 数字输入 | `t-input`（type=number） | 机柜数、MW |
| 单选 | `t-picker`（mode=selector） | 所有权、制冷方式 |
| 日期选择 | `t-date-time-picker` | 拜访日期、预计交付 |
| 是/否 | `t-switch` | 连续机柜、液冷支持 |
| 多选 | `t-checkbox` | 支持的网络类型 |
| 照片上传 | `photo-upload`（自定义组件） | 现场照片 |

**表单底部操作栏**：

```
[上一步]     [保存草稿]     [下一步/提交]
```

**提交校验**：
- 仅验证必填字段（名称 + 拜访日期）
- 非必填字段为空时给出黄色警告但不阻止提交
- 提交成功后显示成功 Toast 并跳转列表页

**照片上传组件**（`components/photo-upload/`）：
- 使用微信 `chooseMedia` 选择图片
- 上传至微信云存储
- 支持删除已上传图片
- 最多 6 张，每张最大 5MB
- 显示上传进度

**草稿机制**（V1.1+）：
- 本地 Storage 存储草稿，key：`draft_datacenter_{id}` 或 `draft_datacenter_new`
- 打开表单时检测草稿：`有未提交的草稿，是否继续编辑？`
- 草稿有效期 7 天，过期自动清理

---

### 4.6 Excel 导入（pages/import）

**路由**：`/pages/import/import`

**使用场景**：
采集员收到机房服务商提供的 Excel 表格，希望在手机端快速导入。

**流程**：

```
Step 1: 选择文件
  └─ 微信文件选择器（支持 xlsx / xls）

Step 2: 选择模板类型
  ├─ 完整数据导入（65字段）
  └─ 基础信息导入（仅基础字段）

Step 3: 数据预览 + 确认
  ├─ 成功解析：显示解析结果数量
  ├─ 重复数据：按名称匹配，显示重复数量
  │   └─ 操作：跳过 / 覆盖 / 新建
  └─ 错误数据：显示错误行数（可展开查看详情）

Step 4: 提交导入
  └─ 云函数处理，返回导入结果
```

**冲突处理**（同名机房）：
- 跳过（默认）：保留已有记录，忽略导入的重复数据
- 覆盖：用导入数据更新已有记录
- 新建：强制创建新记录（不推荐，可能造成数据重复）

**导入记录自动标记**：
- `importedById`：导入人 openid
- `importedByName`：导入人姓名
- `importedAt`：导入时间

---

### 4.7 Excel 导出（pages/export）

**路由**：`/pages/export/export`

**导出类型**：

| 类型 | 说明 | 权限 |
|------|------|------|
| 当前筛选导出 | 按当前筛选条件导出 | 管理员 |
| 本条记录导出 | 导出单个机房数据 | 所有用户 |
| 空白模板导出 | 导出空白模板给服务商填写 | 所有用户 |

**流程**：

```
选择导出类型
        ↓
（如筛选导出）确认筛选条件
        ↓
点击导出 → 显示 loading
        ↓
云函数生成 Excel → 上传云存储
        ↓
返回文件链接 → 打开文件 / 发送给朋友 / 保存到相册
```

**空白模板**：导出文件名为 `AIDC-Collector-机房采集模板_v1.0.xlsx`，包含：
- 全部 65 个字段的列标题（中英文对照）
- 填写说明行（灰色底）
- 示例数据行（黄色底，第一行）

---

### 4.8 设置（pages/settings）

**路由**：`/pages/settings/settings`
**Tab**：底部 Tab 第3项

**页面结构**：

```
┌─────────────────────────────────┐
│  头像    姓名                    │ ← 用户头像（微信头像或首字）
│          采集员                   │
│          138****8000             │
├─────────────────────────────────┤
│  操作日志                  [>]  │
│  修改密码                  [>]  │
│  关于我们                  [>]  │
│  联系管理员                [>]  │
├─────────────────────────────────┤
│       [退出登录]                 │ ← 危险按钮
├─────────────────────────────────┤
│  [首页]      [列表]      [我的]  │
└─────────────────────────────────┘
```

**操作日志**（V1.1+，`pages/settings/logs`）：
- 显示当前用户最近 30 条操作记录
- 每条：操作类型 + 目标机房名称 + 时间
- 点击进入对应详情页

**联系管理员**：
- 显示管理员联系方式（手机号）
- 点击拨打电话

---

## 五、数据规格

### 5.1 65个业务字段（9大类）

**一、基础信息（5字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `name` | 机房名称 | string | ✅ |
| `address` | 详细地址 | string | |
| `ownership` | 所有权 | 单选 | |
| `expectedDelivery` | 预计交付时间 | string | |
| `notes` | 备注 | string | |

**二、机柜资源（6字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `totalCabinets` | 总机柜数 | number | |
| `availableCabinets` | 可用机柜数 | number | |
| `maxCabinetPower` | 最大机柜功率（kW） | number | |
| `continuousCabinets` | 是否支持连续机柜 | boolean | |
| `physicalIsolation` | 是否支持物理隔离 | boolean | |

**三、电力系统（12字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `mainsCapacity` | 市电总容量（kVA） | number | |
| `availablePower` | 可用电力（MW） | number | |
| `expandablePower` | 可扩容电力（MW） | number | |
| `transformerConfig` | 变压器配置 | 单选 | |
| `transformerCapacity` | 单台变压器容量（kVA） | number | |
| `generatorRedundancy` | 发电机冗余配置 | 单选 | |
| `upsConfig` | UPS 配置 | 单选 | |
| `upsBatteryMinutes` | UPS 电池备电时间（分钟） | number | |
| `highDensityBusway` | 是否支持高密度母线槽 | boolean | |
| `bbuSuperCapacitor` | 是否支持 BBU/超级电容 | boolean | |
| `powerSLA` | 电力 SLA | string | |

**四、制冷系统（10字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `mainCoolingType` | 主制冷方式 | 单选 | |
| `coldPlateLiquid` | 是否支持冷板液冷 | boolean | |
| `liquidCoolRetrofit` | 是否可改造液冷 | boolean | |
| `liquidCoolPeriod` | 液冷改造周期（月） | number | |
| `hasCDU` | 是否配备 CDU | boolean | |
| `chilledWaterSupplyTemp` | 冷冻水供水温度（℃） | number | |
| `chilledWaterReturnTemp` | 冷冻水回水温度（℃） | number | |
| `endAirconRedundancy` | 末端空调冗余配置 | 单选 | |
| `chillerCount` | 冷水主机数量 | number | |
| `pueDesign` | 设计 PUE 值 | number | |

**五、承重与空间（8字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `floorLoad` | 楼板承重（kg/m²） | number | |
| `raisedFloorHeight` | 架空地板高度（m） | number | |
| `freightElevatorWidth` | 货梯宽度（m） | number | |
| `freightElevatorHeight` | 货梯高度（m） | number | |
| `freightElevatorLoad` | 货梯载重（吨） | number | |
| `transportCorridorWidth` | 运输走廊宽度（m） | number | |
| `loadingDock` | 是否有装卸平台 | boolean | |

**六、网络与互联（6字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `networkRoutes` | 网络路由数 | number | |
| `ispCount` | 接入 ISP 数量 | number | |
| `darkFiber` | 是否支持暗光纤 | boolean | |
| `support800G` | 是否支持 800G 端口 | boolean | |
| `supportRoCEIB` | 是否支持 RoCE/IB | boolean | |

**七、交付时间（7字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `delivery3Months` | 3个月内可交付机柜数 | number | |
| `delivery6Months` | 6个月内可交付机柜数 | number | |
| `delivery12Months` | 12个月内可交付机柜数 | number | |
| `existingLiquidPower` | 现有液冷电力（MW） | number | |
| `existingLiquidCount` | 现有液冷机柜数 | number | |
| `powerRetrofitPeriod` | 电力改造周期（月） | number | |
| `coolingRetrofitPeriod` | 制冷改造周期（月） | number | |

**八、配套服务（5字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `officeSeats` | 配套办公位数量 | number | |
| `storageArea` | 配套仓储面积（m²） | number | |
| `ops24x7` | 是否提供 24×7 运维 | boolean | |
| `faultResponseTime` | 故障响应时间（小时） | number | |
| `liquidCoolMaintenance` | 是否提供液冷运维 | boolean | |

**九、成本与报价（3字段）**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `electricityBilling` | 电费计费方式 | 单选 | |
| `oneTimeFee` | 一次性费用（元） | number | |
| `liquidCoolServiceFee` | 液冷服务费（元/机柜/月） | number | |

**十、补充信息**

| 字段名 | 中文名 | 类型 | 必填 |
|--------|--------|------|------|
| `photos` | 现场照片（最多6张） | media[] | |
| `status` | 考察状态 | enum | ✅ |
| `visitDate` | 拜访日期 | date | ✅ |
| `contactPerson` | 联系人 | string | |
| `contactInfo` | 联系方式 | string | |

### 5.2 考察状态枚举

```javascript
status: {
  new:         { label: '新拜访',     color: '#1E3A5F', bg: '#EBF4FF' },
  visited:     { label: '已考察',     color: '#2D9E6C', bg: '#ECFDF5' },
  negotiating: { label: '谈判中',     color: '#D97706', bg: '#FFFBEB' },
  contracted:  { label: '已签约',     color: '#7C3AED', bg: '#F5F3FF' },
  rejected:    { label: '已放弃',     color: '#9CA3AF', bg: '#F3F4F6' }
}
```

### 5.3 区域枚举

```javascript
region: {
  southeast_asia: { label: '东南亚', countries: ['新加坡', '马来西亚', '泰国', '印尼', '越南', '菲律宾'] },
  japan:          { label: '日本',    countries: ['东京', '大阪', '名古屋', '福冈'] },
  europe:         { label: '欧洲',    countries: ['德国', '荷兰', '英国', '法国', '爱尔兰'] },
  australia:      { label: '澳洲',    countries: ['悉尼', '墨尔本', '珀斯'] }
}
```

---

## 六、云函数接口

### 6.1 接口列表

| 接口名 | 方法 | 说明 | 权限 |
|--------|------|------|------|
| `login` | POST | 手机号密码登录 | 无 |
| `getUserInfo` | GET | 获取当前用户信息 | 已登录 |
| `changePassword` | POST | 修改密码 | 已登录 |
| `getDatacenters` | GET | 获取机房列表（支持筛选/分页） | 已登录 |
| `getDatacenterDetail` | GET | 获取单个机房详情 | 已登录 |
| `createDatacenter` | POST | 新建机房 | 已登录 |
| `updateDatacenter` | POST | 更新机房（含字段变更记录） | 已登录 |
| `deleteDatacenter` | POST | 软删除机房 | admin |
| `searchDatacenters` | GET | 关键词全文搜索 | 已登录 |
| `exportDatacenters` | POST | 导出机房数据为 Excel | admin |
| `importDatacenters` | POST | 导入 Excel 数据 | 已登录 |
| `getUploadSign` | GET | 获取 COS/云存储上传签名 | 已登录 |
| `getOperationLogs` | GET | 获取操作日志（当前用户） | 已登录 |

### 6.2 核心接口定义

#### login

```javascript
// 入参
{ phone: string, password: string }

// 返回
{
  success: true,
  user: {
    _id: string,
    name: string,
    phone: string,
    role: 'collector' | 'admin',
    status: 'approved' | 'pending' | 'disabled',
    needChangePassword: boolean,
    region: string   // 最后选择的大区
  },
  token: string   // 临时 token（可选，本项目暂不用 JWT）
}

// 错误码
{ success: false, error: 'INVALID_PASSWORD' | 'ACCOUNT_PENDING' | 'ACCOUNT_DISABLED' | 'NOT_FOUND' }
```

#### getDatacenters

```javascript
// 入参
{
  page: number,        // 页码（从1开始）
  pageSize: number,    // 每页条数（默认20）
  region?: string,      // 筛选：区域
  country?: string,     // 筛选：国家
  city?: string,        // 筛选：城市
  status?: string[],    // 筛选：状态（数组）
  keyword?: string,     // 搜索：关键词
  sortBy?: string,      // 排序字段
  sortOrder?: 'asc'|'desc',
  createdBy?: string   // 筛选：录入人
}

// 返回
{
  success: true,
  data: [ /* datacenter[] */ ],
  total: number,
  page: number,
  pageSize: number
}
```

#### updateDatacenter（含字段变更记录）

```javascript
// 入参
{ _id: string, updates: { field: value, ... } }

// 逻辑：更新前记录所有变更字段到 editHistory 集合
// 返回
{ success: true, record: { /* updated datacenter */ } }
```

---

## 七、组件架构

### 7.1 现有组件（已实现）

| 组件 | 路径 | 说明 |
|------|------|------|
| `dc-card` | `components/dc-card/` | 机房列表卡片（名称/状态/电力/城市） |
| `photo-upload` | `components/photo-upload/` | 照片选择/上传组件 |
| `search-bar` | `components/search-bar/` | 搜索栏（含筛选入口） |
| `status-tag` | `components/status-tag/` | 状态标签（5种颜色） |
| `watermark` | `components/watermark/` | 全局水印（Canvas 绘制用户信息） |

### 7.2 待开发组件

| 组件 | 说明 | 依赖 |
|------|------|------|
| `dc-card`（完善） | 完善卡片内容：支持显示编辑/删除操作 | TDesign |
| `field-group` | 详情页字段分组折叠组件 | 内置 |
| `filter-panel` | 筛选面板（底部弹层） | TDesign popup |
| `form-step` | 分步表单进度指示器 | TDesign steps |
| `compare-table` | 机房对比表格组件 | 内置 |
| `empty-state` | 空状态占位 | TDesign empty |
| `draft-prompt` | 草稿恢复提示弹层 | TDesign dialog |
| `import-preview` | 导入预览表格组件 | 内置 |

### 7.3 自定义组件结构建议

```
components/
├── dc-card/           # 机房卡片（已有，待完善）
│   ├── dc-card.js
│   ├── dc-card.wxml
│   ├── dc-card.wxss
│   └── dc-card.json
├── photo-upload/       # 照片上传（已有，待完善）
│   ├── ...
├── status-tag/         # 状态标签（已有）
│   ├── ...
├── search-bar/         # 搜索栏（已有）
│   ├── ...
├── watermark/          # 水印（已有）
│   ├── ...
├── field-group/        # 🆕 详情页字段分组（待开发）
├── filter-panel/       # 🆕 筛选面板（待开发）
├── compare-table/      # 🆕 对比表格（待开发）
└── empty-state/        # 🆕 空状态（待开发）
```

---

## 八、安全设计

### 8.1 水印机制

所有已登录页面底部覆盖用户水印（Canvas 实现）：
- 内容：`{姓名} {手机号}`
- 样式：半透明（opacity: 0.06）、旋转 -15°、字号 14px
- 覆盖范围：除登录页外的所有页面
- 实现方式：
  1. 全局组件 `watermark`，在 `app.json` 注册
  2. 每个页面底部引入 `<watermark />`
  3. 组件读取全局状态中的用户信息
  4. Canvas 绘制并设为 `pointer-events: none`

### 8.2 禁止分享

微信小程序设置 `wx.showShareMenu({ withShareTicket: false })`，禁止转发到微信群/好友。

### 8.3 操作留痕

所有写操作（创建/更新/删除/导入）自动记录到 `editHistory` 集合。

---

## 九、性能要求

| 指标 | 目标 |
|------|------|
| 首屏加载时间 | ≤ 1.5s（3G 网络） |
| 列表页面渲染 | ≤ 500ms（20条数据） |
| 表单提交响应 | ≤ 1s（不含图片上传） |
| 图片上传 | ≤ 3s/张（普通网络） |
| 离线草稿保存 | ≤ 100ms（本地 Storage） |

**优化策略**：
- 列表页使用 `scroll-view` 替代原生 `map` 组件
- 图片压缩后再上传（最大边 2000px，质量 80%）
- 骨架屏替代 loading，减少感知等待
- 本地 Storage 缓存用户信息，避免重复请求

---

## 十、目录结构

```
miniprogram/
│
├── app.js                          # 应用入口
├── app.json                        # 全局配置（页面注册/组件注册）
├── app.wxss                        # 全局样式
│
├── pages/                          # 页面
│   ├── login/                      # 登录
│   │   ├── index.js
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── index/                      # 首页（Tab 1）
│   ├── list/                       # 机房列表（Tab 2）
│   ├── settings/                   # 设置（Tab 3）
│   │   ├── index/                  # 设置主页
│   │   ├── changePassword/         # 修改密码
│   │   └── logs/                   # 🆕 操作日志
│   ├── form/                       # 🆕 采集表单（编辑模式复用）
│   │   └── basic/                  # 9步表单
│   ├── detail/                     # 🆕 机房详情
│   ├── import/                      # 🆕 Excel 导入
│   ├── export/                      # 🆕 Excel 导出
│   └── compare/                     # 🆕 机房对比（V1.1）
│
├── components/                     # 公共组件
│   ├── dc-card/                    # 机房卡片
│   ├── photo-upload/               # 照片上传
│   ├── search-bar/                 # 搜索栏
│   ├── status-tag/                 # 状态标签
│   ├── watermark/                  # 水印
│   ├── field-group/                # 🆕 字段分组
│   ├── filter-panel/               # 🆕 筛选面板
│   ├── compare-table/              # 🆕 对比表格
│   └── empty-state/                # 🆕 空状态
│
├── styles/                         # 🆕 全局样式
│   ├── variables.wxss              # CSS 变量定义
│   ├── reset.wxss                  # 样式重置
│   ├── common.wxss                 # 通用工具类
│   └── status.wxss                 # 状态色
│
├── utils/                          # 工具函数
│   ├── api.js                      # API 封装（云函数调用）
│   ├── auth.js                     # 认证工具（token/user 读写）
│   ├── filter.js                   # 筛选/排序工具
│   ├── formatter.js                # 数据格式化（日期/数字）
│   └── validator.js                # 字段校验规则
│
├── miniprogram_npm/                # TDesign 组件库
│   └── tdesign-miniprogram/
│
└── docs/                           # 产品文档
    ├── PRODUCT-MP.md              # 本文档（小程序端产品规格）
    ├── DESIGN-SPEC.md             # 视觉设计规范
    └── ...（见 miniprogram/docs/ 目录）
```

---

## 十一、开发优先级与里程碑

### Phase 0：基础框架（P0）— 第 1 周
- [ ] 项目脚手架：微信开发者工具导入，npm 安装 TDesign
- [ ] 全局样式：CSS 变量、颜色系统、字体规范
- [ ] Tab 导航：底部三个 Tab（首页/列表/我的）
- [ ] 登录页：手机号+密码登录 + 错误处理
- [ ] 全局水印组件
- [ ] API 封装：统一请求入口 + 错误处理
- [ ] 认证中间件：登录校验 + 用户信息全局状态

### Phase 1：核心采集流程（P0）— 第 2-3 周
- [ ] 首页：统计卡片 + 操作按钮 + 最近记录
- [ ] 机房列表：搜索 + 筛选 + 分页 + 卡片渲染
- [ ] 采集表单：9步分步表单（不含照片上传）
- [ ] 机房详情：字段分组展示 + 编辑跳转
- [ ] 照片上传组件

### Phase 2：数据管理（P1）— 第 4 周
- [ ] Excel 导入：文件选择 + 预览 + 确认
- [ ] Excel 导出：筛选导出 + 模板下载
- [ ] 修改密码页

### Phase 3：体验增强（P1）— 第 5 周
- [ ] 离线草稿保存（本地 Storage）
- [ ] 草稿恢复提示
- [ ] 操作日志页
- [ ] 数据补全提醒（首页 Badge）

### Phase 4：对比功能（P1）— 第 6 周
- [ ] 机房对比页（2-4条记录横向对比）

---

## 附录 A：与后台的功能边界

| 功能 | 小程序端 | 管理后台 |
|------|---------|---------|
| 登录 | ✅ 手机号密码 | ❌ |
| 新建机房 | ✅ | ✅ |
| 编辑机房 | ✅ | ✅ |
| 删除机房 | ❌ | ✅ 仅管理员 |
| 查看列表 | ✅ | ✅ |
| 搜索/筛选 | ✅ | ✅ 更丰富 |
| Excel 导入 | ✅ | ✅ |
| Excel 导出 | ✅ 筛选导出 | ✅ 全部导出 |
| 模板下载 | ✅ | ✅ |
| 用户管理 | ❌ | ✅ |
| 仪表盘统计 | 简化版 | 完整版 |
| 操作日志 | 仅本人 | 全部日志 |
| 批量操作 | ❌ | ✅ |

## 附录 B：字段别名映射（Excel 导入）

```javascript
const FIELD_ALIASES = {
  // 基础信息
  '机房名称': 'name', '名称': 'name', 'Name': 'name', 'data_center_name': 'name',
  '地址': 'address', '详细地址': 'address', 'Address': 'address',
  '所有权': 'ownership', '权属': 'ownership',
  
  // 电力系统
  '电力容量': 'mainsCapacity', '市电容量': 'mainsCapacity', 'Power Capacity': 'mainsCapacity',
  '可用电力': 'availablePower', '可用容量': 'availablePower',
  
  // 制冷系统
  '制冷方式': 'mainCoolingType', '主制冷': 'mainCoolingType', 'Cooling Type': 'mainCoolingType',
  'PUE': 'pueDesign', 'PUE值': 'pueDesign',
  
  // 机柜资源
  '总机柜数': 'totalCabinets', '机柜总数': 'totalCabinets', 'Total Cabinets': 'totalCabinets',
  '可用机柜': 'availableCabinets', 'Available Cabinets': 'availableCabinets',
  
  // 交付时间
  '3个月交付': 'delivery3Months', '3-month Delivery': 'delivery3Months',
  '6个月交付': 'delivery6Months',
};
```

## 附录 C：参考文档

| 文档 | 位置 | 说明 |
|------|------|------|
| 小程序视觉规范 | `miniprogram/docs/design/DESIGN-SPEC.md` | 完整色彩/字体/图标规范 |
| 数据库设计 | `admin/pages/spec-files/SPEC-07-DATABASE.md` | 所有集合完整字段定义 |
| 云函数设计 | `admin/pages/spec-files/SPEC-08-FUNCTIONS.md` | API 接口详细定义 |
| PM 补充功能 | `admin/pages/spec-files/SPEC-10-PM.md` | 对比/草稿/日志等规划 |
| 开发里程碑 | `admin/pages/spec-files/SPEC-11-MILESTONES.md` | 完整排期规划 |
