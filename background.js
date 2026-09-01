// Background script for the extension
// Import core modules
importScripts('core/common.js');
importScripts('core/remote-config-manager.js');
importScripts('shared/base-config-manager.js');
importScripts('core/auto-update-manager.js');

DebugLogger.log('Hoyo Leaks Block Extension background script loaded');

// 获取默认区域列表配置
async function fetchDefaultAreaList() {
  const remoteManager = new RemoteConfigManager();

  try {
    const areaList = await remoteManager.fetchRemoteAreaList();
    chrome.storage.local.set({ areaList });
  } catch (error) {
    console.warn('Failed to fetch default area list:', error);
    // 使用本地默认区域列表
    try {
      const defaultAreaList = await remoteManager.getDefaultAreaList();
      chrome.storage.local.set({ areaList: defaultAreaList });
    } catch (fallbackError) {
      console.warn('Failed to get default area list:', fallbackError);
      // 最后的备用方案：使用空数组
      chrome.storage.local.set({ areaList: [] });
    }
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
      chrome.storage.local.get(null, (result) => {
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

// 启动时检查自动更新
async function checkAutoUpdateOnStartup() {
  try {
    DebugLogger.log('[HoyoBlock-Background] Checking for auto update...');

    const autoUpdateManager = new AutoUpdateManager();
    const result = await autoUpdateManager.checkAndPerformAutoUpdate();

    if (result.success && !result.skipped) {
      DebugLogger.log(`[HoyoBlock-Background] Auto update completed: merged ${result.mergedCount} rules, skipped ${result.skippedCount} duplicates`);
    } else if (result.skipped) {
      DebugLogger.log('[HoyoBlock-Background] Auto update skipped (not needed)');
    } else {
      console.warn('[HoyoBlock-Background] Auto update failed:', result.error);
    }
  } catch (error) {
    console.warn('[HoyoBlock-Background] Error during auto update check:', error);
  }
}

// 浏览器启动时执行自动更新检查
chrome.runtime.onStartup.addListener(() => {
  DebugLogger.log('[HoyoBlock-Background] Browser startup detected, checking auto update...');
  // 兜底执行一次旧数据迁移（幂等，无副作用）
  migrateSyncToLocal();
  checkAutoUpdateOnStartup();
});

// 将旧版本存储在 chrome.storage.sync 中的用户数据迁移到 chrome.storage.local（一次性）
// 该扩展已全面改用 local 存储（规避 sync 单键 8KB 配额限制），迁移完成后清空 sync 旧数据
async function migrateSyncToLocal() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, (syncData) => {
      if (chrome.runtime.lastError || !syncData) {
        resolve();
        return;
      }

      const keys = Object.keys(syncData);
      if (keys.length === 0) {
        resolve();
        return;
      }

      chrome.storage.local.get(null, (localData) => {
        const toSet = {};
        keys.forEach(key => {
          // 仅迁移本地缺失的键，本地已有数据优先（用户最新修改优先）
          if (localData[key] === undefined) {
            toSet[key] = syncData[key];
          }
        });

        const finish = () => {
          // 迁移/检查完成后清空 sync 旧数据，避免残留数据被迁移逻辑"复活"
          chrome.storage.sync.clear(() => resolve());
        };

        if (Object.keys(toSet).length > 0) {
          chrome.storage.local.set(toSet, finish);
        } else {
          finish();
        }
      });
    });
  });
}

// 合并默认配置：只补全缺失的键，绝不覆盖用户已保存的数据
// 用于扩展更新场景，避免用户自定义规则（黑名单/白名单/关键词）被默认配置清空
async function mergeMissingDefaultConfig(defaultConfig) {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (existing) => {
      const merged = { ...defaultConfig, ...existing };

      // blockRules 深度合并：逐平台、逐规则类型补全缺失部分
      if (defaultConfig.blockRules) {
        merged.blockRules = merged.blockRules || {};
        const platforms = ['bilibili', 'youtube', 'twitter'];
        const ruleTypes = ['keywords', 'blacklist', 'whitelist'];

        platforms.forEach(platform => {
          if (!merged.blockRules[platform]) {
            merged.blockRules[platform] = {};
          }
          ruleTypes.forEach(type => {
            if (!Array.isArray(merged.blockRules[platform][type])) {
              // 仅当用户数据中该字段缺失时才补默认值
              merged.blockRules[platform][type] =
                defaultConfig.blockRules[platform]?.[type] || [];
            }
          });
        });
      }

      resolve(merged);
    });
  });
}

// 扩展启动时也执行检查（用于开发和首次安装）
chrome.runtime.onInstalled.addListener(async (details) => {
  const defaultConfig = APP_CONSTANTS.DEFAULT_CONFIG;

  // 先把旧版本 sync 存储中的用户数据迁移到 local，再执行后续配置逻辑
  await migrateSyncToLocal();

  if (details.reason === 'install') {
    // 仅首次安装时写入默认配置
    chrome.storage.local.set(defaultConfig);
  } else {
    // 更新/浏览器更新等场景：只补全缺失的配置键，保留用户已有数据
    const mergedConfig = await mergeMissingDefaultConfig(defaultConfig);
    chrome.storage.local.set(mergedConfig);
  }

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
    await fetchAndMergeRemoteRules();
  }

  // 执行自动更新检查
  await checkAutoUpdateOnStartup();
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  DebugLogger.log('[HoyoBlock-Background] Received message:', request);

  if (request.action === 'getConfig') {
    DebugLogger.log('[HoyoBlock-Background] Getting config...');
    chrome.storage.local.get(null, (result) => {
      DebugLogger.log('[HoyoBlock-Background] Config retrieved:', result);
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'setConfig') {
    DebugLogger.log('[HoyoBlock-Background] Setting config:', request.config);
    chrome.storage.local.set(request.config, () => {
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
