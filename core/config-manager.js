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
    DebugLogger.log(`[HoyoBlock-${this.platform}] Validating config structure...`);

    // 确保新的配置结构存在
    if (!this.config.blockRules) {
      this.config.blockRules = {};
    }

    const platformName = this.platform.toLowerCase() === 'bili' ? 'bilibili' : this.platform.toLowerCase();

    if (!this.config.blockRules[platformName]) {
      this.config.blockRules[platformName] = {
        keywords: [],
        blacklist: [],
        whitelist: []
      };
    }

    // 确保每个规则类型都存在
    const ruleTypes = ['keywords', 'blacklist', 'whitelist'];
    ruleTypes.forEach(type => {
      if (!Array.isArray(this.config.blockRules[platformName][type])) {
        this.config.blockRules[platformName][type] = [];
      }
    });

    // 输出配置信息用于调试
    const platformRules = this.config.blockRules[platformName];
    DebugLogger.log(`[HoyoBlock-${this.platform}] Platform rules for ${platformName}:`, {
      keywords: platformRules.keywords.length,
      blacklist: platformRules.blacklist.length,
      whitelist: platformRules.whitelist.length
    });

    DebugLogger.log(`[HoyoBlock-${this.platform}] Active area list count:`, this.areaList.length);
    const activeAreas = this.areaList.filter(area =>
      area.area === platformName && area.on === true
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

  getBlockRules(configKey) {
    const platform = this.getPlatformFromConfigKey(configKey);
    const ruleType = this.getRuleTypeFromConfigKey(configKey);

    if (platform && ruleType && this.config.blockRules && this.config.blockRules[platform]) {
      const rules = this.config.blockRules[platform][ruleType];
      if (Array.isArray(rules) && rules.length > 0) {
        // 过滤空值
        const validRules = rules.filter(rule => rule && rule.trim());
        if (validRules.length === 0) {
          DebugLogger.log(`[HoyoBlock-${this.platform}] No valid rules for ${configKey}, returning empty array`);
          return [];
        }
        DebugLogger.log(`[HoyoBlock-${this.platform}] Found rules for ${configKey}:`, validRules);
        return validRules;
      }
    }

    DebugLogger.log(`[HoyoBlock-${this.platform}] No rules found for ${configKey}, returning empty array`);
    return [];
  }

  // 从配置键名获取平台名称
  getPlatformFromConfigKey(configKey) {
    if (configKey.includes('Bili')) return 'bilibili';
    if (configKey.includes('Ytb')) return 'youtube';
    if (configKey.includes('Twitter')) return 'twitter';
    return null;
  }

  // 从配置键名获取规则类型
  getRuleTypeFromConfigKey(configKey) {
    if (configKey.includes('Title')) return 'keywords';
    if (configKey.includes('Users') && !configKey.includes('White')) return 'blacklist';
    if (configKey.includes('UsersWhite')) return 'whitelist';
    return null;
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
