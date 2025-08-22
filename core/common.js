/**
 * 公用核心模块 - 包含调试、常量和基础工具函数
 */

/**
 * ==================== 调试工具 ====================
 */

// 是否为调试模式
const IS_DEBUG_MODE = false; // 本地调试时可以改为 true 来启用调试日志

// 创建调试工具对象
const DebugLogger = {
  // 是否为调试模式
  isDebugMode: IS_DEBUG_MODE,

  // 调试日志（只在调试模式下输出）
  log: function (...args) {
    if (this.isDebugMode) {
      console.log(...args);
    }
  },

  // 信息日志（只在调试模式下输出）
  info: function (...args) {
    if (this.isDebugMode) {
      console.info(...args);
    }
  },

  // 警告日志（总是输出，因为可能涉及功能问题）
  warn: function (...args) {
    console.warn(...args);
  },

  // 错误日志（总是输出，因为涉及严重错误）
  error: function (...args) {
    console.error(...args);
  },

  // 调试信息（包含调试状态）
  debugInfo: function () {
    if (this.isDebugMode) {
      try {
        // 检查Chrome扩展上下文是否有效
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
          console.log('[Debug] Extension ID:', chrome.runtime.id);
          console.log('[Debug] Debug mode enabled');
        } else {
          console.log('[Debug] Extension context unavailable or invalidated');
          console.log('[Debug] Debug mode enabled (offline)');
        }
      } catch (error) {
        console.log('[Debug] Failed to check extension context:', error.message);
      }
    }
  }
};

/**
 * ==================== 全局常量 ====================
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
    areaList: [],
    // 自动更新默认配置
    autoUpdateEnabled: true,
    autoUpdateInterval: 1, // 默认每天检查
    lastUpdateCheck: null,
    lastUpdateTime: null,
    // 指示条显示配置
    showIndicator: true
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

/**
 * ==================== 基础工具函数 ====================
 */

const CommonUtils = {
  /**
   * 延迟执行函数
   * @param {number} ms 延迟时间（毫秒）
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 等待Chrome运行时准备就绪
   * @param {string} platform 平台名称
   * @returns {Promise<void>}
   */
  async waitForChromeRuntime(platform = '') {
    return new Promise((resolve) => {
      const checkRuntime = () => {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          if (platform) DebugLogger.log(`[HoyoBlock-${platform}] Chrome runtime is ready`);
          resolve();
        } else {
          if (platform) DebugLogger.log(`[HoyoBlock-${platform}] Waiting for Chrome runtime...`);
          setTimeout(checkRuntime, 100);
        }
      };
      checkRuntime();
    });
  },

  /**
   * 等待文档准备就绪
   * @param {string} platform 平台名称
   * @returns {Promise<void>}
   */
  async waitForDocumentReady(platform = '') {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
          if (platform) DebugLogger.log(`[HoyoBlock-${platform}] Document is ready`);
          resolve();
        } else {
          if (platform) DebugLogger.log(`[HoyoBlock-${platform}] Waiting for document to be ready...`);
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  },

  /**
   * 获取扩展版本号
   * @returns {string} 版本号
   */
  getExtensionVersion() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        return chrome.runtime.getManifest().version;
      }
    } catch (error) {
      DebugLogger.warn('Failed to get extension version:', error);
    }
    return 'Unknown';
  },

  /**
   * 安全的存储操作
   * @param {string} action 操作类型：'get' | 'set'
   * @param {object} data 数据
   * @returns {Promise<any>}
   */
  async safeStorage(action, data = null) {
    return new Promise((resolve, reject) => {
      try {
        if (!chrome || !chrome.storage || !chrome.storage.sync) {
          reject(new Error('Chrome storage not available'));
          return;
        }

        if (action === 'get') {
          chrome.storage.sync.get(data, (result) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result);
            }
          });
        } else if (action === 'set') {
          chrome.storage.sync.set(data, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        } else {
          reject(new Error('Unknown storage action'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }
};

/**
 * ==================== 统计管理器 ====================
 */

class StatsManager {
  constructor(platform) {
    this.platform = platform;
    this.dailyBlockCount = 0; // 当日屏蔽计数
    this.totalBlockCount = 0; // 总屏蔽计数
    this.lastUpdateDate = null; // 上次更新日期
  }

  // 加载统计数据
  async loadStats() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['todayBlocked', 'totalBlocked', 'lastUpdateDate'], (result) => {
        const today = new Date().toDateString();

        // 如果是新的一天，重置今日统计
        if (result.lastUpdateDate !== today) {
          this.dailyBlockCount = 0;
          this.totalBlockCount = result.totalBlocked || 0;
          this.lastUpdateDate = today;
          this.saveStats();
        } else {
          this.dailyBlockCount = result.todayBlocked || 0;
          this.totalBlockCount = result.totalBlocked || 0;
          this.lastUpdateDate = result.lastUpdateDate;
        }

        DebugLogger.log(`[HoyoBlock-${this.platform}] Stats loaded - Today: ${this.dailyBlockCount}, Total: ${this.totalBlockCount}`);
        resolve();
      });
    });
  }

  // 保存统计数据
  saveStats() {
    chrome.storage.local.set({
      todayBlocked: this.dailyBlockCount,
      totalBlocked: this.totalBlockCount,
      lastUpdateDate: this.lastUpdateDate
    }, () => {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Stats saved - Today: ${this.dailyBlockCount}, Total: ${this.totalBlockCount}`);
    });
  }

  // 更新统计数据
  updateStats(blockedCount) {
    if (blockedCount > 0) {
      this.dailyBlockCount += blockedCount;
      this.totalBlockCount += blockedCount;
      this.saveStats();
    }
  }

  // 获取统计数据
  getStats() {
    return {
      dailyBlockCount: this.dailyBlockCount,
      totalBlockCount: this.totalBlockCount,
      lastUpdateDate: this.lastUpdateDate
    };
  }

  // 重置统计数据
  resetStats() {
    this.dailyBlockCount = 0;
    this.totalBlockCount = 0;
    this.lastUpdateDate = new Date().toDateString();
    this.saveStats();
  }
}

/**
 * ==================== 全局导出 ====================
 */

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.DebugLogger = DebugLogger;
  window.APP_CONSTANTS = APP_CONSTANTS;
  window.CommonUtils = CommonUtils;
  window.StatsManager = StatsManager;
}

// Node.js 环境支持
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DebugLogger, APP_CONSTANTS, CommonUtils, StatsManager };
}
