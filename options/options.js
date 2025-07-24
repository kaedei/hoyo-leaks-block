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

      // 绑定全局配置管理方法到window对象（供HTML中的onclick使用）
      this.bindGlobalMethods();

      // 更新版本显示
      this.updateVersionDisplay();

      this.initialized = true;
      DebugLogger.log('[HoyoBlock-Options] Options page initialized successfully');

    } catch (error) {
      console.error('[HoyoBlock-Options] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * 绑定全局方法供HTML使用
   */
  bindGlobalMethods() {
    // Tag界面不需要绑定额外的方法，所有功能都通过事件监听器处理
    // 只保留基本的配置管理方法
    if (window.ConfigManager) {
      DebugLogger.log('[HoyoBlock-Options] ConfigManager methods available');
    }
  }

  /**
   * 更新版本显示
   */
  updateVersionDisplay() {
    const versionElement = document.getElementById('version-text');
    if (versionElement) {
      try {
        // 获取当前显示的本地化文本（如"版本"）
        const currentText = versionElement.textContent;
        // 获取版本号并组合显示
        const version = SharedUtils.getExtensionVersion();
        versionElement.textContent = `${currentText}: ${version}`;
      } catch (error) {
        console.warn('[HoyoBlock-Options] Failed to update version display:', error);
      }
    }
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

        const errorMsg = chrome.i18n.getMessage('modules_loading_timeout').replace('{modules}', missingModules.join(', '));
        reject(new Error(errorMsg));
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
    const errorMsg = chrome.i18n.getMessage('init_failed').replace('{error}', error.message);
    alert(errorMsg);
  }
});

// 导出主控制器和全局函数（向后兼容）
window.OptionsController = optionsController;
