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
    const str = this.config[configKey] || '';

    if (!str) {
      return null;
    }

    // 处理多个关键词，用|分隔
    const keywords = str.split('|').map(k => k.trim()).filter(k => k);

    if (keywords.length === 0) {
      return null;
    }

    const pattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(pattern, 'i');
  }

  /**
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
