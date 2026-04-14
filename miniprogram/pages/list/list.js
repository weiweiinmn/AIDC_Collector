// pages/list/list.js - 机房列表页（支持「我的录入」与「全部」切换）
const api = require('../../utils/api')
const { showLoading, showError, STATUS_OPTIONS } = require('../../utils/util')
const app = getApp()

Page({
  data: {
    // 列表模式：'mine' = 我的录入，'all' = 全部
    listMode: 'mine',
    keyword: '',
    activeFilter: 'all',
    filterTags: [
      { value: 'all', label: '全部' },
      { value: 'new', label: '新发现' },
      { value: 'visited', label: '已考察' },
      { value: 'negotiating', label: '洽谈中' },
      { value: 'contracted', label: '已签约' },
      { value: 'rejected', label: '已排除' }
    ],
    list: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadList()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true })
    this.loadList().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  // ---- 模式切换：我的录入 / 全部 ----
  onModeChange(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ listMode: mode, page: 1, list: [], hasMore: true })
    this.loadList()
  },

  // ---- 搜索 ----
  onSearchChange(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearchConfirm() {
    this.setData({ page: 1, list: [], hasMore: true })
    this.loadList()
  },

  onSearchClear() {
    this.setData({ keyword: '', page: 1, list: [], hasMore: true })
    this.loadList()
  },

  // ---- 状态筛选 ----
  onFilterTap(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      activeFilter: value,
      page: 1,
      list: [],
      hasMore: true
    })
    this.loadList()
  },

  // ---- 加载数据 ----
  loadList() {
    this.setData({ loading: true })
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      keyword: this.data.keyword
    }

    // 「我的录入」模式：只查自己录入的记录
    if (this.data.listMode === 'mine') {
      const userInfo = app.globalData.userInfo
      if (userInfo && userInfo._id) {
        params.createdBy = userInfo._id
      }
    }

    // 状态筛选
    if (this.data.activeFilter !== 'all') {
      params.status = this.data.activeFilter
    }

    return api.getDatacenters(params).then((result) => {
      const newList = (result.list || []).map(item => {
        const statusObj = STATUS_OPTIONS.find(s => s.value === (item.status || 'new'))
        // 归属显示：自己的显示「我录入」，其他的显示录入人名
        const myId = app.globalData.userInfo && app.globalData.userInfo._id
        const isMine = item.createdBy === myId
        return {
          ...item,
          statusText: statusObj ? statusObj.label : '新发现',
          creatorLabel: isMine ? '我录入' : (item.createdByName || '—')
        }
      })

      const list = this.data.page === 1 ? newList : [...this.data.list, ...newList]
      this.setData({
        list,
        loading: false,
        hasMore: newList.length >= this.data.pageSize
      })
    }).catch(() => {
      this.setData({ loading: false })
      showError('加载失败')
    })
  },

  // ---- 加载更多 ----
  loadMore() {
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    })
    this.loadList().then(() => {
      this.setData({ loadingMore: false })
    })
  },

  // ---- 跳转详情 ----
  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  // ---- 跳转新建 ----
  goForm() {
    wx.navigateTo({ url: '/pages/form/basic' })
  }
})
