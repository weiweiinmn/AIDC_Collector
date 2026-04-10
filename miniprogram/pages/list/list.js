// pages/list/list.js
const api = require('../../utils/api')
const { requireApproved, showLoading, showError, STATUS_OPTIONS, REGION_FILTER_OPTIONS } = require('../../utils/util')

Page({
  data: {
    keyword: '',
    activeFilter: 'all',
    activeRegion: 'all',
    filterTags: [
      { value: 'all', label: '全部' },
      { value: 'new', label: '新发现' },
      { value: 'visited', label: '已考察' },
      { value: 'negotiating', label: '谈判中' },
      { value: 'contracted', label: '已签约' },
      { value: 'rejected', label: '已排除' }
    ],
    regionTags: REGION_FILTER_OPTIONS,
    list: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    // if (!requireApproved()) return  // TODO: 登录功能完成后恢复
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

  // 搜索
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

  // 筛选
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

  // 区域筛选
  onRegionTap(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      activeRegion: value,
      page: 1,
      list: [],
      hasMore: true
    })
    this.loadList()
  },

  // 加载数据
  loadList() {
    this.setData({ loading: true })
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      keyword: this.data.keyword
    }
    if (this.data.activeFilter !== 'all') {
      params.status = this.data.activeFilter
    }
    if (this.data.activeRegion !== 'all') {
      params.region = this.data.activeRegion
    }

    return api.getDatacenters(params).then((result) => {
      const newList = (result.list || []).map(item => {
        const statusObj = STATUS_OPTIONS.find(s => s.value === (item.status || 'new'))
        return {
          ...item,
          statusText: statusObj ? statusObj.label : '新发现'
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

  // 加载更多
  loadMore() {
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    })
    this.loadList().then(() => {
      this.setData({ loadingMore: false })
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  goForm() {
    wx.navigateTo({ url: '/pages/form/basic' })
  }
})
