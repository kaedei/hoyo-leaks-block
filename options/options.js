/**
 * 米游内鬼信息屏蔽 - 设置页面（合并了工具函数和国际化）
 */

/**
 * ==================== 工具函数 ====================
 */

/**
 * 创建对话框元素
 * @param {string} title 对话框标题
 * @param {string} content 对话框内容HTML
 * @param {string} className 对话框CSS类名
 * @returns {HTMLElement} 对话框元素
 */
function createDialog(title, content, className = 'edit-dialog') {
  const dialog = document.createElement('div');
  dialog.className = 'edit-dialog-overlay';
  dialog.innerHTML = `
    <div class="${className}">
      <h3>${title}</h3>
      ${content}
    </div>
  `;
  return dialog;
}

/**
 * 关闭对话框
 */
function closeDialog() {
  const dialog = document.querySelector('.edit-dialog-overlay');
  if (dialog) {
    dialog.remove();
  }
}

/**
 * ==================== 国际化工具 ====================
 */

/**
 * 国际化管理器
 */
class I18nManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化国际化
   */
  init() {
    if (this.initialized) {
      console.warn('[I18nManager] Already initialized');
      return;
    }

    DebugLogger.log('[I18nManager] Initializing i18n...');

    try {
      this.localizeHTML();
      this.initialized = true;
      DebugLogger.log('[I18nManager] I18n initialized successfully');
    } catch (error) {
      console.error('[I18nManager] Error initializing i18n:', error);
      throw error;
    }
  }

  /**
   * 本地化HTML内容
   */
  localizeHTML() {
    // 获取所有包含 __MSG_*__ 的元素（包括head和body）
    const walker = document.createTreeWalker(
      document.documentElement, // 从根元素开始，包括head和body
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    const textNodesToProcess = [];
    const attributesToProcess = [];

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.includes('__MSG_')) {
          textNodesToProcess.push(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 检查元素的属性
        if (node.hasAttributes()) {
          Array.from(node.attributes).forEach(attr => {
            if (attr.value.includes('__MSG_')) {
              attributesToProcess.push({ element: node, attribute: attr });
            }
          });
        }
      }
    }

    // 处理文本节点
    textNodesToProcess.forEach(node => {
      node.textContent = this.processText(node.textContent);
    });

    // 处理属性
    attributesToProcess.forEach(({ element, attribute }) => {
      const newValue = this.processText(attribute.value);
      element.setAttribute(attribute.name, newValue);
    });

    // 特别处理title标签
    this.localizeTitle();
  }

  /**
   * 处理文本中的本地化标记
   * @param {string} text 包含 __MSG_*__ 标记的文本
   * @returns {string} 本地化后的文本
   */
  processText(text) {
    return text.replace(/__MSG_([a-zA-Z0-9_]+)__/g, (match, key) => {
      try {
        const message = chrome.i18n.getMessage(key);
        return message || match; // 如果找不到对应的消息，返回原始标记
      } catch (error) {
        console.warn(`[I18nManager] Failed to get message for key: ${key}`, error);
        return match;
      }
    });
  }

  /**
   * 获取本地化消息
   * @param {string} key 消息键
   * @param {string|string[]} substitutions 替换参数
   * @returns {string} 本地化后的消息
   */
  getMessage(key, substitutions = null) {
    try {
      return chrome.i18n.getMessage(key, substitutions);
    } catch (error) {
      console.warn(`[I18nManager] Failed to get message for key: ${key}`, error);
      return key;
    }
  }

  /**
   * 特别处理title标签的本地化
   */
  localizeTitle() {
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.textContent.includes('__MSG_')) {
      titleElement.textContent = this.processText(titleElement.textContent);
      DebugLogger.log('[I18nManager] Title localized:', titleElement.textContent);
    }
  }
}

/**
 * ==================== 设置页面主控制器 ====================
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

/**
 * ==================== 全局导出 ====================
 */

// 创建并导出国际化管理器实例
window.I18nManager = new I18nManager();

// 导出工具函数（合并共享工具和本地特有工具）
window.Utils = {
  // 从SharedUtils继承的方法
  getPlatformDisplayName: SharedUtils.getPlatformDisplayName,
  showMessage: SharedUtils.showMessage,
  downloadJSON: SharedUtils.downloadJSON,
  readJSONFile: SharedUtils.readJSONFile,
  debounce: SharedUtils.debounce,
  throttle: SharedUtils.throttle,
  getNestedProperty: SharedUtils.getNestedProperty,
  generateId: SharedUtils.generateId,

  // 本地特有的方法
  createDialog,
  closeDialog
};

// 导出主控制器和全局函数（向后兼容）
window.OptionsController = optionsController;
