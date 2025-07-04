/**
 * 米游内鬼信息屏蔽 - 设置页面主入口
 *
 * 模块说明：
 * - chrome-api-mock.js: Chrome API 模拟（用于测试）
 * - utils.js: 工具函数
 * - config-manager.js: 配置管理
 * - area-manager.js: 区域管理
 * - ui-manager.js: UI管理和事件处理
 * - options.js: 主入口文件（当前文件）
 */

/**
 * 设置页面主控制器
 */
class OptionsController {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化设置页面
   */
  init() {
    if (this.initialized) {
      console.warn('[HoyoBlock-Options] Already initialized');
      return;
    }

    DebugLogger.log('[HoyoBlock-Options] Initializing options page...');

    try {
      // 初始化国际化
      window.I18nManager.init();

      // 初始化UI管理器
      window.UIManager.init();

      // 加载配置
      window.ConfigManager.loadConfig();

      // 加载区域列表
      window.AreaManager.loadAreaList();

      // 初始化区域数据（如果没有数据则加载示例数据）
      window.AreaManager.initAreaData();

      this.initialized = true;
      DebugLogger.log('[HoyoBlock-Options] Options page initialized successfully');

    } catch (error) {
      console.error('[HoyoBlock-Options] Error initializing options page:', error);
      if (typeof window.Utils !== 'undefined' && window.Utils.showMessage) {
        window.Utils.showMessage('初始化失败: ' + error.message, 'error');
      } else {
        alert('初始化失败: ' + error.message);
      }
    }
  }

  /**
   * 获取应用版本信息
   * @returns {string} 版本号
   */
  getVersion() {
    return '103.0';
  }

  /**
   * 获取应用信息
   * @returns {Object} 应用信息对象
   */
  getAppInfo() {
    return {
      name: '米游内鬼信息屏蔽',
      version: this.getVersion(),
      author: 'kaedei',
      description: '用于屏蔽B站、YouTube、Twitter等平台上有关米哈游旗下游戏内鬼爆料内容的浏览器扩展',
      repository: 'https://github.com/kaedei/hoyo-leaks-block'
    };
  }
}

// 创建主控制器实例
const optionsController = new OptionsController();

// 确保所有模块都已加载的函数
function waitForModules() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50; // 最多等待 5 秒
    let attempts = 0;

    const checkModules = () => {
      attempts++;

      DebugLogger.log(`[HoyoBlock-Options] Checking modules (attempt ${attempts}/${maxAttempts})...`);
      DebugLogger.log(`[HoyoBlock-Options] I18nManager: ${typeof window.I18nManager !== 'undefined' ? 'defined' : 'undefined'}`);
      DebugLogger.log(`[HoyoBlock-Options] UIManager: ${typeof window.UIManager !== 'undefined' ? 'defined' : 'undefined'}, has init: ${typeof window.UIManager !== 'undefined' && window.UIManager && typeof window.UIManager.init === 'function' ? 'yes' : 'no'}`);
      DebugLogger.log(`[HoyoBlock-Options] ConfigManager: ${typeof window.ConfigManager !== 'undefined' ? 'defined' : 'undefined'}`);
      DebugLogger.log(`[HoyoBlock-Options] AreaManager: ${typeof window.AreaManager !== 'undefined' ? 'defined' : 'undefined'}`);
      DebugLogger.log(`[HoyoBlock-Options] Utils: ${typeof window.Utils !== 'undefined' ? 'defined' : 'undefined'}`);

      if (typeof window.I18nManager !== 'undefined' && window.I18nManager &&
        typeof window.UIManager !== 'undefined' && window.UIManager && typeof window.UIManager.init === 'function' &&
        typeof window.ConfigManager !== 'undefined' && window.ConfigManager &&
        typeof window.AreaManager !== 'undefined' && window.AreaManager &&
        typeof window.Utils !== 'undefined' && window.Utils) {

        DebugLogger.log('[HoyoBlock-Options] All modules loaded successfully');
        resolve();
      } else if (attempts >= maxAttempts) {
        const missingModules = [];
        if (typeof window.I18nManager === 'undefined' || !window.I18nManager) missingModules.push('I18nManager');
        if (typeof window.UIManager === 'undefined' || !window.UIManager) missingModules.push('UIManager');
        if (typeof window.ConfigManager === 'undefined' || !window.ConfigManager) missingModules.push('ConfigManager');
        if (typeof window.AreaManager === 'undefined' || !window.AreaManager) missingModules.push('AreaManager');
        if (typeof window.Utils === 'undefined' || !window.Utils) missingModules.push('Utils');

        reject(new Error(`模块加载超时，未加载的模块: ${missingModules.join(', ')}`));
      } else {
        setTimeout(checkModules, 100);
      }
    };

    checkModules();
  });
}

// 页面加载完成后等待模块加载然后初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    DebugLogger.log('[HoyoBlock-Options] DOM loaded, waiting for modules...');
    await waitForModules();
    optionsController.init();
  } catch (error) {
    console.error('[HoyoBlock-Options] Failed to initialize:', error);
    alert('初始化失败: ' + error.message);
  }
});

// 导出主控制器和全局函数（向后兼容）
window.OptionsController = optionsController;

// 为了向后兼容，导出一些全局函数
window.toggleArea = (index) => window.AreaManager.toggleArea(index);
window.editArea = (index) => window.AreaManager.editArea(index);
window.deleteArea = (index) => window.AreaManager.deleteArea(index);
window.addArea = () => window.AreaManager.addArea();
window.refreshAreas = () => window.AreaManager.refreshAreas();
window.closeEditDialog = () => window.Utils.closeDialog();
window.closeAddDialog = () => window.Utils.closeDialog();

// 导出工具函数（向后兼容）
window.getPlatformDisplayName = window.Utils.getPlatformDisplayName;
window.showMessage = window.Utils.showMessage;
