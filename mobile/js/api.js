/**
 * AIDC Collector — 手机端统一数据层
 * 存储键与桌面端 admin/pages/api.js 完全一致，数据互通。
 * 用法：await AIDC_API.login(u, p)  // 返回 Promise
 */
(function () {
  'use strict';

  var K = {
    user:        'aidc_user',
    datacenters: 'aidc_datacenters',
    customers:   'aidc_customers',
    users:       'aidc_users',
    changelogs:  'aidc_changelogs',
    visits:      'aidc_visits',
  };

  // ── 工具 ───────────────────────────────────────────────────────────────
  function uid()  { return 'u' + Date.now(); }
  function now()  { return new Date().toISOString(); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(K.user) || 'null'); } catch(e) { return null; }
  }

  function isLoggedIn() { return !!getUser(); }

  function isAdmin() {
    var u = getUser();
    return !!(u && u.role === 'admin');
  }

  // ── 变更日志 ──────────────────────────────────────────────────────────
  function addChangelog(dcId, dcName, type, content, operatorName) {
    var logs = JSON.parse(localStorage.getItem(K.changelogs) || '[]');
    var u = getUser();
    logs.unshift({
      id: 'cl' + Date.now(),
      dcId: dcId, dcName: dcName, type: type,
      content: content,
      operatorName: operatorName || (u ? u.name : '未知'),
      operatorId:   u ? u.id : '',
      createdAt: now()
    });
    localStorage.setItem(K.changelogs, JSON.stringify(logs));
  }

  function getChangelogs(dcId) {
    return JSON.parse(localStorage.getItem(K.changelogs) || '[]').filter(function(c) {
      return c.dcId === dcId;
    });
  }

  // ── 强制重置种子数据（用于调试） ─────────────────────────────────
  function resetSeed() {
    localStorage.removeItem(K.user);
    localStorage.removeItem(K.users);
    localStorage.removeItem(K.datacenters);
    localStorage.removeItem(K.customers);
    localStorage.removeItem(K.changelogs);
    localStorage.removeItem(K.visits);
    console.log('[DEBUG] 种子数据已强制重置');
  }
  window.AIDC_RESET_SEED = resetSeed;

  // ── 种子数据（仅首次） ────────────────────────────────────────────────
  function seed() {
    // 用户
    if (!localStorage.getItem(K.users)) {
      localStorage.setItem(K.users, JSON.stringify([
        { id: 'u001', name: '管理员', username: 'admin',    phone: '13800000001', password: 'Admin@2026', role: 'admin',     status: 'active',   createdAt: now() },
        { id: 'u002', name: '张三',   username: 'zhangsan', phone: '13800000002', password: 'Abc@12345',  role: 'collector', status: 'active',   createdAt: now() },
        { id: 'u003', name: '李四',   username: 'lisi',     phone: '13800000003', password: 'Abc@12345',  role: 'collector', status: 'disabled', createdAt: now() },
      ]));
    }

    // 机房（desktop 已有则跳过）
    if (!localStorage.getItem(K.datacenters)) {
      var seed = [
        // ═══ 本周新增 ═══
        { id: 'dc001', name: 'Equinix SG2',          country: '新加坡',  province: '新加坡', city: '新加坡',  address: '1 Genting Lane, Singapore 349544',  status: 'collected',   customer: 'Equinix',    rackCount: 1800, powerPerRack: 10, pue: 1.35, kycStatus: 'approved', remark: '新加坡核心交换节点', kycRemark: 'KYC审核通过', createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*5).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc002', name: 'STT Bangkok 1',        country: '泰国',    province: '曼谷',   city: '曼谷',    address: 'Bang Khen District, Bangkok 10220', status: 'new',         customer: 'STT GDC',   rackCount: 800,  powerPerRack: 10, pue: 1.42, kycStatus: 'pending', remark: '曼谷重要节点', kycRemark: '待补充资料', createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc003', name: 'DCI Indonesia JK01',    country: '印尼',    province: '雅加达', city: '雅加达',  address: 'Jl. Kebayoran Lama, Jakarta Barat',   status: 'collected',   customer: 'DCI',       rackCount: 600,  powerPerRack: 6,  pue: 1.5,  kycStatus: 'approved', remark: '雅加达核心', kycRemark: '', createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000).toISOString(),   updatedAt: new Date().toISOString() },
        // ═══ 本周新增（今天创建）═══
        { id: 'dc010', name: 'NTT Jakarta 2',        country: '印尼',    province: '雅加达', city: '雅加达',  address: 'Kuningan, Jakarta Selatan',          status: 'new',         customer: 'NTT',       rackCount: 1200, powerPerRack: 12, pue: 1.28, kycStatus: 'in_progress', remark: '液冷机房，AI就绪', kycRemark: 'KYC 进行中，缺营业执照', createdBy: 'u001', createdByName: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc011', name: 'Keppel DC SG3',        country: '新加坡',  province: '新加坡', city: '新加坡',  address: '25 Serangoon North Ave 7, Singapore', status: 'new',         customer: 'Keppel DC', rackCount: 1500, powerPerRack: 15, pue: 1.25, kycStatus: 'pending', remark: '新建机房，容量充足', kycRemark: '', createdBy: 'u002', createdByName: '张三',   createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 签约进行中 ═══
        { id: 'dc004', name: 'Supernap Thailand 1',   country: '泰国',    province: '春武里', city: '春武里',  address: 'Amata City, Chonburi',                status: 'negotiating', customer: 'Supernap',  rackCount: 2000, powerPerRack: 15, pue: 1.38, kycStatus: 'in_progress', remark: 'TCC集团项目，液冷改造中', kycRemark: 'KYC审核中，已补材料', createdBy: 'u001', createdByName: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc012', name: 'Digital Realty SIN3',  country: '新加坡',  province: '新加坡', city: '新加坡',  address: '1 Sunview Road, Singapore',          status: 'negotiating', customer: 'Digital Realty', rackCount: 2200, powerPerRack: 14, pue: 1.22, kycStatus: 'approved', remark: 'Tier IV认证，价格较高', kycRemark: '', createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000).toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 已签约 ═══
        { id: 'dc005', name: 'Keppel DC Singapore 2',  country: '新加坡',  province: '新加坡', city: '新加坡',  address: '55 Ayer Rajah Crescent, Singapore',  status: 'signed',      customer: 'Keppel DC', rackCount: 2500, powerPerRack: 12, pue: 1.3,  kycStatus: 'approved', remark: '关灯哥重点项目', kycRemark: '', createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc013', name: 'AirTrunk SYD-2',        country: '澳大利亚',province: '新南威尔士',city:'悉尼',   address: 'Sydney Olympic Park, NSW',           status: 'signed',      customer: 'AirTrunk', rackCount: 3500, powerPerRack: 14, pue: 1.28, kycStatus: 'approved', remark: '超大规模，部署中', kycRemark: '', createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 已收录 ═══
        { id: 'dc006', name: 'AirTrunk SYD-1',         country: '澳大利亚',province: '新南威尔士',city:'悉尼',   address: 'Sydney Olympic Park, NSW',           status: 'new',         customer: 'AirTrunk', rackCount: 3000, powerPerRack: 12, pue: 1.3,  kycStatus: 'pending', remark: '超大规模项目', kycRemark: '', createdBy: 'u001', createdByName: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc014', name: 'NTT Tokyo 1',           country: '日本',    province: '东京都', city: '东京',    address: 'Tama City, Tokyo',                   status: 'collected',   customer: 'NTT',       rackCount: 1800, powerPerRack: 10, pue: 1.32, kycStatus: 'approved', remark: '东京核心节点', kycRemark: '', createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000*4).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc015', name: 'GDS Shanghai 1',        country: '中国',    province: '上海',   city: '上海',    address: 'Pudong New Area, Shanghai',          status: 'collected',   customer: 'GDS',       rackCount: 2500, powerPerRack: 11, pue: 1.35, kycStatus: 'approved', remark: '上海核心机房', kycRemark: '', createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*6).toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 已淘汰 ═══
        { id: 'dc016', name: 'Small DC Vietnam',      country: '越南',    province: '胡志明市',city:'胡志明市',address: 'District 7, Ho Chi Minh City',       status: 'rejected',    customer: 'Local ISP', rackCount: 200, powerPerRack: 4,  pue: 1.8,  kycStatus: 'not_started', remark: '基础设施弱，不推荐', kycRemark: '承重不足，电力冗余低', createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: new Date().toISOString() },
      ];
      localStorage.setItem(K.datacenters, JSON.stringify(seed));
      addChangelog('dc001', 'Equinix SG2',         'create', '新增机房 [Equinix SG2]',          '管理员');
      addChangelog('dc002', 'STT Bangkok 1',       'create', '新增机房 [STT Bangkok 1]',        '管理员');
      addChangelog('dc003', 'DCI Indonesia JK01',  'create', '新增机房 [DCI Indonesia JK01]',    '张三');
      addChangelog('dc001', 'Equinix SG2',          'update', '更新字段：status、customer',       '管理员');
      addChangelog('dc005', 'Keppel DC Singapore 2','status', '状态变更为：已签约',               '管理员');
    }
  }

  // ── 内部响应 ──────────────────────────────────────────────────────────
  function ok(data)    { return Promise.resolve({ code: 0, data: data }); }
  function err(msg)    { return Promise.resolve({ code: 1, message: msg }); }

  // ══ AIDC_API ═══════════════════════════════════════════════════════════
  window.AIDC_API = {

    // ── 登录/用户 ───────────────────────────────────────────────────────
    login: function(username, password) {
      var self = this;
      return new Promise(function(resolve) {
        setTimeout(function() {
          var users = JSON.parse(localStorage.getItem(K.users) || '[]');
          var user  = users.find(function(u) { return u.username === username; });
          if (!user)                                    { resolve(err('用户名不存在')); return; }
          if (user.password && user.password !== password) { resolve(err('密码错误')); return; }
          if (user.status === 'disabled')               { resolve(err('账号已被停用')); return; }
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
      return ok({});
    },

    getUser: function() { return getUser(); },
    isLoggedIn: function() { return isLoggedIn(); },
    isAdmin: function() { return isAdmin(); },

    // ── 机房 CRUD ───────────────────────────────────────────────────────
    getDatacenters: function(params) {
      params   = params   || {};
      var keyword  = params.keyword  || '';
      var status   = params.status   || '';
      var country  = params.country  || '';
      var createdBy = params.createdBy || '';

      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]')
        .filter(function(d){ return !d._deleted; });

      if (keyword) {
        var kw = keyword.toLowerCase();
        list = list.filter(function(d) {
          return (d.name||'').toLowerCase().includes(kw) ||
                 (d.address||'').toLowerCase().includes(kw) ||
                 (d.customer||'').toLowerCase().includes(kw) ||
                 (d.city||'').toLowerCase().includes(kw);
        });
      }
      if (status)   list = list.filter(function(d){ return d.status   === status;   });
      if (country)  list = list.filter(function(d){ return d.country  === country;  });
      if (createdBy) list = list.filter(function(d){ return d.createdBy === createdBy; });

      return ok({ list: list, total: list.length });
    },

    getDatacenter: function(id) {
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]')
        .filter(function(d){ return !d._deleted; });
      var item = list.find(function(d){ return d.id === id; });
      if (!item) return err('记录不存在');
      return ok(item);
    },

    createDatacenter: function(data) {
      var user   = getUser();
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
      if (changedFields.length > 0) {
        addChangelog(list[idx].id, list[idx].name, 'update',
          '更新字段：' + changedFields.join('、'),
          getUser() ? getUser().name : '未知');
      }
      return ok(list[idx]);
    },

    deleteDatacenter: function(id) {
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      var idx  = list.findIndex(function(d){ return d.id === id; });
      if (idx === -1) return err('记录不存在');
      list[idx] = Object.assign({}, list[idx], {
        _deleted:  true,
        deletedAt: now(),
        deletedBy: getUser() ? getUser().id : '',
      });
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      addChangelog(list[idx].id, list[idx].name, 'delete', '软删除机房记录', getUser() ? getUser().name : '未知');
      return ok({});
    },

    getDatacenterChangelogs: function(dcId) {
      return ok(getChangelogs(dcId));
    },

    // ── 仪表盘 ───────────────────────────────────────────────────────────
    getStats: function() {
      var all = JSON.parse(localStorage.getItem(K.datacenters) || '[]')
        .filter(function(d){ return !d._deleted; });
      var today      = new Date().toDateString();
      var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      var weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - (weekStart.getDay()||7) + 1); weekStart.setHours(0,0,0,0);
      var statusDist = {};
      all.forEach(function(d) { statusDist[d.status] = (statusDist[d.status]||0) + 1; });
      return ok({
        total:      all.length,
        todayCount: all.filter(function(d){ return new Date(d.createdAt).toDateString() === today;  }).length,
        weekCount:  all.filter(function(d){ return new Date(d.createdAt) >= weekStart;               }).length,
        monthCount: all.filter(function(d){ return new Date(d.createdAt) >= monthStart;              }).length,
        myCount:    all.filter(function(d){ return d.createdBy === (getUser()||{}).id;               }).length,
        statusDist: statusDist,
      });
    },

    // ── 状态映射 ─────────────────────────────────────────────────────────
    statusMap: {
      'new':         { label: '新增',    cls: 'info'    },
      'collected':   { label: '已收录',  cls: 'success' },
      'negotiating': { label: '洽谈中',  cls: 'warning' },
      'signed':      { label: '已签约',  cls: 'accent'  },
      'rejected':    { label: '已淘汰',  cls: 'danger'  },
    },

    getStatusLabel: function(status) {
      var m = this.statusMap[status];
      return m ? m.label : status || '未知';
    },

    getStatusCls: function(status) {
      var m = this.statusMap[status];
      return m ? m.cls : 'info';
    },

    kycStatusMap: {
      'approved':     { label: '已通过',  cls: 'success' },
      'in_progress':  { label: '审核中',  cls: 'warning'  },
      'pending':      { label: '待提交',  cls: 'info'     },
      'pending_doc':  { label: '缺资料',  cls: 'warning'  },
      'not_started':  { label: '未开始',  cls: 'info'     },
    },

    getKycLabel: function(status) {
      var m = this.kycStatusMap[status];
      return m ? m.label : status || '—';
    },

  }; // end AIDC_API

})();
