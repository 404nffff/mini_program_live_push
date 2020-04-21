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

 
  wx_log: function () {
    var openId = wx.getStorageSync('openid');
    openId = 1;
    if (openId) {

      wx.login({
        success (res) {
          if (res.code) {
            var code = res.code;
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
                  var encryptedData = res.encryptedData;
                  var iv = res.iv;

                  wx.request({
                    url: 'https://test.fooktech.cn/live/login/wx_app_auth', // 仅为示例，并非真实的接口地址
                    data: {
                      id: 11,
                      code: code,
                      encryptedData: encryptedData,
                      iv:iv,
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
                }
              })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      });
    } else {
      // todo --- 
    }
  },


  onPushInputTap: function (e) {
    this.setData({
      focusPush: true,
      pushUrl: e.detail
    })
  },
  onPushInputChange: function (e) {

    this.setData({
      focusPush: true,
      pushUrl: e.detail
    })
  },
  onPlayInputTap: function () {
    this.setData({
      focusPlay: true
    })
  },
  onPlayInputChange: function (e) {
    this.setData({
      playUrl: e.detail,
    })
  },
  modeRadioChange: function (e) {
    this.setData({
      mode: e.detail.value
    });
  },
  orientationRadioChange: function (e) {
    this.setData({
      orientation: e.detail.value
    });
  },
  switchChange: function (e) {
    this.setData({
      enableCamera: !e.detail
    });
  },
  onScanQR: function () {
    var self = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res);
        self.setData({
          pushUrl: res.result,
          playUrl: "",
        })
      }
    })
  },

  onNewUrlClick: function () {
    var self = this;

    wx.request({
      url: 'https://lvb.qcloud.com/weapp/utils/get_test_pushurl',
      success: (res) => {
        var pushUrl = res.data['url_push'];
        var rtmpUrl = res.data['url_play_rtmp'];
        var flvUrl = res.data['url_play_flv'];
        var hlsUrl = res.data['url_play_hls'];
        var accUrl = res.data['url_play_acc'];
        console.log(pushUrl);
        self.setData({
          pushUrl: pushUrl,
          playUrl: flvUrl,
        })

        wx.showToast({
          title: '获取地址成功',
        })
      },
      fail: (res) => {
        console.log(res);
        wx.showToast({
          title: '网络或服务器异常',
        })
      }
    })
  },
  onCopyPushUrl: function () {
    wx.setClipboardData({
      data: this.data.pushUrl,
    })
  },
  onCopyPlayUrl: function () {
    wx.setClipboardData({
      data: this.data.playUrl,
    })
  },
  startPush : function () {
    var self = this;
    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    }
    // if (!self.data.pushUrl || self.data.pushUrl.indexOf("rtmp://") != 0) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '推流地址不合法，请点击自动生成按钮先获取腾讯云推流地址',
    //     showCancel: false
    //   });
    //   return;
    // }
    var url = '/pages/live-pusher/push?pushUrl=' + encodeURIComponent(self.data.pushUrl) + '@' + self.data.mode + '&orientation=' + self.data.orientation + '&enableCamera=' + self.data.enableCamera;
    console.log(url);
    wx.navigateTo({
      url: url
    });
    
    self.setData({ 'tapTime': nowTime });
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
  }
})