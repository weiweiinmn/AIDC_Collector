# 表格组件规范

## 1. 文档信息

- **所属系统**：AIDC Collector 管理后台
- **组件名称**：DataTable（数据表格）
- **规范级别**：强制
- **相关文档**：
  - [PRODUCT-STRUCTURE.md](./PRODUCT-STRUCTURE.md) — 整体架构
  - [COMPONENT-sidebar.md](./COMPONENT-sidebar.md) — 左边栏组件
  - [COMPONENT-form.md](./COMPONENT-form.md) — 表单组件

---

## 2. 组件结构

```
<div class="data-table">
  <!-- 工具栏 -->
  <div class="table-toolbar">
    <div class="toolbar-left">
      <h3 class="table-title">机房列表</h3>
    </div>
    <div class="toolbar-right">
      <input class="search-input" placeholder="搜索..." />
      <button class="btn-filter">筛选</button>
      <button class="btn-add">新建</button>
    </div>
  </div>

  <!-- 表格主体 -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th class="checkbox-col"><input type="checkbox" /></th>
          <th>机房名称 <i class="sort-icon">↕</i></th>
          <th>所在城市 <i class="sort-icon">↕</i></th>
          <th>机柜数量</th>
          <th>状态</th>
          <th>最后更新</th>
          <th class="action-col">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="checkbox" /></td>
          <td>北京亦庄机房</td>
          <td>北京市</td>
          <td>500</td>
          <td><span class="badge badge-success">正常</span></td>
          <td>2026-04-08 10:30</td>
          <td>
            <button class="btn-link">查看</button>
            <button class="btn-link">编辑</button>
            <button class="btn-link btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 分页 -->
  <div class="table-pagination">
    <span class="pagination-info">共 128 条记录，第 1/7 页</span>
    <div class="pagination-controls">
      <button disabled>首页</button>
      <button disabled>上一页</button>
      <span class="page-number active">1</span>
      <span class="page-number">2</span>
      <span class="page-number">3</span>
      <button>下一页</button>
      <button>末页</button>
    </div>
    <select class="page-size-select">
      <option>10 条/页</option>
      <option selected>20 条/页</option>
      <option>50 条/页</option>
      <option>100 条/页</option>
    </select>
  </div>
</div>
```

---

## 3. 列配置

### 3.1 列类型

| 类型 | 说明 | 渲染方式 |
|------|------|----------|
| text | 普通文本 | 直接显示 |
| number | 数字 | 右对齐，千分位格式化 |
| date | 日期 | 格式：YYYY-MM-DD HH:mm |
| badge | 状态标签 | 彩色徽章 |
| link | 可点击链接 | 跳转或弹窗 |
| action | 操作按钮 | 按钮组 |
| checkbox | 多选框 | 全选/单选 |
| expand | 行展开 | 展开详情 |
| image | 图片 | 缩略图（48×48） |

### 3.2 可排序列

- 支持升序/降序切换
- 排序图标：↕（默认）↑（升序）↓（降序）
- 默认排序列在文档中明确说明

---

## 4. 样式规范

### 4.1 尺寸

| 属性 | 值 |
|------|-----|
| 表头高度 | 44px |
| 行高 | 52px |
| 单元格内边距 | 12px 16px |
| 工具栏高度 | 56px |
| 分页高度 | 52px |

### 4.2 颜色

| 元素 | 值 |
|------|---|
| 表头背景 | #F9FAFB |
| 表头文字 | #6B7280 |
| 行悬停背景 | #F9FAFB |
| 斑马纹（可选） | #FFFFFF / #F9FAFB |
| 边框色 | #E5E7EB |
| 表头文字字重 | 600 |

### 4.3 状态徽章

| 状态 | 背景色 | 文字色 |
|------|--------|--------|
| 正常/启用 | #D1FAE5 | #065F46 |
| 禁用/停用 | #F3F4F6 | #6B7280 |
| 告警/异常 | #FEE2E2 | #991B1B |
| 进行中 | #DBEAFE | #1E40AF |
| 待审核 | #FEF3C7 | #92400E |

---

## 5. 交互规范

### 5.1 排序

- 点击列头触发排序（仅支持单列排序）
- 服务器端排序，触发时重新请求数据
- 排序参数：`sort=field_name&order=asc|desc`

### 5.2 筛选

- 工具栏筛选器：下拉多选 + 关键字搜索
- 列内筛选：点击表头筛选图标展开筛选面板
- 筛选条件显示在表格上方标签栏，可单个清除或全部重置

### 5.3 分页

- 默认页大小：20
- 切换页码时保持筛选/排序条件
- 跳页输入框：支持直接输入页码跳转

### 5.4 行操作

- 查看/编辑：跳转到详情页（路由参数传递 ID）
- 删除：二次确认弹窗（标题「确认删除？」，正文描述性文案）
- 操作按钮过多时，显示「更多」下拉菜单

### 5.5 复选框

- 全选：选中当前页所有行
- indeterminate 状态：半选（部分选中）
- 批量操作栏：当选中 >0 行时，顶部出现批量操作工具栏

### 5.6 行悬停

- 悬停整行高亮（背景色 #F9FAFB）
- 操作列按钮平时隐藏，悬停时显示（可选渐进显示）

---

## 6. 空状态

当无数据时，显示：
- 插图（数据中心/列表相关的简约 SVG）
- 主文案：「暂无数据」
- 副文案（可选）：「试试调整筛选条件」或操作引导按钮

---

## 7. 加载状态

- 首次加载：骨架屏（Skeleton），占满表格区域
- 刷新/翻页：表格区域显示半透明遮罩 + 居中 loading 动画
- 请求超时：显示错误提示 + 重试按钮

---

## 8. 验收标准

1. ✅ 表头固定（sticky），滚动时不出视线
2. ✅ 列宽可拖拽调整（可选）
3. ✅ 支持导出当前页/全部数据（见 PAGE-export.md）
4. ✅ 响应式：列过多时支持水平滚动
5. ✅ 打印友好：隐藏操作列，展开所有列
6. ✅ 无障碍：表格含 `scope="col"`、caption 或 aria-label
