// Background script for the extension
console.log('Hoyo Leaks Block Extension background script loaded');

// Initialize default storage values
chrome.runtime.onInstalled.addListener(() => {
  const defaultConfig = {
    // B站配置
    blockTitleBili: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开',
    blockUsersBili: '',
    blockUsersWhiteBili: '',

    // YouTube配置
    blockTitleYtb: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开',
    blockUsersYtb: '',
    blockUsersWhiteYtb: '',

    // Twitter配置
    blockTitleTwitter: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开',
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
    console.log('Failed to fetch default area list:', error);
    // 设置默认区域列表
    const defaultAreaList = [
      // B站默认区域
      {
        name: 'B站-首页推荐',
        area: 'bilibili',
        main: '.feed-card',
        item: '.bili-video-card',
        text: '.bili-video-card__info--tit',
        media: '.bili-video-card__image--wrap',
        user: '.bili-video-card__info--author',
        on: true,
        home: false
      },
      // YouTube默认区域
      {
        name: 'YouTube-首页推荐',
        area: 'youtube',
        main: '#contents',
        item: 'ytd-rich-item-renderer',
        text: '#video-title',
        media: 'ytd-thumbnail',
        user: '#channel-name',
        on: true,
        home: false
      },
      // Twitter默认区域
      {
        name: 'Twitter-时间线',
        area: 'twitter',
        main: '[data-testid="primaryColumn"]',
        item: 'article[data-testid="tweet"]',
        text: '[data-testid="tweetText"]',
        media: '[data-testid="tweetPhoto"]',
        user: '[data-testid="User-Name"]',
        on: true,
        home: false
      }
    ];
    chrome.storage.sync.set({ areaList: defaultAreaList });
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    chrome.storage.sync.get(null, (result) => {
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'setConfig') {
    chrome.storage.sync.set(request.config, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
