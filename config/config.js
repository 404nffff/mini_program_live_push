
let config = {
    apiHttp:'https://test.fooktech.cn',
}

let api = {
    wxAuth:config.apiHttp+'/live/login/wx_app_auth',
    bindLive:config.apiHttp+'/live/user/live_user',
    LivebindCancel:config.apiHttp+'/live/user/live_user_cancel'
};

module.exports = {
    api: api,
    config:config
}