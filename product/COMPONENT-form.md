# 表单组件规范

## 1. 文档信息

- **所属系统**：AIDC Collector 管理后台
- **组件名称**：Form（表单）
- **规范级别**：强制
- **相关文档**：
  - [PRODUCT-STRUCTURE.md](./PRODUCT-STRUCTURE.md) — 整体架构
  - [COMPONENT-sidebar.md](./COMPONENT-sidebar.md) — 左边栏组件
  - [COMPONENT-table.md](./COMPONENT-table.md) — 表格组件

---

## 2. 表单结构

```
<form class="data-form">
  <!-- 基本信息 -->
  <div class="form-section">
    <h4 class="form-section-title">基本信息</h4>

    <!-- 单行文本 -->
    <div class="form-group">
      <label class="form-label required">机房名称</label>
      <input
        type="text"
        class="form-input"
        placeholder="请输入机房名称"
        v-model="form.name"
      />
      <span class="form-hint">不超过50个字符</span>
      <span class="form-error">请输入机房名称</span>
    </div>

    <!-- 下拉选择 -->
    <div class="form-group">
      <label class="form-label required">所在城市</label>
      <select class="form-select">
        <option value="">请选择城市</option>
        <option value="beijing">北京市</option>
        <option value="shanghai">上海市</option>
      </select>
    </div>

    <!-- 多行文本 -->
    <div class="form-group">
      <label class="form-label">备注</label>
      <textarea
        class="form-textarea"
        rows="4"
        placeholder="请输入备注信息"
      ></textarea>
    </div>

    <!-- 开关 -->
    <div class="form-group">
      <label class="form-label">启用状态</label>
      <label class="switch">
        <input type="checkbox" checked />
        <span class="switch-slider"></span>
      </label>
    </div>

    <!-- 日期选择 -->
    <div class="form-group">
      <label class="form-label">创建日期</label>
      <input type="date" class="form-input" />
    </div>

    <!-- 文件上传 -->
    <div class="form-group">
      <label class="form-label">资质文件</label>
      <div class="upload-area">
        <input type="file" class="upload-input" />
        <span class="upload-hint">支持 JPG、PNG、PDF，单个文件不超过 10MB</span>
      </div>
    </div>
  </div>

  <!-- 提交按钮 -->
  <div class="form-actions">
    <button type="button" class="btn btn-secondary">取消</button>
    <button type="submit" class="btn btn-primary">保存</button>
  </div>
</form>
```

---

## 3. 字段类型

| 类型 | 组件 | 说明 |
|------|------|------|
| text | input[type=text] | 单行文本 |
| textarea | textarea | 多行文本 |
| number | input[type=number] | 数字输入 |
| email | input[type=email] | 邮箱 |
| phone | input[type=tel] | 手机/电话，带格式校验 |
| password | input[type=password] | 密码，显示切换按钮 |
| select | select / custom-select | 下拉单选 |
| multi-select | multi-select | 下拉多选（标签形式） |
| radio | radio-group | 单选按钮组 |
| checkbox | checkbox-group | 多选按钮组 |
| switch | toggle-switch | 开关 |
| date | date-picker | 日期选择 |
| datetime | datetime-picker | 日期时间选择 |
| date-range | date-range-picker | 日期范围 |
| file | upload | 文件上传 |
| image | image-upload | 图片上传（支持预览） |
| cascader | cascader-select | 级联选择 |
| rich-text | rich-text-editor | 富文本编辑器 |

---

## 4. 字段规则

### 4.1 必填校验

- 必填字段标签后加红色星号 `*`
- 标签样式 `.form-label.required::after { content: '*'; color: #EF4444; margin-left: 2px; }`

### 4.2 校验时机

| 时机 | 行为 |
|------|------|
| 失焦时（blur） | 触发单字段校验，显示错误信息 |
| 提交时 | 触发全表单校验，滚动到第一个错误处 |
| 值变化后 | 清除该字段错误状态 |

### 4.3 常见校验规则

| 规则 | 实现方式 | 错误提示示例 |
|------|----------|--------------|
| 必填 | required | 此项为必填项 |
| 最小/最大长度 | minlength / maxlength | 长度不能少于 X 个字符 |
| 邮箱格式 | pattern 或内置 validator | 请输入有效的邮箱地址 |
| 手机号 | 11位数字，1开头 | 请输入有效的手机号 |
| URL | URL 格式校验 | 请输入有效的网址 |
| 数字范围 | min / max | 数值必须在 X ~ Y 之间 |
| 自定义正则 | pattern | 格式不正确 |

---

## 5. 样式规范

### 5.1 尺寸

| 属性 | 值 |
|------|-----|
| 标签宽度 | 120px（固定） |
| 输入框宽度 | flex: 1（占满剩余空间） |
| 表单组间距 | 24px |
| 内边距 | 12px 16px |
| 圆角 | 6px |

### 5.2 颜色

| 元素 | 默认色 | 聚焦色 | 错误色 | 禁用色 |
|------|--------|--------|--------|--------|
| 边框 | #D1D5DB | #2563EB | #EF4444 | #E5E7EB |
| 背景 | #FFFFFF | #FFFFFF | #FFFFFF | #F9FAFB |
| 文字 | #111827 | #111827 | #EF4444 | #9CA3AF |
| 标签 | #374151 | — | #EF4444 | #9CA3AF |

### 5.3 辅助文本

| 类型 | 样式 | 用途 |
|------|------|------|
| hint | 灰色小字，12px | 填写说明/限制条件 |
| error | 红色小字，12px | 错误提示 |
| success | 绿色小字，12px | 校验通过提示 |

---

## 6. 布局模式

### 6.1 常规布局

```
标签（120px）| 输入区域（flex: 1）| 辅助文本
```

### 6.2 分组布局

- 表单分为多个 section（`.form-section`）
- section 之间用标题 `.form-section-title` 分隔
- section 可折叠/展开（可选）

### 6.3 网格布局

- 大型表单支持多列网格（2列、3列）
- 每行字段数量随屏幕宽度递减
- 移动端强制单列

---

## 7. 提交行为

### 7.1 按钮状态

| 状态 | 行为 |
|------|------|
| 默认 | 可点击 |
| 提交中 | 显示 loading，禁用点击 |
| 失败 | 恢复可点击，Toast 提示错误 |

### 7.2 提交后

- 成功：关闭弹窗/跳转列表，Toast 提示「保存成功」
- 失败：停留在当前页，滚动到第一个错误字段
- 部分保存（如草稿）：提示保存状态

---

## 8. 验收标准

1. ✅ 所有表单使用统一组件，支持配置化生成
2. ✅ 必填项清晰标识（星号 + label）
3. ✅ 实时校验 + 提交前全量校验
4. ✅ 错误信息描述清晰（非「字段错误」）
5. ✅ 提交中按钮防重复点击
6. ✅ 支持键盘操作（Tab 切换、Enter 提交）
7. ✅ 移动端表单适配（放大镜弹出、日期选择器等）
