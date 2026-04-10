// mock/history.js - Demo 修改历史数据
const DEMO_HISTORY = [
  {
    _id: 'hist-001',
    datacenterId: 'demo-001',
    field: 'availablePower',
    oldValue: '6.0',
    newValue: '8.0',
    updatedBy: 'mock-admin-001',
    updatedByName: 'Willis',
    updatedAt: '2026-04-05T14:30:00.000Z'
  },
  {
    _id: 'hist-002',
    datacenterId: 'demo-001',
    field: 'status',
    oldValue: 'new',
    newValue: 'visited',
    updatedBy: 'mock-admin-001',
    updatedByName: 'Willis',
    updatedAt: '2026-04-03T10:15:00.000Z'
  },
  {
    _id: 'hist-003',
    datacenterId: 'demo-001',
    field: 'totalCabinets',
    oldValue: '1200',
    newValue: '1500',
    updatedBy: 'mock-admin-001',
    updatedByName: 'Willis',
    updatedAt: '2026-04-01T16:45:00.000Z'
  },
  {
    _id: 'hist-004',
    datacenterId: 'demo-002',
    field: 'pueDesign',
    oldValue: '1.40',
    newValue: '1.25',
    updatedBy: 'mock-admin-001',
    updatedByName: 'Willis',
    updatedAt: '2026-04-04T11:20:00.000Z'
  },
  {
    _id: 'hist-005',
    datacenterId: 'demo-002',
    field: 'status',
    oldValue: 'new',
    newValue: 'negotiating',
    updatedBy: 'mock-admin-001',
    updatedByName: 'Willis',
    updatedAt: '2026-04-02T09:30:00.000Z'
  }
]

module.exports = { DEMO_HISTORY }
