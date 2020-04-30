// pages/push/push.js
const app = getApp();

import Websocket from "../../utils/socket";
import utils  from "../../utils/utils";
import config from "../../config/config";

import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const promisify = require('../../utils/promise');
const wxRequest = promisify(wx.request);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    frontCamera: true,
    cameraContext: {},
    pushUrl: "",
    mode: "720p",
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
      // { uname: '123', text: '123', color: 'white'}
    ],
    scrollTop:'0px',
    liveOnlinePeopleNum:0,
    shopLogo:'',
    activityName:'',
    playerTimeId:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");

    let player   = wx.getStorageSync("player");
    let userName = wx.getStorageSync("userName");
    let token    = wx.getStorageSync("token");
    let secret   = wx.getStorageSync("secret");


    let id          = player.id;
    let loginStatus = utils.checkLoginStatus(id);
  
    this.setData({
      mode: options.mode,
      orientation: options.orientation,
      enableCamera: options.enableCamera === "false" ? false : true,
      pushUrl: decodeURIComponent(options.pushUrl),
      shopLogo:player.player_master_logo,
      activityName:player.name,
      liveOnlinePeopleNum:player.virtual_watch_num,
      playerTimeId:options.playerTimeId
    });

    //websocketUrl    :'ws://192.168.22.186:9501?roomId=abcd&secret=33f4987917538319f9bd&token=Yk9oQk5kSEN1bVM4elk2SlZLSzE5M3lMUEF0MndJMCYwJjQ4JjY5JjImMjE0NDN1ZFQwWGE5ZTFNRXFMY212QURHUjVmcEtuNmtWSlcwMg==&username=zm',

    app.globalData.websocketUrl = player.barrage_ip+'?roomId='+player.id+'&secret='+secret+'&token='+token+'&uid='+userName;


    console.log(app.globalData.websocketUrl);
    //app.globalData.websocketUrl = 'ws://192.168.51.26:9501'+'?roomId='+player.id+'&secret='+secret+'&token='+token+'&username='+userName;
    //app.globalData.websocketUrl = 'ws://192.168.22.186:9501/?roomId=11&secret=706657f812865dc126e6&token=d1JBckJVU0lXNkhKWkF4c2cwS3poTkc0VqVkNiVTZkNzAmMCYwJjAmMCYyNjgyMiYwMQRlVJc24yYWRBYmlJUk5TbzVBcGpPSk==&username=oqEJb1XdOTmw1ryGzAxoSgHnimr4';

    //console.log(app.globalData.websocketUrl);
  

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
    console.log(e.detail.code);
    if (e.detail.code == -1307) {
      wx.showToast({
        title: '推流多次失败',
        icon: 'fail',
        duration: 1000,
        success:() =>{
          self.stop();
          wx.navigateBack({
            delta: 1
          })
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

          let userName   = wx.getStorageSync("userName");
          let token      = wx.getStorageSync("token");
          let sercet     = wx.getStorageSync("sercet");
          let player     = wx.getStorageSync("player");
          let liveUserId = wx.getStorageSync("liveUserId");
          let aid        = player.id;
      
          //console.log(config.api.startLive);
          wxRequest({
            url: config.api.changeLiveStatus, 
            data: {
              player_id      : aid,
              user_name      : userName,
              live_status    : 3,
              live_user_id   : liveUserId,
              live_status_id : self.data.playerTimeId,
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
              Toast.clear();
              wx.showToast({
                  title: '直播间已关闭',
                  icon: 'success',
                  duration: 2000,
                  success:() =>{
                    
                    self.stop();

                    self.websocket.closeWebSocket();
                    app.globalData.websocketUrl = '';
                    app.globalData.roomId       = '';
                    app.globalData.username     = '';
    
                    wx.clearStorageSync();
    
                    wx.redirectTo({
                      url: '/pages/msg/msg?type=success&msg=直播间已关闭'
                    })
    
                  
                  }
              });
             
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
          isReconnection: true
          
      });
      // 建立连接
      this.websocket._onSocketOpened(() => {
          console.log('连接成功')
          let player   = wx.getStorageSync("player");
          let userName = wx.getStorageSync("userName");

          // 发送登录信息
          wx.sendSocketMessage({
          // 这里是第一次建立连接所发送的信息，应由前后端商量后决定
              data: JSON.stringify({
                  "content"  : '1',
                  "action"   : 'liveOnlinePeopleNum',
                  "uid"      : userName,
                  "roomId"   : player.id,
                  
              })
          })
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


       
          // 要进行的操作
        let self = this;
        if(result.data == 'PONG'){
            return false;
        }

        let jsonData   = JSON.parse(result.data);
       
        let action   = jsonData.action;
        let content  = jsonData.content;
        let username = jsonData.username;


        if(action == 'broadCast') {
          self.sendDanmu(username, content);
        } else if (action == 'liveOnlinePeopleNum') {
          self.liveOnlinePeopleNum(content);
        }

        
        
    })
  },

  // 向其他页面暴露当前websocket连接
  getSocket() {
      return this.websocket;
  },
  
  sendDanmu(username, content) {
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
        scrollTop: (itemHeight+28)+'px'
      });

    })

    let danmulist = self.data.danmulist;
    if (danmulist.length >= 20) {
      danmulist.shift();
    }

    let timestamp = new Date().getTime();

    danmulist.push({ uname: username, text: content, color: 'white'});
    self.setData({
      danmulist: danmulist
    });
  },
  liveOnlinePeopleNum(num) {

    let player = wx.getStorageSync("player");
    let self   = this;
    let nowPeopleNum = player.virtual_watch_num+num;
    self.setData({
      liveOnlinePeopleNum: nowPeopleNum
    });
  }


  
})