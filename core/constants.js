/**
 * 全局常量配置
 */

const APP_CONSTANTS = {
  // 远程配置URL
  REMOTE_CONFIG_URL: 'https://raw.githubusercontent.com/kaedei/hoyo-leaks-block/refs/heads/main/config/arealist.json',

  // 默认配置
  DEFAULT_CONFIG: {
    // 简化的字符串数组格式
    blockRules: {
      bilibili: {
        keywords: ['内鬼', '爆料', '泄露', 'leak', 'beta', '测试服', 'v2', 'v3', 'v4', 'v5'],
        blacklist: [],
        whitelist: []
      },
      youtube: {
        keywords: ['leak', 'beta', 'insider', 'spoiler', 'unreleased'],
        blacklist: [],
        whitelist: []
      },
      twitter: {
        keywords: ['leak', 'beta', 'insider', 'spoiler', 'unreleased'],
        blacklist: [],
        whitelist: []
      }
    },
    areaList: []
  },

  // 默认区域列表
  DEFAULT_AREA_LIST: [
    {
      "name": "Bilibili首页列表",
      "area": "bilibili",
      "main": ".recommended-container_floor-aside",
      "item": ".bili-video-card",
      "text": ".bili-video-card__info--tit a",
      "media": ".bili-video-card__image",
      "user": ".bili-video-card__info--author",
      "on": true,
      "home": false
    },
    {
      "name": "Bilibili视频页右侧列表",
      "area": "bilibili",
      "main": ".recommend-list-v1",
      "item": ".video-page-card-small",
      "text": ".title",
      "media": ".pic-box",
      "user": ".upname",
      "on": true,
      "home": false
    },
    {
      "name": "Bilibili视频播放结束推荐列表",
      "area": "bilibili",
      "main": ".bpx-player-ending-related",
      "item": ".bpx-player-ending-related-item",
      "text": ".bpx-player-ending-related-item-title",
      "media": ".bpx-player-ending-related-item-img",
      "user": "",
      "on": true,
      "home": false
    },
    {
      "name": "Bilibili搜索页",
      "area": "bilibili",
      "main": ".search-page .video-list",
      "item": ".bili-video-card",
      "text": ".bili-video-card__info--tit",
      "media": ".bili-video-card__image",
      "user": ".bili-video-card__info--author",
      "on": true,
      "home": false
    },
    {
      "name": "Bilibili列表（排行榜）",
      "area": "bilibili",
      "main": ".card-list",
      "item": ".video-card",
      "text": ".video-name",
      "media": ".cover-picture__image",
      "user": ".up-name__text",
      "on": true,
      "home": false
    },
    {
      "name": "动态首页",
      "area": "bilibili",
      "main": ".bili-dyn-home--member .bili-dyn-list__items",
      "item": ".bili-dyn-list__item",
      "text": ".bili-dyn-content__orig__desc, .bili-dyn-card-video__title, .bili-dyn-card-video__desc, .bili-dyn-content__forw__desc, .dyn-card-opus__summary",
      "media": ".bili-album__preview__picture, .b-img",
      "user": ".bili-dyn-title__text",
      "on": true,
      "home": false
    },
    {
      "name": "话题页",
      "area": "bilibili",
      "main": ".topic-list",
      "item": ".list__topic-card",
      "text": ".bili-dyn-card-video__title, .bili-dyn-content__orig__desc, .bili-dyn-card-video__desc",
      "media": ".bili-dyn-card-video__cover",
      "user": ".bili-dyn-item__header .bili-dyn-title__text",
      "on": true,
      "home": false
    },
    {
      "name": "Bilibili UP主空间代表作",
      "area": "bilibili",
      "main": ".space-main",
      "item": ".top-video",
      "text": ".top-video__title",
      "media": ".top-video__cover",
      "user": ".upinfo__main .nickname",
      "on": true,
      "home": true
    },
    {
      "name": "Bilibili UP主空间通用视频",
      "area": "bilibili",
      "main": ".space-main",
      "item": ".bili-video-card",
      "text": ".bili-video-card__details .bili-video-card__title",
      "media": ".bili-video-card__cover",
      "user": ".upinfo__main .nickname",
      "on": true,
      "home": true
    },
    {
      "name": "Bilibili UP主空间动态",
      "area": "bilibili",
      "main": ".space-main",
      "item": ".bili-dyn-list__item",
      "text": ".bili-dyn-content__orig__desc, .bili-dyn-card-video__title, .bili-dyn-card-video__desc, .bili-dyn-content__forw__desc, .dyn-card-opus__summary",
      "media": ".bili-album__preview__picture, .b-img",
      "user": ".bili-dyn-title__text",
      "on": true,
      "home": true
    },
    {
      "name": "Bilibili消息中心（回复我的）",
      "area": "bilibili",
      "main": ".message-main",
      "item": ".interaction-item",
      "text": ".interaction-item__msg",
      "media": ".interaction-item__cover",
      "user": ".interaction-item__uname",
      "on": true,
      "home": false
    },
    {
      "name": "油管列表",
      "area": "youtube",
      "main": "ytd-rich-grid-renderer",
      "item": "ytd-rich-item-renderer",
      "text": "#video-title",
      "media": "ytd-thumbnail",
      "user": "ytd-channel-name",
      "on": true,
      "home": false
    },
    {
      "name": "油管搜索页",
      "area": "youtube",
      "main": "ytd-item-section-renderer",
      "item": "ytd-video-renderer",
      "text": ".text-wrapper #video-title",
      "media": "ytd-thumbnail",
      "user": ".text-wrapper ytd-channel-name",
      "on": true,
      "home": false
    },
    {
      "name": "油管视频页右侧推荐栏",
      "area": "youtube",
      "main": "ytd-watch-next-secondary-results-renderer",
      "item": "ytd-item-section-renderer ytd-compact-video-renderer",
      "text": "#video-title",
      "media": "ytd-thumbnail",
      "user": "ytd-channel-name",
      "on": true,
      "home": false
    },
    {
      "name": "推文列表",
      "area": "twitter",
      "main": "[aria-labelledby='accessible-list-1']",
      "item": "[data-testid=tweet]",
      "text": "[data-testid=tweetText]",
      "media": "[data-testid=tweetPhoto], video",
      "user": "[data-testid=User-Name]",
      "on": true,
      "home": false
    }
  ]
};

// 如果在扩展环境中，将常量添加到全局
if (typeof window !== 'undefined') {
  window.APP_CONSTANTS = APP_CONSTANTS;
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONSTANTS;
}
