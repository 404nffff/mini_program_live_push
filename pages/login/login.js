// pages/push-config/push-config.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modeItems: [
      { value: '480p', title: '480p'},
      { value: '720p', title: '720p'},
    ],
    mode :'720p',
    orientationItems: [
      { value: 'vertical', title: '竖屏推流' },
      { value: 'horizontal', title: '横屏推流' },
    ],
    orientation: 'vertical',
    enableCamera : true,
    focusPush: false,
    focusPlay: false,
    tapTime: '',		// 防止两次点击操作间隔太快
    headerHeight: app.globalData.headerHeight,
    statusBarHeight: app.globalData.statusBarHeight,
    pushUrl:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  // onShareAppMessage: function () {

  // },
  onBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  wx_log: function () {
    var openId = wx.getStorageSync('openid');
    openId = 1;
    if (openId) {
      wx.getUserInfo({
        lang: "zh_CN",
        success: function(res) {
          console.log(res);
          var userInfo = res.userInfo
          var nickName = userInfo.nickName
          var avatarUrl = userInfo.avatarUrl
          var gender = userInfo.gender //性别 0：未知、1：男、2：女
          var province = userInfo.province
          var city = userInfo.city
          var country = userInfo.country


          wx.login({
            success (res) {
              if (res.code) {
                console.log(res.code);
                //发起网络请求
                wx.request({
                  url: 'https://test.fooktech.cn/live/login/wx_app_auth', // 仅为示例，并非真实的接口地址
                  data: {
                    id: 11,
                    code: res.code,
                    userInfo: userInfo
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success(res) {
                    console.log(res.data);
                  },
                  fail(err){
                    console.log(err); 
                  }
                });
              } else {
                console.log('登录失败！' + res.errMsg)
              }
            }
          });


        }
      })
    } else {
      
    }
    
  }
})