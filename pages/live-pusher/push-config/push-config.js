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
    pushUrl:'',
    shopLogo:'',
    shopName:'',
    activityName:'',
    liveTime:'',
    display:'none',
    liveTimeBoxShow: false,
    liveTimeColumns: [],
    liveTimeLabel:'',
    liveTimeSelected:0,
    liveTimeData:[],
    playerTimeId:0
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
    utils.checkLoginStatus(aid);

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
   
    
    let self       = this;
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
      header: {'Authorization': token}
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


        let timeArr = [];
        let timeObj = [];
        let keyNum  = 0;
        player.live_time_list.forEach(e => {
            let timeLabel = e.text;
            let id        = e.id;

            timeArr.push(timeLabel);

            timeObj[keyNum] = id;
            keyNum++;
        });
        

        self.setData({
          shopLogo        : player.player_master_logo,
          shopName        : player.player_master_name,
          activityName    : player.name,
          pushUrl         : player.rtmp_url,
          liveTimeColumns : timeArr,
          liveTimeData    : timeObj,
          display         : 'block'
        })
        
        Toast.clear();
      }).catch(err => {
        app.globalData.websocketUrl = '';
        app.globalData.roomId       = '';
        app.globalData.username     = '';

        wx.clearStorageSync();

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
  bindliveTimeBoxShow() {
    this.setData({ liveTimeBoxShow: true });
  },

  bindliveTimeBoxClose() {
    this.setData({ liveTimeBoxShow: false });
  },
  bindliveTimeConfirm(event) {
    const { picker, value, index } = event.detail;

    var that = this;
  
    that.setData({ 
      liveTimeLabel    : value,
      liveTimeSelected : index,
      playerTimeId     : that.data.liveTimeData[index]
    });

    that.setData({ liveTimeBoxShow: false });
  },
  startPush : function () {
    var self         = this;
    var playerTimeId = self.data.playerTimeId;

    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    }

    if (playerTimeId == 0 || isNaN(playerTimeId)) {
      Toast({
        type: 'fail',
        message: '请选择直播时间',
        mask:true,
        duration:2000
      });
      return;
    }

    Toast.loading({
      mask: true,
      message: '加载中...',
      duration:0
    });

    if (!self.data.pushUrl || self.data.pushUrl.indexOf("rtmp://") != 0) {
      wx.showModal({
        title: '提示',
        content: '推流地址不合法',
        showCancel: false
      });
      return;
    }
    let userName   = wx.getStorageSync("userName");
    let token      = wx.getStorageSync("token");
    let sercet     = wx.getStorageSync("sercet");
    let player     = wx.getStorageSync("player");
    let liveUserId = wx.getStorageSync("liveUserId");
    let aid        = player.id;

    wxRequest({
      url: config.api.changeLiveStatus, 
      data: {
        player_id      : aid,
        user_name      : userName,
        live_status    : 2,
        live_user_id   : liveUserId,
        type           : self.data.orientation,
        live_status_id : playerTimeId,
        token          : token
      },
      header: {'Authorization': token}
      }).then(res => {

        let errCode  = res.data.errCode;
        let msg      = res.data.msg;
        let activity = res.data.data;
        if(errCode != '000000') {
          return Promise.reject(msg);
        }
        var url = '/pages/live-pusher/push?pushUrl=' + encodeURIComponent(self.data.pushUrl) + '@'+self.data.mode+'&mode=' + self.data.mode + '&orientation=' + self.data.orientation + '&enableCamera=' + self.data.enableCamera+'&playerTimeId='+playerTimeId;
        console.log(url);
        wx.navigateTo({
          url: url
        });
        
        self.setData({ 'tapTime': nowTime });
        Toast.clear();
      }).catch(err => {
        app.globalData.websocketUrl = '';
        app.globalData.roomId       = '';
        app.globalData.username     = '';

        wx.clearStorageSync();

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
  //解除绑定
  onLiveBindCancel : function () {
    utils.alertConfirmMsg('是否确认解除绑定？', () => {
      Toast.loading({
        mask: true,
        message: '加载中...',
        duration:0
      });
      let userName   = wx.getStorageSync("userName");
      let liveUserId = wx.getStorageSync("liveUserId");
      let player     = wx.getStorageSync("player");
      let token      = wx.getStorageSync("token");
      let aid        = player.id;
      wxRequest({
        url: config.api.LivebindCancel, 
        data: {
          id      : liveUserId,
          unionId : userName
        },
        header: {'Authorization': token}
        }).then(res => {
  
          let errCode  = res.data.errCode;
          let msg      = res.data.msg;
          let activity = res.data.data;
          if(errCode != '000000') {
            return Promise.reject(msg);
          }
          
          
          Toast.clear();

          app.globalData.websocketUrl = '';
          app.globalData.roomId       = '';
          app.globalData.username     = '';

          wx.clearStorageSync();

          wx.redirectTo({
            url: '/pages/msg/msg?type=return&msg=已成功解除绑定&id='+aid
          })
        }).catch(err => {
          Toast.clear();
          utils.alertMsg('解除失败 : '+err.errMsg)
        })
    })
  }
})