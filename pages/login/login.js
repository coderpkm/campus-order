// pages/login/login.js
const app = getApp()
const baseUrl = require('../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  // 登录
  formSubmit(e) {
    // console.log(e)
    // 学号为空
    if(e.detail.value.stunum.length == 0) {
      wx.showToast({
        title: '学号不能为空',
        icon: 'loading',
        duration: 2000
      }) 
    } else if (e.detail.value.pwd.length == 0) {
        wx.showToast({
          title: '密码不能为空',
          icon: 'loading',
          duration: 2000
        })
    } else if(e.detail.value.pwd.length < 6) {
      wx.showToast({
        title: '密码少于6位',
        icon: "loading",
        duration: 2000
      })
    } else {
      wx.request({
        url: baseUrl + '/api/login',
        method: 'POST',
        header: {'Content-Type': 'application/x-www-form-urlencoded' },   
        data: {
          studentNo: e.detail.value.stunum,
          password: e.detail.value.pwd
        },
        success: (res) => {
          if(res.data.status == 0 ) {
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            })
            // 信息存储到本地
            wx.setStorageSync('userInfo', res.data)
            wx.reLaunch({
              url: '/pages/index/index',
            })
          } else {
            wx.showToast({
              title: '学号或密码错误，请重新登录',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
      
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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