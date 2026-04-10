# iDC Collector 视觉设计规范文档

> 版本：v1.0 | 更新日期：2026-04-07  
> 产品：东南亚算力机房采集小程序  
> 设计方向：瑞士国际主义 × 现代企业 SaaS — 专业但不冰冷

---

## 目录

1. [设计理念](#1-设计理念)
2. [配色方案](#2-配色方案)
3. [字体规范](#3-字体规范)
4. [图标规范](#4-图标规范)
5. [组件规范](#5-组件规范)
6. [布局规范](#6-布局规范)
7. [交互规范](#7-交互规范)
8. [设计参考](#8-设计参考)

---

## 1. 设计理念

### 1.1 核心设计哲学

**瑞士国际主义 × 现代企业 SaaS**

我们追求的不是"好看"，而是"好用"。设计服务于功能，而非装饰。

- **灵感来源**：Notion、Linear、Figma 等内部工具的专业感
- **设计原则**：严格网格、大字号反差、留白克制、信息密度适中
- **情感基调**：信任、专业、高效、沉稳

### 1.2 去AI味设计原则（强制执行）

| ❌ 禁止 | ✅ 必须 |
|--------|--------|
| 蓝紫渐变背景 | 纯色或极浅灰背景 |
| 三等分卡片布局 | 列表或表格为主 |
| 居中 Hero + 大 CTA 按钮 | 左对齐内容，操作 inline |
| Inter/Roboto/Arial 主字体 | DM Sans / 系统字体 |
| Emoji 作为图标 | 专业图标库 SVG |
| 圆角过大（>16px） | 适中圆角（8-12px） |
| 阴影过重 | 极浅阴影或无边框设计 |

### 1.3 差异化定位

与市面上常见的"AI生成感"设计不同，我们的设计强调：

1. **数据密度**：信息展示优先，减少装饰元素
2. **状态明确**：每个元素都有明确的功能状态
3. **层级清晰**：通过字号、字重、颜色建立视觉层级
4. **一致性**：所有页面遵循同一套视觉语言

---

## 2. 配色方案

### 2.1 主色与强调色

```css
:root {
  /* 主色 - 深海军蓝：信任、专业、沉稳 */
  --primary: #1E3A5F;
  --primary-light: #2C5282;
  --primary-lighter: #3B5998;
  --primary-dark: #152A45;
  
  /* 强调色 - 暖铜橙：行动、关注、温暖 */
  --accent: #E8843C;
  --accent-light: #F5A623;
  --accent-dark: #C76A2E;
}
```

**使用原则**：
- 主色用于导航、标题、主要按钮
- 强调色用于关键操作、高亮、状态指示
- 避免在同一界面使用超过2种主色调

### 2.2 状态色

```css
:root {
  /* 成功 - 深青绿 */
  --success: #2D9E6C;
  --success-bg: #ECFDF5;
  --success-border: #A7F3D0;
  
  /* 警告 - 琥珀 */
  --warning: #D97706;
  --warning-bg: #FFFBEB;
  --warning-border: #FCD34D;
  
  /* 危险 - 纯红 */
  --danger: #DC2626;
  --danger-bg: #FEF2F2;
  --danger-border: #FECACA;
  
  /* 信息 - 中性蓝 */
  --info: #3B82F6;
  --info-bg: #EFF6FF;
  --info-border: #BFDBFE;
}
```

**状态色使用场景**：

| 状态 | 颜色 | 使用场景 |
|------|------|----------|
| 成功 | #2D9E6C | 操作成功、已完成、通过 |
| 警告 | #D97706 | 需要注意、待完善、待审核 |
| 危险 | #DC2626 | 删除、拒绝、错误、高风险 |
| 信息 | #3B82F6 | 提示、进行中、新消息 |

### 2.3 中性色

```css
:root {
  /* 背景色 */
  --bg: #F4F6F9;           /* 页面背景 - 冷灰白 */
  --bg-elevated: #FFFFFF;   /* 卡片背景 - 纯白 */
  --bg-hover: #F9FAFB;      /* 悬停背景 */
  --bg-active: #F3F4F6;     /* 激活背景 */
  
  /* 边框色 */
  --border: #E5E7EB;        /* 常规边框 */
  --border-light: #F3F4F6;  /* 浅色边框 */
  --border-dark: #D1D5DB;   /* 深色边框 */
  
  /* 文字色 */
  --text: #111827;          /* 主文字 - 近黑 */
  --text-secondary: #6B7280; /* 次要文字 */
  --text-muted: #9CA3AF;    /* 弱化文字 */
  --text-inverse: #FFFFFF;  /* 反白文字 */
}
```

### 2.4 配色应用示例

**页面背景**：`--bg` #F4F6F9  
**卡片背景**：`--bg-elevated` #FFFFFF  
**侧边栏**：`--primary` #1E3A5F  
**主按钮**：`--primary` #1E3A5F  
**强调按钮**：`--accent` #E8843C  
**成功状态**：`--success` #2D9E6C  
**警告状态**：`--warning` #D97706  
**危险操作**：`--danger` #DC2626  

---

## 3. 字体规范

### 3.1 字体栈

```css
/* 标题/品牌字体 */
--font-heading: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 正文字体 */
--font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 数据/数字字体 */
--font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;
```

### 3.2 字号规范

| 层级 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| H1 | 28px | 700 | 1.3 | 页面大标题 |
| H2 | 22px | 700 | 1.3 | 区块标题 |
| H3 | 18px | 600 | 1.4 | 卡片标题 |
| H4 | 16px | 600 | 1.4 | 小标题 |
| Body Large | 15px | 400 | 1.6 | 重要正文 |
| Body | 14px | 400 | 1.6 | 常规正文 |
| Body Small | 13px | 400 | 1.5 | 次要文字 |
| Caption | 12px | 400 | 1.4 | 辅助说明 |
| Data Large | 24px | 600 | 1.2 | 大数据展示 |
| Data | 16px | 600 | 1.2 | 常规数据 |

### 3.3 字重规范

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**使用原则**：
- 正文：400（normal）
- 按钮/标签：500（medium）
- 小标题：600（semibold）
- 大标题：700（bold）

### 3.4 数据展示字体

数字、价格、统计数据使用等宽字体 `JetBrains Mono`：

```css
.stat-value {
  font-family: var(--font-mono);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
```

---

## 4. 图标规范

### 4.1 图标库选择

**禁止使用 Emoji 作为图标**

| 图标库 | 来源 | 使用场景 |
|--------|------|----------|
| **TDesign Icons** | 腾讯 | 小程序主要图标 |
| **Iconfont** | 阿里 | Web 管理后台图标 |
| **Heroicons** | 开源 | 备选线性图标 |

### 4.2 图标风格

- **风格**：线性图标（Outline）为主
- **线宽**：1.5px - 2px
- **圆角**：2px 端点圆角
- **尺寸**：16px（小）、20px（中）、24px（大）

### 4.3 图标使用原则

| 场景 | 尺寸 | 颜色 |
|------|------|------|
| 导航项 | 18px | 继承文字色 |
| 按钮内 | 16px | 继承按钮文字色 |
| 表单提示 | 16px | --text-muted |
| 状态指示 | 20px | 对应状态色 |
| 空状态 | 48px | --text-muted |

### 4.4 图标资源链接

**TDesign 小程序图标**：
- 文档：https://tdesign.tencent.com/miniprogram/components/icon
- 图标列表：使用 `t-icon` 组件

**Iconfont 阿里图标库**：
- 官网：https://www.iconfont.cn/
- 推荐搜索关键词："linear", "outline", "business"

**Heroicons**：
- 官网：https://heroicons.com/
- 风格：24x24 线性图标

---

## 5. 组件规范

### 5.1 按钮（Button）

#### 按钮类型

```css
/* 主要按钮 */
.btn-primary {
  background: var(--primary);
  color: #fff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

/* 强调按钮 */
.btn-accent {
  background: var(--accent);
  color: #fff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

/* 次要按钮 */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

/* 文字按钮 */
.btn-text {
  background: transparent;
  color: var(--primary);
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 500;
}
```

#### 按钮尺寸

| 尺寸 | 高度 | 内边距 | 字号 | 用途 |
|------|------|--------|------|------|
| Large | 44px | 12px 24px | 15px | 主要操作 |
| Default | 36px | 9px 18px | 13px | 常规操作 |
| Small | 28px | 6px 12px | 12px | 次要操作 |

#### 按钮状态

```css
.btn:hover { opacity: 0.9; }
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

### 5.2 表单（Form）

#### 输入框

```css
.input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

.input::placeholder {
  color: var(--text-muted);
}
```

#### 表单标签

```css
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.form-label-required::after {
  content: '*';
  color: var(--danger);
  margin-left: 2px;
}
```

#### 选择器

```css
.select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* 下拉箭头 */
  background-repeat: no-repeat;
  background-position: right 12px center;
}
```

### 5.3 卡片（Card）

```css
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
```

### 5.4 表格（Table）

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.table tr:hover td {
  background: var(--bg-hover);
}
```

### 5.5 标签（Tag）

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag-success {
  background: var(--success-bg);
  color: var(--success);
}

.tag-warning {
  background: var(--warning-bg);
  color: var(--warning);
}

.tag-danger {
  background: var(--danger-bg);
  color: var(--danger);
}

.tag-info {
  background: var(--info-bg);
  color: var(--info);
}
```

### 5.6 状态标签映射

| 业务状态 | 标签样式 | 颜色 |
|----------|----------|------|
| 已完成 | tag-success | #2D9E6C |
| 待完善 | tag-warning | #D97706 |
| 待跟进 | tag-info | #3B82F6 |
| 已放弃 | 灰色标签 | #6B7280 |
| 未考察 | tag-info | #3B82F6 |
| 已考察 | tag-success | #2D9E6C |
| 已安排 | tag-warning | #D97706 |

---

## 6. 布局规范

### 6.1 间距系统

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

### 6.2 圆角系统

```css
:root {
  --radius-sm: 6px;    /* 小元素：标签、输入框 */
  --radius-md: 8px;    /* 按钮、小卡片 */
  --radius-lg: 12px;   /* 卡片、面板 */
  --radius-xl: 16px;   /* 大卡片、模态框 */
}
```

### 6.3 阴影系统

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
}
```

### 6.4 页面布局

#### 管理后台布局

```
┌─────────────────────────────────────────────┐
│  侧边栏 (240px)  │  主内容区 (自适应)        │
│                  │  ┌─────────────────────┐  │
│  Logo            │  │ 顶部栏               │  │
│  ─────────────   │  ├─────────────────────┤  │
│  导航项          │  │                     │  │
│  导航项          │  │ 内容区域             │  │
│  导航项          │  │                     │  │
│  ─────────────   │  │                     │  │
│  用户信息        │  │                     │  │
└─────────────────────────────────────────────┘
```

#### 小程序布局

```
┌─────────────────────┐
│  状态栏              │
├─────────────────────┤
│  导航栏              │
├─────────────────────┤
│                     │
│  内容区域            │
│  (安全区内)          │
│                     │
├─────────────────────┤
│  TabBar (如有)       │
│  安全区              │
└─────────────────────┘
```

### 6.5 响应式断点

| 断点 | 宽度 | 设备类型 |
|------|------|----------|
| Mobile | < 640px | 手机 |
| Tablet | 640px - 1024px | 平板 |
| Desktop | > 1024px | 桌面 |

---

## 7. 交互规范

### 7.1 过渡动画

```css
/* 默认过渡 */
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;

/* 常用过渡 */
.element {
  transition: all var(--transition-fast);
}
```

### 7.2 悬停效果

```css
/* 按钮悬停 */
.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 卡片悬停 */
.card:hover {
  box-shadow: var(--shadow-md);
}

/* 列表项悬停 */
.list-item:hover {
  background: var(--bg-hover);
}
```

### 7.3 点击反馈

```css
/* 按钮点击 */
.btn:active {
  transform: scale(0.98);
}

/* 列表项点击 */
.list-item:active {
  background: var(--bg-active);
}
```

### 7.4 加载状态

```css
/* 骨架屏 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 7.5 表单验证

```css
/* 错误状态 */
.input-error {
  border-color: var(--danger);
  background: var(--danger-bg);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* 错误提示 */
.error-message {
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
}
```

### 7.6 手势操作（小程序）

| 手势 | 操作 | 反馈 |
|------|------|------|
| 点击 | 选择/确认 | 轻微缩放 |
| 长按 | 更多操作 | 震动 + 菜单 |
| 滑动 | 删除/归档 | 背景色变化 |
| 下拉 | 刷新 | 加载指示器 |

---

## 8. 设计参考

### 8.1 内部设计规范补充

> **必读**：[FRONTEND-DESIGN-GUIDE.md](./FRONTEND-DESIGN-GUIDE.md) — frontend-design skill 规范摘要，涵盖字体选择、动效设计、AI 味设计禁令及 AIDC 落地指南。

### 8.2 优秀设计案例

#### 国内参考

| 产品 | 链接 | 学习点 |
|------|------|--------|
| **语雀** | https://www.yuque.com | 信息层级、文档阅读体验 |
| **飞书文档** | https://www.feishu.cn | 协作工具的专业感 |
| **TDesign** | https://tdesign.tencent.com | 组件设计规范 |
| **Ant Design** | https://ant.design | 企业级设计系统 |

#### 国际参考

| 产品 | 链接 | 学习点 |
|------|------|--------|
| **Linear** | https://linear.app | 极简主义、动效设计 |
| **Notion** | https://notion.so | 内容密度、模块化 |
| **Figma** | https://figma.com | 工具感、专业界面 |
| **Vercel** | https://vercel.com | 深色主题、数据展示 |
| **Supabase** | https://supabase.com | 开发者工具设计 |
| **Tailwind UI** | https://tailwindui.com | 组件设计模式 |

### 8.2 设计资源

#### 图标资源

| 资源 | 链接 | 说明 |
|------|------|------|
| TDesign Icons | https://tdesign.tencent.com/miniprogram/components/icon | 小程序图标 |
| Iconfont | https://www.iconfont.cn | 阿里图标库 |
| Heroicons | https://heroicons.com | 开源线性图标 |
| Feather Icons | https://feathericons.com | 简洁线性图标 |

#### 字体资源

| 字体 | 链接 | 用途 |
|------|------|------|
| DM Sans | Google Fonts | 标题/正文 |
| JetBrains Mono | https://www.jetbrains.com/lp/mono | 数据展示 |
| Inter | Google Fonts | 备选字体 |

### 8.3 配色工具

| 工具 | 链接 | 用途 |
|------|------|------|
| Coolors | https://coolors.co | 配色方案生成 |
| Color Hunt | https://colorhunt.co | 配色灵感 |
| Adobe Color | https://color.adobe.com | 专业配色工具 |

---

## 附录：CSS 变量完整定义

```css
:root {
  /* 主色 */
  --primary: #1E3A5F;
  --primary-light: #2C5282;
  --primary-lighter: #3B5998;
  --primary-dark: #152A45;
  
  /* 强调色 */
  --accent: #E8843C;
  --accent-light: #F5A623;
  --accent-dark: #C76A2E;
  
  /* 状态色 */
  --success: #2D9E6C;
  --success-bg: #ECFDF5;
  --warning: #D97706;
  --warning-bg: #FFFBEB;
  --danger: #DC2626;
  --danger-bg: #FEF2F2;
  --info: #3B82F6;
  --info-bg: #EFF6FF;
  
  /* 中性色 */
  --bg: #F4F6F9;
  --bg-elevated: #FFFFFF;
  --bg-hover: #F9FAFB;
  --bg-active: #F3F4F6;
  --border: #E5E7EB;
  --border-light: #F3F4F6;
  --border-dark: #D1D5DB;
  --text: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --text-inverse: #FFFFFF;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
  
  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  
  /* 字体 */
  --font-heading: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;
  
  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

---

*文档结束*
