// pages/push/push.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    frontCamera: true,
    cameraContext: {},
    pushUrl: "",
    mode: "SD",
    muted: false,
    enableCamera: true,
    orientation: "vertical",
    beauty: 6.3,
    whiteness: 3.0,
    backgroundMute: false,
    debug: false,
    headerHeight: app.globalData.headerHeight,
    statusBarHeight: app.globalData.statusBarHeight,
    danmulist: [
      { uname: "杨茂元", text: "秒杀的活动还有吗", color: "blue" },
      {
        uname: "杨茂元",
        text: "秒杀的活动还有吗 什么时候结束啊，还有没有优惠啊",
        color: ""
      },
      { uname: "杨茂元", text: "秒杀的活动还有吗", color: "" },
      {
        uname: "杨茂元",
        text: "秒杀的活动还有吗 什么时候结束啊，还有没有优惠啊",
        color: ""
      },
      { uname: "杨茂元", text: "秒杀的活动还有吗", color: "" }
    ]
  },
  onSwitchCameraClick: function () {
    this.data.frontCamera = !this.data.frontCamera;
    this.setData({
      frontCamera: this.data.frontCamera
    })
    this.data.cameraContext.switchCamera();
  },
  onBeautyClick: function () {
    if (this.data.beauty != 0) {
      this.data.beauty = 0;
      this.data.whiteness = 0;
    } else {
      this.data.beauty = 6.3;
      this.data.whiteness = 3.0;
    }

    this.setData({
      beauty: this.data.beauty,
      whiteness: this.data.whiteness
    })
  },
  onLogClick: function () {
    this.setData({
      debug: !this.data.debug
    })
  },
  onMuteClick: function () {
    this.setData({
      muted: !this.data.muted
    })
  },
  onPushEvent: function (e) {

    let self = this;
    if (e.detail.code == -1307) {
      wx.showToast({
        title: '推流多次失败',
        icon: 'fail',
        duration: 1000,
        success:() =>{
          self.stop();
        }
      })
    }
  },

  onStop:function(e) {

    this.list.push({ uname: "杨茂元：", text: '123', color: colors[b], flag });

    // let self = this;
    // wx.showModal({
    //   title: '提示',
    //   content: '是否确认关闭直播间',
    //   confirmColor:'#0059BF',
    //   success (res) {
    //     if (res.confirm) {
    //       //console.log('用户点击确定')

    //       wx.showToast({
    //         title: '直播间已关闭',
    //         icon: 'success',
    //         duration: 1000,
    //         success:() =>{
    //           self.stop();
    //         }
    //       })

    //     } else if (res.cancel) {
    //       console.log('用户点击取消')
    //     }
    //   }
    // })
    
  },
  stop: function () {
    this.setData({
      playing: false,
      pushUrl: "",
      mode: "SD",
      muted: false,
      enableCamera: true,
      orientation: "vertical",
      beauty: 6.3,
      whiteness: 3.0,
      backgroundMute: false,
      debug: false
    })
    this.data.cameraContext.stop();
    wx.redirectTo({
      url: '/pages/live-pusher/push-config/push-config'
    })
  },

  createContext: function () {
    var self = this;
    this.setData({
      cameraContext: wx.createLivePusherContext('camera-push'),
    } , () => {
      self.data.cameraContext.start();
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
    this.setData({
      mode: options.mode,
      orientation: options.orientation,
      enableCamera: options.enableCamera === "false" ? false : true,
      pushUrl: decodeURIComponent(options.pushUrl)
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onLoad onReady");
    this.createContext();

    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onLoad onShow");

    
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onLoad onHide");

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onLoad onUnload");
    this.stop();

    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("onLoad onShareAppMessage");
    return {
      // title: 'RTMP推流',
      // path: '/pages/push/push',
      path: '/pages/home-page/main',
      imageUrl: 'https://mc.qcloudimg.com/static/img/dacf9205fe088ec2fef6f0b781c92510/share.png'
    }
  },
  onBack: function () {
    wx.navigateBack({
      delta: 1
    });
  }
})