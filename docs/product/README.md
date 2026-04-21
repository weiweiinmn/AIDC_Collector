# AIDC Collector 桌面端产品文档

**版本**: v2.0  
**日期**: 2026-04-15  
**适用范围**: 管理后台 (admin/pages/)

---

## 文档清单

| 文档 | 说明 |
|------|------|
| `01-仪表盘.md` | 仪表盘页面功能、数据指标、KPI计算逻辑 |
| `02-机房列表.md` | 机房列表筛选、排序、分页、弹窗详情 |
| `03-添加机房.md` | 添加机房表单字段、验证规则、数据提交 |
| `04-导入导出.md` | 数据导入导出功能、模板下载、格式支持 |

---

## 系统架构

### 技术栈
- **前端**: 纯 HTML + CSS + JavaScript (无框架)
- **数据存储**: localStorage (浏览器本地存储)
- **样式**: 自定义 CSS 变量 + 深色/浅色双主题
- **图标**: SVG 内联图标

### 页面结构
```
admin/pages/
├── login.html              # 登录页
├── dashboard-v2.html       # 仪表盘
├── datacenter-list.html    # 机房列表
├── datacenter-form.html    # 添加/编辑机房
├── datacenter-import.html  # 导入导出
├── datacenter-view.html    # 机房详情(只读)
├── datacenter-detail-v2.html # 机房详情(编辑)
├── gantt.html              # 项目进度(甘特图)
├── customers.html          # 客户管理
├── users.html              # 用户管理
├── visits.html             # 拜访记录
├── statistics.html         # 统计分析
├── settings.html           # 系统设置
├── api.js                  # 数据层API
├── shared.css              # 共享样式(深色主题)
└── shared-light.css        # 浅色主题覆盖
```

### 数据流
```
用户操作 → 页面JS → AIDC_API (api.js) → localStorage
                    ↓
              数据返回 → 页面渲染
```

---

## 核心数据模型

### 机房数据字段 (Datacenter)

```javascript
{
  id: "uuid",                    // 唯一标识
  name: "机房名称",
  dc_name: "机房名称(冗余)",
  country: "国家",
  province: "省/州",
  city: "城市",
  address: "详细地址",
  park: "园区",
  building: "楼号",
  
  // 业务状态
  status: "new|collected|negotiating|signed|rejected",
  kycStatus: "not_started|in_progress|pending_doc|approved|rejected|not_required",
  cooperation_status: "合作状态",
  
  // 规模
  mw: "总容量(MW)",
  availPowerMw: "可用电力(MW)",
  expandablePowerMw: "可扩容上限(MW)",
  rackCount: "总机柜数",
  rackAvailable: "可用机柜数",
  powerPerRack: "单机柜功率(kW)",
  
  // 时间
  delivery_date: "交付日期",
  expectedDate: "预计交付时间",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  
  // 电力系统
  mainsCapacityKva: "市电总容量(kVA)",
  transformerConfig: "变压器配置",
  transformerKva: "单台变压器容量",
  gensetRedundancy: "柴发冗余等级",
  gensetRuntimeHours: "柴发储油时长",
  upsConfig: "UPS配置",
  upsRuntimeMinutes: "UPS电池后备时间",
  hasBusbar: "是否配备高密度母线",
  powerSla: "电力可用性SLA",
  
  // 制冷系统
  coolingSystem: "主制冷方式",
  liquidCoolingSupport: "液冷支持",
  floorLoad: "地板承重(kg/m²)",
  raisedFloorHeight: "架空地板高度(m)",
  chillerCount: "冷水机组数量",
  pue_value: "PUE设计值",
  
  // 网络
  networkRoutes: "网络进线路由数",
  isp: "运营商",
  support800g: "800G网络支持",
  roceSupport: "RoCE支持",
  networkRedundancy: "网络冗余",
  hasDedicatedLine: "是否有专线",
  
  // 认证
  levelCertification: "等级认证",
  isoCertified: "ISO认证",
  boiStatus: "BOI资质",
  securityLevel: "安保等级",
  
  // 联系信息
  contact: "联系人",
  contactPhone: "联系电话",
  contactEmail: "联系邮箱",
  liaison: "对接同事",
  customer: "客户名称",
  source: "信息来源",
  service_provider: "服务商名称",
  
  // 其他
  expandable: "是否可扩容",
  property: "产权归属",
  ownership: "产权归属(冗余)",
  remark: "备注"
}
```

### 状态枚举

| 状态类型 | 可选值 | 说明 |
|----------|--------|------|
| status | new | 新增 |
| | collected | 已收录 |
| | negotiating | 洽谈中 |
| | signed | 已签约 |
| | rejected | 已淘汰 |
| kycStatus | not_started | 未开始 |
| | in_progress | 进行中 |
| | pending_doc | 待补充 |
| | approved | 已完成 |
| | rejected | 已驳回 |
| | not_required | 不需要 |

---

## 通用功能

### 主题切换
- 支持深色/浅色双主题
- 主题偏好存储在 localStorage: `aidc_theme`
- 切换按钮位于顶部导航栏右侧

### 登录态校验
```javascript
// 每个页面头部嵌入
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem("aidc_user")); } catch(e){}
  if (!u) { window.location.href = "login.html"; return; }
})();
```

### 导航栏
- 固定顶部，包含品牌Logo、菜单、主题切换、用户信息、退出
- 当前页面高亮显示
- 菜单项: 仪表盘、机房列表、添加机房、导入导出、项目进度

---

## 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-04-15 | v2.0 | 重构产品文档，统一格式 |
