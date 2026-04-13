# AIDC Collector v2.0

## 版本信息
- 版本号：v2.0
- 发布日期：2026-04-13
- Git 提交：b9620f3

## 🆕 v2.0 新特性

### 电脑端网站全面升级
- **仪表盘**：KPI 指标卡、状态分布进度条、最近活动列表
- **机房列表**：搜索、筛选、排序、分页、详情弹窗、状态标签
- **添加机房**：V4 调研表完整字段、五级联动地区选择、周历选择交付时间
- **导入导出**：拖拽上传、批量导入、Excel/CSV/JSON 导出、模板下载
- **项目进度甘特图**：三个预置项目、六阶段任务、周历时间轴、可编辑任务

### 技术升级
- 纯前端 HTML/CSS/JS，无框架依赖
- localStorage 数据持久化 + AIDC_API 封装
- 深色/浅色主题切换
- 统一顶部导航
- 响应式布局

### 数据连通
- api.js 封装所有 CRUD 操作
- 预置 demo 数据
- 支持导入导出

## 使用方式

### 在线访问
```
https://weiweiinmn.github.io/AIDC_Collector/
```

### 本地部署
1. 解压 `AIDC_Collector_v2.0.zip`
2. 将 `docs/` 目录部署到任意 HTTP 服务器
3. 访问 `index.html`

## 文件结构
```
aidc-collector/
├── docs/                 # GitHub Pages 部署（v2.0）
│   ├── index.html        # 入口页
│   ├── dashboard-v2.html # 仪表盘
│   ├── datacenter-list.html # 机房列表
│   ├── datacenter-form.html # 添加机房
│   ├── datacenter-import.html # 导入导出
│   ├── gantt.html        # 项目进度
│   ├── api.js            # API 封装
│   └── shared.css        # 共享样式
├── admin/pages/          # 开发源文件
├── cloudfunctions/       # 云函数
└── releases/             # 版本打包
    ├── v1.0/             # 旧版本归档
    └── v2.0/             # 当前版本
```

## 更新日志

### v2.0 (2026-04-13)
- 全新电脑端网站设计
- 完整导入导出功能
- 项目进度甘特图
- 统一导航和主题

### v1.0 (2026-04-13)
- 完整前后端系统
- 支持电脑端和小程序
