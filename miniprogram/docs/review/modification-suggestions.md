# 修改建议

**生成时间**: 2026-04-08  
**关联文档**: product-review.md, issues.md

---

## 一、Dashboard 仪表盘修改建议

### 1.1 重构指标卡片区域

**当前问题**: 显示的是机房状态分布（已签约/洽谈中/已考察/新发现/已排除）

**需求**: 显示核心业务指标（机房总数、客户总数、设备总数、告警数量）

**修改方案**:

```html
<!-- 建议的指标卡片结构 -->
<div class="stats-grid">
  <!-- 机房总数 -->
  <div class="stat-card" data-link="/datacenter">
    <div class="stat-header">
      <div class="stat-icon primary">
        <svg><!-- 机房图标 --></svg>
      </div>
      <div class="stat-trend up">
        <svg><!-- 趋势图标 --></svg>
        +12%
      </div>
    </div>
    <div class="stat-value" data-target="1286">0</div>
    <div class="stat-label">机房总数 <span class="unit">个</span></div>
  </div>

  <!-- 客户总数 -->
  <div class="stat-card" data-link="/customers">
    <div class="stat-header">
      <div class="stat-icon success">
        <svg><!-- 客户图标 --></svg>
      </div>
      <div class="stat-trend up">
        <svg><!-- 趋势图标 --></svg>
        +8%
      </div>
    </div>
    <div class="stat-value" data-target="256">0</div>
    <div class="stat-label">客户总数 <span class="unit">人</span></div>
  </div>

  <!-- 设备总数 -->
  <div class="stat-card" data-link="/devices">
    <div class="stat-header">
      <div class="stat-icon info">
        <svg><!-- 设备图标 --></svg>
      </div>
      <div class="stat-trend up">
        <svg><!-- 趋势图标 --></svg>
        +15%
      </div>
    </div>
    <div class="stat-value" data-target="3580">0</div>
    <div class="stat-label">设备总数 <span class="unit">台</span></div>
  </div>

  <!-- 告警数量 -->
  <div class="stat-card alert-card" data-link="/datacenter?status=warning">
    <div class="stat-header">
      <div class="stat-icon danger">
        <svg><!-- 告警图标 --></svg>
      </div>
      <div class="stat-trend down">
        <svg><!-- 趋势图标 --></svg>
        -5%
      </div>
    </div>
    <div class="stat-value" data-target="12">0</div>
    <div class="stat-label">告警数量 <span class="unit">个</span></div>
  </div>
</div>
```

**CSS 补充**:
```css
/* 告警卡片特殊样式 */
.stat-card.alert-card {
  border: 2px solid var(--danger);
  background-color: rgba(239, 68, 68, 0.05);
}

.stat-card.alert-card .stat-value {
  color: var(--danger);
}

/* 单位样式 */
.stat-label .unit {
  color: var(--text-muted);
  font-size: 12px;
  margin-left: 4px;
}

/* 可点击卡片 */
.stat-card {
  cursor: pointer;
}
```

### 1.2 添加骨架屏效果

```html
<!-- 骨架屏结构 -->
<div class="skeleton-screen" id="skeleton">
  <div class="skeleton-header"></div>
  <div class="skeleton-stats">
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  </div>
</div>
```

```css
.skeleton-screen {
  display: none;
}

.skeleton-screen.active {
  display: block;
}

.skeleton-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  height: 100px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 1.3 添加计数器动画

```javascript
// 数字增长动画
function animateCounter(element, target, duration = 500) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3); // ease-out
    const current = Math.floor(start + (target - start) * easeOut);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// 页面加载时执行
document.querySelectorAll('.stat-value').forEach(el => {
  const target = parseInt(el.dataset.target);
  animateCounter(el, target);
});
```

### 1.4 添加自动刷新功能

```javascript
// 自动刷新（60秒）
let autoRefreshInterval;

function startAutoRefresh() {
  autoRefreshInterval = setInterval(() => {
    refreshData();
  }, 60000);
}

function stopAutoRefresh() {
  clearInterval(autoRefreshInterval);
}

function refreshData() {
  // 显示加载状态
  document.getElementById('skeleton').classList.add('active');
  
  // 模拟 API 请求
  fetch('/api/dashboard/stats')
    .then(res => res.json())
    .then(data => {
      updateStats(data);
      document.getElementById('skeleton').classList.remove('active');
    });
}

// 页面可见性变化时控制刷新
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});
```

---

## 二、机房详情页修改建议

### 2.1 补充完整 HTML 结构

**当前问题**: 文件在第 449 行被截断，缺少主内容区域

**需要补充的内容**:

```html
<!-- 主内容区 -->
<main class="main-content">
  <!-- 顶部状态栏 -->
  <header class="page-header">
    <div class="header-left">
      <a href="/datacenter" class="back-btn">
        <svg><!-- 返回图标 --></svg>
        返回列表
      </a>
      <div class="header-title-group">
        <h1 class="header-title">北京朝阳数据中心</h1>
        <span class="status-tag normal">正常</span>
      </div>
      <div class="header-meta">
        <span>
          <svg><!-- 位置图标 --></svg>
          北京市朝阳区
        </span>
        <span>
          <svg><!-- 时间图标 --></svg>
          更新于 2024-01-15 14:30
        </span>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn btn-outline" id="editBtn">
        <svg><!-- 编辑图标 --></svg>
        编辑
      </button>
      <button class="btn btn-danger hidden" id="deleteBtn">
        <svg><!-- 删除图标 --></svg>
        删除
      </button>
    </div>
  </header>

  <!-- 页面主体 -->
  <div class="page-body">
    <!-- 基本信息卡片 -->
    <section class="section-card">
      <div class="section-card-header">
        <div class="section-card-title">
          <div class="icon primary">
            <svg><!-- 信息图标 --></svg>
          </div>
          基本信息
        </div>
      </div>
      <div class="section-card-body">
        <div class="field-grid view-mode" id="basicInfo">
          <!-- 机房名称 -->
          <div class="field-item">
            <label class="field-label">
              机房名称 <span class="required">*</span>
            </label>
            <div class="field-value">北京朝阳数据中心</div>
            <input type="text" class="field-input" value="北京朝阳数据中心" name="name">
          </div>

          <!-- 机房编码 -->
          <div class="field-item">
            <label class="field-label">
              机房编码 <span class="required">*</span>
            </label>
            <div class="field-value highlight">BJ-CY-001</div>
            <input type="text" class="field-input" value="BJ-CY-001" name="code" readonly>
          </div>

          <!-- 所在城市 -->
          <div class="field-item">
            <label class="field-label">
              所在城市 <span class="required">*</span>
            </label>
            <div class="field-value">北京市</div>
            <select class="field-select" name="city">
              <option value="beijing" selected>北京市</option>
              <option value="shanghai">上海市</option>
              <!-- 其他城市 -->
            </select>
          </div>

          <!-- 详细地址 -->
          <div class="field-item span-2">
            <label class="field-label">
              详细地址 <span class="required">*</span>
            </label>
            <div class="field-value">朝阳区建国路88号</div>
            <input type="text" class="field-input" value="朝阳区建国路88号" name="address">
          </div>

          <!-- 机房面积 -->
          <div class="field-item">
            <label class="field-label">机房面积</label>
            <div class="field-value">
              2000 <span class="unit">平方米</span>
            </div>
            <input type="number" class="field-input" value="2000" name="area">
          </div>

          <!-- 机柜总数 -->
          <div class="field-item">
            <label class="field-label">机柜总数</label>
            <div class="field-value accent-highlight">
              120 <span class="unit">个</span>
            </div>
          </div>

          <!-- 设备总数 -->
          <div class="field-item">
            <label class="field-label">设备总数</label>
            <div class="field-value accent-highlight">
              450 <span class="unit">台</span>
            </div>
          </div>

          <!-- 联系人姓名 -->
          <div class="field-item">
            <label class="field-label">联系人</label>
            <div class="field-value">张三</div>
            <input type="text" class="field-input" value="张三" name="contact_name">
          </div>

          <!-- 联系人电话 -->
          <div class="field-item">
            <label class="field-label">联系电话</label>
            <div class="field-value">13800138000</div>
            <input type="tel" class="field-input" value="13800138000" name="contact_phone">
          </div>

          <!-- 创建时间 -->
          <div class="field-item">
            <label class="field-label">创建时间</label>
            <div class="field-value">2024-01-10 09:00</div>
          </div>

          <!-- 更新时间 -->
          <div class="field-item">
            <label class="field-label">更新时间</label>
            <div class="field-value">2024-01-15 14:30</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 机柜列表卡片 -->
    <section class="section-card">
      <div class="section-card-header">
        <div class="section-card-title">
          <div class="icon accent">
            <svg><!-- 机柜图标 --></svg>
          </div>
          机柜列表
          <span class="badge">共 120 个</span>
        </div>
        <div class="section-card-actions">
          <button class="btn btn-primary btn-sm" id="addRackBtn">
            <svg><!-- 添加图标 --></svg>
            新增机柜
          </button>
        </div>
      </div>
      <div class="section-card-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>机柜编号</th>
              <th>高度(U)</th>
              <th>最大功率</th>
              <th>当前功率</th>
              <th>状态</th>
              <th>设备数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A-01</td>
              <td>42U</td>
              <td>10 kW</td>
              <td>6.5 kW</td>
              <td><span class="status-badge available">可用</span></td>
              <td>8 台</td>
              <td>
                <button class="action-link">查看</button>
              </td>
            </tr>
            <!-- 更多机柜行 -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- 设备列表卡片 -->
    <section class="section-card">
      <div class="section-card-header">
        <div class="section-card-title">
          <div class="icon info">
            <svg><!-- 设备图标 --></svg>
          </div>
          设备列表
          <span class="badge">共 450 台</span>
        </div>
      </div>
      <div class="section-card-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>设备名称</th>
              <th>设备类型</th>
              <th>机柜位置</th>
              <th>U位</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <!-- 设备列表数据 -->
          </tbody>
        </table>
        <!-- 分页组件 -->
        <div class="pagination">
          <!-- 分页按钮 -->
        </div>
      </div>
    </section>

    <!-- 操作记录 -->
    <section class="history-section">
      <div class="history-header">
        <div class="history-title">
          <svg><!-- 历史图标 --></svg>
          操作记录
        </div>
        <a href="/operation-logs?datacenter=xxx" class="btn btn-ghost btn-sm">
          查看全部
        </a>
      </div>
      <div class="history-list">
        <div class="history-item">
          <div class="history-avatar">李</div>
          <div class="history-content">
            <div class="history-meta">
              <span class="history-user">李四</span>
              <span class="history-time">2024-01-15 14:30</span>
            </div>
            <div class="history-change">
              修改了 <span class="field-name">联系人电话</span>：
              <span class="old-val">13800138001</span> →
              <span class="new-val">13800138000</span>
            </div>
          </div>
        </div>
        <!-- 更多历史记录 -->
      </div>
    </section>
  </div>
</main>

<!-- Toast 提示 -->
<div class="toast" id="toast">
  <svg><!-- 成功图标 --></svg>
  <span class="toast-message">操作成功</span>
</div>

<script>
// 编辑模式切换
const editBtn = document.getElementById('editBtn');
const basicInfo = document.getElementById('basicInfo');
let isEditing = false;

editBtn.addEventListener('click', () => {
  isEditing = !isEditing;
  if (isEditing) {
    basicInfo.classList.remove('view-mode');
    basicInfo.classList.add('edit-mode');
    editBtn.innerHTML = '<svg></svg> 保存';
  } else {
    // 保存逻辑
    saveData();
    basicInfo.classList.remove('edit-mode');
    basicInfo.classList.add('view-mode');
    editBtn.innerHTML = '<svg></svg> 编辑';
  }
});

// 权限控制
const userRole = 'admin'; // 从登录状态获取
if (userRole === 'viewer') {
  editBtn.classList.add('hidden');
  document.getElementById('deleteBtn').classList.add('hidden');
  document.getElementById('addRackBtn').classList.add('hidden');
} else if (userRole === 'manager') {
  document.getElementById('deleteBtn').classList.add('hidden');
}

// 删除前校验
const deleteBtn = document.getElementById('deleteBtn');
deleteBtn.addEventListener('click', () => {
  const deviceCount = 450;
  if (deviceCount > 0) {
    alert(`该机房下存在 ${deviceCount} 台设备，请先移除后再删除`);
    return;
  }
  if (confirm('确定要删除该机房吗？此操作不可恢复。')) {
    // 执行删除
  }
});
</script>
</body>
</html>
```

### 2.2 添加机柜状态样式

```css
/* 机柜状态标签 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.available {
  background: var(--success-bg);
  color: var(--success);
}
.status-badge.available::before {
  background: var(--success);
}

.status-badge.full {
  background: var(--warning-bg);
  color: var(--warning);
}
.status-badge.full::before {
  background: var(--warning);
}

.status-badge.offline {
  background: var(--danger-bg);
  color: var(--danger);
}
.status-badge.offline::before {
  background: var(--danger);
}
```

---

## 三、登录页创建建议

### 3.1 基础登录页结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - AIDC Collector</title>
  <style>
    /* 登录页专用样式 */
    :root {
      --primary: #1E3A5F;
      --primary-light: #2C5282;
      --accent: #E8843C;
      --bg: #F4F6F9;
      --card: #FFFFFF;
      --border: #E5E7EB;
      --text: #111827;
      --text-secondary: #6B7280;
      --danger: #DC2626;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      padding: 20px;
    }

    .login-card {
      background: var(--card);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 16px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
    }

    .login-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 8px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }

    .form-input.error {
      border-color: var(--danger);
    }

    .error-message {
      font-size: 12px;
      color: var(--danger);
      margin-top: 4px;
      display: none;
    }

    .error-message.show {
      display: block;
    }

    .login-btn {
      width: 100%;
      height: 44px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .login-btn:hover {
      background: var(--primary-light);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      font-size: 13px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .forgot-password {
      color: var(--primary);
      text-decoration: none;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <line x1="2" y1="9" x2="22" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        </div>
        <h1 class="login-title">AIDC Collector</h1>
        <p class="login-subtitle">数据中心资产管理系统</p>
      </div>

      <form id="loginForm">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input type="text" class="form-input" id="username" placeholder="请输入用户名" required>
          <span class="error-message" id="usernameError">请输入用户名</span>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input type="password" class="form-input" id="password" placeholder="请输入密码" required>
          <span class="error-message" id="passwordError">请输入密码</span>
        </div>

        <button type="submit" class="login-btn" id="loginBtn">登录</button>

        <div class="login-options">
          <label class="remember-me">
            <input type="checkbox" id="rememberMe">
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>
      </form>
    </div>
  </div>

  <script>
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      // 表单验证
      let hasError = false;

      if (!username) {
        document.getElementById('username').classList.add('error');
        document.getElementById('usernameError').classList.add('show');
        hasError = true;
      } else {
        document.getElementById('username').classList.remove('error');
        document.getElementById('usernameError').classList.remove('show');
      }

      if (!password) {
        document.getElementById('password').classList.add('error');
        document.getElementById('passwordError').classList.add('show');
        hasError = true;
      } else {
        document.getElementById('password').classList.remove('error');
        document.getElementById('passwordError').classList.remove('show');
      }

      if (hasError) return;

      // 登录请求
      loginBtn.disabled = true;
      loginBtn.textContent = '登录中...';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
          // 保存登录状态
          if (document.getElementById('rememberMe').checked) {
            localStorage.setItem('token', data.token);
          } else {
            sessionStorage.setItem('token', data.token);
          }
          // 跳转到仪表盘
          window.location.href = '/dashboard';
        } else {
          alert(data.message || '登录失败');
        }
      } catch (error) {
        alert('网络错误，请稍后重试');
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
      }
    });
  </script>
</body>
</html>
```

---

## 四、通用改进建议

### 4.1 添加全局权限控制工具

```javascript
// auth.js - 权限控制工具
const Auth = {
  // 获取当前用户角色
  getRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'viewer';
  },

  // 检查是否有权限
  hasPermission(permission) {
    const role = this.getRole();
    const permissions = {
      admin: ['view', 'edit', 'delete', 'create'],
      manager: ['view', 'edit', 'create'],
      viewer: ['view']
    };
    return permissions[role]?.includes(permission) || false;
  },

  // 根据权限显示/隐藏元素
  applyPermissions() {
    const role = this.getRole();

    // 隐藏编辑按钮
    if (!this.hasPermission('edit')) {
      document.querySelectorAll('[data-perm="edit"]').forEach(el => {
        el.classList.add('hidden');
      });
    }

    // 隐藏删除按钮
    if (!this.hasPermission('delete')) {
      document.querySelectorAll('[data-perm="delete"]').forEach(el => {
        el.classList.add('hidden');
      });
    }

    // 隐藏创建按钮
    if (!this.hasPermission('create')) {
      document.querySelectorAll('[data-perm="create"]').forEach(el => {
        el.classList.add('hidden');
      });
    }
  }
};

// 页面加载时应用权限
document.addEventListener('DOMContentLoaded', () => {
  Auth.applyPermissions();
});
```

### 4.2 添加 API 请求封装

```javascript
// api.js - API 请求封装
const API = {
  baseURL: '/api',

  async request(url, options = {}) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${this.baseURL}${url}`, config);

    if (response.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/login';
      return;
    }

    return response.json();
  },

  // Dashboard 相关
  dashboard: {
    getStats() {
      return API.request('/dashboard/stats');
    }
  },

  // 机房相关
  datacenter: {
    getList(params) {
      const query = new URLSearchParams(params).toString();
      return API.request(`/datacenter?${query}`);
    },
    getDetail(id) {
      return API.request(`/datacenter/${id}`);
    },
    update(id, data) {
      return API.request(`/datacenter/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete(id) {
      return API.request(`/datacenter/${id}`, {
        method: 'DELETE'
      });
    }
  }
};
```

---

## 五、文件修改清单

| 文件 | 修改类型 | 修改内容 |
|-----|---------|---------|
| dashboard-v2.html | 修改 | 重构指标卡片为 4 个核心业务指标 |
| dashboard-v2.html | 添加 | 骨架屏、计数器动画、自动刷新 |
| datacenter-detail-v2.html | 修复 | 补充完整 HTML 结构 |
| datacenter-detail-v2.html | 添加 | 机房信息、机柜列表、设备列表、操作记录 |
| login-v2.html | 创建 | 新建登录页面 |
| - | 创建 | auth.js 权限控制工具 |
| - | 创建 | api.js API 请求封装 |

---

**建议优先级**:
1. 🔴 高: 修复 datacenter-detail-v2.html 文件截断
2. 🔴 高: 创建 login-v2.html
3. 🟡 中: 重构 dashboard 指标卡片
4. 🟢 低: 添加交互效果和权限控制
