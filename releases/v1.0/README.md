# AIDC Collector v1.0

## 版本信息
- 版本号：v1.0
- 发布日期：2026-04-13
- Git 提交：ac7a111

## 功能模块

### 电脑端网站（admin/pages/）
- 仪表盘：KPI 指标卡、状态分布、最近活动
- 机房列表：搜索、筛选、排序、分页、详情弹窗
- 添加机房：V4 调研表完整字段、五级联动、周历选择
- 导入导出：拖拽上传、批量导入、Excel/CSV/JSON 导出、模板下载
- 项目进度甘特图：三个预置项目、六阶段任务、周历时间轴

### 小程序端（miniprogram/）
- 机房列表、详情、新增
- 个人中心、设置

### 云函数（cloudfunctions/）
- 用户管理：login, register, changePassword, resetPassword, getUsers, updateUserStatus
- 机房管理：getDatacenters, getDatacenterDetail, createDatacenter, updateDatacenter, deleteDatacenter
- 导入导出：importExcel, adminImportExcel, exportExcel

## 技术栈
- 前端：纯 HTML/CSS/JS（无框架）
- 后端：微信云开发
- 数据：localStorage + 云数据库

## 使用方式

### 电脑端
1. 解压 `AIDC_Collector_v1.0.zip`
2. 将 `admin/pages/` 部署到 HTTP 服务器
3. 访问 `dashboard-v2.html`

### 小程序端
1. 导入微信开发者工具
2. 配置云开发环境
3. 上传云函数
4. 预览/发布

## 文件结构
```
aidc-collector/
├── admin/pages/          # 电脑端网站
│   ├── dashboard-v2.html # 仪表盘
│   ├── datacenter-list.html # 机房列表
│   ├── datacenter-form.html # 添加机房
│   ├── datacenter-import.html # 导入导出
│   ├── gantt.html        # 项目进度
│   ├── api.js            # API 封装
│   └── shared.css        # 共享样式
├── miniprogram/          # 小程序
├── cloudfunctions/       # 云函数
└── docs/                 # GitHub Pages
```

## 更新日志
- v1.0 (2026-04-13): 完整前后端系统，支持电脑端和小程序
