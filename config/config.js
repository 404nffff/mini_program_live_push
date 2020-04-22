
let config = {
    apiHttp:'https://test.fooktech.cn',
}

let api = {
    wxAuth:config.apiHttp+'/live/login/wx_app_auth',
    bindLive:config.apiHttp+'/live/user/live_user'
};

module.exports = {
    api: api,
    config:config
}