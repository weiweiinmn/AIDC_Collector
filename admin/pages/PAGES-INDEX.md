# AIDC Collector — 页面导航索引

> 更新日期：2026-04-10
> 项目状态：原型设计完成，待开发

---

## 📱 页面清单

### 小程序端（前台）

| # | 页面 | 文件路径 | 状态 | 说明 |
|---|------|----------|------|------|
| 1 | **登录页** | `pages/login-phone.html` | ✅ 新增 | 手机号+密码登录（替代微信授权） |
| 2 | **修改密码** | `pages/change-password.html` | ✅ 新增 | 首次登录强制修改 / 设置页入口 |
| 3 | **首页仪表盘** | `idc-collector-ui.html#dashboard` | ✅ 已有 | 统计栏 + 快捷操作 + 最近记录 |
| 4 | **新建采集** | `idc-collector-ui.html#form` | ✅ 已有 | 9大类65字段表单 |
| 5 | **采集列表** | `idc-collector-ui.html#list` | ✅ 已有 | 搜索 + 筛选 + 分页 + 排序 |
| 6 | **记录详情** | `idc-collector-ui.html#detail` | ✅ 已有 | 分组展示 + 修改历史 |
| 7 | **Excel 导入** | `pages/import-excel.html` | ✅ 新增 | 批量导入机房信息 |
| 8 | **导出管理** | `idc-collector-ui.html#export` | ✅ 已有 | 导出 Excel / 模板下载 |
| 9 | **预设筛选** | `pages/filter-presets.html` | ✅ 新增 | 保存/管理常用筛选条件 |
| 10 | **设置页** | `idc-collector-ui.html#settings` | ✅ 已有 | 个人信息 + 修改密码 + 退出 |

### 管理后台

| # | 页面 | 文件路径 | 状态 | 说明 |
|---|------|----------|------|------|
| 1 | **后台首页** | `idc-admin-v3.html#dashboard` | ✅ 已有 | 统计概览 + 最新机房 |
| 2 | **机房列表** | `idc-admin-v3.html#datacenters` | ✅ 已有 | 全量数据表格 + 内联编辑 |
| 3 | **新增机房** | `idc-admin-v3.html#datacenter-add` | ✅ 已有 | 机房信息表单 |
| 4 | **机房详情** | `idc-admin-v3.html#datacenter-detail` | ✅ 已有 | 查看机房详细信息 |
| 5 | **成员管理** | `idc-admin-v3.html#users` | ✅ 已有 | 用户列表 + 状态管理 |
| 6 | **成员详情** | `idc-admin-v3.html#user-detail` | ✅ 已有 | 成员信息编辑 |
| 7 | **批量导入** | `idc-admin-v3.html` (弹窗) | ✅ 已有 | 后台导入 + 选择归属人 |
| 8 | **数据导出** | `idc-admin-v3.html` (功能) | ✅ 已有 | 导出 Excel |

---

## 🗂️ 文件目录

```
aidc-collector/
├── pages/                          # 页面原型目录
│   ├── login-phone.html            # 手机号登录页 🆕
│   ├── change-password.html        # 修改密码页 🆕
│   ├── import-excel.html           # Excel导入页 🆕
│   └── filter-presets.html         # 预设筛选页 🆕
│
├── idc-collector-ui.html           # 小程序端主UI（多页面合一）
├── idc-admin-v3.html               # 管理后台主页面
│
├── SPEC.md                         # 设计规格书 v2.0
├── SPEC-MVP.md                     # MVP开发计划
├── SPEC-FULL.md                    # 完整功能规格书 v3.0
├── GAP-ANALYSIS.md                 # 功能差距分析
├── PROJECT-INDEX.md                # 项目文件索引
│
├── CLIENT-MANAGEMENT-README.md     # 客户管理功能说明
├── IMPLEMENTATION-SUMMARY.md       # 实现总结报告
├── EXCEL-TEMPLATE-GUIDE.md         # Excel模板指南
├── SCREENSHOTS-GUIDE.md            # 截图演示指南
│
├── project.config.json             # 小程序项目配置
└── test-client-management.js       # 自动化测试脚本
```

---

## 🎨 设计规范快速参考

### 配色方案
```css
--primary: #1E3A5F;     /* 主色 - 深海军蓝 */
--accent: #E8843C;      /* 强调色 - 暖铜橙 */
--success: #2D9E6C;     /* 成功色 */
--warning: #D97706;     /* 警告色 */
--danger: #DC2626;      /* 危险色 */
--bg: #F4F6F9;          /* 背景色 */
--card: #FFFFFF;        /* 卡片色 */
--border: #E2E8F0;      /* 边框色 */
--text: #1A202C;        /* 文字主色 */
--text-muted: #64748B;  /* 文字次色 */
```

### 字体
- **主字体**: DM Sans
- **数字/代码**: JetBrains Mono
- **中文回退**: PingFang SC, Microsoft YaHei

### 组件规范
- **圆角**: 卡片 10px, 按钮 6px
- **阴影**: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- **间距**: 小 8px, 中 16px, 大 24px

---

## 🚀 本地预览

### 小程序端页面
直接在浏览器打开 HTML 文件即可预览：
- 登录页: `pages/login-phone.html`
- 主界面: `idc-collector-ui.html`
- 导入页: `pages/import-excel.html`
- 预设筛选: `pages/filter-presets.html`

### 管理后台
- 后台首页: `idc-admin-v3.html`

---

## 📋 待开发功能

根据 SPEC-FULL.md，以下功能需要在正式开发时实现：

1. **云函数开发** - 登录、CRUD、导入导出等 API
2. **数据库设计** - users, datacenters, editHistory 等集合
3. **水印功能** - 全页面 Canvas 水印覆盖
4. **Agent 辅助** - 自动抓取机房信息预填表单（P2）
5. **消息提醒** - 考察日期提醒、状态变更通知（P2）
6. **批量操作** - 批量改状态、分配归属人（P2）

---

## 👥 角色 & 权限

| 角色 | 权限范围 |
|------|----------|
| **管理员 (admin)** | 全部功能 + 后台管理 + 用户管理 |
| **采集员 (collector)** | 前台采集/查看/编辑/导入导出 |

### 用户状态
| 状态 | 说明 |
|------|------|
| `pending` | 待开通 |
| `approved` | 已开通（正常使用） |
| `disabled` | 已停用 |

---

## 🔗 相关链接

- [TDesign 组件库](https://tdesign.tencent.com/miniprogram/overview)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [ExcelJS 文档](https://github.com/exceljs/exceljs)

---

**文档维护**: AI Assistant
**最后更新**: 2026-04-10
