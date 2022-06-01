const app = getApp()
const baseUrl = require('../../utils/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 用户信息
    classroomlist: '' // 预约教室的信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    let userInfo = wx.getStorageSync('userInfo');
    // 是否获取到用户信息,可以就设置用户信息
    if(userInfo) {
      this.setData({
        userInfo
      })
      // 获取预约教室的信息
      let id = options.index; // 预约教室信息的id
      wx.request({
        url: baseUrl + '/my/order/getclassrooms/' + id,
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": this.data.userInfo.token
        },
        success: (res) => {
          // console.log(res)
          this.setData({
            classroomlist: res.data.data
          })
        }
      })
    }
  },

  // 取消预约教室
  deleteClassroom(e) {
    var that = this;
  //   that.setData({
  //    isLogin: true
  //  })
   
    let id = that.data.classroomlist.id;  // 获取预约教室信息的id
    let class_id = that.data.classroomlist.class_id;  // 教室的id
    wx.showModal({
      title: '提示',
      content: '是否取消预约？',
      success: (res) => {
        // 如果确定取消，则删除预约信息，修改该教室可以预约
        if(res.confirm) {
          // 删除预约信息
          wx.request({
            url: baseUrl+ '/my/order/deleteclassrooms/'+id,
            method: 'GET',
            header: {
              "Content-Type": 'application/json',
              "Authorization": that.data.userInfo.token
            }
          })
         
          // 修改该教室可以预约
          wx.request({
            url: baseUrl + '/my/order/updateisdel/'+ class_id,
            method: 'GET',
            header: {
              "Content-Type": 'application/json',
              "Authorization": that.data.userInfo.token
            }
          })

          //返回上一级
          wx.navigateBack({
            delta: 1,
          })
         let pages = getCurrentPages() // 获取页面数组
         let prePage = pages[pages.length - 2]  // 上一个页面
         prePage.onLoad() // 调用上一个页面的 onLoad方法
        }
      }
    })
    
  },


 
})