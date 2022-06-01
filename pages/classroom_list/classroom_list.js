// pages/classroom_list/classroom_list.js
const app = getApp();
const baseUrl = require('../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},  // 用户信息
    classroom_list: '' // 可预约教室信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo) {
      this.setData({
        userInfo
      })
    }
    // 请求获取预约教室信息的接口
    wx.request({
      url: baseUrl + '/my/order/classroomlist',
      method: 'GET',
      header: {
        "Content-Type": 'application/json',
        "Authorization": this.data.userInfo.token
      },
      success: (res) => {
        this.setData({
          classroom_list: res.data.data
        })
      }
    })    
  },

  // 跳转到教室预约页
  toClassrooom(e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/classroom/classroom?index= '+index,
    })
  },
})