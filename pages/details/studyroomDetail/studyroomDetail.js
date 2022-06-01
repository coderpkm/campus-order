const app = getApp();
const baseUrl = require('../../utils/config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},  // 用户信息
    seatlist: '',  // 预约座位信息
    myId: '', // 签到页传回的id
    seatListInfo: '', // 全部的自习室信息
    isShow: 0, // 用于判断签到是否过期
    idx: '', // 预约信息的id
  },

  // 签到是否过期
  isOverdue() {
    var that = this
    let now_time = new Date()  // 现在的时间
    let year = new Date().getFullYear()
    let month = new Date().getMonth() + 1
    let d = new Date().getDate()
    let ymd = [year, month, d].join('-')
    let end = ymd + ' ' + this.data.seatlist.end_time
    let e = new Date(end)
    if(now_time.getTime() - e.getTime() > 0) { // 签到过期
      wx.request({
        url: baseUrl + '/my/order/updateseat?id=' + this.data.idx,
        method: 'POST',
        header: {
          "Content-Type": 'application/x-www-form-urlencoded',
          "Authorization": this.data.userInfo.token
        },
        data: {
          id: this.data.idx,
          state: '签到已过期'
        },
        success(res) {
          console.log(res);
          if(res.data.status === 0) {
            that.getMySeat()
          }
        }
      })

    }
  },

  // 签到时间函数
  time_range(beginTime, endTime, nowTime) {
    var strb = beginTime.split (":");
    if (strb.length != 2) {
        return false;
    }
    var stre = endTime.split (":");
    if (stre.length != 2) {
        return false;
    }
    var strn = nowTime.split (":");
    if (stre.length != 2) {
        return false;
    }
    var b = new Date ();
    var e = new Date ();
    var n = new Date ();
    b.setHours (strb[0]);
    b.setMinutes (strb[1]);
    e.setHours (stre[0]);
    e.setMinutes (stre[1]);
    n.setHours (strn[0]);
    n.setMinutes (strn[1]);
    if(n.getTime() - b.getTime() <= 0) {
      wx.showToast({
        title: '未到签到时间！',
        icon: 'none',
        duration: 2000
      })
    } else if(n.getTime() - e.getTime() > 0) {
      wx.showToast({
        title: '签到已过期',
        icon: 'none',
        duration: 2000
      })
    } else {
      var id = this.data.seatlist.id; // 预约信息的id
      wx.navigateTo({
        url: '/pages/location_check_in/location_check_in?id='+id 
      })
    }
  },

  // 跳转到位置签到
  toLocation(e) {
    let start_time = this.data.seatlist.start_time; // 开始时间
    
    let year = new Date().getFullYear()
    let month = new Date().getMonth() + 1
    let d = new Date().getDate()
    let ymd = [year, month, d].join('-')
    let time = ymd + ' ' + start_time
    let date1 = new Date(time)
    let date2 = new Date(date1.getTime() + 60*1000*15)
    let end_time = date2.toString().slice(-26, -21) // 签到的结束时间
    
    const h1 = new Date().getHours()
    const h = h1 < 10 ? '0' + h1 : h1
    const m1 = new Date().getMinutes()
    const m = m1 < 10 ? '0' + m1 : m1
    const now_time = [h, m].join(':') // 现在的时间
    this.time_range(start_time, end_time, now_time) // 调用签到函数时间
    
  },

    // 获取全部自习室信息
    getSeatInfo() {
      let that = this
      wx.request({
        url: baseUrl + '/my/order/studyrooms',
        method: "GET",
        header: {
          "Content-Type": 'application/json',
          "Authorization": that.data.userInfo.token
        },
        success: (res) => {
          this.setData({
            seatListInfo: res.data.data
          })
        }
      })
    },
  
    // 取消预约
    deleteOrder(e) {
      var that = this;
      // 获取预约信息的id
      let id = that.data.seatlist.id;
      wx.showModal({
        title: '提示',
        content: '是否取消预约？',
        success: (res) => {
          if(res.confirm) {
            wx.request({  // 发送删除预约信息的请求
              url: baseUrl + '/my/order/deleteseats/'+id,
              method: 'GET',
              header: {
                "Content-Type": 'application/json',
                "Authorization": that.data.userInfo.token
              },
              // 如果删除成功则返回到上一页（我的页面）
              success: (res) => {
                // console.log(res)
                if(res.data.status === 0) {
                  wx.navigateBack({
                    delta: 1,
                  })
                  // let pages = getCurrentPages() // 获取页面数组
                  // let prePage = pages[pages.length - 2]  // 上一个页面
                  // prePage.onLoad() // 调用上一个页面的 onLoad方法
                }
              }
            })
            let seatLists = that.data.seatListInfo // 全部自习室信息
            let myseat = that.data.seatlist // 自己预约的信息
     
            // 判断取消预约的自习室是哪一个，则修改它的剩余座位数+1
            for(let i = 0; i < seatLists.length; i++){
              if(myseat.location == seatLists[i].sturoom_name) {
                wx.request({
                  url: baseUrl + '/my/order/updatehaveseat?id=' + seatLists[i].id,
                  method: "POST",
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "Authorization": that.data.userInfo.token
                  },
                  data: {
                    id: seatLists[i].id,
                    have_seat: seatLists[i].have_seat + 1
                  },
                  
                })
              }
            }
          }
        }
      })
    },
    
  
    // 从签到页返回后调用这个方法,获取预约自习室座位的信息
    getSeatList() {
      var that = this
      // 获取预约自习室座位的信息
      wx.request({
        url: baseUrl + '/my/order/getseat/'+that.data.myId,
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": that.data.userInfo.token
        },
        success: (res) => {
          that.setData({
            seatlist: res.data.data
          })
        }
      })
    },

    // 自己预约的座位
    getMySeat() {
      var that = this
      // 获取预约自习室座位的信息
      wx.request({
        url: baseUrl + '/my/order/getseat/'+that.data.idx,
        method: 'GET',
        header: {
          "Content-Type": 'application/json',
          "Authorization": that.data.userInfo.token
        },
        success: (res) => {
          that.setData({
            seatlist: res.data.data
          })
        }
      })
    },

    // 续时
    goTime(){
      var that = this
      let now_time = new Date()  // 现在的时间
      let year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      let d = new Date().getDate()
      let ymd = [year, month, d].join('-')
      let end = ymd + ' ' + this.data.seatlist.end_time //预约的结束时间
      let e = new Date(end)
      let end_time1 = new Date(e.getTime() + 1000*60*60)
      let end_time = end_time1.toString().slice(-26, -21)
      if(e.getTime() - now_time.getTime() > 1000*60*30) {
        wx.showToast({
          title: '暂不能续时!',
          icon: "none",
          duration: 2000
        })
      } else if(e.getTime() - now_time.getTime() <= 60*1000*30) {
        // 发送修改预约时间的请求
        wx.request({
          url: baseUrl + '/my/order/updatetime?id=' + that.data.idx,
          method: "POST",
          header: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Authorization": this.data.userInfo.token
          },
          data: {
            id: that.data.idx,
            end_time
          },
          success:(res) => {
            if(res.data.status === 0) {
              wx.showToast({
                title: '续时成功',
                duration: 2000
              })
              that.getMySeat()
            }
          }
        })
      }
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // 获取预约信息的id
    let idx = options.index
    // 是否获取到用户信息
    let userInfo = wx.getStorageSync('userInfo')
    if(userInfo) {
      this.setData({
        userInfo,
        idx
      })
      // 获取预约自习室座位的信息
      wx.request({
        url: baseUrl + '/my/order/getseat/'+idx,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          "Authorization": this.data.userInfo.token
        },
        success: (res) => {
          
          this.setData({
            seatlist: res.data.data
          })
          if(res.data.status === 0) {
            // 签到是否已过期
            this.isOverdue()
          }
          
        }
      })

      //获取全部自习室信息
      this.getSeatInfo()

      
    }
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var that=this;
    // let pages = getCurrentPages();
    // let currPage = pages[pages.length - 1];
    // currPage.onLoad()
    
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