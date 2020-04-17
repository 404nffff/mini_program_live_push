// pages/push/push.js
const app = getApp();

import Websocket from "../utils/socket";
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
      { uname: '123', text: '123', color: 'white'}
    ],
    scrollTop:'0px',

    timeout:1000, 
    timeoutObj:null,
    serverTimeoutObj:null,
    lockReconnect:true
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
    this.socketInit();
     this.linkWebsocket();
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

    
    let self = this;
    wx.showModal({
      title: '提示',
      content: '是否确认关闭直播间',
      confirmColor:'#0059BF',
      success (res) {
        if (res.confirm) {
          //console.log('用户点击确定')

          
            wx.showToast({
              title: '直播间已关闭',
              icon: 'success',
              duration: 1000,
              success:() =>{
                self.stop();
                wx.closeSocket();
              }
          });
          

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
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
  
    // 建立连接
  linkWebsocket() {
      this.websocket.initWebSocket({
          url: app.globalData.websocketUrl,
          success(res) {
              // console.log(res)
          },
          fail(err) {
              console.log("linkWebsocket err", err)
          }
      })
  },
  /**
   * 创建websocket对象
   */
  socketInit() {
    let self = this;
      // 创建websocket对象
      this.websocket = new Websocket({
          // true代表启用心跳检测和断线重连
          heartCheck: true,
          isReconnection: true,
          
      });
      // 建立连接
      this.websocket._onSocketOpened(() => {
           console.log('连接成功')
      })

      // 监听websocket状态
      this.websocket.onSocketClosed({
          url: app.globalData.websocketUrl,
          success(res) {
              console.log(res)
          },
          fail(err) {
              console.log("onSocketClosed err", err)
          }
      })
      // 监听网络变化
      this.websocket.onNetworkChange({
          url: app.globalData.websocketUrl,
          success(res) {
              console.log(res)
          },
          fail(err) {
              console.log("onNetworkChange err", err)
          }
      })
      // 监听服务器返回
      this.websocket.onReceivedMsg(result => {
         //console.log('app.js收到服务器内容：' + result.data);
          // 要进行的操作
        let self = this;
        if(result.data == 'PONG'){
            return false;
        }

        self.sendDanmu(result);
        
    })
  },

  // 向其他页面暴露当前websocket连接
  getSocket() {
      return this.websocket;
  },
  
  sendDanmu(result) {
    let jsonData   = JSON.parse(result.data);
    let self       = this;
    const query    = wx.createSelectorQuery()
    query.selectAll('.danme_item').boundingClientRect()
    //query.selectViewport().scrollOffset()
    query.exec(function(res){
      let item       = res[0];
      let itemLengh  = item.length;
      let itemHeight = 0;
      if( itemLengh == 0) {
        return false;
      }
      
      item.forEach(element =>{
        
        itemHeight += element.height;
      });
      
      self.setData({
        scrollTop: itemHeight+'px'
      });

    })

    let danmulist = self.data.danmulist;
    if (danmulist.length >= 20) {
      danmulist.shift();
    }

    let timestamp = new Date().getTime();

    danmulist.push({ uname: jsonData.username, text: jsonData.content, color: 'white'});
    self.setData({
      danmulist: danmulist
    });
  }


  
})