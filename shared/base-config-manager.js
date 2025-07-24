/**
 * 基础配置管理模块 - 共享的配置管理功能
 */

class BaseConfigManager {
  constructor() {
    this.config = {};
    this.areaList = [];
  }

  /**
   * 基础的存储访问方法
   */
  async getStorageData(keys = null) {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.storage) {
        reject(new Error('Chrome storage not available'));
        return;
      }

      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * 基础的存储保存方法
   */
  async setStorageData(data) {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.storage) {
        reject(new Error('Chrome storage not available'));
        return;
      }

      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * 构建正则表达式
   */
  buildRegExp(configKey) {
    const platform = this.getPlatformFromConfigKey(configKey);
    const ruleType = this.getRuleTypeFromConfigKey(configKey);

    if (platform && ruleType && this.config.blockRules && this.config.blockRules[platform]) {
      const rules = this.config.blockRules[platform][ruleType];
      if (Array.isArray(rules)) {
        const enabledRules = rules.filter(rule => rule.enabled).map(rule => rule.value);
        if (enabledRules.length === 0) {
          return null;
        }
        const pattern = enabledRules.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        return new RegExp(pattern, 'i');
      }
    }

    return null;
  }

  /**
   * 从配置键名获取平台名称
   */
  getPlatformFromConfigKey(configKey) {
    if (configKey.includes('Bili')) return 'bilibili';
    if (configKey.includes('Ytb')) return 'youtube';
    if (configKey.includes('Twitter')) return 'twitter';
    return null;
  }

  /**
   * 从配置键名获取规则类型
   */
  getRuleTypeFromConfigKey(configKey) {
    if (configKey.includes('Title')) return 'keywords';
    if (configKey.includes('Users') && !configKey.includes('White')) return 'blacklist';
    if (configKey.includes('UsersWhite')) return 'whitelist';
    return null;
  }

  /**
   * 初始化配置结构
   */
  initConfigStructure() {
    // 初始化 blockRules 结构
    if (!this.config.blockRules) {
      this.config.blockRules = {
        bilibili: { keywords: [], blacklist: [], whitelist: [] },
        youtube: { keywords: [], blacklist: [], whitelist: [] },
        twitter: { keywords: [], blacklist: [], whitelist: [] }
      };
    }

    // 确保每个平台都有完整的结构
    ['bilibili', 'youtube', 'twitter'].forEach(platform => {
      if (!this.config.blockRules[platform]) {
        this.config.blockRules[platform] = { keywords: [], blacklist: [], whitelist: [] };
      }
      ['keywords', 'blacklist', 'whitelist'].forEach(type => {
        if (!Array.isArray(this.config.blockRules[platform][type])) {
          this.config.blockRules[platform][type] = [];
        }
      });
    });
  }

  /**
   * 生成规则ID
   */
  generateRuleId() {
    return 'rule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }  /**
   * 获取配置
   */
  getConfig() {
    return this.config;
  }

  /**
   * 获取区域列表
   */
  getAreaList() {
    return this.areaList;
  }
}

// 导出供其他模块使用
if (typeof window !== 'undefined') {
  window.BaseConfigManager = BaseConfigManager;
}
