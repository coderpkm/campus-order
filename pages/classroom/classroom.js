const app = getApp()
const baseUrl = require('../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '', // 唯一标识
    nowYear: '', // 年
    nowMonth: '', //月
    nowDay: '', //日
    date: '', //第一个日期
    // datas: '', //第二个日期
    time: '', // 第二个时间
    times: '', // 第二个时间
    userInfo: {}, // 用户信息
    classroom_list: '', // 可预约教室信息
    id: '', // 教室列表的id
  },
  
  // 文本框
  textareaBInput(e) {
    this.setData({
      textareaBValue: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    // 修改教室列表的id
    let id = options.index;
    this.setData({
      id
    })
    // 时间
    var month = new Date().getMonth() + 1;
    var day = new Date().getDate();
    this.setData({
      nowYear: new Date().getFullYear(),
      nowMonth: month < 10 ? '0' + month : month,
      nowDay: day < 10 ? '0' + day : day
    })

    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo');
    let openid = wx.getStorageSync('openid');
    if(userInfo) {
      this.setData({
        userInfo,
        openid
      })
    }

    // 获取可预约教室信息
    wx.request({
      url: baseUrl + '/my/order/classroomlist',
      method: 'GET',
      header: { // 请求头
        "Content-Type": 'application/json',
        "Authorization": this.data.userInfo.token
      },
      success: (res) => {   // 跳转到对应教室的表单页
        for(let i = 0; i < res.data.data.length; i++) {
          if(options.index == res.data.data[i].id) {
            this.setData({
              classroom_list: res.data.data[i]
            })
          }
        }
      }
    })
  },

  // 提交预约表单
  formSubmit(e) {
    // console.log(e)
    var that = this;
    let id = that.data.id; // 教室列表的id
    let pub_date = that.data.nowYear + '-' + that.data.nowMonth + '-' + that.data.nowDay;
    let title = e.detail.value.title;
    let describe = e.detail.value.describe;
    let sub_date = that.data.classroom_list.space_date;
    let start_time = that.data.classroom_list.start_time;
    let end_time = that.data.classroom_list.end_time;
    let location = that.data.classroom_list.location;
    let class_id = id;
    let person = that.data.userInfo.data.username
    
    if(!that.data.userInfo.data.studentNo) { // 判断用户是否已经登录
      wx.showToast({
        title: '未登录, 请先登录！',
        icon: 'none',
        duration: 2000
      })
    } else if(title.length == 0) {
      wx.showToast({
        title: '主题不能为空！',
        icon: 'none'
      })
    } else if(describe.length == 0) {
      wx.showToast({
        title: '描述不能为空！',
        icon: 'none'
      })
    } else if(sub_date.length == 0) {
      wx.showToast({
        title: '空闲日期不能为空',
        icon: 'none'
      })
    } else if(start_time.length==0 || end_time.length==0) {
      wx.showToast({
        title: '预约时间段不能为空！',
        icon: 'none'
      })
    } else if(location.length == 0) {
      wx.showToast({
        title: '教室地点不能为空！',
      })
    } else {
      wx.request({
        url: baseUrl + '/my/order/addclassrooms',
        method: "POST",
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": that.data.userInfo.token,
        },
        data: {
          pub_date: pub_date,
          title: title,
          describe: describe,
          sub_date: sub_date,
          start_time: start_time,
          end_time: end_time,
          location: location,
          state: '等待审核',
          class_id: class_id,
          openid: that.data.openid,
          person: person
        },
        success: (res) => {
          console.log(res)
          if(res.data.status == 0){
            wx.showToast({
              title: '提交成功',
            })
            // 发布成功后需要删除该教室信息
            wx.request({
              url: baseUrl + '/my/order/delclassroomlist/'+id,
              method: 'GET',
              header: {
                "Content-Type": 'application/json',
                "Authorization": that.data.userInfo.token
              }
            })
          } else {
            wx.showToast({
              title: '提交失败',
              icon: 'loading'
            })
          }
        }
      })
    }
  },

  
})