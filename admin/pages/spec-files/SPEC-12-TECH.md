# 12. 技术架构

> 来源：SPEC-FULL.md | 编号：12
> 完整规格书请参考：[SPEC-FULL.md](./SPEC-FULL.md)

---

## 12. 技术架构

### 12.1 架构总览

| 层级 | 方案 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生 + TDesign 组件库 | PRD 推荐，60+ 组件 |
| 后端 | 微信云开发（云函数 + 云数据库 + 云存储） | 19.9元/月，首月免费 |
| 管理后台 | 云后台/CMS（免开发） | 低代码管理界面 |
| 数据库 | 云开发 NoSQL（MongoDB） | 集合 + 文档模式 |
| 认证 | 手机号 + 密码（自定义） | 替代微信登录 |
| 密码加密 | bcrypt | 云函数端加密验证 |
| Excel处理 | exceljs | 导入导出 |
| 存储 | 微信云存储 | 照片 + Excel 文件 |

### 12.2 成本

- 云开发基础套餐：19.9元/月（首月免费）
- 个人主体小程序：免费
- **总计：19.9元/月**

### 12.3 项目结构

```
idc-collector/
├── miniprogram/
│   ├── app.js                          # 全局逻辑
│   ├── app.json                        # 页面配置
│   ├── app.wxss                        # 全局样式
│   ├── project.config.json
│   ├── sitemap.json
│   ├── pages/
│   │   ├── login/                      # 登录页
│   │   ├── index/                      # 首页
│   │   ├── form/                       # 采集表单
│   │   ├── list/                       # 采集列表
│   │   ├── detail/                     # 记录详情
│   │   ├── import/                     # Excel导入
│   │   ├── export/                     # Excel导出
│   │   └── settings/                   # 设置页
│   ├── components/
│   │   ├── watermark/                  # 水印组件 🆕
│   │   ├── dc-card/                    # 机房卡片
│   │   ├── status-tag/                 # 状态标签
│   │   ├── photo-upload/               # 图片上传
│   │   ├── search-bar/                 # 搜索栏
│   │   ├── filter-panel/               # 筛选面板
│   │   └── region-picker/              # 区域选择器 🆕
│   ├── utils/
│   │   ├── api.js                      # 云函数调用封装
│   │   ├── auth.js                     # 登录状态管理（改造）
│   │   ├── watermark.js                # 水印绘制工具 🆕
│   │   └── util.js                     # 通用工具
│   ├── styles/
│   │   └── theme.wxss                  # TDesign 主题变量
│   └── miniprogram_npm/
│       └── tdesign-miniprogram/
├── cloudfunctions/
│   ├── login/                          # 登录（改造）
│   ├── register/                       # 注册 🆕
│   ├── changePassword/                 # 修改密码 🆕
│   ├── resetPassword/                  # 重置密码 🆕
│   ├── getDatacenters/                 # 查询列表
│   ├── getDatacenterDetail/            # 查询详情
│   ├── createDatacenter/               # 新建
│   ├── updateDatacenter/               # 更新
│   ├── deleteDatacenter/               # 删除
│   ├── exportExcel/                    # 导出Excel
│   ├── importExcel/                    # 导入Excel（手机端）
│   ├── adminImportExcel/               # 导入Excel（后台版）🆕
│   ├── uploadPhotos/                   # 上传照片
│   ├── getUsers/                       # 获取用户列表 🆕
│   └── updateUserStatus/               # 更新用户状态 🆕
├── SPEC.md                             # 原始规格书
├── SPEC-MVP.md                         # MVP开发计划
├── SPEC-FULL.md                        # 本文件（完整功能规格书）
├── GAP-ANALYSIS.md                     # 差距分析
└── HANDOVER.md                         # 交接文档
```

---

