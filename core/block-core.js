// 重构后的核心功能模块
class HoyoLeaksBlockCore {
  constructor(platform) {
    this.platform = platform;
    this.isInitialized = false;

    // 初始化各个管理器
    this.configManager = new ConfigManager(platform);
    this.statsManager = new StatsManager(platform);
    this.uiManager = new UIManager(platform);
    this.contentBlocker = new ContentBlocker(platform, this.configManager);

    this.init();
  }

  async init() {
    try {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Starting initialization...`);

      // 添加延迟确保Chrome扩展API已准备好
      await Utils.waitForChromeRuntime(this.platform);
      DebugLogger.log(`[HoyoBlock-${this.platform}] Chrome runtime ready`);

      // 加载配置和统计数据
      await this.configManager.loadConfig();
      await this.statsManager.loadStats();
      DebugLogger.log(`[HoyoBlock-${this.platform}] Config loaded:`, this.configManager.getConfig());
      DebugLogger.log(`[HoyoBlock-${this.platform}] Area list loaded:`, this.configManager.getAreaList());

      // 等待DOM加载完成后再设置UI
      await Utils.waitForDocumentReady(this.platform);
      this.uiManager.setupUI();
      DebugLogger.log(`[HoyoBlock-${this.platform}] UI setup complete`);

      // 启动内容屏蔽
      this.startBlocking();
      DebugLogger.log(`[HoyoBlock-${this.platform}] Blocking started`);

      this.isInitialized = true;
      DebugLogger.log(`[HoyoBlock-${this.platform}] Initialization complete!`);
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Failed to initialize:`, error);
    }
  }

  startBlocking() {
    // 创建一个包装函数来处理统计更新
    const originalBlockContent = this.contentBlocker.blockContent.bind(this.contentBlocker);
    this.contentBlocker.blockContent = () => {
      const blockedCount = originalBlockContent();
      this.statsManager.updateStats(blockedCount);
      return blockedCount;
    };

    this.contentBlocker.startBlocking();
  }

  stopBlocking() {
    this.contentBlocker.stopBlocking();
  }

  // 获取统计信息
  getStats() {
    return this.statsManager.getStats();
  }

  // 获取配置信息
  getConfig() {
    return this.configManager.getConfig();
  }

  // 保存配置
  async saveConfig(newConfig) {
    return await this.configManager.saveConfig(newConfig);
  }

  // 重置统计数据
  resetStats() {
    this.statsManager.resetStats();
  }

  // 清理和销毁
  destroy() {
    this.contentBlocker.stopBlocking();
    this.contentBlocker.clearAllBlocks();
    this.uiManager.removeUI();
    this.isInitialized = false;
    DebugLogger.log(`[HoyoBlock-${this.platform}] Core destroyed`);
  }

  // 重新初始化（用于配置更新后）
  async reinitialize() {
    DebugLogger.log(`[HoyoBlock-${this.platform}] Reinitializing...`);
    this.stopBlocking();
    await this.configManager.loadConfig();
    this.startBlocking();
    DebugLogger.log(`[HoyoBlock-${this.platform}] Reinitialized`);
  }
}

// 导出供content script使用
window.HoyoLeaksBlockCore = HoyoLeaksBlockCore;
