// Background script for the extension
// Import debug logger and constants
importScripts('core/debug-logger.js');
importScripts('core/constants.js');
importScripts('core/remote-config-manager.js');
importScripts('shared/base-config-manager.js');

DebugLogger.log('Hoyo Leaks Block Extension background script loaded');

// Initialize default storage values
chrome.runtime.onInstalled.addListener((details) => {
  const defaultConfig = APP_CONSTANTS.DEFAULT_CONFIG;

  // 设置默认配置
  chrome.storage.sync.set(defaultConfig);

  // 初始化统计数据
  const today = new Date().toDateString();
  chrome.storage.local.get(['todayBlocked', 'totalBlocked', 'lastUpdateDate'], (result) => {
    chrome.storage.local.set({
      todayBlocked: result.todayBlocked || 0,
      totalBlocked: result.totalBlocked || 0,
      lastUpdateDate: result.lastUpdateDate || today
    });
  });

  // 获取并设置默认区域列表
  fetchDefaultAreaList();

  // 如果是首次安装或更新，尝试从云端获取默认规则
  if (details.reason === 'install' || details.reason === 'update') {
    fetchAndMergeRemoteRules();
  }
});

// 获取默认区域列表配置
async function fetchDefaultAreaList() {
  const remoteManager = new RemoteConfigManager();

  try {
    const areaList = await remoteManager.fetchRemoteAreaList();
    chrome.storage.sync.set({ areaList });
  } catch (error) {
    console.warn('Failed to fetch default area list:', error);
    // 使用本地默认区域列表
    const defaultAreaList = remoteManager.getDefaultAreaList();
    chrome.storage.sync.set({ areaList: defaultAreaList });
  }
}

// 获取并合并远程默认规则
async function fetchAndMergeRemoteRules() {
  try {
    DebugLogger.log('[HoyoBlock-Background] Fetching remote default rules...');

    // 创建配置管理器实例
    const configManager = new BaseConfigManager();

    // 获取当前配置
    const currentConfig = await new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        resolve(result);
      });
    });

    configManager.config = currentConfig;
    configManager.initConfigStructure();

    // 从云端同步规则
    const result = await configManager.syncWithRemoteConfig(false);

    if (result.success) {
      DebugLogger.log('[HoyoBlock-Background] Remote rules synced successfully:', result);
    } else {
      console.warn('[HoyoBlock-Background] Failed to sync remote rules:', result.error);
    }
  } catch (error) {
    console.warn('[HoyoBlock-Background] Error fetching remote rules:', error);
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  DebugLogger.log('[HoyoBlock-Background] Received message:', request);

  if (request.action === 'getConfig') {
    DebugLogger.log('[HoyoBlock-Background] Getting config...');
    chrome.storage.sync.get(null, (result) => {
      DebugLogger.log('[HoyoBlock-Background] Config retrieved:', result);
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'setConfig') {
    DebugLogger.log('[HoyoBlock-Background] Setting config:', request.config);
    chrome.storage.sync.set(request.config, () => {
      if (chrome.runtime.lastError) {
        console.warn('[HoyoBlock-Background] Error saving config:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        DebugLogger.log('[HoyoBlock-Background] Config saved successfully');
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
          DebugLogger.log('选项页面已打开');
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
