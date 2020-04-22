// pages/push-config/push-config.js
const app = getApp()
import utils  from "../../../utils/utils";
import config from "../../../config/config";

import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast';
const promisify = require('../../../utils/promise');
const wxRequest = promisify(wx.request);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modeItems: [
      { value: '480p', title: '480p'},
      { value: '720p', title: '720p'},
    ],
    mode :'480p',
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
    Toast.loading({
      mask: true,
      message: '加载中...',
      duration:0
    });

    let aid = options.id;
    if(aid == 'undefined'  || aid == undefined || aid == '') {
      Toast({
          type: 'fail',
          message: '请重新登录',
          mask:true,
          duration:2000,
          onClose: () => {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      return false;
    }
    

    let userName   = wx.getStorageSync("userName");
    let token      = wx.getStorageSync("token");
    let sercet     = wx.getStorageSync("sercet");
    let player     = wx.getStorageSync("player");
    let liveUserId = wx.getStorageSync("liveUserId");


    wxRequest({
      url: config.api.bindLive, 
      data: {
        id      : aid,
        unionId : userName
      },
      header: {'Authorization': 'cFZ3c3Y2bGRYazVnNGJDRXhhN0Q4WURUJkTlNDRktybDAmMCYxJjEmMCYyMTQ0MyYwMgTjY4MnhWMXVLaE9yaG9ESjlseFIyaW=='}
      }).then(res => {

        let errCode  = res.data.errCode;
        let msg      = res.data.msg;
        let activity = res.data.data;
        if(errCode != '000000') {
          return Promise.reject(msg);
        }
        let liveUserId = activity.live_user_id; //绑定表id 
        let player     = activity.player; //活动数据 
        
        var timestamp  = Math.round(new Date().getTime()/1000);
        var expiration = timestamp + 604800; //七天



        wx.setStorageSync("player", player);
        wx.setStorageSync("liveUserId", liveUserId);


        app.globalData.roomId   = aid;
        app.globalData.username = userName;
        


      }).catch(err => {
        Toast.clear();
        Toast({
          type: 'fail',
          message: err,
          mask:true,
          duration:2000,
          onClose: () => {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      })


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
    var url = '/pages/live-pusher/push?pushUrl=' + encodeURIComponent(self.data.pushUrl) + '@'+self.data.mode+'&mode=' + self.data.mode + '&orientation=' + self.data.orientation + '&enableCamera=' + self.data.enableCamera;
    console.log(url);
    wx.navigateTo({
      url: url
    });
    
    self.setData({ 'tapTime': nowTime });
  }
})