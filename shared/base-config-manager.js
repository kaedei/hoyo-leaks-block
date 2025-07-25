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
      if (Array.isArray(rules) && rules.length > 0) {
        // 过滤空值
        const validRules = rules.filter(rule => rule && rule.trim());
        if (validRules.length === 0) {
          return null;
        }
        const pattern = validRules.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
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

  /**
   * 从云端获取默认配置
   */
  async fetchRemoteDefaultConfig() {
    const url = 'https://raw.githubusercontent.com/kaedei/hoyo-leaks-block/refs/heads/main/config/default-v1.json';

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const remoteConfig = await response.json();
      return remoteConfig;
    } catch (error) {
      console.error('[BaseConfigManager] Failed to fetch remote config:', error);
      throw error;
    }
  }

  /**
   * 合并远程配置到本地配置
   * @param {Object} remoteConfig - 远程配置对象
   * @param {boolean} overwrite - 是否覆盖已存在的规则，默认为false（只添加新规则）
   */
  mergeRemoteConfig(remoteConfig, overwrite = false) {
    if (!remoteConfig || !remoteConfig.blockRules) {
      throw new Error('Invalid remote config format');
    }

    // 确保本地配置结构存在
    this.initConfigStructure();

    const platforms = ['bilibili', 'youtube', 'twitter'];
    const ruleTypes = ['keywords', 'blacklist', 'whitelist'];

    let mergedCount = 0;
    let skippedCount = 0;

    platforms.forEach(platform => {
      if (!remoteConfig.blockRules[platform]) return;

      ruleTypes.forEach(ruleType => {
        const remoteRules = remoteConfig.blockRules[platform][ruleType];
        if (!Array.isArray(remoteRules)) return;

        const localRules = this.config.blockRules[platform][ruleType];

        remoteRules.forEach(remoteRule => {
          if (!remoteRule || !remoteRule.trim()) return;

          const ruleExists = localRules.some(localRule =>
            localRule.toLowerCase().trim() === remoteRule.toLowerCase().trim()
          );

          if (!ruleExists) {
            localRules.push(remoteRule.trim());
            mergedCount++;
          } else if (overwrite) {
            // 如果选择覆盖且规则已存在，更新规则
            const existingIndex = localRules.findIndex(localRule =>
              localRule.toLowerCase().trim() === remoteRule.toLowerCase().trim()
            );
            if (existingIndex !== -1) {
              localRules[existingIndex] = remoteRule.trim();
            }
          } else {
            skippedCount++;
          }
        });
      });
    });

    return { mergedCount, skippedCount };
  }

  /**
   * 获取并合并远程默认配置
   * @param {boolean} overwrite - 是否覆盖已存在的规则
   */
  async syncWithRemoteConfig(overwrite = false) {
    try {
      const remoteConfig = await this.fetchRemoteDefaultConfig();
      const result = this.mergeRemoteConfig(remoteConfig, overwrite);

      // 保存到本地存储
      await this.setStorageData({ blockRules: this.config.blockRules });

      return {
        success: true,
        ...result,
        remoteVersion: remoteConfig.version,
        lastUpdated: remoteConfig.lastUpdated
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 导出供其他模块使用
if (typeof window !== 'undefined') {
  window.BaseConfigManager = BaseConfigManager;
}
