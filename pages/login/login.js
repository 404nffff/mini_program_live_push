// pages/push-config/push-config.js
const app = getApp()

import config from "../../config/config";
import utils  from "../../utils/utils";
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const promisify     = require('../../utils/promise');
const wxLogin       = promisify(wx.login);
const wxGetUserInfo = promisify(wx.getUserInfo);
const wxRequest     = promisify(wx.request);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let id = options.id;

    if(id == undefined){
      utils.alertMsg('缺少参数');
      return false;
    }
    this.setData({
      id:options.id
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
  onShow: function (options) {
    
    //
    //console.log(url);

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
 
  wxLogin: function () {
    let aid = this.data.id;

    if(aid == 'undefined'  || aid == undefined || aid == '') {
      utils.alertMsg('异常错误，请重新扫码进入');
      return false;
    }


    wxLogin().then((res) => {

      Toast.loading({
        mask: true,
        message: '加载中...',
        duration:0
      });

      let code = res.code;

      wxGetUserInfo({lang: "zh_CN"}).then(res => {

        let userInfo      = res.userInfo
        let encryptedData = res.encryptedData;
        let iv            = res.iv;

        wxRequest({
          url: config.api.wxAuth, 
          data: {
            code          : code,
            encryptedData : encryptedData,
            iv            : iv,
            userInfo      : userInfo
          },
          header: {'content-type': 'application/json'}
          }).then(res => {

            let errCode  = res.data.errCode;
            let msg      = res.data.msg;
            let userData = res.data.data;
            if(errCode != '000000') {
              return Promise.reject(msg);
            }

            let userName = userData.user.user_name;
            let token    = userData.user.token;
            let sercet   = userData.user.sercet;

            wx.setStorageSync("index_data_expiration", expiration);
            wx.setStorageSync("userName", userName);
            wx.setStorageSync("token", token);
            wx.setStorageSync("sercet", sercet);


            Toast({
              type: 'success',
              message: '登录成功',
              mask:true,
              duration:1000,
              onClose: () => {
                wx.navigateTo({
                  url: '/pages/live-pusher/push-config/push-config?id='+aid,
                });
              }
            });

          }).catch(err => {
            Toast.clear();
            utils.alertMsg('登录失败 : '+err);
          });
        

      }).catch(err => {
        Toast.clear();
        utils.alertMsg('登录失败');
      })
     

    }).catch((err) => {
      Toast.clear();
      utils.alertMsg('登录失败 : '+err.errMsg)
    });
  },
})