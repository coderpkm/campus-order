const app = getApp()
const baseUrl = require('../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 用户信息
    studyroom_list: '',   // 自习室
    seatInfo: '',  // 预约的全部信息
  },

  // 获取全部的自习室信息
  getStudyRoom() {
    wx.request({
      url: baseUrl + '/my/order/studyrooms',
      method: 'GET',
      header: {
        "Content-Type": 'application/json',
        "Authorization": this.data.userInfo.token
      },
      success: (res) => {
        // console.log(res)
        this.setData({
          studyroom_list: res.data.data,
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo) {
      this.setData({
        userInfo
      })
      // 获取预约自习室座位的全部信息
      // this.getSeatInfo()
      // 获取自习室的接口
      this.getStudyRoom()

      // 定时更新剩余可选座位
      setInterval(() => {
        that.formatTime()
      }, 1000)
      
    }
  },

  // 跳转到选座位页
  toStudyRoom(e) {
    // console.log(e)
    let index = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/studyroom/studyroom?index=' + index,
    })
  },
 
  // 获取时间 判断是否是 6点 如果是则更新自习室的剩余可选座位
  formatTime() {
    var that = this
    const h1 = new Date().getHours()
    const h = h1 < 10 ? '0' + h1 : h1
    const m1 = new Date().getMinutes()
    const m = m1 < 10 ? '0' + m1 : m1
    const hm = [h, m].join(':')
    let studyroom_list = that.data.studyroom_list
    if(hm == '06:00')  {
      for(let i = 0; i < studyroom_list.length; i++) {
        wx.request({
          url: baseUrl + '/my/order/updatehaveseat?id='+ studyroom_list[i].id,
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Authorization": that.data.userInfo.token,
          },
          data: {
            id: studyroom_list[i].id,
            have_seat: studyroom_list[i].seats_num
          },
        })
      }
    } 
  },
})