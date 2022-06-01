const app = getApp();
const baseUrl = require('../utils/config.js')
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {} , // 用户信息
    isShow: true,  // 是否显示
    credit_score: '', // 信誉分
  },
  
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

    // 跳转到登录页面
    toLogin() {
      // 如果有获取到了数据，则禁止跳转到登录页面
      if(this.data.userInfo.nickname){
        return;
      }
      wx.navigateTo({
        url: '/pages/login/login',
      })
    },

    // 获取用户的信息 
    getUser() {
      const that = this
      wx.request({
        url: baseUrl + '/my/userinfo' ,
        method: "GET",
        header: {
          'Content-Type': 'application/json' ,
          "Authorization": that.data.userInfo.token
        },
        success: (res) => {
          that.setData({
            credit_score: res.data.data.credit_score  // 信誉分
          })
        }
      })
    },
    // 获取时间，如果是星期一的06:00，则信誉分恢复为100
    formatTime() {
      var that = this
      const h1 = new Date().getHours()  // 小时
      const h = h1 < 10 ? '0' + h1 : h1
      const m1 = new Date().getMinutes()  // 分钟
      const m = m1 < 10 ? '0' + m1 : m1
      const w = new Date().getDay() // 星期
      const arr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const hm = [h, m].join(':')
      const whm = [arr[w], hm].join('-')
      if(whm == '星期日-22:04') {
        wx.request({
          url: baseUrl + '/my/updatecredit?id=' + that.data.userInfo.data.id,
          method: 'POST',
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded' ,
            "Authorization": that.data.userInfo.token
          },
          data: {
            id: that.data.userInfo.data.id,
            credit_score: 900
          },
          success: (res) => {
            // console.log(res);
          }
        })
      }
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    // 获取登录信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo) {
      this.setData({
        userInfo,
        isShow: false
      })
    }
    this.formatTime()
    setTimeout(() => {
      that.getUser()
    })
   
  },

  //跳到自习室座位预约说明页
  toStudyroomRule() {
    wx.navigateTo({
      url: '/pages/my_list/studyroom_rule/studyroom_rule',
    })
  },
  //跳到教室预约说明页
  toClassroomRule() {
    wx.navigateTo({
      url: '/pages/my_list/classroom_rule/classroom_rule',
    })
  },
  //跳到宿舍维修预约说明页
  toMaintainRule(){
    wx.navigateTo({
      url: '/pages/my_list/maintain_rule/maintain_rule',
    })
  },
  // 跳转到忘记密码页面
  tomysafe() {
    wx.navigateTo({
      url: '/pages/my_list/change_pwd/change_pwd',
    })
  },

  onShow: function() {
    // 刷新当前页面
    const pages = getCurrentPages()
    const perpage = pages[pages.length - 1]
    perpage.onLoad()
  }
})

