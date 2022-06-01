// pages/change_pwd/change_pwd.js
const app = getApp()
const baseUrl = require('../../utils/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
     userInfo: {}, // 用户信息
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取登录信息
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo) {
      this.setData({
        userInfo
      })
    }
  },

  formSubmit(e) {
    let pwdExp = (/^[\S][6,12]$/); // 密码必须是6-12位，且不能出现空格
    let oldPwd = e.detail.value.oldpwd; // 输入的原密码
    let newPwd = e.detail.value.newpwd; // 输入的新密码
    let surePwd = e.detail.value.surepwd; // 输入的确认密码
    if(oldPwd != this.data.userInfo.data.password){
      wx.showToast({
        title: '原密码输入错误，请重新输入',
        icon:'none',
        duration: 2000
      })
    } else if(!pwdExp.test(newPwd)) {
      wx.showToast({
        title: '密码必须是6-12位，且不能出现空格，请重新输入',
        icon: 'none'
      })
    } else if(newPwd != surePwd) {
      wx.showToast({
        title: '修改密码不一致，请重新输入',
        icon: 'none'
      })
    } else if(oldPwd === newPwd) {
      wx.showToast({
        title: '新密码不能与旧密码相同',
        icon: 'none'
      })
    } 
    else {
      wx.request({
        url: baseUrl + '/my/updatepwd',
        method: 'POST',
        header: { 
          'Content-Type': 'application/x-www-form-urlencoded' ,
          "Authorization": this.data.userInfo.token
        },
        data: {
          oldPwd,
          newPwd
        },
        success: (res) => {
          if(res.data.status === 0) {
            wx.showToast({
              title: '修改密码成功',
              icon: 'success',
              duration: '2000'
            })
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }, 2000)
          } 
        }
      })
    }
  },
})