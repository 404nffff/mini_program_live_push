//app.js

import utils from "./utils/utils";

import config from "./config/config";

App({
  onLaunch: function () {
    const { model, system, statusBarHeight } = wx.getSystemInfoSync();
    var headHeight;
    if (/iphone\s{0,}x/i.test(model)) {
      headHeight = 88;
    } else if (system.indexOf('Android') !== -1) {
      headHeight = 68;
    } else {
      headHeight = 64;
    }
    this.globalData.headerHeight    = headHeight;
    this.globalData.statusBarHeight = statusBarHeight;

   

    utils.checkUpdateVersion();

  
  },
  onShow :(options) => {

    let path = options.path;
    let aid  = options.query.id;

    utils.checkLoginStatus(path, aid);

  },
  globalData: {
    userInfo        : null,
    headerHeight    : 0,
    statusBarHeight : 0,
    websocketUrl    :'ws://192.168.22.186:9501?roomId=abcd&secret=33f4987917538319f9bd&token=Yk9oQk5kSEN1bVM4elk2SlZLSzE5M3lMUEF0MndJMCYwJjQ4JjY5JjImMjE0NDN1ZFQwWGE5ZTFNRXFMY212QURHUjVmcEtuNmtWSlcwMg==&username=zm',
    roomId          :'', //活动id
    username        :'' //username
  }
})