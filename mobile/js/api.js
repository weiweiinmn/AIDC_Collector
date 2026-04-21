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

  // ── 字段映射（移动端旧字段 → 桌面端统一字段）─────────────────────────────
  // 桌面端用 r1/r2/r3 存地址，移动端旧字段名 country/province/city
  // 统一策略：以桌面端字段名为准
  //
  // 字段对照：
  //   rackCount      → cabinet_count
  //   powerPerRack   → cabinet_power
  //   pue            → pue_design
  //   mainCoolingType→ cooling_type
  //   mainsCapacity  → power_kva
  //   powerCapacity  → power_mw
  //   expandable     → power_expand
  //   propertyType   → property
  //   expectedDate   → delivery_date
  //   liaison        → contact_person
  //   country        → r1
  //   province       → r2
  //   city           → r3
  //
  // 兼容读取：如果新字段不存在，回退读旧字段

  // 将旧字段名数据转换为新字段名（用于读取兼容）
  // 支持：旧 snake_case → 新 camelCase
  function normalizeDatacenter(d) {
    if (!d) return d;
    // 地址字段兼容
    if (!d.r1 && d.country) d.r1 = d.country;
    if (!d.r2 && d.province) d.r2 = d.province;
    if (!d.r3 && d.city) d.r3 = d.city;
    // 机柜电力字段兼容（旧→新）
    if (d.rackCount !== undefined && d.cabinetCount === undefined) d.cabinetCount = d.rackCount;
    if (d.cabinet_count !== undefined && d.cabinetCount === undefined) d.cabinetCount = d.cabinet_count;
    if (d.powerPerRack !== undefined && d.cabinetPower === undefined) d.cabinetPower = d.powerPerRack;
    if (d.cabinet_power !== undefined && d.cabinetPower === undefined) d.cabinetPower = d.cabinet_power;
    if (d.pue !== undefined && d.pueDesign === undefined) d.pueDesign = d.pue;
    if (d.pue_design !== undefined && d.pueDesign === undefined) d.pueDesign = d.pue_design;
    if (d.mainCoolingType !== undefined && d.coolingType === undefined) d.coolingType = d.mainCoolingType;
    if (d.cooling_type !== undefined && d.coolingType === undefined) d.coolingType = d.cooling_type;
    if (d.mainsCapacity !== undefined && d.powerKva === undefined) d.powerKva = d.mainsCapacity;
    if (d.power_kva !== undefined && d.powerKva === undefined) d.powerKva = d.power_kva;
    if (d.powerCapacity !== undefined && d.powerMw === undefined) d.powerMw = d.powerCapacity;
    if (d.power_mw !== undefined && d.powerMw === undefined) d.powerMw = d.power_mw;
    if (d.expandable !== undefined && d.powerExpand === undefined) d.powerExpand = d.expandable;
    if (d.power_expand !== undefined && d.powerExpand === undefined) d.powerExpand = d.power_expand;
    if (d.propertyType !== undefined && d.property === undefined) d.property = d.propertyType;
    if (d.expectedDate !== undefined && d.deliveryDate === undefined) d.deliveryDate = d.expectedDate;
    if (d.delivery_date !== undefined && d.deliveryDate === undefined) d.deliveryDate = d.delivery_date;
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

  // 将表单数据写入时，同时写入新旧字段名（确保兼容）
  // 新代码用 camelCase，旧代码用 snake_case，双向兼容
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
    if (data.powerMw !== undefined) { out.power_mw = data.powerMw; out.powerCapacity = data.powerMw; }
    if (data.power_mw !== undefined) { out.powerMw = data.power_mw; out.powerCapacity = data.power_mw; }
    if (data.powerExpand !== undefined) { out.power_expand = data.powerExpand; out.expandable = data.powerExpand; }
    if (data.power_expand !== undefined) { out.powerExpand = data.power_expand; out.expandable = data.power_expand; }
    if (data.deliveryDate !== undefined) { out.delivery_date = data.deliveryDate; out.expectedDate = data.deliveryDate; }
    if (data.delivery_date !== undefined) { out.deliveryDate = data.delivery_date; out.expectedDate = data.delivery_date; }
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
    // 种子数据使用统一字段名（桌面端格式），同时写入旧字段名确保兼容
    if (!localStorage.getItem(K.datacenters)) {
      var seed = [
        // ═══ 本周新增 ═══
        { id: 'dc001', name: 'Equinix SG2',          r1: '新加坡',  r2: '新加坡', r3: '新加坡',  address: '1 Genting Lane, Singapore 349544',  status: 'collected',   customer: 'Equinix',    cabinet_count: 1800, cabinet_power: 10, pue_design: 1.35, cooling_type: '风冷+冷冻水', kycStatus: 'approved', remark: '新加坡核心交换节点', kycRemark: 'KYC审核通过', source: '客户介绍', property: '自有', delivery_date: '2025-06', contact_person: '张伟', power_mw: 50, power_expand: true, transformer: '2×2.5MVA', ups_config: '2N', ups_runtime: 15, genset_redundancy: 'N+1', genset_runtime: 48, busbar: '母线槽', power_sla: '99.99%', liquid_cooling: false, floor_load: '12kN/m²', floor_height: '600mm', chiller_count: 4, network_routes: '双路由', carrier_count: 8, network_800g: true, cabinet_available: 200, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*5).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc002', name: 'STT Bangkok 1',        r1: '泰国',    r2: '曼谷',   r3: '曼谷',    address: 'Bang Khen District, Bangkok 10220', status: 'new',         customer: 'STT GDC',   cabinet_count: 800,  cabinet_power: 10, pue_design: 1.42, cooling_type: '风冷', kycStatus: 'pending', remark: '曼谷重要节点', kycRemark: '待补充资料', source: '展会', property: '租赁', delivery_date: '2025-09', contact_person: '李明', power_mw: 25, power_expand: true, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc003', name: 'DCI Indonesia JK01',    r1: '印尼',    r2: '雅加达', r3: '雅加达',  address: 'Jl. Kebayoran Lama, Jakarta Barat',   status: 'collected',   customer: 'DCI',       cabinet_count: 600,  cabinet_power: 6,  pue_design: 1.5,  cooling_type: '风冷', kycStatus: 'approved', remark: '雅加达核心', kycRemark: '', source: '合作伙伴', property: '合资', contact_person: '王芳', power_mw: 15, createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000).toISOString(),   updatedAt: new Date().toISOString() },
        // ═══ 本周新增（今天创建）═══
        { id: 'dc010', name: 'NTT Jakarta 2',        r1: '印尼',    r2: '雅加达', r3: '雅加达',  address: 'Kuningan, Jakarta Selatan',          status: 'new',         customer: 'NTT',       cabinet_count: 1200, cabinet_power: 12, pue_design: 1.28, cooling_type: '液冷', kycStatus: 'in_progress', remark: '液冷机房，AI就绪', kycRemark: 'KYC 进行中，缺营业执照', source: '主动开发', property: '自有', delivery_date: '2025-12', contact_person: '赵强', power_mw: 40, power_expand: true, liquid_cooling: true, createdBy: 'u001', createdByName: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc011', name: 'Keppel DC SG3',        r1: '新加坡',  r2: '新加坡', r3: '新加坡',  address: '25 Serangoon North Ave 7, Singapore', status: 'new',         customer: 'Keppel DC', cabinet_count: 1500, cabinet_power: 15, pue_design: 1.25, cooling_type: '冷冻水', kycStatus: 'pending', remark: '新建机房，容量充足', kycRemark: '', source: '客户推荐', property: '自有', contact_person: '陈华', power_mw: 60, createdBy: 'u002', createdByName: '张三',   createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 签约进行中 ═══
        { id: 'dc004', name: 'Supernap Thailand 1',   r1: '泰国',    r2: '春武里', r3: '春武里',  address: 'Amata City, Chonburi',                status: 'negotiating', customer: 'Supernap',  cabinet_count: 2000, cabinet_power: 15, pue_design: 1.38, cooling_type: '液冷', kycStatus: 'in_progress', remark: 'TCC集团项目，液冷改造中', kycRemark: 'KYC审核中，已补材料', source: '展会', property: '租赁', delivery_date: '2026-03', contact_person: 'Somchai', power_mw: 80, power_expand: true, liquid_cooling: true, createdBy: 'u001', createdByName: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc012', name: 'Digital Realty SIN3',  r1: '新加坡',  r2: '新加坡', r3: '新加坡',  address: '1 Sunview Road, Singapore',          status: 'negotiating', customer: 'Digital Realty', cabinet_count: 2200, cabinet_power: 14, pue_design: 1.22, cooling_type: '风冷+冷冻水', kycStatus: 'approved', remark: 'Tier IV认证，价格较高', kycRemark: '', source: '主动开发', property: '自有', contact_person: 'Kevin', power_mw: 90, cabinet_available: 300, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000).toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 已签约 ═══
        { id: 'dc005', name: 'Keppel DC Singapore 2',  r1: '新加坡',  r2: '新加坡', r3: '新加坡',  address: '55 Ayer Rajah Crescent, Singapore',  status: 'signed',      customer: 'Keppel DC', cabinet_count: 2500, cabinet_power: 12, pue_design: 1.3,  cooling_type: '冷冻水', kycStatus: 'approved', remark: '关灯哥重点项目', kycRemark: '', source: '客户推荐', property: '自有', contact_person: '林志强', power_mw: 100, createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc013', name: 'AirTrunk SYD-2',        r1: '澳大利亚',r2: '新南威尔士',r3:'悉尼',   address: 'Sydney Olympic Park, NSW',           status: 'signed',      customer: 'AirTrunk', cabinet_count: 3500, cabinet_power: 14, pue_design: 1.28, cooling_type: '液冷', kycStatus: 'approved', remark: '超大规模，部署中', kycRemark: '', source: '主动开发', property: '自有', delivery_date: '2025-08', contact_person: 'John', power_mw: 150, power_expand: true, liquid_cooling: true, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 已收录 ═══
        { id: 'dc006', name: 'AirTrunk SYD-1',         r1: '澳大利亚',r2: '新南威尔士',r3:'悉尼',   address: 'Sydney Olympic Park, NSW',           status: 'new',         customer: 'AirTrunk', cabinet_count: 3000, cabinet_power: 12, pue_design: 1.3,  cooling_type: '风冷', kycStatus: 'pending', remark: '超大规模项目', kycRemark: '', source: '展会', property: '自有', contact_person: 'Michael', power_mw: 120, createdBy: 'u001', createdByName: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc014', name: 'NTT Tokyo 1',           r1: '日本',    r2: '东京都', r3: '东京',    address: 'Tama City, Tokyo',                   status: 'collected',   customer: 'NTT',       cabinet_count: 1800, cabinet_power: 10, pue_design: 1.32, cooling_type: '风冷+冷冻水', kycStatus: 'approved', remark: '东京核心节点', kycRemark: '', source: '合作伙伴', property: '自有', contact_person: '田中', power_mw: 70, createdBy: 'u002', createdByName: '张三',   createdAt: new Date(Date.now()-86400000*4).toISOString(), updatedAt: new Date().toISOString() },
        { id: 'dc015', name: 'GDS Shanghai 1',        r1: '中国',    r2: '上海',   r3: '上海',    address: 'Pudong New Area, Shanghai',          status: 'collected',   customer: 'GDS',       cabinet_count: 2500, cabinet_power: 11, pue_design: 1.35, cooling_type: '冷冻水', kycStatus: 'approved', remark: '上海核心机房', kycRemark: '', source: '客户介绍', property: '自有', contact_person: '黄伟', power_mw: 80, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*6).toISOString(), updatedAt: new Date().toISOString() },
        // ═══ 已淘汰 ═══
        { id: 'dc016', name: 'Small DC Vietnam',      r1: '越南',    r2: '胡志明市',r3:'胡志明市',address: 'District 7, Ho Chi Minh City',       status: 'rejected',    customer: 'Local ISP', cabinet_count: 200, cabinet_power: 4,  pue_design: 1.8,  cooling_type: '风冷', kycStatus: 'not_started', remark: '基础设施弱，不推荐', kycRemark: '承重不足，电力冗余低', source: '主动开发', property: '租赁', contact_person: 'Nguyen', power_mw: 5, power_expand: false, createdBy: 'u001', createdByName: '管理员', createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: new Date().toISOString() },
      ];
      // 写入时确保新旧字段名都有
      seed = seed.map(function(d) {
        return compatWrite(d);
      });
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
        .filter(function(d){ return !d._deleted; })
        .map(function(d) { return normalizeDatacenter(d); }); // 兼容读取

      if (keyword) {
        var kw = keyword.toLowerCase();
        list = list.filter(function(d) {
          return (d.name||'').toLowerCase().includes(kw) ||
                 (d.address||'').toLowerCase().includes(kw) ||
                 (d.customer||'').toLowerCase().includes(kw) ||
                 (d.r3||d.city||'').toLowerCase().includes(kw) ||
                 (d.r1||d.country||'').toLowerCase().includes(kw);
        });
      }
      if (status)   list = list.filter(function(d){ return d.status   === status;   });
      if (country)  list = list.filter(function(d){ return (d.r1||d.country) === country;  });
      if (createdBy) list = list.filter(function(d){ return d.createdBy === createdBy; });

      return ok({ list: list, total: list.length });
    },

    getDatacenter: function(id) {
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]')
        .filter(function(d){ return !d._deleted; });
      var item = list.find(function(d){ return d.id === id; });
      if (!item) return err('记录不存在');
      return ok(normalizeDatacenter(item)); // 兼容读取
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
      }, compatWrite(data)); // 兼容写入
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      list.unshift(record);
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      addChangelog(record.id, record.name, 'create',
        '新增机房 [' + (record.name||'') + ']',
        user ? user.name : '管理员');
      return ok(normalizeDatacenter(record));
    },

    updateDatacenter: function(id, data) {
      var list = JSON.parse(localStorage.getItem(K.datacenters) || '[]');
      var idx  = list.findIndex(function(d){ return d.id === id; });
      if (idx === -1) return err('记录不存在');
      var oldRecord = list[idx];
      var compatData = compatWrite(data); // 兼容写入
      var changedFields = [];
      Object.keys(compatData).forEach(function(key) {
        if (oldRecord[key] !== compatData[key]) changedFields.push(key);
      });
      list[idx] = Object.assign({}, oldRecord, compatData, { updatedAt: now() });
      localStorage.setItem(K.datacenters, JSON.stringify(list));
      if (changedFields.length > 0) {
        addChangelog(list[idx].id, list[idx].name, 'update',
          '更新字段：' + changedFields.join('、'),
          getUser() ? getUser().name : '未知');
      }
      return ok(normalizeDatacenter(list[idx]));
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
