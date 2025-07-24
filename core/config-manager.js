// 配置管理模块 - 内容脚本版本
class ConfigManager extends BaseConfigManager {
  constructor(platform) {
    super();
    this.platform = platform;
  }

  async loadConfig() {
    DebugLogger.log(`[HoyoBlock-${this.platform}] Loading config...`);

    return new Promise((resolve, reject) => {
      // 检查chrome.runtime是否可用
      if (!chrome || !chrome.runtime) {
        const error = 'Chrome runtime not available';
        console.warn(`[HoyoBlock-${this.platform}] ${error}`);
        reject(new Error(error));
        return;
      }

      try {
        // 先尝试直接从storage读取
        chrome.storage.sync.get(null, (directResult) => {
          if (chrome.runtime.lastError) {
            console.warn(`[HoyoBlock-${this.platform}] Direct storage read failed:`, chrome.runtime.lastError);
            // 如果直接读取失败，尝试通过消息传递
            this.loadConfigViaMessage(resolve, reject);
            return;
          }

          DebugLogger.log(`[HoyoBlock-${this.platform}] Config loaded directly from storage:`, directResult);
          this.config = directResult || {};
          this.areaList = directResult?.areaList || [];

          // 初始化配置结构
          this.initConfigStructure();

          // 验证配置的完整性
          this.validateConfig();
          resolve();
        });
      } catch (error) {
        console.warn(`[HoyoBlock-${this.platform}] Failed to load config directly:`, error);
        // 尝试通过消息传递
        this.loadConfigViaMessage(resolve, reject);
      }
    });
  }

  loadConfigViaMessage(resolve, reject) {
    DebugLogger.log(`[HoyoBlock-${this.platform}] Loading config via background message...`);

    try {
      chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(`[HoyoBlock-${this.platform}] Error loading config via message:`, chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        DebugLogger.log(`[HoyoBlock-${this.platform}] Config loaded via message:`, response);
        this.config = response || {};
        this.areaList = response?.areaList || [];

        // 验证配置的完整性
        this.validateConfig();
        resolve();
      });
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Failed to send message:`, error);
      reject(error);
    }
  }

  validateConfig() {
    const requiredKeys = [
      `blockTitle${this.platform}`,
      `blockUsers${this.platform}`,
      `blockUsersWhite${this.platform}`
    ];

    DebugLogger.log(`[HoyoBlock-${this.platform}] Validating config for keys:`, requiredKeys);

    requiredKeys.forEach(key => {
      if (!(key in this.config)) {
        console.warn(`[HoyoBlock-${this.platform}] Missing config key: ${key}`);
        this.config[key] = '';
      } else {
        DebugLogger.log(`[HoyoBlock-${this.platform}] Config ${key}:`, this.config[key]);
      }
    });

    DebugLogger.log(`[HoyoBlock-${this.platform}] Active area list count:`, this.areaList.length);
    const activeAreas = this.areaList.filter(area =>
      area.area === this.platform.toLowerCase() && area.on === true
    );
    DebugLogger.log(`[HoyoBlock-${this.platform}] Areas for this platform:`, activeAreas);
  }

  async saveConfig(newConfig) {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.runtime) {
        console.warn('Chrome runtime not available');
        reject(new Error('Chrome runtime not available'));
        return;
      }

      try {
        chrome.runtime.sendMessage({
          action: 'setConfig',
          config: newConfig
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Error saving config:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (response?.success) {
            this.config = { ...this.config, ...newConfig };
            resolve(true);
          } else {
            reject(new Error('Failed to save config'));
          }
        });
      } catch (error) {
        console.warn('Failed to send message:', error);
        reject(error);
      }
    });
  }

  getBlockRegExp(configKey) {
    const str = this.config[configKey] || '';
    DebugLogger.log(`[HoyoBlock-${this.platform}] Building regex for ${configKey}:`, str);

    if (!str) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] No keywords for ${configKey}, returning null`);
      return null;
    }

    const regex = this.buildRegExp(configKey);
    DebugLogger.log(`[HoyoBlock-${this.platform}] Regex pattern for ${configKey}:`, regex?.source);
    return regex;
  }

  getConfig() {
    return this.config;
  }

  getAreaList() {
    return this.areaList;
  }
}

// 导出供其他模块使用
window.ConfigManager = ConfigManager;
