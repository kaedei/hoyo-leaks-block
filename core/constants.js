/**
 * 全局常量配置
 */

// 获取本地化的区域名称
function getLocalizedAreaName(areaKey) {
  try {
    // 检查扩展上下文是否有效
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
      return areaKey;
    }
    return chrome.i18n.getMessage(areaKey) || areaKey;
  } catch (error) {
    // 静默处理扩展上下文失效的错误
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

  // 从本地arealist.json文件获取默认区域列表
  async loadDefaultAreaListFromConfig() {
    try {
      // 在扩展环境中，尝试从打包文件中加载arealist.json
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const url = chrome.runtime.getURL('config/arealist.json');
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.arealist && Array.isArray(data.arealist)) {
            // 应用本地化名称
            return data.arealist.map(area => ({
              ...area,
              name: getLocalizedAreaName(area.name)
            }));
          }
        }
      }
    } catch (error) {
      console.warn('[APP_CONSTANTS] Failed to load arealist.json:', error);
    }
    // 如果加载失败，返回一个空数组
    return [];
  },

};

// 如果在扩展环境中，将常量添加到全局
if (typeof window !== 'undefined') {
  window.APP_CONSTANTS = APP_CONSTANTS;
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONSTANTS;
}
