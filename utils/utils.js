function checkUpdateVersion() {
    //创建 UpdateManager 实例
    const updateManager = wx.getUpdateManager();
    //检测版本更新
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        //监听小程序有版本更新事件
        updateManager.onUpdateReady(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            confirmColor:'#0059BF',
            success(res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              }
            }
          })
        })
  
        updateManager.onUpdateFailed(function() {
          // 新版本下载失败
          wx.showModal({
            title: '已经有新版本咯~',
            content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开呦~',
          })
        })
      }
    })
}


function alertMsg(content, callBack){
  wx.showModal({
    title        : '提示',
    content      : content,
    confirmColor : '#0059BF',
    showCancel   : false,
    success (res) {
      if (typeof callBack == "function") {
          callBack(res)
      }
    }
  })
}

function alertConfirmMsg(content, callBack){
  wx.showModal({
    title        : '提示',
    content      : content,
    confirmColor : '#0059BF',
    success (res) {
      if (res.confirm) {
        if (typeof callBack == "function") {
            callBack(res)
        }
      } else if (res.cancel) {
        console.log('用户点击取消')
      }

      
    }
  })
}


function checkLoginStatus(aid)
{
  let userName      = wx.getStorageSync("userName");
  let token         = wx.getStorageSync("token");
  let secret        = wx.getStorageSync("secret");
  let expiration    = wx.getStorageSync("index_data_expiration");//拿到过期时间
  let timestamp     = Math.round(new Date().getTime()/1000);//拿到现在时间
  const pages       = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const path        = `/${currentPage.route}`;

  if(
      userName == undefined || 
      token == undefined || 
      secret == undefined || 
      expiration == undefined || 
      userName == '' || 
      token == '' || 
      secret == '' || 
      expiration == '' 
    ) {
    alertMsg('请先登录', () => {
        wx.clearStorageSync();//清空缓存
        if(path.indexOf('pages/login/login') == -1) {
          wx.redirectTo({
            url: '/pages/login/login?id='+aid,
          });//跳转到登录
        }
      })
      return false;
    }
  //进行时间比较

  if(expiration < timestamp){//过期了，清空缓存，跳转到登录

    alertMsg('登录凭证已过期，请重新登录', () => {
      wx.clearStorageSync();//清空缓存

      if(path.indexOf('pages/login/login') == -1) {
        wx.redirectTo({
          url: '/pages/login/login?id='+aid,
        });//跳转到登录
      }
    })
    return false;
  }
  return true;
}

module.exports = {
    checkUpdateVersion: checkUpdateVersion,
    alertMsg:alertMsg,
    checkLoginStatus:checkLoginStatus,
    alertConfirmMsg:alertConfirmMsg
}