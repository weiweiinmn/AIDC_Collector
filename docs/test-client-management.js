// 客户管理模块测试脚本
// 在浏览器控制台中运行此脚本进行功能测试

console.log('=== 客户管理模块测试 ===\n');

// 测试1: 检查全局变量
console.log('✓ 测试1: 全局变量检查');
console.log('  - allCustomers:', typeof allCustomers !== 'undefined' ? '✅ 存在' : '❌ 不存在');
console.log('  - allDatacenters:', typeof allDatacenters !== 'undefined' ? '✅ 存在' : '❌ 不存在');
console.log('  - selectedClients:', typeof selectedClients !== 'undefined' ? '✅ 存在' : '❌ 不存在');

// 测试2: 数据结构验证
console.log('\n✓ 测试2: 数据结构验证');
if (typeof allCustomers !== 'undefined' && allCustomers.length > 0) {
  const customer = allCustomers[0];
  console.log('  - 客户ID:', customer._id ? '✅' : '❌');
  console.log('  - 客户名称:', customer.name ? '✅' : '❌');
  console.log('  - 客户状态:', ['active', 'paused', 'churned'].includes(customer.status) ? '✅' : '❌');
}

if (typeof allDatacenters !== 'undefined' && allDatacenters.length > 0) {
  const dc = allDatacenters[0];
  console.log('  - 机房reservedClients:', Array.isArray(dc.reservedClients) ? '✅' : '❌');
}

// 测试3: 功能函数检查
console.log('\n✓ 测试3: 功能函数检查');
const functions = [
  'navigateTo', 'renderCustomerTable', 'openAddCustomerModal', 
  'editCustomer', 'saveCustomer', 'deleteCustomer',
  'renderMultiSelect', 'toggleClient', 'applyFilters'
];
functions.forEach(fn => {
  console.log(`  - ${fn}():`, typeof window[fn] === 'function' ? '✅' : '❌');
});

// 测试4: 数据关联验证
console.log('\n✓ 测试4: 数据关联验证');
if (typeof allDatacenters !== 'undefined' && typeof allCustomers !== 'undefined') {
  const dcWithReservation = allDatacenters.find(d => d.reservedClients && d.reservedClients.length > 0);
  if (dcWithReservation) {
    const validReservation = dcWithReservation.reservedClients.every(cid => 
      allCustomers.some(c => c._id === cid)
    );
    console.log('  - 预留客户ID有效性:', validReservation ? '✅' : '❌');
    console.log('  - 示例机房:', dcWithReservation.name);
    console.log('  - 预留客户数:', dcWithReservation.reservedClients.length);
  }
}

// 测试5: UI元素检查
console.log('\n✓ 测试5: UI元素检查');
const elements = [
  'page-customers', 'customerTableBody', 'customerModal',
  'clientFilter', 'reservedClientsSelect'
];
elements.forEach(id => {
  console.log(`  - #${id}:`, document.getElementById(id) ? '✅' : '❌');
});

// 测试6: 统计数据
console.log('\n✓ 测试6: 统计数据');
if (typeof allCustomers !== 'undefined') {
  console.log('  - 总客户数:', allCustomers.length);
  console.log('  - 活跃客户:', allCustomers.filter(c => c.status === 'active').length);
  console.log('  - 暂停客户:', allCustomers.filter(c => c.status === 'paused').length);
}
if (typeof allDatacenters !== 'undefined') {
  const reservedCount = allDatacenters.filter(d => d.reservedClients && d.reservedClients.length > 0).length;
  console.log('  - 总机房数:', allDatacenters.length);
  console.log('  - 已预留机房:', reservedCount);
}

console.log('\n=== 测试完成 ===');
console.log('提示: 在浏览器中打开 idc-admin-v3.html 后,在控制台运行此脚本');
