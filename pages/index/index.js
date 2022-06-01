// pages/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 用户的信息
  },
  // 跳转到自习室座位预约页面
  toStudyRoom() {
    wx.navigateTo({
      url: '/pages/studyroom_list/studyroom_list',
    })
  },

  // 跳转到报修页面
  toMaintainOrder() {
    wx.navigateTo({
      url: '/pages/maintainOrder/maintainOrder',
    })
  },
  // 跳转到教室预约页面
  toClassRoom() {
    wx.navigateTo({
      url: '/pages/classroom_list/classroom_list',
    })
  },
  // 更多功能
  showModal(){
    wx.showModal({
      content: '更多功能，敬请期待！',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取登录信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo) {
      this.setData({
        userInfo
      })
    }

    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})