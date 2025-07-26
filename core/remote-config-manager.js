/**
 * 远程配置管理工具
 */

/**
 * 远程配置管理器
 */
class RemoteConfigManager {
  constructor() {
    // 确保 APP_CONSTANTS 可用
    this.constants = (typeof window !== 'undefined' && window.APP_CONSTANTS) ?
      window.APP_CONSTANTS :
      (typeof APP_CONSTANTS !== 'undefined' ? APP_CONSTANTS : null);

    if (!this.constants) {
      console.warn('[RemoteConfigManager] APP_CONSTANTS not found, using fallback URL');
      this.remoteUrl = 'https://raw.githubusercontent.com/kaedei/hoyo-leaks-block/refs/heads/main/config/arealist.json';
    } else {
      this.remoteUrl = this.constants.REMOTE_CONFIG_URL;
    }
  }

  /**
   * 获取远程区域配置
   * @returns {Promise<Array>} 远程区域配置数据
   */
  async fetchRemoteAreaList() {
    try {
      const response = await fetch(this.remoteUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.arealist && Array.isArray(data.arealist)) {
        return data.arealist;
      } else {
        // 安全地获取国际化消息
        let errorMsg = 'Invalid server data';
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.i18n) {
            errorMsg = chrome.i18n.getMessage('invalid_server_data') || errorMsg;
          }
        } catch (e) {
          // 扩展上下文失效时使用默认消息
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.warn('[RemoteConfigManager] Failed to fetch remote config:', error);
      throw error;
    }
  }

  /**
   * 获取默认区域配置（本地备用）
   * @returns {Promise<Array>} 默认区域配置
   */
  async getDefaultAreaList() {
    if (this.constants && this.constants.loadDefaultAreaListFromConfig) {
      try {
        return await this.constants.loadDefaultAreaListFromConfig();
      } catch (error) {
        console.warn('[RemoteConfigManager] Failed to load default area list from config:', error);
      }
    }

    console.warn('[RemoteConfigManager] Using fallback empty area list');
    return [];
  }

  /**
   * 更新存储中的区域配置
   * @param {Function} onSuccess 成功回调
   * @param {Function} onError 错误回调
   */
  async updateAreaConfig(onSuccess, onError) {
    try {
      const areaList = await this.fetchRemoteAreaList();

      chrome.storage.sync.set({ areaList }, () => {
        if (chrome.runtime.lastError) {
          const error = new Error(chrome.runtime.lastError.message);
          if (onError) onError(error);
        } else {
          if (onSuccess) onSuccess(areaList);
        }
      });
    } catch (error) {
      if (onError) onError(error);
    }
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.RemoteConfigManager = RemoteConfigManager;
}

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RemoteConfigManager;
}
