# 8. 云函数设计

> 来源：SPEC-FULL.md | 编号：8
> 完整规格书请参考：[SPEC-FULL.md](./SPEC-FULL.md)

---

## 8. 云函数设计

### 8.1 login — 登录

**改造重点**：从微信登录改为手机号+密码登录

- **入参**：`{ phone, password }`
- **逻辑**：
  1. 查询 users 集合，匹配 phone
  2. 用 bcrypt 验证密码
  3. 检查 status
  4. 记录登录日志
  5. 返回用户信息 + token
- **权限**：开放
- **返回**：
  - `success: true, user: { name, role, status, phone, needChangePassword }`
  - `success: false, error: "手机号或密码错误" / "账号待开通" / "账号已停用"`

### 8.2 register — 首次注册/开通

**新增** — 管理员在后台创建用户时调用

- **入参**：`{ phone, name, role, initialPassword }`
- **逻辑**：
  1. 检查手机号是否已注册
  2. bcrypt 加密密码
  3. 创建用户记录，`status: 'pending'`
- **权限**：admin only
- **返回**：`{ success: true, userId }`

### 8.3 changePassword — 修改密码

**新增** — 用户修改自己的密码

- **入参**：`{ oldPassword, newPassword }`
- **逻辑**：
  1. 验证旧密码
  2. 更新为新密码（bcrypt 加密）
  3. 设置 `needChangePassword: false`
- **权限**：已登录用户
- **返回**：`{ success: true }`

### 8.4 resetPassword — 管理员重置密码

**新增** — 管理员重置其他用户的密码

- **入参**：`{ userId, newPassword }`
- **逻辑**：
  1. 验证调用者为 admin
  2. 更新目标用户密码
  3. 设置 `needChangePassword: true`
- **权限**：admin only
- **返回**：`{ success: true }`

### 8.5 getDatacenters — 查询机房列表

- **入参**：`{ page, pageSize, filters, keyword, sortBy, sortOrder }`
- **逻辑**：分页查询，支持区域/国家/城市/状态等多维筛选
- **权限**：approved 用户
- **返回**：`{ list: [], total, page, pageSize }`

### 8.6 getDatacenterDetail — 查询机房详情

- **入参**：`{ id }`
- **逻辑**：查单条 + 最近修改历史
- **权限**：approved 用户

### 8.7 createDatacenter — 新建机房记录

- **入参**：机房基本信息（65个字段 + photos）
- **逻辑**：校验必填项（name, address）→ 写入 datacenters → 返回 id
- **权限**：collector, admin（且 status=approved）

### 8.8 updateDatacenter — 更新机房记录

- **入参**：`{ id, updates }`
- **逻辑**：查旧值 → 写入 editHistory → 更新 datacenters
- **权限**：录入人本人或 admin（且 status=approved）

### 8.9 deleteDatacenter — 删除机房记录

- **入参**：`{ id }`
- **逻辑**：软删除（标记 `_deleted: true`）
- **权限**：admin only

### 8.10 exportExcel — 导出 Excel

- **入参**：`{ type, filters, fields }`
  - `type`: "all" | "filtered" | "template" | "single"
- **逻辑**：
  - 查数据 → 用 exceljs 生成 Excel → 上传云存储 → 返回文件ID
  - template 类型：生成空白模板
  - single 类型：导出单条记录
- **权限**：admin（template 类型所有用户可用）
- **返回**：`{ fileId, fileName }`

### 8.11 importExcel — Excel 导入（手机端）

- **入参**：`{ fileId }`（云存储中的 Excel 文件 ID）
- **逻辑**：
  1. 从云存储下载 Excel
  2. 按字段映射表解析 65 个字段
  3. 逐条写入 datacenters 集合
  4. 自动填入 `importedById`、`importedByName`、`importedAt`
  5. 写入 importLogs 记录
- **冲突处理**：同名机房视为更新，其余视为新增
- **权限**：collector, admin（且 status=approved）
- **返回**：`{ created: N, updated: M, failed: K, errors: [...] }`

### 8.12 adminImportExcel — Excel 导入（后台版）🆕

**新增** — 管理员在后台导入 Excel，支持指定归属人

- **入参**：`{ fileId, assigneeId, conflictStrategy }`
  - `assigneeId`: 归属人用户 ID
  - `conflictStrategy`: "skip" | "overwrite" | "create"
- **逻辑**：
  1. 从云存储下载 Excel
  2. 解析数据
  3. 按 conflictStrategy 处理冲突
  4. 写入 datacenters，标记 importedById/importedByName/importedAt
  5. **归属人标记**：`createdBy`/`createdByName` 设为归属人信息
  6. 写入 importLogs
- **权限**：admin only
- **返回**：`{ created: N, updated: M, failed: K, errors: [...] }`

### 8.13 uploadPhotos — 上传照片

- **入参**：`{ tempFilePaths }`
- **逻辑**：批量上传到云存储 → 返回 fileID 数组
- **权限**：collector, admin（且 status=approved）

### 8.14 getUsers — 获取用户列表 🆕

**新增** — 管理员查看/管理用户

- **入参**：`{ status, role, keyword }`
- **权限**：admin only
- **返回**：用户列表（脱敏手机号）

### 8.15 updateUserStatus — 更新用户状态 🆕

**新增** — 管理员开通/停用用户

- **入参**：`{ userId, status, rejectReason? }`
- **权限**：admin only

---

