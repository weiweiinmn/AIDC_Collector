# QClaw 任务：后台管理端独立化（React + Vite）

> 分配方：子房（CEO Agent） | 优先级：P1 | 预计时间：3-4 小时

## 项目信息

- **关联小程序**：AIDC Collector（AI算力机房采集助手）
- **当前后台**：`/Users/willisun/微云同步助手(173695609)/中安赋/miniprogram/aidc-collector/idc-admin.html`（单文件 HTML，纯静态）
- **技术栈建议**：React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **参考文档**：`/Users/willisun/微云同步助手(173695609)/中安赋/miniprogram/aidc-collector/docs/SPEC-FULL.md`（完整功能规格书）

## 背景

当前后台管理端是一个单文件 HTML（idc-admin.html），所有数据是写死的 demo 数据。需要做成独立的 Web 应用，接入微信云开发数据库，实现真正的数据管理。

## 品牌设计规范

| 项目 | 值 |
|------|-----|
| 品牌色（主色） | 深海军蓝 `#1E3A5F` |
| 品牌色（强调色） | 暖铜橙 `#E8843C` |
| 字体 | 系统默认字体栈即可 |
| 风格 | 简洁专业、数据密集型管理后台 |

## 功能需求

### 核心功能（P0，必须实现）

#### 1. 管理员登录
- 手机号 + 密码登录
- 调用云函数 `login` 验证
- 只允许 `role: "admin"` 的用户登录后台

#### 2. 机房数据列表（核心页面）
- **表格展示**：机房名称、所在城市/国家、采集区域（东南亚/日本/欧洲/澳洲）、状态（已签约/洽谈中/已考察/新发现/已排除）、采集人、最后更新时间
- **搜索**：按机房名称、城市模糊搜索
- **筛选**：按状态、区域、采集人筛选
- **分页**：每页 20 条
- **操作**：查看详情、编辑、删除
- **统计条**：页面顶部一行统计数字（总数/已签约/洽谈中/已考察/新发现/已排除），随筛选实时更新

#### 3. 机房详情/编辑
- 弹窗或独立页面，显示/编辑 9 大类 65 个字段
- 字段分组显示（基础信息、机柜资源、电力系统、制冷系统、承重与空间、网络与互联、交付时间、配套服务、成本与报价）
- 保存调用云函数 `updateDatacenter`

#### 4. 数据导入（Excel）
- 点击「导入 Excel」打开弹窗
- **选择归属采集人**（下拉列表，调用 `getUsers` 获取用户列表）
- 上传 .xlsx/.xls 文件
- 调用云函数 `adminImportExcel`（和普通导入的区别是可以指定归属人）
- 显示导入结果（新增 N 条、更新 M 条）

#### 5. 数据导出（Excel）
- 导出当前筛选结果的完整数据
- 调用云函数 `exportExcel`
- 也可导出空白模板

#### 6. 用户管理
- 显示所有注册用户列表（手机号、姓名、角色、状态、注册时间）
- 操作：开通/拒绝/禁用用户
- 调用云函数 `updateUserStatus`

### 次要功能（P1，有余力再做）

#### 7. 操作日志
- 显示最近的操作日志（谁、什么时间、做了什么操作）
- 数据源：`loginLogs` + `importLogs` 集合

#### 8. 密码重置
- 管理员可以给用户重置密码为默认密码 `123456`
- 调用云函数 `resetPassword`

## 技术要求

### 微信云开发 Web SDK 接入

后台是 Web 应用，需要通过微信云开发的 **HTTP API** 或 **Web SDK** 访问云数据库和云函数。

**推荐方案**：使用微信云开发的 **Cloud Base Web SDK**

```bash
npm install @cloudbase/js-sdk
```

初始化：
```js
import cloudbase from '@cloudbase/js-sdk'

const app = cloudbase.init({
  env: '云环境ID',  // 从 TASK-QCLAW-01 获取
  region: 'ap-shanghai'
})

// 登录（Web 端用匿名登录或自定义登录）
await app.auth().anonymousAuthProvider().signIn()
```

**注意**：Web 端调用云函数需要在微信云开发控制台配置「Web 安全域名」。开发阶段可以用 `localhost`。

### 云函数调用

```js
const result = await app.callFunction({
  name: 'getDatacenters',
  data: { page: 1, pageSize: 20, keyword: '', status: '', region: '' }
})
```

### 项目结构建议

```
aidc-admin/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   ├── cloudbase.ts        # 云开发初始化
│   │   ├── api.ts              # 云函数调用封装
│   │   └── constants.ts        # 常量（状态、区域选项等）
│   ├── components/
│   │   ├── Layout.tsx          # 侧边栏布局
│   │   ├── StatBar.tsx         # 统计条
│   │   ├── DatacenterTable.tsx # 机房列表表格
│   │   ├── DatacenterDetail.tsx# 详情弹窗
│   │   ├── ImportModal.tsx     # 导入弹窗
│   │   └── UserTable.tsx       # 用户管理表格
│   ├── pages/
│   │   ├── Login.tsx           # 登录页
│   │   ├── Dashboard.tsx       # 仪表盘（机房列表为主）
│   │   └── Users.tsx           # 用户管理
│   ├── hooks/
│   │   ├── useAuth.ts          # 认证 hook
│   │   └── useDatacenters.ts   # 机房数据 hook
│   └── types/
│       └── index.ts            # TypeScript 类型定义
```

### 页面布局

- **登录页**：居中卡片，手机号+密码+登录按钮
- **主界面**：左侧导航栏（窄，图标+文字）+ 右侧内容区
- **导航项**：
  - 机房列表（默认页，核心）
  - 用户管理
  - 操作日志
  - 退出登录

### 参考现有代码

当前 `idc-admin.html` 中的 demo 数据、表格结构、UI 样式可作为参考。关键信息：
- demo 机房数据 8 条（覆盖4区域×5状态）
- demo 团队成员 6 人
- Excel 导入弹窗（含归属人选择器）
- 统计条（6个统计芯片）

## 验收标准

- [ ] `npm run dev` 能正常启动
- [ ] 登录功能可用（手机号+密码）
- [ ] 机房列表正常显示，搜索/筛选/分页可用
- [ ] 点击可查看/编辑机房详情
- [ ] Excel 导入功能可用（含归属人选择）
- [ ] Excel 导出功能可用
- [ ] 用户管理功能可用（查看列表、开通/禁用）
- [ ] 响应式布局，在不同屏幕尺寸下可用

## 注意事项

1. **云环境 ID**：需要先完成 TASK-QCLAW-01 获取真实的云环境 ID
2. **Web 安全域名**：需要在云开发控制台添加 `localhost` 和最终部署域名
3. **Mock 模式**：开发阶段如果没有真实云环境，建议保留 mock 数据切换开关
4. **不要用 emoji**：UI 中不要使用 emoji 作为图标，使用图标库（推荐 lucide-react）
5. **现有 idc-admin.html**：参考但不要复制代码，用现代 React 方式重写
