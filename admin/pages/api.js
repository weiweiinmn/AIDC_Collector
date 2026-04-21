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
    visits:    'aidc_visits',
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
      { id: 'u001', name: '管理员', username: 'admin',    phone: '13800000001', password: 'Admin@2026', role: 'admin',     status: 'active',   createdAt: now() },
      { id: 'u002', name: '张三',   username: 'zhangsan', phone: '13800000002', password: 'Abc@12345',  role: 'collector', status: 'active',   createdAt: now() },
      { id: 'u003', name: '李四',   username: 'lisi',     phone: '13800000003', password: 'Abc@12345',  role: 'collector', status: 'disabled', createdAt: now() },
    ];
    localStorage.setItem(K.users, JSON.stringify(seed));
  }

  // ── 模拟机房种子 ──────────────────────────────────────────────────────────
  function seedDatacenters() {
    var raw = localStorage.getItem(K.datacenters);
    if (raw && JSON.parse(raw).length > 0) return;
    var seed = [
      { id: 'dc001', name: 'Equinix SG2',         r1: '新加坡',  r2: '新加坡', r3: '新加坡', address: '1 Genting Lane, Singapore 349544', status: 'collected',   customer: 'Equinix',   cabinetCount: 1800, cabinetPower: 10, pueDesign: 1.35, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*5).toISOString(), updatedAt: now() },
      { id: 'dc002', name: 'STT Bangkok 1',        r1: '泰国',    r2: '曼谷',   r3: '曼谷',  address: 'Bang Khen District, Bangkok 10220', status: 'new',         customer: 'STT GDC',   cabinetCount: 800,  cabinetPower: 10, pueDesign: 1.42, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: now() },
      { id: 'dc003', name: 'DCI Indonesia JK01',   r1: '印尼',    r2: '雅加达', r3: '雅加达', address: 'Jl. Kebayoran Lama, Jakarta Barat', status: 'collected',   customer: 'DCI',       cabinetCount: 600,  cabinetPower: 6,  pueDesign: 1.5,  createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000).toISOString(),   updatedAt: now() },
      { id: 'dc004', name: 'Supernap Thailand 1',  r1: '泰国',    r2: '曼谷',   r3: '曼谷',  address: 'Suvarnabhumi Area, Bangkok 10540', status: 'negotiating', customer: 'Supernap',  cabinetCount: 2000, cabinetPower: 15, pueDesign: 1.38, createdBy: 'u001', createdByName: '管理员', createdAt: now(), updatedAt: now() },
      { id: 'dc005', name: 'Keppel DC Singapore 2',r1: '新加坡',  r2: '新加坡', r3: '新加坡', address: '55 Ayer Rajah Crescent, Singapore', status: 'signed',      customer: 'Keppel DC', cabinetCount: 2500, cabinetPower: 12, pueDesign: 1.3,  createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: now() },
    ];
    // 使用 compatWrite 确保新旧字段名都写入
    seed = seed.map(function(d) { return compatWrite(d); });
    addChangelog('dc001', 'Equinix SG2',          'create', '新增机房 [Equinix SG2]',          '管理员');
    addChangelog('dc002', 'STT Bangkok 1',         'create', '新增机房 [STT Bangkok 1]',         '管理员');
    addChangelog('dc003', 'DCI Indonesia JK01',    'create', '新增机房 [DCI Indonesia JK01]',    '张三');
    addChangelog('dc001', 'Equinix SG2',           'update', '更新字段：status、customer',        '管理员');
    addChangelog('dc005', 'Keppel DC Singapore 2', 'status', '状态变更为：已签约',               '管理员');
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

  // ── 字段名兼容层（与移动端统一）────────────────────────────────────────────
  // 读取兼容：旧字段名 → 新 camelCase 字段名
  function normalizeDatacenter(d) {
    if (!d) return d;
    // 地址字段兼容
    if (!d.r1 && d.country) d.r1 = d.country;
    if (!d.r2 && d.province) d.r2 = d.province;
    if (!d.r3 && d.city) d.r3 = d.city;
    // 机柜电力字段兼容（旧→新 camelCase）
    if (d.rackCount !== undefined && d.cabinetCount === undefined) d.cabinetCount = d.rackCount;
    if (d.cabinet_count !== undefined && d.cabinetCount === undefined) d.cabinetCount = d.cabinet_count;
    if (d.powerPerRack !== undefined && d.cabinetPower === undefined) d.cabinetPower = d.powerPerRack;
    if (d.cabinet_power !== undefined && d.cabinetPower === undefined) d.cabinetPower = d.cabinet_power;
    if (d.pue !== undefined && d.pueDesign === undefined) d.pueDesign = d.pue;
    if (d.pue_design !== undefined && d.pueDesign === undefined) d.pueDesign = d.pue_design;
    if (d.mainCoolingType !== undefined && d.coolingType === undefined) d.coolingType = d.mainCoolingType;
    if (d.cooling_type !== undefined && d.coolingType === undefined) d.coolingType = d.cooling_type;
    if (d.mainsCapacity !== undefined && d.powerKva === undefined) d.powerKva = d.mainsCapacity;
    if (d.mains_capacity !== undefined && d.powerKva === undefined) d.powerKva = d.mains_capacity;
    if (d.powerCapacity !== undefined && d.powerMw === undefined) d.powerMw = d.powerCapacity;
    if (d.available_power !== undefined && d.powerMw === undefined) d.powerMw = d.available_power;
    if (d.expandable !== undefined && d.powerExpand === undefined) d.powerExpand = d.expandable;
    if (d.expandable_power !== undefined && d.powerExpand === undefined) d.powerExpand = d.expandable_power;
    if (d.propertyType !== undefined && d.property === undefined) d.property = d.propertyType;
    if (d.expectedDate !== undefined && d.deliveryDate === undefined) d.deliveryDate = d.expectedDate;
    if (d.expected_date !== undefined && d.deliveryDate === undefined) d.deliveryDate = d.expected_date;
    if (d.liaison !== undefined && d.contactPerson === undefined) d.contactPerson = d.liaison;
    if (d.contact_person !== undefined && d.contactPerson === undefined) d.contactPerson = d.contact_person;
    // 其他字段兼容
    if (d.cabinet_available !== undefined && d.cabinetAvailable === undefined) d.cabinetAvailable = d.cabinet_available;
    if (d.network_routes !== undefined && d.networkRoutes === undefined) d.networkRoutes = d.network_routes;
    if (d.carrier_count !== undefined && d.carrierCount === undefined) d.carrierCount = d.carrier_count;
    if (d.network_800g !== undefined && d.network800g === undefined) d.network800g = d.network_800g;
    if (d.transformer_kva !== undefined && d.transformerKva === undefined) d.transformerKva = d.transformer_kva;
    if (d.genset_redundancy !== undefined && d.gensetRedundancy === undefined) d.gensetRedundancy = d.genset_redundancy;
    if (d.genset_runtime !== undefined && d.gensetRuntime === undefined) d.gensetRuntime = d.genset_runtime;
    if (d.ups_config !== undefined && d.upsConfig === undefined) d.upsConfig = d.ups_config;
    if (d.ups_runtime !== undefined && d.upsRuntime === undefined) d.upsRuntime = d.ups_runtime;
    if (d.power_sla !== undefined && d.powerSla === undefined) d.powerSla = d.power_sla;
    if (d.chiller_count !== undefined && d.chillerCount === undefined) d.chillerCount = d.chiller_count;
    if (d.liquid_cooling !== undefined && d.liquidCooling === undefined) d.liquidCooling = d.liquid_cooling;
    if (d.floor_load !== undefined && d.floorLoad === undefined) d.floorLoad = d.floor_load;
    if (d.floor_height !== undefined && d.floorHeight === undefined) d.floorHeight = d.floor_height;
    return d;
  }

  // 写入兼容：同时写入新旧字段名
  function compatWrite(data) {
    var out = Object.assign({}, data);
    // 地址字段双向写入
    if (data.r1) { out.country = data.r1; }
    if (data.r2) { out.province = data.r2; }
    if (data.r3) { out.city = data.r3; }
    if (data.country) { out.r1 = data.country; }
    if (data.province) { out.r2 = data.province; }
    if (data.city) { out.r3 = data.city; }
    // 机柜电力字段双向写入（新 camelCase → 旧 snake_case）
    if (data.cabinetCount !== undefined) { out.cabinet_count = data.cabinetCount; out.rackCount = data.cabinetCount; }
    if (data.cabinet_count !== undefined) { out.cabinetCount = data.cabinet_count; out.rackCount = data.cabinet_count; }
    if (data.cabinetPower !== undefined) { out.cabinet_power = data.cabinetPower; out.powerPerRack = data.cabinetPower; }
    if (data.cabinet_power !== undefined) { out.cabinetPower = data.cabinet_power; out.powerPerRack = data.cabinet_power; }
    if (data.pueDesign !== undefined) { out.pue_design = data.pueDesign; out.pue = data.pueDesign; }
    if (data.pue_design !== undefined) { out.pueDesign = data.pue_design; out.pue = data.pue_design; }
    if (data.coolingType !== undefined) { out.cooling_type = data.coolingType; out.mainCoolingType = data.coolingType; }
    if (data.cooling_type !== undefined) { out.coolingType = data.cooling_type; out.mainCoolingType = data.cooling_type; }
    if (data.powerKva !== undefined) { out.power_kva = data.powerKva; out.mainsCapacity = data.powerKva; }
    if (data.power_kva !== undefined) { out.powerKva = data.power_kva; out.mainsCapacity = data.power_kva; }
    if (data.mains_capacity !== undefined) { out.powerKva = data.mains_capacity; out.mainsCapacity = data.mains_capacity; }
    if (data.powerMw !== undefined) { out.power_mw = data.powerMw; out.powerCapacity = data.powerMw; out.available_power = data.powerMw; }
    if (data.available_power !== undefined) { out.powerMw = data.available_power; out.powerCapacity = data.available_power; }
    if (data.powerExpand !== undefined) { out.power_expand = data.powerExpand; out.expandable = data.powerExpand; out.expandable_power = data.powerExpand; }
    if (data.expandable_power !== undefined) { out.powerExpand = data.expandable_power; out.expandable = data.expandable_power; }
    if (data.deliveryDate !== undefined) { out.delivery_date = data.deliveryDate; out.expectedDate = data.deliveryDate; out.expected_date = data.deliveryDate; }
    if (data.expected_date !== undefined) { out.deliveryDate = data.expected_date; out.expectedDate = data.expected_date; }
    if (data.contactPerson !== undefined) { out.contact_person = data.contactPerson; out.liaison = data.contactPerson; }
    if (data.contact_person !== undefined) { out.contactPerson = data.contact_person; out.liaison = data.contact_person; }
    if (data.property !== undefined) { out.propertyType = data.property; }
    if (data.propertyType !== undefined) { out.property = data.propertyType; }
    // 其他字段双向写入
    if (data.cabinetAvailable !== undefined) { out.cabinet_available = data.cabinetAvailable; }
    if (data.cabinet_available !== undefined) { out.cabinetAvailable = data.cabinet_available; }
    if (data.networkRoutes !== undefined) { out.network_routes = data.networkRoutes; }
    if (data.network_routes !== undefined) { out.networkRoutes = data.network_routes; }
    if (data.carrierCount !== undefined) { out.carrier_count = data.carrierCount; }
    if (data.carrier_count !== undefined) { out.carrierCount = data.carrier_count; }
    if (data.network800g !== undefined) { out.network_800g = data.network800g; }
    if (data.network_800g !== undefined) { out.network800g = data.network_800g; }
    if (data.transformerKva !== undefined) { out.transformer_kva = data.transformerKva; }
    if (data.transformer_kva !== undefined) { out.transformerKva = data.transformer_kva; }
    if (data.gensetRedundancy !== undefined) { out.genset_redundancy = data.gensetRedundancy; }
    if (data.genset_redundancy !== undefined) { out.gensetRedundancy = data.genset_redundancy; }
    if (data.gensetRuntime !== undefined) { out.genset_runtime = data.gensetRuntime; }
    if (data.genset_runtime !== undefined) { out.gensetRuntime = data.genset_runtime; }
    if (data.upsConfig !== undefined) { out.ups_config = data.upsConfig; }
    if (data.ups_config !== undefined) { out.upsConfig = data.ups_config; }
    if (data.upsRuntime !== undefined) { out.ups_runtime = data.upsRuntime; }
    if (data.ups_runtime !== undefined) { out.upsRuntime = data.ups_runtime; }
    if (data.powerSla !== undefined) { out.power_sla = data.powerSla; }
    if (data.power_sla !== undefined) { out.powerSla = data.power_sla; }
    if (data.chillerCount !== undefined) { out.chiller_count = data.chillerCount; }
    if (data.chiller_count !== undefined) { out.chillerCount = data.chiller_count; }
    if (data.liquidCooling !== undefined) { out.liquid_cooling = data.liquidCooling; }
    if (data.liquid_cooling !== undefined) { out.liquidCooling = data.liquid_cooling; }
    if (data.floorLoad !== undefined) { out.floor_load = data.floorLoad; }
    if (data.floor_load !== undefined) { out.floorLoad = data.floor_load; }
    if (data.floorHeight !== undefined) { out.floor_height = data.floorHeight; }
    if (data.floor_height !== undefined) { out.floorHeight = data.floor_height; }
    return out;
  }

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

      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]').filter(function(d){ return !d._deleted; });
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
      var today      = new Date().toDateString();
      var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      var weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() || 7); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0);

      return ok({
        list:       paged,
        total:      total,
        todayCount: list.filter(function(d){ return new Date(d.createdAt).toDateString() === today;     }).length,
        weekCount:  list.filter(function(d){ return new Date(d.createdAt) >= weekStart;                }).length,
        monthCount: list.filter(function(d){ return new Date(d.createdAt) >= monthStart;                }).length,
        myCount:    list.filter(function(d){ return d.createdBy === (this.getUser()||{}).id; }, this).length,
      });
    },

    createDatacenter: function(data) {
      var user   = this.getUser();
      // 使用 compatWrite 确保新旧字段名都写入
      var record = compatWrite(Object.assign({
        id:             'dc' + Date.now(),
        status:         'new',
        createdBy:      user ? user.id : 'u001',
        createdByName:  user ? user.name : '管理员',
        createdAt:      now(),
        updatedAt:      now(),
      }, data));
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
      // 使用 compatWrite 确保新旧字段名都写入
      var compatData = compatWrite(data);
      var changedFields = [];
      Object.keys(compatData).forEach(function(key) {
        if (oldRecord[key] !== compatData[key]) changedFields.push(key);
      });
      list[idx] = Object.assign({}, oldRecord, compatData, { updatedAt: now() });
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
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      var idx  = list.findIndex(function(d){ return d.id === id; });
      if (idx === -1) return err('记录不存在');
      var user = this.getUser();
      list[idx] = Object.assign({}, list[idx], {
        _deleted:      true,
        deletedAt:     now(),
        deletedBy:     user ? user.id : '',
        deletedByName: user ? user.name : '未知'
      });
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      addChangelog(list[idx].id, list[idx].name, 'delete', '软删除机房记录', user ? user.name : '未知');
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

    // ══ 考察任务 ═══════════════════════════════════════════════════════════
    getVisits: function() {
      return ok(JSON.parse(localStorage.getItem(K.visits) || '[]'));
    },

    createVisit: function(data) {
      var record = Object.assign({ id: 'v' + Date.now(), status: 'scheduled', createdAt: now() }, data);
      var list  = JSON.parse(localStorage.getItem(K.visits) || '[]');
      list.push(record);
      localStorage.setItem(K.visits, JSON.stringify(list));
      return ok(record);
    },

    updateVisit: function(id, data) {
      var list = JSON.parse(localStorage.getItem(K.visits) || '[]');
      var idx  = list.findIndex(function(v){ return v.id === id; });
      if (idx === -1) return err('任务不存在');
      list[idx] = Object.assign({}, list[idx], data);
      localStorage.setItem(K.visits, JSON.stringify(list));
      return ok(list[idx]);
    },

    deleteVisit: function(id) {
      var list = JSON.parse(localStorage.getItem(K.visits) || '[]').filter(function(v){ return v.id !== id; });
      localStorage.setItem(K.visits, JSON.stringify(list));
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
      var all        = JSON.parse(localStorage.getItem(K.datacenters) || '[]').filter(function(d){ return !d._deleted; });
      var today      = new Date().toDateString();
      var monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      var weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() || 7); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0);
      var now        = new Date();
      var in90Days   = new Date(now.getTime() + 90 * 86400000);

      // 状态分布
      var statusDist = {};
      all.forEach(function(d) { statusDist[d.status] = (statusDist[d.status]||0) + 1; });

      // MW 统计（兼容 powerMw / power_mw / powerCapacity / available_power）
      var totalMw   = 0;
      var signedMw  = 0;
      var totalCabinets = 0;
      all.forEach(function(d) {
        var mw = parseFloat(d.powerMw || d.power_mw || d.powerCapacity || d.available_power || 0);
        var cab = parseInt(d.cabinetCount || d.cabinet_count || d.rackCount || 0);
        totalMw += mw;
        totalCabinets += cab;
        if (d.status === 'signed') signedMw += mw;
      });

      // 平均 PUE（power_kva / powerKva / pueDesign / pue）
      var pueSum = 0, pueCount = 0;
      all.forEach(function(d) {
        var p = parseFloat(d.pueDesign || d.pue_design || d.pue || 0);
        if (p > 0) { pueSum += p; pueCount++; }
      });

      // 800G / 液冷 / powerSla 统计
      var network800gCount   = 0;
      var liquidCoolingCount = 0;
      var powerSlaCount      = 0;
      all.forEach(function(d) {
        if (d.network800g || d.network_800g) network800gCount++;
        if (d.liquidCooling || d.liquid_cooling) liquidCoolingCount++;
        if (d.powerSla === '99.999%' || d.power_sla === '99.999%') powerSlaCount++;
      });

      // KYC 阻塞清单（pending_doc 或 in_progress 超30天未更新）
      var kycBlockers = all.filter(function(d) {
        if (d.kycStatus === 'pending_doc') return true;
        if (d.kycStatus === 'in_progress' || d.kycStatus === 'in-progress') {
          var updated = new Date(d.updatedAt || d.createdAt);
          var daysSinceUpdate = (now - updated) / 86400000;
          return daysSinceUpdate > 30;
        }
        return false;
      }).map(function(d) {
        var updated = new Date(d.updatedAt || d.createdAt);
        var daysSinceUpdate = Math.floor((now - updated) / 86400000);
        return { id: d.id, name: d.name, kycStatus: d.kycStatus, daysSinceUpdate: daysSinceUpdate };
      });

      // 90天内即将交付
      var upcomingDeliveries = all.filter(function(d) {
        if (!d.deliveryDate) return false;
        var dd = new Date(d.deliveryDate);
        return dd >= now && dd <= in90Days;
      }).map(function(d) {
        var dd = new Date(d.deliveryDate);
        var daysLeft = Math.ceil((dd - now) / 86400000);
        return { id: d.id, name: d.name, deliveryDate: d.deliveryDate, daysLeft: daysLeft };
      });

      return ok({
        // 基础数量
        total:        all.length,
        todayCount:   all.filter(function(d){ return new Date(d.createdAt).toDateString() === today;     }).length,
        weekCount:    all.filter(function(d){ return new Date(d.createdAt) >= weekStart;                }).length,
        monthCount:   all.filter(function(d){ return new Date(d.createdAt) >= monthStart;                }).length,
        // 状态分布
        statusDist:   statusDist,
        // MW / 机柜
        totalMw:      Math.round(totalMw * 100) / 100,
        signedMw:     Math.round(signedMw * 100) / 100,
        totalCabinets: totalCabinets,
        // PUE
        avgPue:       pueCount > 0 ? Math.round(pueSum / pueCount * 100) / 100 : null,
        // 基础设施能力
        network800gCount:    network800gCount,
        network800gTotal:    all.length,
        liquidCoolingCount: liquidCoolingCount,
        liquidCoolingTotal: all.length,
        powerSlaCount:       powerSlaCount,
        powerSlaTotal:       all.length,
        // KYC & 交付
        kycBlockers:         kycBlockers,
        upcomingDeliveries:  upcomingDeliveries,
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

    // ── 字段映射兼容层（供表单页面直接调用）─────────────────────────────
    normalizeDatacenter: function(d) {
      if (!d) return d;
      if (!d.r1 && d.country) d.r1 = d.country;
      if (!d.r2 && d.province) d.r2 = d.province;
      if (!d.r3 && d.city) d.r3 = d.city;
      if (d.rackCount !== undefined && d.cabinetCount === undefined) d.cabinetCount = d.rackCount;
      if (d.cabinet_count !== undefined && d.cabinetCount === undefined) d.cabinetCount = d.cabinet_count;
      if (d.powerPerRack !== undefined && d.cabinetPower === undefined) d.cabinetPower = d.powerPerRack;
      if (d.cabinet_power !== undefined && d.cabinetPower === undefined) d.cabinetPower = d.cabinet_power;
      if (d.pue !== undefined && d.pueDesign === undefined) d.pueDesign = d.pue;
      if (d.pue_design !== undefined && d.pueDesign === undefined) d.pueDesign = d.pue_design;
      if (d.mainCoolingType !== undefined && d.coolingType === undefined) d.coolingType = d.mainCoolingType;
      if (d.cooling_type !== undefined && d.coolingType === undefined) d.coolingType = d.cooling_type;
      if (d.mainsCapacity !== undefined && d.powerKva === undefined) d.powerKva = d.mainsCapacity;
      if (d.mains_capacity !== undefined && d.powerKva === undefined) d.powerKva = d.mains_capacity;
      if (d.powerCapacity !== undefined && d.powerMw === undefined) d.powerMw = d.powerCapacity;
      if (d.available_power !== undefined && d.powerMw === undefined) d.powerMw = d.available_power;
      if (d.expandable !== undefined && d.powerExpand === undefined) d.powerExpand = d.expandable;
      if (d.expandable_power !== undefined && d.powerExpand === undefined) d.powerExpand = d.expandable_power;
      if (d.propertyType !== undefined && d.property === undefined) d.property = d.propertyType;
      if (d.expectedDate !== undefined && d.deliveryDate === undefined) d.deliveryDate = d.expectedDate;
      if (d.expected_date !== undefined && d.deliveryDate === undefined) d.deliveryDate = d.expected_date;
      if (d.liaison !== undefined && d.contactPerson === undefined) d.contactPerson = d.liaison;
      if (d.contact_person !== undefined && d.contactPerson === undefined) d.contactPerson = d.contact_person;
      if (d.cabinet_available !== undefined && d.cabinetAvailable === undefined) d.cabinetAvailable = d.cabinet_available;
      if (d.network_routes !== undefined && d.networkRoutes === undefined) d.networkRoutes = d.network_routes;
      if (d.carrier_count !== undefined && d.carrierCount === undefined) d.carrierCount = d.carrier_count;
      if (d.network_800g !== undefined && d.network800g === undefined) d.network800g = d.network_800g;
      if (d.transformer_kva !== undefined && d.transformerKva === undefined) d.transformerKva = d.transformer_kva;
      if (d.genset_redundancy !== undefined && d.gensetRedundancy === undefined) d.gensetRedundancy = d.genset_redundancy;
      if (d.genset_runtime !== undefined && d.gensetRuntime === undefined) d.gensetRuntime = d.genset_runtime;
      if (d.ups_config !== undefined && d.upsConfig === undefined) d.upsConfig = d.ups_config;
      if (d.ups_runtime !== undefined && d.upsRuntime === undefined) d.upsRuntime = d.ups_runtime;
      if (d.power_sla !== undefined && d.powerSla === undefined) d.powerSla = d.power_sla;
      if (d.chiller_count !== undefined && d.chillerCount === undefined) d.chillerCount = d.chiller_count;
      if (d.liquid_cooling !== undefined && d.liquidCooling === undefined) d.liquidCooling = d.liquid_cooling;
      if (d.floor_load !== undefined && d.floorLoad === undefined) d.floorLoad = d.floor_load;
      if (d.floor_height !== undefined && d.floorHeight === undefined) d.floorHeight = d.floor_height;
      return d;
    },

    compatWrite: function(data) {
      var out = Object.assign({}, data);
      if (data.r1) { out.country = data.r1; }
      if (data.r2) { out.province = data.r2; }
      if (data.r3) { out.city = data.r3; }
      if (data.country) { out.r1 = data.country; }
      if (data.province) { out.r2 = data.province; }
      if (data.city) { out.r3 = data.city; }
      if (data.cabinetCount !== undefined) { out.cabinet_count = data.cabinetCount; out.rackCount = data.cabinetCount; }
      if (data.cabinet_count !== undefined) { out.cabinetCount = data.cabinet_count; out.rackCount = data.cabinet_count; }
      if (data.cabinetPower !== undefined) { out.cabinet_power = data.cabinetPower; out.powerPerRack = data.cabinetPower; }
      if (data.cabinet_power !== undefined) { out.cabinetPower = data.cabinet_power; out.powerPerRack = data.cabinet_power; }
      if (data.pueDesign !== undefined) { out.pue_design = data.pueDesign; out.pue = data.pueDesign; }
      if (data.pue_design !== undefined) { out.pueDesign = data.pue_design; out.pue = data.pue_design; }
      if (data.coolingType !== undefined) { out.cooling_type = data.coolingType; out.mainCoolingType = data.coolingType; }
      if (data.cooling_type !== undefined) { out.coolingType = data.cooling_type; out.mainCoolingType = data.cooling_type; }
      if (data.powerKva !== undefined) { out.power_kva = data.powerKva; out.mainsCapacity = data.powerKva; }
      if (data.power_kva !== undefined) { out.powerKva = data.power_kva; out.mainsCapacity = data.power_kva; }
      if (data.mains_capacity !== undefined) { out.powerKva = data.mains_capacity; out.mainsCapacity = data.mains_capacity; }
      if (data.powerMw !== undefined) { out.power_mw = data.powerMw; out.powerCapacity = data.powerMw; out.available_power = data.powerMw; }
      if (data.available_power !== undefined) { out.powerMw = data.available_power; out.powerCapacity = data.available_power; }
      if (data.powerExpand !== undefined) { out.power_expand = data.powerExpand; out.expandable = data.powerExpand; out.expandable_power = data.powerExpand; }
      if (data.expandable_power !== undefined) { out.powerExpand = data.expandable_power; out.expandable = data.expandable_power; }
      if (data.deliveryDate !== undefined) { out.delivery_date = data.deliveryDate; out.expectedDate = data.deliveryDate; out.expected_date = data.deliveryDate; }
      if (data.expected_date !== undefined) { out.deliveryDate = data.expected_date; out.expectedDate = data.expected_date; }
      if (data.contactPerson !== undefined) { out.contact_person = data.contactPerson; out.liaison = data.contactPerson; }
      if (data.contact_person !== undefined) { out.contactPerson = data.contact_person; out.liaison = data.contact_person; }
      if (data.property !== undefined) { out.propertyType = data.property; }
      if (data.propertyType !== undefined) { out.property = data.propertyType; }
      if (data.cabinetAvailable !== undefined) { out.cabinet_available = data.cabinetAvailable; }
      if (data.cabinet_available !== undefined) { out.cabinetAvailable = data.cabinet_available; }
      if (data.networkRoutes !== undefined) { out.network_routes = data.networkRoutes; }
      if (data.network_routes !== undefined) { out.networkRoutes = data.network_routes; }
      if (data.carrierCount !== undefined) { out.carrier_count = data.carrierCount; }
      if (data.carrier_count !== undefined) { out.carrierCount = data.carrier_count; }
      if (data.network800g !== undefined) { out.network_800g = data.network800g; }
      if (data.network_800g !== undefined) { out.network800g = data.network_800g; }
      if (data.transformerKva !== undefined) { out.transformer_kva = data.transformerKva; }
      if (data.transformer_kva !== undefined) { out.transformerKva = data.transformer_kva; }
      if (data.gensetRedundancy !== undefined) { out.genset_redundancy = data.gensetRedundancy; }
      if (data.genset_redundancy !== undefined) { out.gensetRedundancy = data.genset_redundancy; }
      if (data.gensetRuntime !== undefined) { out.genset_runtime = data.gensetRuntime; }
      if (data.genset_runtime !== undefined) { out.gensetRuntime = data.genset_runtime; }
      if (data.upsConfig !== undefined) { out.ups_config = data.upsConfig; }
      if (data.ups_config !== undefined) { out.upsConfig = data.ups_config; }
      if (data.upsRuntime !== undefined) { out.ups_runtime = data.upsRuntime; }
      if (data.ups_runtime !== undefined) { out.upsRuntime = data.ups_runtime; }
      if (data.powerSla !== undefined) { out.power_sla = data.powerSla; }
      if (data.power_sla !== undefined) { out.powerSla = data.power_sla; }
      if (data.chillerCount !== undefined) { out.chiller_count = data.chillerCount; }
      if (data.chiller_count !== undefined) { out.chillerCount = data.chiller_count; }
      if (data.liquidCooling !== undefined) { out.liquid_cooling = data.liquidCooling; }
      if (data.liquid_cooling !== undefined) { out.liquidCooling = data.liquid_cooling; }
      if (data.floorLoad !== undefined) { out.floor_load = data.floorLoad; }
      if (data.floor_load !== undefined) { out.floorLoad = data.floor_load; }
      if (data.floorHeight !== undefined) { out.floor_height = data.floorHeight; }
      if (data.floor_height !== undefined) { out.floorHeight = data.floor_height; }
      return out;
    },

  }; // end AIDC_API

})();
