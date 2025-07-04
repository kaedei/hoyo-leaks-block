/**
 * 国际化模块 - 处理页面本地化
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
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getCurrentLanguage() {
    try {
      return chrome.i18n.getUILanguage();
    } catch (error) {
      console.warn('[I18nManager] Failed to get current language:', error);
      return 'en';
    }
  }

  /**
   * 动态更新元素的本地化内容
   * @param {string} elementId 元素ID
   * @param {string} messageKey 消息键
   */
  updateElementText(elementId, messageKey) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = this.getMessage(messageKey);
    }
  }

  /**
   * 动态更新元素的本地化属性
   * @param {string} elementId 元素ID
   * @param {string} attributeName 属性名
   * @param {string} messageKey 消息键
   */
  updateElementAttribute(elementId, attributeName, messageKey) {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute(attributeName, this.getMessage(messageKey));
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

// 创建全局实例
window.I18nManager = new I18nManager();

// 兼容性检查
if (typeof chrome === 'undefined' || !chrome.i18n) {
  console.warn('[I18nManager] Chrome i18n API not available, creating mock');
  // 创建模拟的 chrome.i18n API
  window.chrome = window.chrome || {};
  window.chrome.i18n = window.chrome.i18n || {
    getMessage: function (key) {
      console.warn(`[I18nManager] Mock getMessage called with key: ${key}`);
      return key;
    },
    getUILanguage: function () {
      return 'en';
    }
  };
}
