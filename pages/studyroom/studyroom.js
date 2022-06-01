const app = getApp()
const baseUrl = require('../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 用户信息
    openid: '', // 唯一标识
    studyroomInfo: '', // 自习室信息
    seatInfo: '', // 预约自习室座位的信息
    nowYear: '', // 年
    nowMonth: '', //月
    nowDay: '', //日
    nowHour: '', //小时
    nowTime: '', //
    startTime: '07:00', // 开始时间
    endTime: '07:00', // 结束时间

    seat_num: '',// 预约的座位号
    iconColor: [], //座位图标颜色
    have_seat: '', // 剩余的座位数
    idx: '', // 自习室的id
    current_seat: -1,  // 点击的座位
    isOrder: 0, // 记录用户预约座位数
  },

  // 开始时间
  startChange(e) {
    this.setData({
      startTime: e.detail.value
    })
  },
  // 结束时间
  endChange(e) {
    this.setData({
      endTime: e.detail.value
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    let idx = options.index
     // 获取用户信息 
     let userInfo = wx.getStorageSync('userInfo');
     let openid = wx.getStorageSync('openid');
     if(userInfo) {
       this.setData({
         userInfo,
         openid,
         idx
       })
     }
     // 时间
    var month = new Date().getMonth() + 1;
    var day = new Date().getDate();
    this.setData({
      nowYear: new Date().getFullYear(),
      nowMonth: month < 10 ? '0' + month : month,
      nowDay: day < 10 ? '0' + day : day,
      nowHour: new Date().getHours()
    })

   // 获取对应自习室的信息
   wx.request({
     url: baseUrl + '/my/order/getstudyrooms/'+ options.index,
     method: "GET",
     header: {
      "Content-Type": 'application/json',
      "Authorization": this.data.userInfo.token
    },
    success: (res) => {
      // console.log(res);
      this.setData({
        studyroomInfo: res.data.data
      })
    }
   })

   // 获取预约自习室座位的全部信息
   
    that.getSeats()
    that.getIsOrder()

  },
  // 获取预约自习室座位的全部信息
  getSeats() {
    wx.request({
      url: baseUrl + '/my/order/seats',
      method: "GET",
      header: {
       "Content-Type": 'application/json',
       "Authorization": this.data.userInfo.token
     },
     success: (res) => {
       // console.log(res)
       let seatInfo = res.data.data
       this.setData({  // 获取到全部的预约信息
         seatInfo: seatInfo
       })
      let iconColor = []  // 颜色
       for(let i = 0; i < this.data.studyroomInfo.seats_num; i++) { // 给每个座位都设置灰色
         iconColor.push('#ccc')
       }
       let myopenid = this.data.openid  // 用户的opeind
       let sturoomname = this.data.studyroomInfo.sturoom_name //自习室地点
       let tadaytime = this.data.nowYear+'-'+this.data.nowMonth+'-'+this.data.nowDay;  // 当天的时间
       for(let j = 0; j < seatInfo.length; j++) { 
         // 如果预约的是自己则座位颜色为绿色 
         if(myopenid == seatInfo[j].openid && sturoomname == seatInfo[j].location && tadaytime == seatInfo[j].sub_date) { 
           iconColor[seatInfo[j].seat_num - 1] = '#3dce42'
         } 
         // 其他用户预约的为红色
         else if(myopenid != seatInfo[j].openid && sturoomname == seatInfo[j].location && tadaytime == seatInfo[j].sub_date){  
           iconColor[seatInfo[j].seat_num - 1] = '#f00'
         }
       }
       this.setData({
         iconColor
       })
       
     }
    })
  },

  // 记录当天是否预约了座位 
  getIsOrder() {
    let seatInfo = this.data.seatInfo // 预约的全部信息
    let myopenid = this.data.openid  // 用户的opeind
    let tadaytime = this.data.nowYear+'-'+this.data.nowMonth+'-'+this.data.nowDay;  // 当天的时间
    for(let k = 0; k <seatInfo.length; k++) {
      // 如果用户当天预约了座位，则记录 1
      if(tadaytime == seatInfo[k].sub_date && myopenid == seatInfo[k].openid) {
        
        this.setData({
          isOrder: 1
        })
      } 
      // console.log(this.data.isOrder);
    }
  },

  // 修改自习室的座位数
  updateSeat() {
    var that = this
    that.getSeats()  // 获取全部的预约信息
  
    // 剩余座位数 = 预约一个座位则 - 1
    that.setData({
      have_seat: that.data.studyroomInfo.have_seat - 1
    })
    // 发送修改座位数的请求
    wx.request({
      url: baseUrl + '/my/order/updatehaveseat?id='+ that.data.idx,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": that.data.userInfo.token,
      },
      data: {
        id: that.data.idx,
        have_seat: that.data.have_seat
      },
      success: (res) => {
        console.log(res);
      }
    })
  },

  // 点击座位号
  clickhandle(e) {
    var that = this;
    that.getIsOrder()
    let idx = e.currentTarget.dataset.index // 点击座位的下标
    if(that.data.isOrder == 1) {
      wx.showToast({
        title: '您已预约座位，请勿重复预约！',
        icon: 'none',
        duration: 2000
      })
    } else {
      that.setData({
        current_seat: idx
      })
      wx.showModal({
        content: `是否选择${idx+1}号？`,
        success: (res)=> {
          if(res.confirm) {
            that.setData({
              seat_num: idx , // 获取点击的座位号码的下标
              // 更改颜色
            })
          } else {
            console.log(124);
            
          }
        }
      })
    }
    
    
  },

  // 提交表单
  formSubmit(e) {
    var that = this;
    // console.log(that.data.userInfo)
    let location = that.data.studyroomInfo.sturoom_name;
    // console.log(location)
    // 预约日期
    let sub_date = that.data.nowYear + '-' + that.data.nowMonth + '-' + that.data.nowDay;
    // 开始时间
    let start_time = e.detail.value.start_time;
    // 结束时间
    let end_time = e.detail.value.end_time;
    // 座位号
    let seat_num = that.data.seat_num + 1;
    if(that.data.seat_num.length == 0) {
      wx.showToast({
        title: '请选择座位',
        icon: 'none'
      })
    } else if(that.data.userInfo.credit_score < 70) {
      wx.showToast({
        title: '信誉分低于70，禁止预约！',
        icon: 'none',
        duration: 2000
      })
    } 
    else {
      wx.request({
        url: baseUrl + '/my/order/addseats',
        method: "POST",
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": that.data.userInfo.token,
        },
        data: {
          location: location,
          sub_date: sub_date,
          start_time: start_time,
          end_time: end_time,
          seat_num: seat_num,
          studentNo: that.data.userInfo.data.studentNo,
          username: that.data.userInfo.data.username,
          state: '未签到',
          openid: that.data.openid
        },
        success: (res) => {
          if(res.data.status == 0) {
            wx.showToast({
              title: '预约成功',
              icon: 'none'
            })
            that.updateSeat() // 调用修改剩余自习室座位数的函数
            let pages = getCurrentPages() // 获取页面数组
            let prePage = pages[pages.length - 2]  // 上一个页面
            prePage.getStudyRoom()  // 调用上一级的方法
          } else {
            wx.showToast({
              title: '预约失败',
              icon: 'none'
            })
          }
        }
      })
    }
  },

  
})