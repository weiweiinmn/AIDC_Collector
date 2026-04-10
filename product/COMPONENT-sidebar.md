# 左边栏组件规范

## 1. 文档信息

| 属性 | 内容 |
|------|------|
| **所属系统** | AIDC Collector 管理后台 |
| **组件名称** | Sidebar（左边栏） |
| **规范级别** | 强制 |
| **版本** | v2.0 |
| **最后更新** | 2026-04-08 |

### 相关文档

- [PRODUCT-STRUCTURE.md](./PRODUCT-STRUCTURE.md) — 整体架构
- [COMPONENT-table.md](./COMPONENT-table.md) — 表格组件
- [COMPONENT-form.md](./COMPONENT-form.md) — 表单组件
- [COMPONENT-header.md](./COMPONENT-header.md) — 顶部导航栏

---

## 2. 菜单结构详情

### 2.1 完整菜单树

```
AIDC Collector（Logo区）
│
├── 📊 仪表盘              [/dashboard]
├── 🏢 机房管理            [/machine-rooms]        ← 有子菜单
│   ├── 📋 机房列表        [/machine-rooms/list]
│   └── 📁 我的机房        [/machine-rooms/mine]
│
├── 👥 客户管理            [/customers]            ← 有子菜单
│   ├── 📋 客户列表        [/customers/list]
│   └── 👤 我的客户        [/customers/mine]
│
├── 👤 用户管理            [/users]                ⚠️ 仅 admin 可见
│
├── 📝 操作日志            [/operation-logs]
│
├── 📤 数据导入            [/data-import]
│
├── 📥 数据导出            [/data-export]
│
└── ⚙️ 系统设置            [/settings]             ← 有子菜单
    ├── 👤 个人设置        [/settings/profile]
    └── 🔒 管理员设置      [/settings/admin]       ⚠️ 仅 admin 可见
```

### 2.2 菜单项配置表

| ID | 名称 | 图标 | 路由路径 | 父级 | 权限要求 | 说明 |
|----|------|------|----------|------|----------|------|
| `dashboard` | 仪表盘 | `chart-bar` | `/dashboard` | — | 所有用户 | 首页数据展示 |
| `machine-rooms` | 机房管理 | `building` | `/machine-rooms` | — | 所有用户 | 二级菜单 |
| `machine-rooms-list` | 机房列表 | `list` | `/machine-rooms/list` | 机房管理 | 所有用户 | 全部机房 |
| `machine-rooms-mine` | 我的机房 | `folder` | `/machine-rooms/mine` | 机房管理 | 所有用户 | 个人机房 |
| `customers` | 客户管理 | `users` | `/customers` | — | 所有用户 | 二级菜单 |
| `customers-list` | 客户列表 | `list` | `/customers/list` | 客户管理 | 所有用户 | 全部客户 |
| `customers-mine` | 我的客户 | `user` | `/customers/mine` | 客户管理 | 所有用户 | 个人客户 |
| `users` | 用户管理 | `user-cog` | `/users` | — | 仅 admin | 用户CRUD |
| `operation-logs` | 操作日志 | `clipboard-list` | `/operation-logs` | — | 所有用户 | 日志审计 |
| `data-import` | 数据导入 | `upload` | `/data-import` | — | 导入权限 | 批量导入 |
| `data-export` | 数据导出 | `download` | `/data-export` | — | 导出权限 | 数据导出 |
| `settings` | 系统设置 | `cog` | `/settings` | — | 所有用户 | 二级菜单 |
| `settings-profile` | 个人设置 | `user-circle` | `/settings/profile` | 系统设置 | 所有用户 | 个人信息 |
| `settings-admin` | 管理员设置 | `shield` | `/settings/admin` | 系统设置 | 仅 admin | 系统配置 |

---

## 3. 组件结构

### 3.1 整体结构

```
┌─────────────────────────────┐
│      sidebar-header          │  ← Logo + 标题 + 折叠按钮
│─────────────────────────────│
│                             │
│        sidebar-nav           │  ← 主导航区域（可滚动）
│                             │
│  ┌───────────────────────┐  │
│  │     nav-section       │  │  ← 主导航分组
│  │  ┌─────────────────┐  │  │
│  │  │    nav-item     │  │  │  ← 一级菜单项
│  │  ├─────────────────┤  │  │
│  │  │   nav-submenu   │  │  │  ← 子菜单容器
│  │  │  ┌───────────┐  │  │  │
│  │  │  │submenu-item│  │  │  │  ← 二级菜单项
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
│                             │
│─────────────────────────────│
│      sidebar-footer          │  ← 用户信息 + 退出
└─────────────────────────────┘
```

### 3.2 HTML 结构

```html
<!-- 左边栏容器 -->
<aside class="sidebar" id="sidebar">
  
  <!-- Logo 区域 -->
  <header class="sidebar-header">
    <div class="sidebar-logo">
      <svg class="logo-icon" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="8" fill="#2563EB"/>
        <path d="M8 16L14 22L24 10" stroke="#fff" stroke-width="3" fill="none"/>
      </svg>
      <span class="logo-text">AIDC Collector</span>
    </div>
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="切换侧边栏">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
  </header>

  <!-- 导航菜单 -->
  <nav class="sidebar-nav" role="navigation" aria-label="主导航">
    
    <!-- 主导航分组 -->
    <div class="nav-section" data-section="main">
      <ul class="nav-list" role="list">
        
        <!-- 一级菜单：仪表盘 -->
        <li class="nav-item active" data-menu-id="dashboard" data-path="/dashboard">
          <a href="/dashboard" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9" rx="1" fill="currentColor"/>
              <rect x="14" y="3" width="7" height="5" rx="1" fill="currentColor"/>
              <rect x="14" y="12" width="7" height="9" rx="1" fill="currentColor"/>
              <rect x="3" y="16" width="7" height="5" rx="1" fill="currentColor"/>
            </svg>
            <span class="nav-label">仪表盘</span>
          </a>
        </li>

        <!-- 一级菜单：机房管理（有子菜单） -->
        <li class="nav-item has-submenu is-expanded" data-menu-id="machine-rooms" data-path="/machine-rooms">
          <button class="nav-link" aria-expanded="true" aria-controls="submenu-machine-rooms">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
              <rect x="7" y="7" width="4" height="4" fill="currentColor"/>
              <rect x="13" y="7" width="4" height="4" fill="currentColor"/>
              <rect x="7" y="13" width="4" height="4" fill="currentColor"/>
              <rect x="13" y="13" width="4" height="4" fill="currentColor"/>
            </svg>
            <span class="nav-label">机房管理</span>
            <svg class="submenu-arrow expanded" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
          
          <!-- 子菜单 -->
          <ul class="nav-submenu expanded" id="submenu-machine-rooms" role="list">
            <li class="nav-submenu-item" data-menu-id="machine-rooms-list" data-path="/machine-rooms/list">
              <a href="/machine-rooms/list">机房列表</a>
            </li>
            <li class="nav-submenu-item" data-menu-id="machine-rooms-mine" data-path="/machine-rooms/mine">
              <a href="/machine-rooms/mine">我的机房</a>
            </li>
          </ul>
        </li>

        <!-- 一级菜单：客户管理（有子菜单） -->
        <li class="nav-item has-submenu" data-menu-id="customers" data-path="/customers">
          <button class="nav-link" aria-expanded="false" aria-controls="submenu-customers">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M16 3l2 2 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
              <circle cx="17" cy="7" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <span class="nav-label">客户管理</span>
            <svg class="submenu-arrow" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
          
          <!-- 子菜单 -->
          <ul class="nav-submenu collapsed" id="submenu-customers" role="list">
            <li class="nav-submenu-item" data-menu-id="customers-list" data-path="/customers/list">
              <a href="/customers/list">客户列表</a>
            </li>
            <li class="nav-submenu-item" data-menu-id="customers-mine" data-path="/customers/mine">
              <a href="/customers/mine">我的客户</a>
            </li>
          </ul>
        </li>

        <!-- 一级菜单：用户管理（仅 admin 可见） -->
        <li class="nav-item" data-menu-id="users" data-path="/users" data-permission="admin">
          <a href="/users" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M4 20v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
              <circle cx="19" cy="6" r="2" fill="currentColor"/>
              <path d="M22 10l-2 2" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="nav-label">用户管理</span>
          </a>
        </li>

        <!-- 一级菜单：操作日志 -->
        <li class="nav-item" data-menu-id="operation-logs" data-path="/operation-logs">
          <a href="/operation-logs" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="nav-label">操作日志</span>
          </a>
        </li>

        <!-- 一级菜单：数据导入（需导入权限） -->
        <li class="nav-item" data-menu-id="data-import" data-path="/data-import" data-permission="import">
          <a href="/data-import" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <span class="nav-label">数据导入</span>
          </a>
        </li>

        <!-- 一级菜单：数据导出（需导出权限） -->
        <li class="nav-item" data-menu-id="data-export" data-path="/data-export" data-permission="export">
          <a href="/data-export" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <path d="M12 21V9M8 15l4-4 4 4" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <span class="nav-label">数据导出</span>
          </a>
        </li>

        <!-- 一级菜单：系统设置（有子菜单） -->
        <li class="nav-item has-submenu" data-menu-id="settings" data-path="/settings">
          <button class="nav-link" aria-expanded="false" aria-controls="submenu-settings">
            <svg class="nav-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="nav-label">系统设置</span>
            <svg class="submenu-arrow" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
          
          <!-- 子菜单 -->
          <ul class="nav-submenu collapsed" id="submenu-settings" role="list">
            <li class="nav-submenu-item" data-menu-id="settings-profile" data-path="/settings/profile">
              <a href="/settings/profile">个人设置</a>
            </li>
            <li class="nav-submenu-item" data-menu-id="settings-admin" data-path="/settings/admin" data-permission="admin">
              <a href="/settings/admin">管理员设置</a>
            </li>
          </ul>
        </li>

      </ul>
    </div>
  </nav>

  <!-- 用户信息区域 -->
  <footer class="sidebar-footer">
    <div class="user-profile">
      <div class="user-avatar-wrapper">
        <img src="/assets/avatar-default.png" alt="头像" class="user-avatar" />
        <span class="user-status online" aria-label="在线"></span>
      </div>
      <div class="user-info">
        <span class="user-name">张三</span>
        <span class="user-role" data-role="admin">管理员</span>
      </div>
    </div>
    <div class="footer-actions">
      <button class="action-btn settings-btn" aria-label="设置" title="设置">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <button class="action-btn logout-btn" aria-label="退出登录" title="退出登录">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" stroke-width="2" fill="none"/>
          <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </footer>

</aside>
```

---

## 4. 样式规范

### 4.1 尺寸规格

| 属性 | 展开状态 | 折叠状态 | 说明 |
|------|----------|----------|------|
| 宽度 | `240px` | `64px` | 可通过 CSS 变量 `--sidebar-width` 自定义 |
| 最小高度 | `100vh` | `100vh` | 固定高度，超出可滚动 |
| 内边距 | `16px` | `12px` | Logo 区域两侧 |
| 菜单项高度 | `44px` | `44px` | 一级菜单 |
| 子菜单项高度 | `40px` | `40px` | 二级菜单 |
| 菜单项内边距 | `12px 16px` | — | 折叠后隐藏文字 |
| 圆角 | `8px` | `8px` | 菜单项 hover/active 状态 |
| 子菜单箭头尺寸 | `16px` | — | 展开指示器 |
| Logo 图标尺寸 | `32px × 32px` | `32px × 32px` | 固定尺寸 |
| 用户头像尺寸 | `36px × 36px` | `32px × 32px` | 圆形裁剪 |
| 图标尺寸 | `20px × 20px` | `20px × 20px` | SVG 图标 |

### 4.2 颜色规范

#### 基础色板

```css
:root {
  /* 背景色 */
  --sidebar-bg: #FFFFFF;
  --sidebar-bg-hover: #F3F4F6;
  --sidebar-bg-active: #EFF6FF;
  
  /* 文字色 */
  --sidebar-text: #374151;        /* 默认 */
  --sidebar-text-hover: #2563EB;  /* 悬停 */
  --sidebar-text-active: #2563EB; /* 激活 */
  --sidebar-text-disabled: #9CA3AF; /* 禁用/无权限 */
  
  /* 强调色 */
  --sidebar-accent: #2563EB;      /* 主题蓝 */
  --sidebar-accent-light: #DBEAFE;/* 浅蓝背景 */
  
  /* 边框与分隔 */
  --sidebar-border: #E5E7EB;
  --sidebar-divider: #F3F4F6;
  
  /* 遮罩（移动端） */
  --sidebar-overlay: rgba(0, 0, 0, 0.5);
  
  /* 用户头像状态 */
  --status-online: #10B981;
  --status-offline: #6B7280;
}
```

#### 状态颜色对照

| 状态 | 背景色 | 文字色 | 边框/指示器 |
|------|--------|--------|------------|
| 默认 (Default) | `transparent` | `#374151` | 无 |
| 悬停 (Hover) | `#F3F4F6` | `#2563EB` | 无 |
| 激活 (Active) | `#EFF6FF` | `#2563EB` | 左边 `3px #2563EB` 实线 |
| 选中 (Selected) | `#DBEAFE` | `#1D4ED8` | 左边 `3px #1D4ED8` 实线 |
| 聚焦 (Focus) | — | — | `2px` 虚线轮廓 `#2563EB` |
| 禁用 (Disabled) | `transparent` | `#9CA3AF` | 无 |

### 4.3 字体规范

| 元素 | 字号 | 字重 | 行高 | 颜色 |
|------|------|------|------|------|
| Logo 文字 | `14px` | `600` | `1.2` | `#111827` |
| 一级菜单 | `14px` | `500` | `1.4` | `#374151` |
| 二级菜单 | `13px` | `400` | `1.4` | `#6B7280` |
| 用户名 | `14px` | `500` | `1.2` | `#111827` |
| 用户角色 | `12px` | `400` | `1.2` | `#6B7280` |

### 4.4 CSS 完整代码

```css
/* ============================================
   Sidebar 样式规范
   ============================================ */

/* 容器 */
.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background-color: var(--sidebar-bg, #FFFFFF);
  border-right: 1px solid var(--sidebar-border, #E5E7EB);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
}

/* 折叠状态 */
.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar.collapsed .logo-text,
.sidebar.collapsed .nav-label,
.sidebar.collapsed .user-info,
.sidebar.collapsed .user-name,
.sidebar.collapsed .user-role {
  display: none;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 12px;
}

.sidebar.collapsed .sidebar-logo {
  justify-content: center;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}

/* Logo 区域 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--sidebar-divider, #F3F4F6);
  min-height: 64px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 折叠按钮 */
.sidebar-toggle {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background-color: var(--sidebar-bg-hover, #F3F4F6);
  color: var(--sidebar-text-hover, #2563EB);
}

.sidebar-toggle:focus {
  outline: 2px solid var(--sidebar-accent, #2563EB);
  outline-offset: 2px;
}

/* 导航区域 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: #D1D5DB;
  border-radius: 2px;
}

/* 导航列表 */
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 一级菜单项 */
.nav-item {
  margin-bottom: 4px;
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: var(--sidebar-text, #374151);
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
  text-align: left;
}

.nav-link:hover {
  background-color: var(--sidebar-bg-hover, #F3F4F6);
  color: var(--sidebar-text-hover, #2563EB);
}

.nav-link:focus {
  outline: 2px solid var(--sidebar-accent, #2563EB);
  outline-offset: -2px;
}

/* 菜单图标 */
.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: currentColor;
}

/* 菜单文字 */
.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 子菜单箭头 */
.submenu-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #9CA3AF;
  transition: transform 0.2s ease;
}

.has-submenu.is-expanded .submenu-arrow {
  transform: rotate(180deg);
}

/* 选中状态 */
.nav-item.active > .nav-link {
  background-color: var(--sidebar-bg-active, #EFF6FF);
  color: var(--sidebar-text-active, #2563EB);
  position: relative;
}

.nav-item.active > .nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background-color: var(--sidebar-accent, #2563EB);
  border-radius: 0 2px 2px 0;
}

/* 子菜单 */
.nav-submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease-out, opacity 0.2s ease;
  opacity: 0;
}

.nav-submenu.expanded {
  max-height: 200px;
  opacity: 1;
}

.nav-submenu-item {
  height: 40px;
  padding-left: 44px;
}

.nav-submenu-item a {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #6B7280;
  font-size: 13px;
  font-weight: 400;
  transition: background-color 0.2s, color 0.2s;
}

.nav-submenu-item a:hover {
  background-color: var(--sidebar-bg-hover, #F3F4F6);
  color: var(--sidebar-text-hover, #2563EB);
}

.nav-submenu-item.active a {
  background-color: var(--sidebar-accent-light, #DBEAFE);
  color: var(--sidebar-accent, #2563EB);
  font-weight: 500;
}

/* 折叠模式 Tooltip */
.sidebar.collapsed .nav-item {
  position: relative;
}

.sidebar.collapsed .nav-link::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  background-color: #1F2937;
  color: #FFFFFF;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
  pointer-events: none;
}

.sidebar.collapsed .nav-item:hover .nav-link::after {
  opacity: 1;
  visibility: visible;
}

/* Footer 用户区域 */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--sidebar-divider, #F3F4F6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
}

.user-status.online {
  background-color: var(--status-online, #10B981);
}

.user-status.offline {
  background-color: var(--status-offline, #6B7280);
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #6B7280;
}

/* Footer 操作按钮 */
.footer-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  transition: background-color 0.2s, color 0.2s;
}

.action-btn:hover {
  background-color: var(--sidebar-bg-hover, #F3F4F6);
  color: var(--sidebar-text-hover, #2563EB);
}

.logout-btn:hover {
  color: #EF4444;
}
```

---

## 5. 交互行为

### 5.1 菜单项交互

#### 点击行为

| 菜单类型 | 点击结果 | 附加效果 |
|----------|----------|----------|
| 无子菜单 | 路由跳转至 `data-path` | 高亮当前项，清除其他选中态 |
| 有子菜单（已折叠） | 展开子菜单 | 箭头旋转 180°，保持当前页面 |
| 有子菜单（已展开） | 折叠子菜单 | 箭头恢复 0° |
| 子菜单项 | 路由跳转至 `data-path` | 高亮当前项，父级保持展开 |

#### 键盘导航

| 按键 | 行为 |
|------|------|
| `Tab` | 在菜单项间顺序切换 |
| `Shift + Tab` | 反向切换 |
| `Enter` / `Space` | 激活菜单项/展开子菜单 |
| `↑` / `↓` | 在同级菜单间移动 |
| `←` | 折叠当前子菜单（如果在子菜单内） |
| `→` | 展开当前子菜单（如果有） |
| `Escape` | 关闭所有展开的子菜单；移动端关闭抽屉 |

### 5.2 展开/折叠逻辑

#### 折叠模式（Collapse Mode）

```javascript
// 折叠模式触发方式
const SidebarCollapse = {
  triggers: [
    'click .sidebar-toggle',    // 点击折叠按钮
    'keyboard Cmd/Ctrl + B',    // 快捷键
    'resize window < 768px',    // 响应式触发（移动端）
  ],
  
  // 折叠后行为
  collapsedBehavior: {
    showIconsOnly: true,        // 仅显示图标
    hideLabels: true,           // 隐藏文字标签
    showTooltips: true,         // 悬停显示完整名称
    rememberPreference: true,    // localStorage 记住状态
  },
  
  // 状态持久化
  storage: {
    key: 'sidebar_collapsed',
    scope: 'user',              // 按用户存储
  }
}
```

#### 子菜单展开逻辑

```
用户点击「机房管理」
        │
        ▼
┌───────────────────────────┐
│ 检查 data-path 是否匹配    │
│ 当前路由？                 │
└─────────────┬─────────────┘
              │
      ┌───────┴───────┐
      │ 是            │ 否
      ▼               ▼
┌─────────────┐  ┌─────────────┐
│ 展开子菜单  │  │ 展开子菜单  │
│ + 路由跳转  │  │ + 保持当前  │
└─────────────┘  │   页面不变  │
                 └─────────────┘
```

### 5.3 选中状态样式

#### 视觉规范

```
默认状态                     选中状态
┌──────────────────┐        ┌──────────────────┐
│ ○ 仪表盘         │        │▌● 仪表盘         │ ← 左边蓝色指示条
└──────────────────┘        └──────────────────┘
                              背景: #EFF6FF
                              文字: #2563EB
```

#### CSS 类定义

```css
/* 一级菜单 - 选中态 */
.nav-item.active > .nav-link {
  background-color: var(--sidebar-bg-active);
  color: var(--sidebar-text-active);
  position: relative;
}

.nav-item.active > .nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background-color: var(--sidebar-accent);
  border-radius: 0 2px 2px 0;
}

/* 一级菜单 - 悬停态 */
.nav-item:hover > .nav-link {
  background-color: var(--sidebar-bg-hover);
  color: var(--sidebar-text-hover);
}

/* 二级菜单 - 选中态 */
.nav-submenu-item.active > a {
  background-color: var(--sidebar-accent-light);
  color: var(--sidebar-accent);
  font-weight: 500;
}

/*
/* 二级菜单 - 悬停态 */
.nav-submenu-item:hover > a {
  background-color: var(--sidebar-bg-hover);
  color: var(--sidebar-text-hover);
}

/* 父级菜单保持展开（当子项被选中时） */
.nav-item.has-submenu.is-expanded > button {
  color: var(--sidebar-text-active);
}

.nav-item.has-submenu.is-expanded .submenu-arrow {
  transform: rotate(180deg);
}
```

### 5.4 高亮联动逻辑

```javascript
// 路由匹配规则
const RouteMatch = {
  // 精确匹配（叶子节点）
  exact: '/dashboard',
  
  // 前缀匹配（父级节点）
  prefix: '/machine-rooms/*',  // 匹配 /machine-rooms/list, /machine-rooms/mine
  
  // 面包屑激活
  breadcrumb: [
    { path: '/machine-rooms', label: '机房管理' },
    { path: '/machine-rooms/list', label: '机房列表' }
  ]
}
```

---

## 6. 权限控制

### 6.1 权限模型

```javascript
// 权限配置
const Permissions = {
  roles: ['admin', 'operator', 'viewer'],
  
  // 角色权限矩阵
  rolePermissions: {
    admin: {
      'users': true,           // 用户管理
      'settings-admin': true,  // 管理员设置
      'data-import': true,
      'data-export': true,
      '*': true                // 所有页面
    },
    operator: {
      'users': false,
      'settings-admin': false,
      'data-import': true,
      'data-export': true,
      'dashboard': true,
      'machine-rooms': true,
      'customers': true,
      'operation-logs': true
    },
    viewer: {
      'users': false,
      'settings-admin': false,
      'data-import': false,
      'data-export': false,
      'dashboard': true,
      'machine-rooms': true,
      'customers': true,
      'operation-logs': false
    }
  }
}
```

### 6.2 权限控制表

| 菜单项 | admin | operator | viewer | 说明 |
|--------|-------|----------|--------|------|
| 仪表盘 | ✅ | ✅ | ✅ | 所有角色可见 |
| 机房管理 | ✅ | ✅ | ✅ | 所有角色可见 |
| 机房列表 | ✅ | ✅ | ✅ | — |
| 我的机房 | ✅ | ✅ | ✅ | — |
| 客户管理 | ✅ | ✅ | ✅ | 所有角色可见 |
| 客户列表 | ✅ | ✅ | ✅ | — |
| 我的客户 | ✅ | ✅ | ✅ | — |
| 用户管理 | ✅ | ❌ | ❌ | **仅 admin** |
| 操作日志 | ✅ | ✅ | ❌ | — |
| 数据导入 | ✅ | ✅ | ❌ | 需 `import` 权限 |
| 数据导出 | ✅ | ✅ | ❌ | 需 `export` 权限 |
| 系统设置 | ✅ | ✅ | ✅ | 所有角色可见 |
| 个人设置 | ✅ | ✅ | ✅ | — |
| 管理员设置 | ✅ | ❌ | ❌ | **仅 admin** |

### 6.3 前端权限实现

```vue
<!-- Vue 组件示例 -->
<template>
  <!-- 方式1: v-if 条件渲染 -->
  <li v-if="hasPermission('admin')" class="nav-item">
    ...
  </li>
  
  <!-- 方式2: 指令封装 -->
  <li v-permission="['admin']" class="nav-item">
    ...
  </li>
</template>

<script>
// 权限判断逻辑
function hasPermission(requiredPermission) {
  const userRole = useUserStore().role;
  const permissions = Permissions.rolePermissions[userRole];
  return permissions[requiredPermission] || permissions['*'] || false;
}
</script>
```

```tsx
// React Hook 示例
function usePermission(permission: string) {
  const { role } = useAuth();
  return Permissions.rolePermissions[role]?.[permission] ?? false;
}

// 使用
function SidebarMenu({ menuId, label }: Props) {
  const canView = usePermission(menuId);
  
  if (!canView) return null;
  
  return <li className="nav-item">{label}</li>;
}
```

---

## 7. 响应式设计

### 7.1 断点定义

| 断点 | 视口宽度 | 侧边栏行为 |
|------|----------|------------|
| `desktop` | `≥ 1024px` | 始终展开，固定定位 |
| `tablet` | `768px - 1023px` | 默认折叠，可展开 |
| `mobile` | `< 768px` | 抽屉模式，汉堡菜单触发 |

### 7.2 移动端适配

#### 布局结构

```
┌────────────────────────────────────────┐
│  ☰  AIDC Collector            [用户]  │  ← Header（固定顶部）
├────────────────────────────────────────┤
│                                        │
│              主内容区域                  │  ← Content（可滚动）
│                                        │
│                                        │
└────────────────────────────────────────┘
         ↑ 点击 ☰ 触发 ↓
┌────────────────────────────────────────┐
│ ╳                              Logo    │  ← 抽屉头部
├────────────────────────────────────────┤
│                                        │
│         侧边栏抽屉（从左滑入）           │
│                                        │
│  📊 仪表盘                            │
│  🏢 机房管理                          │
│     ├ 机房列表                         │
│     └ 我的机房                         │
│  ...                                   │
│                                        │
├────────────────────────────────────────┤
│  [头像] 张三 · 管理员    [⚙️] [退出]  │  ← 用户区域
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 遮罩层
└────────────────────────────────────────┘
```

#### CSS 媒体查询

```css
/* 桌面端：默认展开 */
@media (min-width: 1024px) {
  .sidebar {
    width: var(--sidebar-width, 240px);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }
  
  .sidebar.collapsed {
    width: var(--sidebar-collapsed-width, 64px);
  }
  
  .sidebar-toggle {
    display: flex;
  }
}

/* 平板端：可折叠 */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: var(--sidebar-collapsed-width, 64px);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }
  
  .sidebar.expanded {
    width: var(--sidebar-width, 240px);
  }
  
  .sidebar:not(.expanded) .nav-label,
  .sidebar:not(.expanded) .logo-text {
    display: none;
  }
}

/* 移动端：抽屉模式 */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    width: var(--sidebar-width, 280px);
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    box-shadow: none;
  }
  
  .sidebar.mobile-open {
    left: 0;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }
  
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--sidebar-overlay);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .sidebar-overlay.visible {
    opacity: 1;
    visibility: visible;
  }
  
  /* 移动端菜单项调整 */
  .nav-item {
    height: 48px;
  }
  
  .nav-label {
    font-size: 15px;
  }
}
```

#### JavaScript 切换逻辑

```javascript
class SidebarController {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.overlay = document.getElementById('sidebarOverlay');
    this.toggleBtn = document.getElementById('sidebarToggle');
    
    this.state = {
      isExpanded: false,
      isMobileOpen: false
    };
    
    this.init();
  }
  
  init() {
    // 监听窗口 resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // 绑定折叠按钮
    this.toggleBtn?.addEventListener('click', this.toggle.bind(this));
    
    // 绑定遮罩点击
    this.overlay?.addEventListener('click', this.closeMobile.bind(this));
    
    // 绑定快捷键
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // 恢复状态
    this.restoreState();
  }
  
  handleResize() {
    const width = window.innerWidth;
    
    if (width >= 1024) {
      // 桌面端：恢复展开/折叠状态
      this.restoreState();
    } else if (width >= 768) {
      // 平板端：默认折叠
      this.sidebar?.classList.remove('expanded', 'mobile-open');
      this.overlay?.classList.remove('visible');
    } else {
      // 移动端：默认关闭抽屉
      this.sidebar?.classList.remove('expanded');
      this.sidebar?.classList.remove('mobile-open');
      this.overlay?.classList.remove('visible');
    }
  }
  
  toggle() {
    const width = window.innerWidth;
    
    if (width < 768) {
      // 移动端：切换抽屉
      this.state.isMobileOpen = !this.state.isMobileOpen;
      this.sidebar?.classList.toggle('mobile-open', this.state.isMobileOpen);
      this.overlay?.classList.toggle('visible', this.state.isMobileOpen);
    } else {
      // 桌面/平板端：切换折叠
      this.state.isExpanded = !this.state.isExpanded;
      this.sidebar?.classList.toggle('collapsed', !this.state.isExpanded);
      this.sidebar?.classList.toggle('expanded', this.state.isExpanded);
      this.saveState();
    }
  }
  
  closeMobile() {
    this.state.isMobileOpen = false;
    this.sidebar?.classList.remove('mobile-open');
    this.overlay?.classList.remove('visible');
  }
  
  handleKeydown(e) {
    // Cmd/Ctrl + B 切换折叠
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      if (window.innerWidth >= 768) {
        this.state.isExpanded = !this.state.isExpanded;
        this.sidebar?.classList.toggle('collapsed', !this.state.isExpanded);
        this.saveState();
      }
    }
    
    // Escape 关闭抽屉/子菜单
    if (e.key === 'Escape') {
      if (this.state.isMobileOpen) {
        this.closeMobile();
      } else {
        this.collapseAllSubmenus();
      }
    }
  }
  
  saveState() {
    localStorage.setItem('sidebar_collapsed', JSON.stringify({
      isExpanded: this.state.isExpanded,
      timestamp: Date.now()
    }));
  }
  
  restoreState() {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved) {
      try {
        const { isExpanded } = JSON.parse(saved);
        this.state.isExpanded = isExpanded;
        this.sidebar?.classList.toggle('collapsed', !isExpanded);
      } catch (e) {
        // ignore
      }
    }
  }
  
  collapseAllSubmenus() {
    const expanded = this.sidebar?.querySelectorAll('.nav-submenu.expanded');
    expanded?.forEach(el => {
      el.classList.remove('expanded');
      el.previousElementSibling?.classList.remove('is-expanded');
      el.previousElementSibling?.setAttribute('aria-expanded', 'false');
    });
  }
}

// 初始化
const sidebar = new SidebarController();
```

---

## 8. 与其他组件的交互关系

### 8.1 组件关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      Layout Container                        │
│  ┌─────────────┐  ┌─────────────────────────────────────┐ │
│  │   Sidebar   │  │         Main Content Area            │ │
│  │              │  │  ┌─────────────────────────────────┐ │ │
│  │  ┌────────┐ │  │  │         Page Header             │ │ │
│  │  │ Header │ │  │  ├─────────────────────────────────┤ │ │
│  │  └────────┘ │  │  │                                 │ │ │
│  │  ┌────────┐ │  │  │         Page Content            │ │ │
│  │  │  Nav   │ │  │  │  ┌─────────┐  ┌─────────────┐  │ │ │
│  │  │        │ │  │  │  │  Table  │  │    Form     │  │ │ │
│  │  │        │ │  │  │  │         │  │             │  │ │ │
│  │  │        │ │  │  │  └─────────┘  └─────────────┘  │ │ │
│  │  │        │ │  │  │                                 │ │ │
│  │  └────────┘ │  │  └─────────────────────────────────┘ │ │
│  │  ┌────────┐ │  │  ┌─────────────────────────────────┐ │ │
│  │  │ Footer │ │  │  │         Pagination              │ │ │
│  │  └────────┘ │  │  └─────────────────────────────────┘ │ │
│  └─────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 与 Header 组件交互

| 交互事件 | 源组件 | 目标组件 | 行为描述 |
|----------|--------|----------|----------|
| 移动端菜单点击 | Header (汉堡按钮) | Sidebar | 触发 `sidebar.mobile-open` 切换 |
| 用户信息同步 | Sidebar (Footer) | Header | 用户头像/名称变更时同步 |
| 通知徽章 | Header | Sidebar | 显示待处理事项数量 |

```javascript
// Header 组件调用 Sidebar
const HeaderComponent = {
  methods: {
    toggleSidebar() {
      // 触发 Sidebar 抽屉
      document.getElementById('sidebar')?.classList.toggle('mobile-open');
      document.getElementById('sidebarOverlay')?.classList.toggle('visible');
    }
  }
};
```

### 8.3 与路由系统交互

| 交互事件 | 源组件 | 目标组件 | 行为描述 |
|----------|--------|----------|----------|
| 路由切换 | Vue Router / React Router | Sidebar | 更新 `active` 高亮状态 |
| 面包屑更新 | Sidebar | Breadcrumb | 当前菜单路径同步到面包屑 |

```javascript
// 路由变化时更新 Sidebar 高亮
router.afterEach((to) => {
  // 精确匹配
  const activeItem = document.querySelector(`[data-path="${to.path}"]`);
  
  // 前缀匹配（父级）
  const prefixMatch = to.path.match(/^\/([^\/]+)/);
  if (!activeItem && prefixMatch) {
    const parentPath = '/' + prefixMatch[1];
    const parentItem = document.querySelector(`[data-path="${parentPath}"]`);
    if (parentItem) {
      parentItem.classList.add('is-expanded');
      parentItem.querySelector('.nav-submenu')?.classList.add('expanded');
    }
  }
  
  // 清除旧的高亮
  document.querySelectorAll('.nav-item.active, .nav-submenu-item.active').forEach(el => {
    el.classList.remove('active');
  });
  
  // 设置新的高亮
  activeItem?.classList.add('active');
  activeItem?.closest('.nav-item')?.classList.add('active');
});
```

### 8.4 与 Table 组件交互

| 交互事件 | 源组件 | 目标组件 | 行为描述 |
|----------|--------|----------|----------|
| 表格刷新 | Sidebar | Table | 路由跳转后自动触发表格数据刷新 |
| 分页状态 | Sidebar | Table | 离开页面时保存分页状态，返回时恢复 |

### 8.5 与 Form 组件交互

| 交互事件 | 源组件 | 目标组件 | 行为描述 |
|----------|--------|----------|----------|
| 表单提交后跳转 | Form | Sidebar | 提交成功后保持当前高亮状态 |
| 权限验证失败 | Form | Sidebar | 无权限时隐藏对应菜单项 |

### 8.6 事件总线规范

```javascript
// 事件总线
const SidebarEvents = {
  // 菜单切换
  MENU_CLICK: 'sidebar:menu:click',
  MENU_EXPAND: 'sidebar:menu:expand',
  MENU_COLLAPSE: 'sidebar:menu:collapse',
  
  // 状态变化
  STATE_CHANGED: 'sidebar:state:changed',
  
  // 用户操作
  USER_LOGOUT: 'sidebar:user:logout',
  USER_SETTINGS: 'sidebar:user:settings',
};

// 事件监听示例
EventBus.on(SidebarEvents.MENU_CLICK, (payload) => {
  const { menuId, path } = payload;
  router.push(path);
});

// 事件触发示例
EventBus.emit(SidebarEvents.MENU_CLICK, {
  menuId: 'machine-rooms-list',
  path: '/machine-rooms/list'
});
```

---

## 9. 验收标准

### 9.1 功能验收

| 序号 | 检查项 | 验收条件 |
|------|--------|----------|
| 1 | 菜单渲染 | 所有菜单项正确渲染，层级结构清晰 |
| 2 | 路由高亮 | 当前路由对应菜单项正确高亮 |
| 3 | 子菜单展开 | 点击有子菜单的项可正确展开/折叠 |
| 4 | 权限过滤 | admin 可见用户管理和管理员设置，其他角色隐藏 |
| 5 | 折叠功能 | 桌面端折叠后仅显示图标，hover 显示 tooltip |
| 6 | 移动端抽屉 | 移动端点击汉堡按钮可打开/关闭侧边栏抽屉 |
| 7 | 遮罩关闭 | 移动端点击遮罩可关闭侧边栏 |
| 8 | 状态持久化 | 折叠状态保存到 localStorage，刷新后恢复 |
| 9 | 键盘导航 | 可使用 Tab、Enter、方向键导航菜单 |
| 10 | 退出登录 | 点击退出按钮正确登出并跳转登录页 |

### 9.2 视觉验收

| 序号 | 检查项 | 验收条件 |
|------|--------|----------|
| 1 | 尺寸规范 | 展开 240px，折叠 64px |
| 2 | 颜色规范 | 悬停色、激活色符合设计稿 |
| 3 | 选中指示条 | 左边蓝色 3px 指示条正确显示 |
| 4 | 动画过渡 | 展开/折叠动画流畅，无卡顿 |
| 5 | 响应式布局 | 各断点下布局正确 |
| 6 | 图标清晰 | SVG 图标清晰，无模糊 |
| 7 | 文字省略 | 长菜单名正确显示省略号 |

### 9.3 性能验收

| 序号 | 检查项 | 验收条件 |
|------|--------|----------|
| 1 | 首屏渲染 | 侧边栏在 100ms 内渲染完成 |
| 2 | 内存占用 | DOM 节点数不超过 100 个 |
| 3 | 动画性能 | 使用 GPU 加速动画（如 transform） |
| 4 | 事件处理 | 避免在滚动区域绑定高频事件 |

### 9.4 无障碍验收

| 序号 | 检查项 | 验收条件 |
|------|--------|----------|
| 1 | ARIA 标签 | 所有按钮/链接有正确的 aria-label |
| 2 | 焦点管理 | Tab 键可聚焦所有可交互元素 |
| 3 | 焦点指示 | 焦点状态有明显的视觉指示 |
| 4 | 屏幕阅读器 | 菜单结构可被正确朗读 |
| 5 | 键盘操作 | 所有功能可通过键盘完成 |
