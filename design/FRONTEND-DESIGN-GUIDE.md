# Frontend Design Skill 规范摘要

> 来源：[frontend-design skill](../frontend-design/SKILL.md)  
> 版本：v1.0 | 更新日期：2026-04-10  
> 关联主文档：[DESIGN-SPEC.md](./DESIGN-SPEC.md)

---

## 目录

1. [设计思维](#1-设计思维)
2. [前端美学准则](#2-前端美学准则)
3. [字体与配色](#3-字体与配色)
4. [动效设计](#4-动效设计)
5. [空间与布局](#5-空间与布局)
6. [禁止的 AI 味设计](#6-禁止的-ai-味设计)
7. [AIDC Collector 落地指南](#7-aidc-collector-落地指南)

---

## 1. 设计思维

### 1.1 出发顺序

每次构建前端界面之前，必须先明确：

| 维度 | 问题 | AIDC Collector 答案 |
|------|------|------|
| **Purpose** | 这个界面解决什么问题？谁在用？ | 机房数据采集管理，面向运维/商务人员，信息密集型后台 |
| **Tone** | 选一个极端风格方向 | 瑞士国际主义 × 现代企业 SaaS（专业但不冰冷） |
| **Constraints** | 技术限制 | 纯 HTML/CSS/JS，无需框架；暗色主题 |
| **Differentiation** | 让人记住的点是什么？ | 数据密度 + 绿色强调的系统感 |

### 1.2 执行原则

> **选择清晰的概念方向，精确执行。** 极简主义和极致装饰都可以，关键是有意为之，不是随波逐流。

---

## 2. 前端美学准则

### 2.1 核心关注点

- **Typography**：选择独特、有性格的字体，避免 Arial/Inter/Roboto  
- **Color & Theme**：围绕 CSS 变量体系一致执行，不要随意添加 ad-hoc 颜色  
- **Motion**：优先 CSS-only 方案，聚焦高影响力时刻（加载动画、hover 过渡）  
- **Spatial Composition**：不对称、叠加、网格打破、充足负空间或受控密度  
- **Backgrounds**：创造氛围和深度，不默认纯色

### 2.2 实现复杂度匹配美学愿景

| 设计风格 | 代码要求 |
|----------|----------|
| 极简/精致 | 克制、精确，注重间距和字体的微妙细节 |
| 最大主义/丰富 | 需要精细的动画、纹理和装饰细节 |

---

## 3. 字体与配色

### 3.1 禁止的字体

```
❌ Inter / Roboto / Arial / system-ui（无特色）
✅ Fira Sans / DM Sans / JetBrains Mono（AIDC 已在用）
```

### 3.2 配色原则

> **主导色 + 尖锐强调色 > 平均分配的调色板**

AIDC Collector 当前体系：
```css
--brand:   #0EA5E9   /* 品牌蓝 */
--accent:  #22C55E  /* 成功绿（主要行动强调）*/
--warning: #F59E0B  /* 警告橙 */
--danger:  #EF4444  /* 危险红 */
--info:    #0EA5E9  /* 信息蓝（同 brand）*/
```

---

## 4. 动效设计

### 4.1 优先级

1. **页面加载**：一个精心编排的分段揭示动画 > 零散的微交互
2. **Hover 状态**：平滑过渡（0.15s~0.2s），不要突兀跳变
3. **Scroll 触发**：数据密集页面谨慎使用，避免干扰阅读

### 4.2 AIDC Collector 动效规范

```css
--transition-fast:  0.15s ease;   /* hover、focus */
--transition-base:   0.2s ease;   /* 展开、收起 */
--transition-slow:   0.3s ease;   /* 页面切换、模态框 */

/* 页面入场动画 */
@keyframes pageIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.main-content { animation: pageIn 0.3s ease; }
```

### 4.3 禁止的动效

```
❌ 过度弹跳（bounce）效果
❌ 闪烁（flash）的加载状态
❌ 所有元素同时 animation（性能问题）
```

---

## 5. 空间与布局

### 5.1 设计原则

- **不对称** > 严格对称（可以打破三等分）
- **信息密度优先**：AIDC 是数据密集型后台，不是营销页
- **负空间受控**：不是越多越好，是恰到好处

### 5.2 网格系统

```css
/* AIDC 页面布局 */
.main-content {
  max-width: 1440px;
  padding: var(--page-padding); /* 28px */
}
```

---

## 6. 禁止的 AI 味设计

> **来自 frontend-design skill，这是强制执行规则。**

| ❌ 禁止 | ✅ 正确 |
|--------|--------|
| Inter/Roboto/Arial | Fira Sans + Fira Code（AIDC 已在用） |
| 蓝紫渐变背景 | 纯深色或极浅灰（AIDC 暗色 OK） |
| 三等分卡片布局 | 列表或表格为主（AIDC 数据表格 OK） |
| 居中 Hero + 大 CTA | 左对齐内容，inline 操作（AIDC 已有） |
| Emoji 作为图标 | 专业 SVG 图标库（AIDC 已在用） |
| 圆角过大（>16px） | 8-12px（AIDC 已控制） |
| 阴影过重 | 精确控制阴影深度（AIDC 已有） |
| 填充式渐变按钮 | 纯色 + 微妙的 glow（AIDC btn-primary OK） |

---

## 7. AIDC Collector 落地指南

### 7.1 新页面开发检查清单

在编写任何 HTML/CSS 之前，自问：

- [ ] 是否使用了 `var(--brand/accent/warning/danger/info)` 而不是硬编码颜色？
- [ ] 是否有内联 `<style>` 或 `style="..."` 属性？（应避免，统一在 shared.css）
- [ ] 新增组件是否符合现有圆角规范（`--radius-sm/md/lg`）？
- [ ] 动画时长是否在 `--transition-fast/base/slow` 范围内？
- [ ] 是否有 emoji 作为图标？（禁止）

### 7.2 图标系统使用规范

```html
<!-- 导航图标：16px，继承文字色 -->
<span class="nav-item">
  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">...</svg>
</span>

<!-- 统计卡片图标：48px 圆形背景 + 纯色 SVG -->
<div class="stat-icon brand">
  <svg>...</svg>  <!-- 内部 22px -->
</div>

<!-- 表单 section 标题图标：纯色无背景，20px -->
<div class="section-header">
  <span class="section-icon brand"><svg>...</svg></span>
  <span class="section-title">...</span>
</div>

<!-- 卡片标题图标：纯色，24px（自动匹配 .card-title .section-icon） -->
<span class="card-title">
  <span class="section-icon accent"><svg>...</svg></span>
  卡片标题
</span>
```

### 7.3 颜色语义对照表

| CSS 变量 | 颜色 | 语义 | 使用场景 |
|----------|------|------|----------|
| `--brand` | `#0EA5E9` | 品牌蓝 | 导航、标题、统计卡片 |
| `--accent` | `#22C55E` | 操作绿 | 主要按钮、添加、成功 |
| `--warning` | `#F59E0B` | 警告橙 | 待核实、进行中 |
| `--danger` | `#EF4444` | 危险红 | 删除、拒绝、错误 |
| `--info` | `#0EA5E9` | 信息蓝 | 提示、新增状态 |

### 7.4 参考资源

- [线性图标库 Heroicons](https://heroicons.com/) — 24×24，stroke-based
- [线性图标库 Feather](https://feathericons.com/) — 24×24，极简风格
- [AIDC DESIGN-SPEC.md](./DESIGN-SPEC.md) — 完整设计令牌定义

---

*本文件由 frontend-design skill 规范摘要生成，每位参与 AIDC Collector 前端开发的成员应熟读此文档。*
