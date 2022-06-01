// location_check_in/location_check_in.js
const util = require('../utils/util.js')
const app = getApp()
const baseUrl = require('../utils/config')

// 实例化API核心类
const qqmapsdk = app.globalData.qqmapsdk

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 用户的信息
    markers: '',  // 获取用户地址信息后的返回结果
    poi: {  // 用户位置的经纬度
      latitude: '',
      longitude: ''
    },
    sign: {  // 固定签到位置的经纬度
      lat: '', // 纬度
      lng: '',  // 经度
    },

    distance: '', // 两地的距离
    // studyroomAddress: '广东省东莞市麻涌镇沿江西路248号', // 自习室位置
    studyroomAddress: '广东省清远市英德市连江口镇政府', // 自习室位置
    addressName: '',  // 用户位置
    time: '',  // 年月日
    timer: '',
    timer2: '',  // 用来每个一段时间自动刷新一次定位
    canClick: true,
    id: '', // 记录是哪个签到的id
  },
// 设置固定的自习室位置，
 signInAddress(e) {
    var _this = this
    // 调用地址解析接口
    qqmapsdk.geocoder({
      // address: that.data.studyroomAddress,
      address: _this.data.studyroomAddress,
      success: (res) => {  
        _this.setData({
          sign: {
            lat: res.result.location.lat,
            lng: res.result.location.lng
          }
        })  
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

 // 获取用户地址
 getAddress(e) {
    var that = this;
    qqmapsdk.reverseGeocoder({// 逆地址解析
      success: function(res) {
        that.setData({
          addressName: res.result.address  // 地址名称
        })
        var res = res.result;
        var mks = [];
        //当get_poi为0时或者为不填默认值时，检索目标位置，按需使用
        mks.push({ // 获取返回结果，放到mks数组中
          title: res.address,  // 地址
          id: 0,  
          latitude: res.location.lat,  // 纬度
          longitude: res.location.lng,  // 经度
          iconPath: '../../assets/images/zcxj/myPosition.png', // 图标路径
          width: 21,
          height: 28,
          callout: { //在markers上展示地址名称，根据需求是否需要
            content: res.address,
            color: '#000',
            display: 'ALWAYS'
          }
        });
        that.setData({ // 设置markers属性和地图位置poi，将结果在地图展示
          markers: mks,
          poi: {
            latitude: res.location.lat,
            longitude: res.location.lng
          }
        });
      },
      // 失败的回调
      fail: function(error) {
        console.error(error);
      },
      complete: function(res) {
        // console.log(res);
      }
    })
  },

  // 计算两地的距离
  calDistance() {
    var _this = this
    qqmapsdk.calculateDistance({
      form: '',
      to: [{latitude: _this.data.sign.lat, longitude: _this.data.sign.lng}],
      success: (res) => {
        _this.setData({
          distance: res.result.elements[0].distance
        })
      },
      fail: (err) => {
        // console.log(err);
      }
    })
  },
  // 时间
  getTime() {
    let that = this
    let time = that.data.time
    that.setData({
      timer: setInterval(function () {
        time = util.formatTime(new Date())
        that.setData({
          time: time.substr(-8)
        });
        if (time == 0) {
          // 页面跳转后，要把定时器清空掉，免得浪费性能
          clearInterval(that.data.timer)
        }
      }, 1000)
    })
  },
  // 重新定位
  rePosition: function () {
    // console.log('用户点了重新定位')
    this.getAddress()
  },
  // 是否确认签到
  checkIn: function () {
    this.setData({
      canClick: false
    })
    // console.log('用户点击了签到')
    var that = this
    var nowTime = util.formatTime(new Date())
    wx.showModal({
      title: '请确认签到信息',
      // content: '请确认待整改项已整改完毕！',
      content: `地点：${this.data.addressName}\n时间：${nowTime}`,  // 开发者工具上没有换行，真机调试时会有的
      confirmText: '确认',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          // 调起签到接口
          that.realyCheckIn()
          
        } else if (res.cancel) {
          console.log('用户点击取消')
          that.setData({
            canClick: true
          })
        }
      }
    })
  },

  // 签到函数
  realyCheckIn() {
    var that = this
    if(that.data.distance > 5000000) { // 判断签到的位置是否在指定的范围内
      wx.showToast({
        title: '未在指定的区域内签到！签到失败！',
        icon: 'none',
        duration: 2000
      })
      wx.request({  // 签到失败
        url: baseUrl + '/my/order/updateseat?id='+ that.data.id,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": that.data.userInfo.token,
        },
        data: {
          state: '签到失败'
        }
      })
    } else {
      wx.showToast({
        title: '签到成功',
        duration: 2000
      })
      wx.request({  // 签到成功
        url: baseUrl + '/my/order/updateseat?id='+ that.data.id,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "Authorization": that.data.userInfo.token,
        },
        data: {
          id: that.data.id,
          state: '学习中'
        },
        success: (res) => {
          console.log(res);
          if(res.data.status === 0) {
            // 返回上一层
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 2000)
            let pages = getCurrentPages() // 获取页面数组
            let prePage = pages[pages.length - 2]  // 上一个页面
            // prePage.onLoad() // 调用上一个页面的 onLoad方法
            prePage.setData({  // 把id传回上一级
              myId: that.data.id
            })
            prePage.getSeatList()  // 调用上一级的方法
          }
        }
      })
      
      
    }
  },

 
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    // 获取到用户信息
    let userInfo = wx.getStorageSync('userInfo')
    var that = this
    that.getTime()
    that.signInAddress()  // 自习室位置
    that.getAddress()  // 用户位置
    that.calDistance()  // 距离
    that.setData({
      id: options.id,
      userInfo
    })
    
    that.setData({
      canClick: true, // 允许用户点击，防止多次提交
      timer2: setInterval(function () {
        that.getAddress()
      }, 20000)  // 每20秒刷新一次定位
    })

    setTimeout(() => {
      that.getAddress()  // 用户位置
      that.calDistance()  // 距离
    }, 1000);
 

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.timer2)
    console.log("定时器已被清除")
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