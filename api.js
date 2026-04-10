/**
 * AIDC Collector — 统一数据层 API
 * 结构与微信云函数完全对齐，底层换真实接口即可。
 * 用法：window.AIDC_API.getDatacenters({ keyword: 'xxx', status: 'new' })
 */
(function () {
  'use strict';

  // ── localStorage 键名 ───────────────────────────────────────────────────────
  var K = {
    user:       'aidc_user',
    datacenters: 'aidc_datacenters',
    customers:  'aidc_customers',
    users:      'aidc_users',
    loginLogs:  'aidc_loginLogs',
    changelogs: 'aidc_changelogs',
  };

  function uid()  { return 'u' + Date.now(); }
  function now()  { return new Date().toISOString(); }

  // ── 变更记录 ─────────────────────────────────────────────────────────────
  function addChangelog(dcId, dcName, type, content, operatorName) {
    var logs = JSON.parse(localStorage.getItem(K.changelogs) || '[]');
    var u = null;
    try { u = JSON.parse(localStorage.getItem(K.user)); } catch(e) {}
    logs.unshift({
      id:           'cl' + Date.now(),
      dcId:         dcId,
      dcName:       dcName,
      type:         type,
      content:      content,
      operatorName: operatorName || (u ? u.name : '未知'),
      operatorId:   u ? u.id : '',
      createdAt:    now()
    });
    localStorage.setItem(K.changelogs, JSON.stringify(logs));
  }

  function getChangelogs(dcId) {
    return JSON.parse(localStorage.getItem(K.changelogs) || '[]').filter(function(c) {
      return c.dcId === dcId;
    });
  }

  // ── 模拟用户种子 ──────────────────────────────────────────────────────────
  function seedUsers() {
    var raw = localStorage.getItem(K.users);
    if (raw && JSON.parse(raw).length > 0) return;
    var seed = [
      { id: 'u001', name: '管理员', username: 'admin',    phone: '13800000001', role: 'admin',   status: 'active',   createdAt: now() },
      { id: 'u002', name: '张三',   username: 'zhangsan', phone: '13800000002', role: 'editor',  status: 'active',   createdAt: now() },
      { id: 'u003', name: '李四',   username: 'lisi',     phone: '13800000003', role: 'editor',  status: 'disabled', createdAt: now() },
    ];
    localStorage.setItem(K.users, JSON.stringify(seed));
  }

  // ── 模拟机房种子 ──────────────────────────────────────────────────────────
  function seedDatacenters() {
    var raw = localStorage.getItem(K.datacenters);
    if (raw && JSON.parse(raw).length > 0) return;
    var seed = [
      { id: 'dc001', name: 'etix Bangkok #1',   country: '中国', province: '上海', city: '上海', address: '上海市浦东新区',    status: 'collected',  customer: 'etix',    rackCount: 1200, powerPerRack: 8,  pue: 1.35, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*5).toISOString(), updatedAt: now() },
      { id: 'dc002', name: 'STT Bangkok 1',     country: '泰国', province: '曼谷', city: '曼谷', address: 'Bang Khen, Bangkok', status: 'new',        customer: 'STT',     rackCount: 800,  powerPerRack: 10, pue: 1.42, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: now() },
      { id: 'dc003', name: 'GPB Jakarta 1',     country: '印尼', province: '雅加达', city: '雅加达', address: 'Jakarta Barat',    status: 'collected',  customer: 'GPB',     rackCount: 600,  powerPerRack: 6,  pue: 1.5,  createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000).toISOString(),   updatedAt: now() },
      { id: 'dc004', name: 'Supernap Bangkok',  country: '泰国', province: '曼谷', city: '曼谷', address: 'Suvarnabhumi, Bangkok', status: 'negotiating', customer: 'Supernap', rackCount: 2000, powerPerRack: 15, pue: 1.38, createdBy: 'u001', createdByName: '管理员', createdAt: now(), updatedAt: now() },
      { id: 'dc005', name: 'AirTrunk SYD1',    country: '澳大利亚', province: '新南威尔士', city: '悉尼', address: 'Sydney, NSW',  status: 'signed',     customer: 'AirTrunk', rackCount: 3000, powerPerRack: 12, pue: 1.3,  createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: now() },
    ];
    // 给 dc001 dc002 dc003 加变更记录
    addChangelog('dc001', 'etix Bangkok #1', 'create', '新增机房 [etix Bangkok #1]', '管理员');
    addChangelog('dc002', 'STT Bangkok 1',   'create', '新增机房 [STT Bangkok 1]',   '管理员');
    addChangelog('dc003', 'GPB Jakarta 1',   'create', '新增机房 [GPB Jakarta 1]',   '张三');
    addChangelog('dc001', 'etix Bangkok #1', 'update', '更新字段：status、customer', '管理员');
    addChangelog('dc005', 'AirTrunk SYD1',   'status', '状态变更为：已签约', '管理员');
    localStorage.setItem(K.datacenters, JSON.stringify(seed));
  }

  // ── 模拟客户种子 ──────────────────────────────────────────────────────────
  function seedCustomers() {
    var raw = localStorage.getItem(K.customers);
    if (raw && JSON.parse(raw).length > 0) return;
    var seed = [
      { id: 'c001', name: 'etix',    fullName: 'etix Data Centers',       industry: 'IDC',       contact: 'contact@etixgroup.com', status: 'active', remark: '全球托管型', createdAt: now() },
      { id: 'c002', name: 'STT',     fullName: 'STT GDC Thailand',         industry: 'IDC',       contact: 'thailand@sttgdc.com',   status: 'active', remark: '新加坡背景', createdAt: now() },
      { id: 'c003', name: 'GPB',     fullName: 'GPB Indonesia',             industry: 'IDC',       contact: 'info@gpb.id',           status: 'active', remark: '',           createdAt: now() },
      { id: 'c004', name: 'Supernap',fullName: 'Supernap Thailand',         industry: 'IDC',       contact: 'bangkok@supernap.com',  status: 'active', remark: 'TCC集团',     createdAt: now() },
      { id: 'c005', name: 'AirTrunk',fullName: 'AirTrunk Australia',        industry: 'Hyperscale',contact: 'apac@airtrunk.com',    status: 'active', remark: '超大规模',   createdAt: now() },
    ];
    localStorage.setItem(K.customers, JSON.stringify(seed));
  }

  // 初始化
  seedUsers();
  seedDatacenters();
  seedCustomers();

  // ── 统一响应 ─────────────────────────────────────────────────────────────
  function ok(data)    { return { code: 0, data: data }; }
  function err(msg)    { return { code: 1, message: msg }; }

  // ── API ──────────────────────────────────────────────────────────────────
  window.AIDC_API = {

    // ══ 登录/用户 ════════════════════════════════════════════════════════
    login: function(username, password) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          var users = JSON.parse(localStorage.getItem(K.users) || '[]');
          var user  = users.find(function(u) { return u.username === username; });
          if (!user)                           { resolve(err('用户名不存在'));  return; }
          if (user.password && user.password !== password) { resolve(err('密码错误')); return; }
          if (user.status === 'disabled')      { resolve(err('账号已被停用，请联系管理员')); return; }
          user.lastLoginAt = now();
          localStorage.setItem(K.users, JSON.stringify(users));
          var u2 = Object.assign({}, user);
          delete u2.password;
          localStorage.setItem(K.user, JSON.stringify(u2));
          resolve(ok(u2));
        }, 300);
      });
    },

    logout: function() {
      localStorage.removeItem(K.user);
      window.location.href = '../index.html';
    },

    getUser: function() {
      try { return JSON.parse(localStorage.getItem(K.user)); } catch(e) { return null; }
    },

    // ══ 机房 CRUD ════════════════════════════════════════════════════════
    getDatacenters: function(params) {
      params   = params   || {};
      var page     = params.page     || 1;
      var pageSize = params.pageSize || 20;
      var keyword  = params.keyword  || '';
      var status   = params.status   || '';
      var country  = params.country  || '';
      var kyc      = params.kyc      || '';

      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      if (keyword) {
        var kw = keyword.toLowerCase();
        list = list.filter(function(d) {
          return (d.name||'').toLowerCase().includes(kw) ||
                 (d.address||'').toLowerCase().includes(kw) ||
                 (d.customer||'').toLowerCase().includes(kw);
        });
      }
      if (status)  list = list.filter(function(d){ return d.status  === status;  });
      if (country) list = list.filter(function(d){ return d.country === country; });
      if (kyc)     list = list.filter(function(d){ return d.kycStatus === kyc;    });

      var total     = list.length;
      var start     = (page - 1) * pageSize;
      var paged     = list.slice(start, start + pageSize);
      var today     = new Date().toDateString();
      var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

      return ok({
        list:       paged,
        total:      total,
        todayCount: list.filter(function(d){ return new Date(d.createdAt).toDateString() === today;     }).length,
        monthCount: list.filter(function(d){ return new Date(d.createdAt) >= monthStart;                }).length,
        myCount:    list.filter(function(d){ return d.createdBy === (this.getUser()||{}).id; }, this).length,
      });
    },

    createDatacenter: function(data) {
      var user   = this.getUser();
      var record = Object.assign({
        id:             'dc' + Date.now(),
        status:         'new',
        createdBy:      user ? user.id : 'u001',
        createdByName:  user ? user.name : '管理员',
        createdAt:      now(),
        updatedAt:      now(),
      }, data);
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      list.unshift(record);
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      addChangelog(record.id, record.name, 'create',
          '新增机房 [' + (record.name||'') + ']',
          user ? user.name : '管理员');
      return ok(record);
    },

    updateDatacenter: function(id, data) {
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      var idx  = list.findIndex(function(d){ return d.id === id; });
      if (idx === -1) return err('记录不存在');
      var oldRecord = list[idx];
      var changedFields = [];
      Object.keys(data).forEach(function(key) {
        if (oldRecord[key] !== data[key]) changedFields.push(key);
      });
      list[idx] = Object.assign({}, oldRecord, data, { updatedAt: now() });
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      var user = this.getUser();
      if (changedFields.length > 0) {
        addChangelog(list[idx].id, list[idx].name, 'update',
            '更新字段：' + changedFields.join('、'),
            user ? user.name : '未知');
      }
      return ok(list[idx]);
    },

    deleteDatacenter: function(id) {
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]').filter(function(d){ return d.id !== id; });
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      return ok({});
    },

    // 变更记录
    getDatacenterChangelogs: function(dcId) {
      return ok(getChangelogs(dcId));
    },

    // ══ 客户 ══════════════════════════════════════════════════════════════
    getCustomers: function() {
      return ok(JSON.parse(localStorage.getItem(K.customers) || '[]'));
    },

    createCustomer: function(data) {
      var record = Object.assign({ id: 'c' + Date.now(), status: 'active', createdAt: now() }, data);
      var list   = JSON.parse(localStorage.getItem(K.customers) || '[]');
      list.push(record);
      localStorage.setItem(K.customers, JSON.stringify(list));
      return ok(record);
    },

    updateCustomer: function(id, data) {
      var list = JSON.parse(localStorage.getItem(K.customers) || '[]');
      var idx  = list.findIndex(function(c){ return c.id === id; });
      if (idx === -1) return err('客户不存在');
      list[idx] = Object.assign({}, list[idx], data);
      localStorage.setItem(K.customers, JSON.stringify(list));
      return ok(list[idx]);
    },

    deleteCustomer: function(id) {
      var list = JSON.parse(localStorage.getItem(K.customers) || '[]').filter(function(c){ return c.id !== id; });
      localStorage.setItem(K.customers, JSON.stringify(list));
      return ok({});
    },

    // ══ 用户 ══════════════════════════════════════════════════════════════
    getUsers: function() {
      return ok(JSON.parse(localStorage.getItem(K.users) || '[]'));
    },

    updateUser: function(id, data) {
      var list = JSON.parse(localStorage.getItem(K.users) || '[]');
      var idx  = list.findIndex(function(u){ return u.id === id; });
      if (idx === -1) return err('用户不存在');
      list[idx] = Object.assign({}, list[idx], data);
      localStorage.setItem(K.users, JSON.stringify(list));
      return ok(list[idx]);
    },

    // ══ 仪表盘 ═══════════════════════════════════════════════════════════
    getStats: function() {
      var all        = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      var today      = new Date().toDateString();
      var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      var statusDist = {};
      all.forEach(function(d) { statusDist[d.status] = (statusDist[d.status]||0) + 1; });
      return ok({
        total:      all.length,
        todayCount: all.filter(function(d){ return new Date(d.createdAt).toDateString() === today;     }).length,
        monthCount: all.filter(function(d){ return new Date(d.createdAt) >= monthStart;                }).length,
        statusDist: statusDist,
      });
    },

    // ══ 状态映射 ═════════════════════════════════════════════════════════
    statusMap: {
      'new':         { label: '新增',    cls: 'info'    },
      'collected':   { label: '已收录',  cls: 'success' },
      'negotiating': { label: '洽谈中',  cls: 'warning' },
      'signed':      { label: '已签约',  cls: 'accent'  },
      'rejected':    { label: '已淘汰',  cls: 'danger'  },
    },

    getStatusLabel: function(status) {
      var m = this.statusMap[status];
      return m ? m.label : status;
    },

    getStatusCls: function(status) {
      var m = this.statusMap[status];
      return m ? m.cls : 'info';
    },

  }; // end AIDC_API

})();
