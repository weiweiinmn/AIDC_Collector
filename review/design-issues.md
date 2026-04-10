# AIDC Collector 视觉问题清单

> 复查日期：2026-04-08  
> 问题总数：15项（高优先级6项，中优先级5项，低优先级4项）

---

## 高优先级问题（必须修复）

### H1. 字体栈未使用DM Sans
**影响页面**：全部三个页面（dashboard-v2.html、datacenter-detail-v2.html、login.html）

**问题描述**：
- 当前使用系统默认字体或Inter
- 未引入设计规范要求的DM Sans字体

**当前代码**：
```css
/* dashboard-v2 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* datacenter-detail-v2 */
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* login */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**规范要求**：
```css
--font-heading: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

**修复建议**：
1. 在head中引入Google Fonts：`<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">`
2. 统一CSS变量定义

---

### H2. 侧边栏样式不统一
**影响页面**：dashboard-v2.html vs datacenter-detail-v2.html

**问题描述**：
- dashboard-v2：深色侧边栏（background: var(--primary) #1E3A5F）
- datacenter-detail-v2：白色侧边栏（background: #FFFFFF）

**截图对比**：
| 页面 | 侧边栏背景 | 文字颜色 |
|------|-----------|----------|
| dashboard-v2 | #1E3A5F（深色） | 白色 |
| datacenter-detail-v2 | #FFFFFF（白色） | 深色 |

**修复建议**：
统一使用深色侧边栏，更符合专业SaaS产品风格：
```css
.sidebar {
  background-color: var(--primary); /* #1E3A5F */
  color: var(--text-inverse); /* #FFFFFF */
}
```

---

### H3. 状态色值与规范不符
**影响页面**：全部三个页面

**问题描述**：

| 状态 | 当前值 | 规范值 | 偏差 |
|------|--------|--------|------|
| 成功 | `#10B981` | `#2D9E6C` | 过亮 |
| 警告 | `#F59E0B` | `#D97706` | 过亮 |
| 危险 | `#EF4444` | `#DC2626` | 略有偏差 |
| 信息 | `#3B82F6` | `#3B82F6` | ✅ 正确 |

**修复建议**：
统一替换为规范定义的状态色：
```css
:root {
  --success: #2D9E6C;
  --success-bg: #ECFDF5;
  --warning: #D97706;
  --warning-bg: #FFFBEB;
  --danger: #DC2626;
  --danger-bg: #FEF2F2;
  --info: #3B82F6;
  --info-bg: #EFF6FF;
}
```

---

### H4. 机房详情页状态标签颜色错误
**影响页面**：datacenter-detail-v2.html

**问题描述**：
`.status-tag.negotiating` 使用了紫色 `#7C3AED`，与规范不符。

**当前代码**：
```css
.status-tag.negotiating { 
  background: #F3E8FF; 
  color: #7C3AED; /* 错误：使用了紫色 */
}
```

**规范要求**：
洽谈中状态应使用警告色（琥珀色）：
```css
.status-tag.negotiating { 
  background: var(--warning-bg); /* #FFFBEB */
  color: var(--warning); /* #D97706 */
}
```

---

### H5. 统计数值未使用等宽字体
**影响页面**：dashboard-v2.html

**问题描述**：
统计卡片中的数值使用普通字体，未使用规范要求的JetBrains Mono等宽字体。

**当前代码**：
```css
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}
```

**规范要求**：
```css
.stat-value {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-size: 24px; /* Data Large */
}
```

**修复建议**：
1. 引入JetBrains Mono字体
2. 添加`font-variant-numeric: tabular-nums`确保数字对齐

---

### H6. 登录页品牌区使用渐变背景
**影响页面**：login.html

**问题描述**：
品牌区使用了135度渐变背景，违反"去AI味"设计原则。

**当前代码**：
```css
.brand-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}
```

**规范要求**：
```css
.brand-section {
  background: var(--primary); /* 纯色 #1E3A5F */
}
```

---

## 中优先级问题（建议修复）

### M1. 登录页背景渐变装饰
**影响页面**：login.html

**问题描述**：
页面使用了`.bg-gradient-orb`渐变装饰球，虽然颜色是主色和强调色，但仍属于装饰性渐变。

**当前代码**：
```css
.bg-gradient-orb {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  filter: blur(80px);
  opacity: 0.4;
}
```

**修复建议**：
移除渐变装饰，使用纯色或极浅灰背景：
```css
/* 方案1：移除装饰 */
.bg-decoration { display: none; }

/* 方案2：改为纯色装饰 */
.bg-gradient-orb {
  background: var(--primary);
  opacity: 0.05;
}
```

---

### M2. 圆角系统不统一
**影响页面**：全部三个页面

**问题描述**：
各页面圆角值不统一，未严格遵循6-8-12-16系统。

| 元素 | dashboard-v2 | datacenter-detail-v2 | login |
|------|-------------|---------------------|-------|
| 按钮 | 8px | 8px | 10px |
| 输入框 | 8px | 6px | 10px |
| 卡片 | 12px | 12px | - |
| 小标签 | - | - | 5px |

**修复建议**：
统一使用规范圆角系统：
```css
--radius-sm: 6px;    /* 标签、输入框 */
--radius-md: 8px;    /* 按钮、小卡片 */
--radius-lg: 12px;   /* 卡片、面板 */
--radius-xl: 16px;   /* 大卡片、模态框 */
```

---

### M3. datacenter-detail-v2 Logo使用渐变
**影响页面**：datacenter-detail-v2.html

**问题描述**：
Logo图标使用了渐变背景。

**当前代码**：
```css
.logo-icon {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
}
```

**修复建议**：
```css
.logo-icon {
  background: var(--primary); /* 纯色 */
}
```

---

### M4. 阴影值与规范不完全一致
**影响页面**：全部三个页面

**问题描述**：
各页面阴影值略有差异，未完全使用规范定义的阴影系统。

**当前值**：
- dashboard-v2：`0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- datacenter-detail-v2：`0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`

**规范值**：
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
```

---

### M5. 页面标题字号不统一
**影响页面**：全部三个页面

**问题描述**：
各页面标题字号不一致。

| 页面 | 标题字号 | 规范要求 |
|------|----------|----------|
| dashboard-v2 | 20px | 22px (H2) |
| datacenter-detail-v2 | 18px | 22px (H2) |
| login | 28px | 28px (H1) ✅ |

**修复建议**：
页面标题统一使用H2规格（22px, font-weight: 700）。

---

## 低优先级问题（可选优化）

### L1. 间距系统可进一步优化
**影响页面**：全部三个页面

**问题描述**：
各页面间距值略有差异，建议统一使用规范定义的间距系统。

**规范间距**：
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
```

---

### L2. 过渡动画时间可统一
**影响页面**：全部三个页面

**问题描述**：
各页面过渡动画时间略有差异（0.15s、0.2s、0.25s混用）。

**规范定义**：
```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
```

---

### L3. 边框颜色可统一
**影响页面**：全部三个页面

**问题描述**：
边框颜色值在各页面略有差异。

**当前情况**：
- dashboard-v2：`#E5E7EB`、`#F3F4F6`
- datacenter-detail-v2：`#E5E7EB`、`#F3F4F6`
- login：`#E5E7EB`

**建议**：
统一使用规范定义的边框色：
```css
--border: #E5E7EB;
--border-light: #F3F4F6;
--border-dark: #D1D5DB;
```

---

### L4. 按钮高度可统一
**影响页面**：全部三个页面

**问题描述**：
各页面按钮高度不一致。

| 页面 | 主要按钮高度 | 规范要求 |
|------|-------------|----------|
| dashboard-v2 | 40px | 36px (Default) |
| datacenter-detail-v2 | 36px | 36px ✅ |
| login | 52px | 44px (Large) |

**说明**：
登录页按钮高度52px在登录场景下可以接受（需要更突出的CTA），但建议明确使用Large规格（44px）。

---

## 问题统计

### 按优先级统计

| 优先级 | 数量 | 占比 |
|--------|------|------|
| 高优先级 | 6项 | 40% |
| 中优先级 | 5项 | 33% |
| 低优先级 | 4项 | 27% |
| **总计** | **15项** | **100%** |

### 按页面统计

| 页面 | 问题数 |
|------|--------|
| dashboard-v2.html | 5项 |
| datacenter-detail-v2.html | 6项 |
| login.html | 6项 |
| 跨页面问题 | 3项 |

---

## 修复建议优先级

### 第一阶段（立即修复）
1. H1 - 统一字体栈，引入DM Sans
2. H2 - 统一侧边栏样式
3. H3 - 修正状态色值

### 第二阶段（本周修复）
4. H4 - 修正状态标签颜色
5. H5 - 统计数值使用等宽字体
6. H6 - 移除登录页渐变背景

### 第三阶段（后续优化）
7. M1-M5 - 中优先级问题
8. L1-L4 - 低优先级问题

---

*清单完成*
