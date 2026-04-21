# AIDC Collector — Admin 后台页面索引

> 更新日期：2026-04-10
> 设计规范版本：v1.0.0
> 共享样式：shared.css

---

## 📁 文件清单

| # | 页面 | 文件名 | 大小 | 状态 |
|---|------|--------|------|------|
| 1 | **登录页** | `login.html` | 4.9 KB | ✅ 已有 |
| 2 | **仪表盘** | `dashboard-v2.html` | 12.6 KB | ✅ 已有 |
| 3 | **机房列表** | `datacenter-list.html` | 21.6 KB | ✅ 已有 |
| 4 | **新增机房** | `datacenter-form.html` | 19.8 KB | ✅ 已有 |
| 5 | **机房查看** | `datacenter-view.html` | 17.3 KB | ✅ 已有 |
| 6 | **机房详情** | `datacenter-detail-v2.html` | 65.2 KB | ✅ 已有 |
| 7 | **导入导出** | `datacenter-import.html` | 21.8 KB | ✅ 已有 |
| 8 | **用户管理** | `users.html` | 31.5 KB | ✅ 已有 |
| 9 | **设置页** | `settings.html` | 62.5 KB | ✅ 已有 |
| 10 | **客户管理** | `customers.html` | 25.8 KB | ✅ 新增 |
| 11 | **考察任务** | `visits.html` | 30.5 KB | ✅ 新增 |
| 12 | **数据统计** | `statistics.html` | 28.2 KB | ✅ 新增 |
| - | **共享样式** | `shared.css` | 32.8 KB | ✅ 核心 |
| - | **设计规范** | `设计规范_v1.0.0.md` | 19.2 KB | ✅ 文档 |

---

## 🧭 导航结构

```
顶部导航栏
├── Logo + 品牌名
├── 主菜单
│   ├── 仪表盘 → dashboard-v2.html
│   ├── 机房列表 → datacenter-list.html
│   ├── 客户管理 → customers.html      🆕
│   ├── 考察任务 → visits.html         🆕
│   ├── 数据统计 → statistics.html     🆕
│   └── 用户管理 → users.html
└── 用户信息区
    ├── 头像 + 姓名
    └── 下拉菜单 → 设置/退出
```

---

## 📊 页面功能矩阵

### 机房管理
| 页面 | 功能 |
|------|------|
| 机房列表 | 搜索、筛选、排序、分页、批量操作、导出 |
| 新增机房 | 9大类65字段表单、图片上传、草稿保存 |
| 机房查看 | 只读详情、修改历史、打印预览 |
| 机房详情 | 完整信息展示、考察记录、客户关联、修改追踪 |
| 导入导出 | Excel导入/导出、模板下载、冲突处理 |

### 客户管理 🆕
| 功能 | 说明 |
|------|------|
| 客户列表 | 名称、行业、等级、状态、客户经理 |
| 跟进状态 | 初步沟通 → 方案已发 → 谈判中 → 已签约/已流失 |
| 客户经理分配 | 指定负责人员 |
| 机房关联 | 查看客户关注的机房数量 |

### 考察任务 🆕
| 功能 | 说明 |
|------|------|
| 任务状态 | 待安排 → 已安排 → 已完成 / 已逾期 |
| 日历视图 | 按日期查看考察安排 |
| 任务分配 | 指定考察人员 |
| 提醒功能 | 考察日期提醒 |

### 数据统计 🆕
| 功能 | 说明 |
|------|------|
| 概览卡片 | 机房总数、考察完成率、签约客户、录入活跃度 |
| 月度趋势 | 柱状图展示录入趋势 |
| 区域分布 | 饼图展示机房地域分布 |
| 人员排行 | 录入人员工作量排行 |
| Tier分布 | 数据中心等级分布统计 |

---

## 🎨 设计规范速查

### 配色方案
```css
--brand:     #1E3A5F;  /* 主色 - 深海蓝 */
--accent:    #E8843C;  /* 强调色 - 橙黄 */
--success:   #2D9E6C;  /* 成功 */
--warning:   #D97706;  /* 警告 */
--danger:    #DC2626;  /* 危险 */
--info:      #3B82F6;  /* 信息 */
--bg-page:   #F4F6F9;  /* 页面背景 */
--bg-card:   #FFFFFF;  /* 卡片背景 */
```

### 字体
- **UI字体**: Inter
- **代码字体**: JetBrains Mono
- **中文回退**: PingFang SC, Microsoft YaHei

### 组件规范
- **圆角**: sm=6px, md=8px, lg=12px
- **阴影**: sm/md/lg 三级
- **过渡**: 0.15s/0.2s/0.3s

---

## 🔗 页面跳转关系

```
login.html
    ↓ 登录成功
dashboard-v2.html ←───────────────────┐
    │                                  │
    ├── 新增机房 → datacenter-form.html │
    │       └── 保存成功 → 返回列表      │
    │                                  │
    ├── 机房列表 → datacenter-list.html │
    │       ├── 查看 → datacenter-view.html
    │       ├── 编辑 → datacenter-form.html?id=xxx
    │       └── 详情 → datacenter-detail-v2.html?id=xxx
    │                                  │
    ├── 导入导出 → datacenter-import.html
    │                                  │
    ├── 客户管理 → customers.html       │
    │                                  │
    ├── 考察任务 → visits.html          │
    │                                  │
    ├── 数据统计 → statistics.html      │
    │                                  │
    └── 用户管理 → users.html ──────────┘
```

---

## 📋 开发注意事项

### 必须引用 shared.css
```html
<link rel="stylesheet" href="shared.css">
```

### 页面结构模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题 - AIDC Collector</title>
    <link rel="stylesheet" href="shared.css">
</head>
<body>
    <!-- 顶部导航 -->
    <nav class="top-nav">...</nav>

    <!-- 主内容区 -->
    <main class="main-content">
        <!-- 页面头部 -->
        <div class="page-header">...</div>

        <!-- 内容卡片 -->
        <div class="card">...</div>
    </main>

    <!-- Toast 容器 -->
    <div class="toast-container" id="toastContainer"></div>
</body>
</html>
```

---

**文档维护**: AI Assistant
**最后更新**: 2026-04-10
