/**
 * Chrome API 模拟 - 用于测试环境
 */

// 模拟Chrome API用于测试
if (!window.chrome || !window.chrome.storage) {
  console.log('[HoyoBlock-Options] Creating mock Chrome API for testing...');

  window.chrome = {
    storage: {
      sync: {
        get: function (keys, callback) {
          // 模拟数据
          const mockData = {
            areaList: [
              {
                name: "B站视频卡片",
                area: "bilibili",
                selector: ".video-item",
                on: true
              },
              {
                name: "YouTube视频缩略图",
                area: "youtube",
                selector: "ytd-video-renderer",
                on: true
              },
              {
                name: "Twitter推文",
                area: "twitter",
                selector: "[data-testid='tweet']",
                on: false
              }
            ]
          };

          setTimeout(() => {
            callback(keys === null ? mockData :
              (Array.isArray(keys) ?
                keys.reduce((result, key) => {
                  result[key] = mockData[key];
                  return result;
                }, {}) :
                { [keys]: mockData[keys] }
              )
            );
          }, 100);
        },
        set: function (items, callback) {
          console.log('[HoyoBlock-Options] Mock storage set:', items);
          setTimeout(() => {
            if (callback) callback();
          }, 100);
        },
        clear: function (callback) {
          console.log('[HoyoBlock-Options] Mock storage clear');
          setTimeout(() => {
            if (callback) callback();
          }, 100);
        }
      },
      local: {
        clear: function (callback) {
          console.log('[HoyoBlock-Options] Mock local storage clear');
          setTimeout(() => {
            if (callback) callback();
          }, 100);
        }
      }
    },
    runtime: {
      lastError: null
    }
  };
}
