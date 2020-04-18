//app.js

App({
  onLaunch: function (options) {
    const { model, system, statusBarHeight } = wx.getSystemInfoSync();
    var headHeight;
    if (/iphone\s{0,}x/i.test(model)) {
      headHeight = 88;
    } else if (system.indexOf('Android') !== -1) {
      headHeight = 68;
    } else {
      headHeight = 64;
    }
    this.globalData.headerHeight = headHeight;
    this.globalData.statusBarHeight = statusBarHeight;



  },
  onReady:() => {
    
  },
  globalData: {
    userInfo: null,
    headerHeight : 0,
    statusBarHeight : 0,
    websocketUrl:'ws://192.168.22.186:9501?roomId=abcd',
    roomId:'abcd',
  }
})