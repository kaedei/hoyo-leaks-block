/**
 * 全局常量配置
 */

// 获取本地化的区域名称
function getLocalizedAreaName(areaKey) {
  try {
    return chrome.i18n.getMessage(areaKey) || areaKey;
  } catch (error) {
    console.warn('Failed to get localized area name:', error);
    return areaKey;
  }
}

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

  // 获取本地化的默认区域列表
  getDefaultAreaList() {
    return [
      {
        "name": getLocalizedAreaName('default_area_bilibili_home'),
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
        "name": getLocalizedAreaName('default_area_bilibili_video_sidebar'),
        "area": "bilibili",
        "main": ".recommend-list-v1",
        "item": ".video-page-card-small",
        "text": ".title",
        "media": ".cover",
        "user": ".name",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_video_end'),
        "area": "bilibili",
        "main": ".rec-list",
        "item": ".rec-card",
        "text": ".info .title",
        "media": ".cover",
        "user": ".info .name",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_search'),
        "area": "bilibili",
        "main": ".video-list.row",
        "item": ".bili-video-card",
        "text": ".bili-video-card__info--tit a",
        "media": ".bili-video-card__image",
        "user": ".bili-video-card__info--author",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_ranking'),
        "area": "bilibili",
        "main": ".rank-list",
        "item": ".rank-item",
        "text": ".info .title",
        "media": ".img",
        "user": ".detail .up",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_dynamic'),
        "area": "bilibili",
        "main": ".feed",
        "item": ".bili-dyn-item",
        "text": ".bili-dyn-content__orig__desc, .bili-dyn-content__forw__desc",
        "media": ".bili-dyn-item__header__avatar, .bili-album__preview__picture__img, .bili-album__watch__pic__img",
        "user": ".bili-dyn-item__header__author .bili-dyn-item__interaction",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_topic'),
        "area": "bilibili",
        "main": ".topic-detail",
        "item": ".bili-dyn-item",
        "text": ".bili-rich-text__content",
        "media": ".bili-album__preview__picture__img",
        "user": ".bili-dyn-item__header__author",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_space_masterpiece'),
        "area": "bilibili",
        "main": ".masterpiece",
        "item": ".small-item",
        "text": ".title",
        "media": ".cover",
        "user": ".info .name",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_space_video'),
        "area": "bilibili",
        "main": ".cube-list",
        "item": ".small-item",
        "text": ".title",
        "media": ".cover",
        "user": ".info .name",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_space_dynamic'),
        "area": "bilibili",
        "main": ".bili-dyn-list",
        "item": ".bili-dyn-item",
        "text": ".bili-rich-text__content",
        "media": ".bili-album__preview__picture__img",
        "user": ".bili-dyn-item__header__author",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_bilibili_message'),
        "area": "bilibili",
        "main": ".reply-list",
        "item": ".reply-item",
        "text": ".reply-content",
        "media": ".reply-face",
        "user": ".reply-name",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_youtube_list'),
        "area": "youtube",
        "main": "#contents",
        "item": "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer",
        "text": "#video-title, #dismissible #details #meta h3, a#video-title",
        "media": "ytd-thumbnail, #thumbnail, .ytp-ce-covering-image",
        "user": "#channel-name, #byline-container #text",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_youtube_search'),
        "area": "youtube",
        "main": "#contents",
        "item": "ytd-video-renderer",
        "text": "#video-title, #dismissible #details #meta h3",
        "media": "ytd-thumbnail",
        "user": "#channel-name, #byline-container #text",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_youtube_sidebar'),
        "area": "youtube",
        "main": "#related",
        "item": "ytd-compact-video-renderer",
        "text": "#video-title",
        "media": "ytd-thumbnail",
        "user": "#channel-name",
        "on": true,
        "home": false
      },
      {
        "name": getLocalizedAreaName('default_area_twitter_timeline'),
        "area": "twitter",
        "main": "[data-testid=\"primaryColumn\"]",
        "item": "article[data-testid=\"tweet\"]",
        "text": "[data-testid=\"tweetText\"], [data-testid=\"card.wrapper\"] span",
        "media": "[data-testid=\"tweetPhoto\"], [data-testid=\"card.wrapper\"] img",
        "user": "[data-testid=\"User-Name\"] div[dir] span",
        "on": true,
        "home": false
      }
    ];
  }
};

// 如果在扩展环境中，将常量添加到全局
if (typeof window !== 'undefined') {
  window.APP_CONSTANTS = APP_CONSTANTS;
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONSTANTS;
}
