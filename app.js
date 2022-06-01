// 引入SDK核心类
var QQMapWX = require('pages/utils/qqmap-wx-jssdk.min.js')


App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: (res) => {
        const code = res.code   // 获取临时凭证code
        wx.request({  // 发送请求
          url: 'http://127.0.0.1:3007/api/getopenid?code='+code,
          method: 'POST',
          header: {'Content-Type': 'application/x-www-form-urlencoded' },
          // data: {
          //   code: code
          // },
          success: (res) =>{	//返回node请求到的OpenID与session_key
            // console.log(res)
            const openid = res.data.openid
            wx.setStorageSync("openid", openid)
          }
        })
      }
    })

    
  },
  globalData: {
    // userInfo: '',
    // CustomBar: 123,
    patrolForm: null,
 
    // 实例化API核心类
    qqmapsdk: new QQMapWX({
      key: 'EGRBZ-TPC66-3JHSL-EU6J3-AJ3Z7-YJFFD' // 必填
    })
  }
})




