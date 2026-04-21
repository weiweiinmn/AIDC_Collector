# QClaw 任务：小程序构建 npm + 云开发初始化

> 分配方：子房（CEO Agent） | 优先级：P0 | 预计时间：30 分钟

## 项目信息

- **项目路径**：`/Users/willisun/微云同步助手(173695609)/中安赋/miniprogram/aidc-collector/`
- **小程序 AppID**：`wx29cb6584fff6c265`
- **技术栈**：微信小程序原生 + TDesign 组件库 + 微信云开发

## 问题现状

小程序在微信开发者工具中打开后**页面白屏**，只有小程序壳子，没有任何内容。

### 根因分析

TDesign npm 包（`tdesign-miniprogram`）已安装在 `miniprogram/node_modules/` 中，但 `miniprogram_npm/` 目录已被删除，未经过微信开发者工具的「构建 npm」步骤，导致所有 `<t-icon>` `<t-tag>` `<t-button>` 等组件无法渲染。

同时，`app.js` 中云开发初始化的 env ID 仍是占位符 `your-env-id`，云函数无法调用。

## 任务清单

### 第一步：构建 npm（解决白屏）

1. 用微信开发者工具打开项目 `/Users/willisun/微云同步助手(173695609)/中安赋/miniprogram/aidc-collector/`
2. 如果遇到 `initProjectByHash` 超时，先**清除缓存**：工具 → 清除缓存 → 全部清除，然后重开
3. 打开项目后，点击菜单栏 **「工具」→「构建 npm」**
4. 等待构建完成，确认 `miniprogram/miniprogram_npm/tdesign-miniprogram/` 目录重新生成
5. 点击**编译**按钮（工具栏上的锤子图标），确认页面正常显示
6. 验证首页能看到统计数字和最近记录列表

**注意**：`project.config.json` 已配置 `packNpmManually: true`，指向 `miniprogram/package.json`，工具应能自动识别。

### 第二步：开通云开发环境

1. 在微信开发者工具中，点击工具栏的**「云开发」**按钮（云朵图标）
2. 如果是第一次使用，按提示**开通云开发**（选择免费基础版即可）
3. 开通后会生成一个**云环境 ID**（格式类似 `cloud1-xxxxx`）
4. 记下这个环境 ID

### 第三步：更新 app.js 中的环境 ID

找到 `miniprogram/app.js`，定位到 `onLaunch()` 方法中的 `wx.cloud.init()`，将 `env: 'your-env-id'` 替换为第二步获取的真实环境 ID。

同时删除 mock 跳过代码（`console.log('[Mock] 跳过云开发初始化'); this.checkLogin(); return;` 这三行）。

### 第四步：部署云函数

1. 在微信开发者工具左侧找到 `cloudfunctions/` 目录（应该有 15 个云函数文件夹）
2. 右键每个云函数文件夹 → **「上传并部署：云端安装依赖」**
3. 需要部署的云函数（共 15 个）：
   - `login`、`register`、`changePassword`、`resetPassword`
   - `getDatacenters`、`getDatacenterDetail`、`createDatacenter`、`updateDatacenter`、`deleteDatacenter`
   - `exportExcel`、`importExcel`、`adminImportExcel`
   - `getUsers`、`updateUserStatus`
4. 每个部署成功后在云开发控制台确认

### 第五步：初始化云数据库集合

在云开发控制台 → 数据库中，创建以下集合：

| 集合名 | 权限 | 说明 |
|--------|------|------|
| `users` | 所有用户可读，仅创建者可读写 | 用户信息 |
| `datacenters` | 所有用户可读，仅创建者可读写 | 机房采集数据 |
| `importLogs` | 管理员可读写 | 导入日志 |
| `loginLogs` | 所有用户可读，仅创建者可写 | 登录日志 |

### 第六步：创建首个管理员账号

使用云开发控制台 → 数据库 → `users` 集合，手动插入一条管理员记录：

```json
{
  "_openid": "（等首次登录后获取）",
  "phone": "18621322945",
  "name": "管理员",
  "password": "（需要加密后存入，先用明文测试）",
  "role": "admin",
  "status": "approved",
  "approvedBy": "system",
  "approvedAt": "2026-04-06T12:00:00.000Z",
  "createdAt": "2026-04-06T12:00:00.000Z"
}
```

**注意**：密码加密逻辑在 `cloudfunctions/login/index.js` 中，先看代码了解加密方式再插入。

### 第七步：关闭 Mock 模式

找到 `miniprogram/utils/api.js`，将 `const MOCK_MODE = true` 改为 `const MOCK_MODE = false`。

然后在 `miniprogram/pages/index/index.js`、`list/list.js`、`detail/detail.js`、`form/basic.js`、`import/import.js` 中，取消 `requireApproved()` 的注释（删除 `// if` 前面的 `//`）。

在 `app.js` 的 `checkLogin()` 方法中，注释掉 mock 用户注入代码。

## 验收标准

- [ ] 小程序首页正常显示统计数字和列表
- [ ] 可以用 18621322945 + 密码登录
- [ ] 云函数调用正常（能获取机房列表、创建记录等）
- [ ] 登录页不再是 mock 直接跳过，而是真正的手机号+密码验证

## 关键注意事项

1. **构建 npm 失败**：确认 `miniprogram/node_modules/tdesign-miniprogram/` 存在，如果不存在则先 `cd miniprogram && npm install`
2. **云函数报错**：检查云函数的 `package.json` 依赖（`exceljs` 等），部署时会自动安装
3. **环境 ID 格式**：确保是完整的云环境 ID，不是简写
4. **备份**：修改 `app.js` 和 `api.js` 前，先备份原文件

## 完成后请输出

1. 云环境 ID（用于后续配置）
2. 各步骤的执行结果（成功/失败）
3. 遇到的问题和解决方案
