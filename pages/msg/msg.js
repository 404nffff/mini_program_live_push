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
    type:'',
    msg:'',
    id:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let type = options.type;
    let msg  = options.msg;
    let id   = options.id;

    if(id == '' || id == undefined) {
      id = '';
    }
   
    this.setData({
      type:options.type,
      msg:options.msg,
      id:id
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

  }
  ,
  /**
   * 页面上拉触底事件的处理函数
   */
  onReturnBottom: function () {
    let aid = this.data.id;
    wx.redirectTo({
      url: '/pages/login/login?id='+aid,
    });
  }
})