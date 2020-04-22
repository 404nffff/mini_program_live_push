// promisify.js
module.exports = (api) => {
    return (option, ...params) => {
      return new Promise((resolve, reject) => {
        api(Object.assign({}, option, { success: resolve, fail: reject }), ...params);
      });
    }
  };