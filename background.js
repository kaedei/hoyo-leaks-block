// Background script for the extension
console.log('Hoyo Leaks Block Extension background script loaded');

// Initialize default storage values
chrome.runtime.onInstalled.addListener(() => {
  const defaultConfig = {
    // B站配置
    blockTitleBili: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开|v1|v2|v3|v4|v5',
    blockUsersBili: '',
    blockUsersWhiteBili: '',

    // YouTube配置
    blockTitleYtb: 'leak|beta|insider|spoiler|unreleased',
    blockUsersYtb: '',
    blockUsersWhiteYtb: '',

    // Twitter配置
    blockTitleTwitter: 'leak|beta|insider|spoiler|unreleased',
    blockUsersTwitter: '',
    blockUsersWhiteTwitter: '',

    // 区域配置
    areaList: []
  };

  // 设置默认配置
  chrome.storage.sync.set(defaultConfig);

  // 获取并设置默认区域列表
  fetchDefaultAreaList();
});

// 获取默认区域列表配置
async function fetchDefaultAreaList() {
  try {
    const response = await fetch('https://lcybff.github.io/helper/mihoyoLeaksBlock/arealist.json');
    const data = await response.json();
    if (data.arealist) {
      chrome.storage.sync.set({ areaList: data.arealist });
    }
  } catch (error) {
    console.warn('Failed to fetch default area list:', error);
    // 设置默认区域列表
    const defaultAreaList = [
      {
        "name": "B站首页列表",
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
        "name": "B站视频页右侧列表",
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
        "name": "B站视频播放结束推荐列表",
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
        "name": "B站搜索页",
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
        "name": "B站列表（排行榜）",
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
        "name": "B站UP主空间代表作",
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
        "name": "B站UP主空间通用视频",
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
        "name": "B站UP主空间动态",
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
        "name": "B站消息中心（回复我的）",
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
    ];
    chrome.storage.sync.set({ areaList: defaultAreaList });
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[HoyoBlock-Background] Received message:', request);

  if (request.action === 'getConfig') {
    console.log('[HoyoBlock-Background] Getting config...');
    chrome.storage.sync.get(null, (result) => {
      console.log('[HoyoBlock-Background] Config retrieved:', result);
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'setConfig') {
    console.log('[HoyoBlock-Background] Setting config:', request.config);
    chrome.storage.sync.set(request.config, () => {
      if (chrome.runtime.lastError) {
        console.warn('[HoyoBlock-Background] Error saving config:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[HoyoBlock-Background] Config saved successfully');
        sendResponse({ success: true });
      }
    });
    return true;
  }

  if (request.action === 'openOptionsPage') {
    try {
      chrome.runtime.openOptionsPage(() => {
        if (chrome.runtime.lastError) {
          console.warn('打开选项页面失败:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('选项页面已打开');
          sendResponse({ success: true });
        }
      });
    } catch (error) {
      console.warn('打开选项页面时出错:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});
