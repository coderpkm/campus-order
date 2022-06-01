// pages/details/maintainDetail/maintainDetail.js
const baseUrl = require('../../utils/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', //用户信息
    maintainlist: '', // 预约信息
    imgUrl: '', // 图片链接
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取预约信息的id
    let id = options.index
    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo');
    // 是否获取到用户信息,可以就设置用户信息
    if(userInfo) {
      this.setData({
        userInfo
      })
      // 获取预约教室的信息
      wx.request({
        url: baseUrl + '/my/order/getmaintains/' + id,
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": this.data.userInfo.token
        },
        success: (res) => {
          // console.log(res)
          if(res.data.status === 0) {
            let image = res.data.data.fault_img
            let imgUrl = image.replace(/\\/g, '/') // 修改图片链接的斜杠
            this.setData({
              maintainlist: res.data.data,
              imgUrl: baseUrl + imgUrl
            })
          }

        }
      })
    }
  },

  // 取消预约
  deleteMaintain(e) {
    var that = this;
    let id = that.data.maintainlist.id
    wx.showModal({
      title: '提示',
      content: '是否取消预约？',
      success: (res) => {
        if(res.confirm) {
          wx.request({
            url: baseUrl + '/my/order/deletemaintains/'+id,
            method: 'GET',
            header: {
              "Content-Type": 'application/json',
              "Authorization": that.data.userInfo.token
            },
            success: (res) => {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      }
    })
        
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