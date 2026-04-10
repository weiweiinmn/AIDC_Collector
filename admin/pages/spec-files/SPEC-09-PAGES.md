# 9. 页面清单

> 来源：SPEC-FULL.md | 编号：9
> 完整规格书请参考：[SPEC-FULL.md](./SPEC-FULL.md)

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

