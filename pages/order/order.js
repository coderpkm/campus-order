// pages/order/order.js
const app = getApp()
const baseUrl = require('../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navId: 0, // 标识
    // 导航栏
    navList: [
      {
        id: 0,
        name: '自习室座位预约'
      },
      {
        id: 1,
        name: '教室预约'
      },
      {
        id: 2,
        name: '宿舍维修预约'
      },
    ],
    userInfo: {}, // 用户信息
    seatlist: [], // 自习室座位预约信息
    classroomlist: [], // 预约教室信息
    maintainlist: [], // 宿舍维修预约信息
    isLogin: false, // 用于判断是否跳转
    openid: '', //用户的唯一标识
  },

    // 导航栏切换
    navChange(e) {
      let currentId = e.target.dataset.id;
      if(this.data.navId === currentId) {
        return;
      } else {
        this.setData({
          navId: currentId
        })
      }
        
    },
    // 对应导航的内容切换
    swiperChange(e) {
      let navId = e.detail.current;
        this.setData({
          navId
        })
    },

    // 跳转到自习室座位预约详情页
    tostudyroomDetail(e) {
      var that = this
      // if(that.data.isLogin) return; 
      let index = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: '/pages/details/studyroomDetail/studyroomDetail?index='+index,
      })
    },
    // 跳转到教室预约详情
    toclassroomDetail(e){
      var that = this
      // if(that.data.isLogin) return;
      let index = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: '/pages/details/classroomDetail/classroomDetail?index='+index,
      })
    },
    // 跳转到宿舍维修预约详情
    tomaintainDetail(e) {
      var that = this
      // if(that.data.isLogin) return;
      let index = e.currentTarget.dataset.index;
      wx.navigateTo({
        url: '/pages/details/maintainDetail/maintainDetail?index='+index,
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo')
    let openid = wx.getStorageSync('openid')
    if(userInfo) {
      this.setData({
        userInfo,
        openid
      })
      // 请求获取预约自习室座位信息的接口
      wx.request({
        url: baseUrl + '/my/order/seats',
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": this.data.userInfo.token
        },
        success: (res) => {
          // console.log(res)
          this.setData({
            seatlist: res.data.data
          })
        },
      })


      // 请求获取预约教室信息的接口
      wx.request({
        url: baseUrl + '/my/order/classrooms',
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": this.data.userInfo.token
        },
        success: (res) => {
          this.setData({
            classroomlist: res.data.data
          })
        }
      })


      // 请求获取预约宿舍维修信息的接口
      wx.request({
        url: baseUrl + '/my/order/maintains',
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": this.data.userInfo.token
        },
        success: (res) => {
          this.setData({
            maintainlist: res.data.data
          })
        }

      })

    }
  },

    onShow: function() {
      // 刷新当前页面
      const pages = getCurrentPages()
      const perpage = pages[pages.length - 1]
      perpage.onLoad()
    }

})