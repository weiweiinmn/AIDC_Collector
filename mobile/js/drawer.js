/**
 * Drawer — 抽屉菜单统一管理
 * 
 * 设计原则：
 * 1. 每个页面加载时抽屉必须关闭
 * 2. 点击菜单项 → 关闭抽屉 → 跳转页面（新页面加载时抽屉必然关闭）
 * 3. 点击遮罩 → 关闭抽屉（留在当前页）
 * 4. 不存在"切换页面后抽屉保持打开"的情况
 */
var Drawer = (function() {
  var _open = false;

  function syncDOM() {
    var el = document.getElementById('drawerOverlay');
    if (!el) return;
    if (_open) {
      el.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      el.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  return {
    /** 切换抽屉（保留，主要给菜单按钮用） */
    toggle: function() {
      _open = !_open;
      syncDOM();
    },

    /** 打开抽屉 */
    open: function() {
      _open = true;
      syncDOM();
    },

    /** 关闭抽屉 */
    close: function() {
      _open = false;
      syncDOM();
    },

    /**
     * 页面初始化时必须调用此方法，确保抽屉关闭。
     * 同时初始化用户信息（如果页面上有对应 DOM）。
     */
    init: function() {
      _open = false;
      syncDOM();
    },

    /**
     * 带导航的关闭：关闭抽屉后跳转到目标页面。
     * 新页面加载时会再次调用 init()，抽屉必然关闭。
     */
    goTab: function(url) {
      window.location.href = url;
    },

    nav: function(url) {
      _open = false;
      syncDOM();
      // 等抽屉动画完全关闭后再跳转
      setTimeout(function() {
        window.location.href = url;
      }, 150);
    }
  };
})();
