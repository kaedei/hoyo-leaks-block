/**
 * 自动更新管理器
 * 负责管理定期更新屏蔽规则的功能
 */

class AutoUpdateManager {
  constructor() {
    this.configManager = new BaseConfigManager();
    this.STORAGE_KEYS = {
      AUTO_UPDATE_ENABLED: 'autoUpdateEnabled',
      AUTO_UPDATE_INTERVAL: 'autoUpdateInterval', // 天数
      LAST_UPDATE_CHECK: 'lastUpdateCheck',
      LAST_UPDATE_TIME: 'lastUpdateTime'
    };
  }

  /**
   * 获取自动更新配置
   */
  async getAutoUpdateConfig() {
    try {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.sync.get([
          this.STORAGE_KEYS.AUTO_UPDATE_ENABLED,
          this.STORAGE_KEYS.AUTO_UPDATE_INTERVAL,
          this.STORAGE_KEYS.LAST_UPDATE_CHECK,
          this.STORAGE_KEYS.LAST_UPDATE_TIME
        ], (data) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(data);
          }
        });
      });

      return {
        enabled: result[this.STORAGE_KEYS.AUTO_UPDATE_ENABLED] || true, // 默认开启
        interval: result[this.STORAGE_KEYS.AUTO_UPDATE_INTERVAL] || 1, // 默认每天
        lastUpdateCheck: result[this.STORAGE_KEYS.LAST_UPDATE_CHECK] || null,
        lastUpdateTime: result[this.STORAGE_KEYS.LAST_UPDATE_TIME] || null
      };
    } catch (error) {
      console.error('[AutoUpdateManager] Failed to get auto update config:', error);
      return {
        enabled: true, // 默认开启
        interval: 1, // 默认每天
        lastUpdateCheck: null,
        lastUpdateTime: null
      };
    }
  }

  /**
   * 保存自动更新配置
   */
  async saveAutoUpdateConfig(config) {
    const data = {};
    data[this.STORAGE_KEYS.AUTO_UPDATE_ENABLED] = config.enabled;
    data[this.STORAGE_KEYS.AUTO_UPDATE_INTERVAL] = config.interval;
    if (config.lastUpdateCheck !== undefined) {
      data[this.STORAGE_KEYS.LAST_UPDATE_CHECK] = config.lastUpdateCheck;
    }
    if (config.lastUpdateTime !== undefined) {
      data[this.STORAGE_KEYS.LAST_UPDATE_TIME] = config.lastUpdateTime;
    }

    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * 检查是否需要执行自动更新
   */
  async shouldPerformAutoUpdate() {
    const config = await this.getAutoUpdateConfig();

    if (!config.enabled) {
      return false;
    }

    const now = new Date();
    const today = now.toDateString();

    // 如果今天已经检查过了，就不再检查
    if (config.lastUpdateCheck === today) {
      return false;
    }

    // 如果从未更新过，则需要更新
    if (!config.lastUpdateTime) {
      return true;
    }

    // 检查距离上次更新是否超过了设定的间隔
    const lastUpdate = new Date(config.lastUpdateTime);
    const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

    return daysSinceLastUpdate >= config.interval;
  }

  /**
   * 执行自动更新
   */
  async performAutoUpdate() {
    try {
      console.log('[AutoUpdateManager] Starting auto update...');

      // 获取当前配置
      const currentConfig = await this.configManager.getStorageData();
      this.configManager.config = currentConfig;
      this.configManager.initConfigStructure();

      // 从云端同步规则
      const result = await this.configManager.syncWithRemoteConfig(false);

      const now = new Date();
      const today = now.toDateString();

      // 更新检查时间和更新时间
      await this.saveAutoUpdateConfig({
        lastUpdateCheck: today,
        lastUpdateTime: result.success ? now.toISOString() : null
      });

      if (result.success) {
        console.log(`[AutoUpdateManager] Auto update completed successfully. Merged: ${result.mergedCount}, Skipped: ${result.skippedCount}`);
        return {
          success: true,
          mergedCount: result.mergedCount,
          skippedCount: result.skippedCount,
          remoteVersion: result.remoteVersion,
          lastUpdated: result.lastUpdated
        };
      } else {
        console.warn('[AutoUpdateManager] Auto update failed:', result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('[AutoUpdateManager] Auto update error:', error);

      // 即使失败也要更新检查时间，避免频繁重试
      const today = new Date().toDateString();
      await this.saveAutoUpdateConfig({
        lastUpdateCheck: today
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查并执行自动更新（如果需要）
   */
  async checkAndPerformAutoUpdate() {
    try {
      const shouldUpdate = await this.shouldPerformAutoUpdate();
      if (shouldUpdate) {
        return await this.performAutoUpdate();
      } else {
        console.log('[AutoUpdateManager] Auto update not needed at this time');
        return { success: true, skipped: true };
      }
    } catch (error) {
      console.error('[AutoUpdateManager] Error during auto update check:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 格式化上次更新时间
   */
  formatLastUpdateTime(isoString) {
    if (!isoString) {
      return null;
    }

    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('[AutoUpdateManager] Error formatting time:', error);
      return null;
    }
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.AutoUpdateManager = AutoUpdateManager;
}

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoUpdateManager;
}
