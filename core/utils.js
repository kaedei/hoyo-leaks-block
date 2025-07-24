// 工具函数模块 - 内容脚本版本
class Utils extends SharedUtils {
  /**
   * 等待Chrome运行时准备就绪
   * @param {string} platform 平台名称
   * @returns {Promise<void>}
   */
  static async waitForChromeRuntime(platform) {
    return new Promise((resolve) => {
      const checkRuntime = () => {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          DebugLogger.log(`[HoyoBlock-${platform}] Chrome runtime is ready`);
          resolve();
        } else {
          DebugLogger.log(`[HoyoBlock-${platform}] Waiting for Chrome runtime...`);
          setTimeout(checkRuntime, 100);
        }
      };
      checkRuntime();
    });
  }

  /**
   * 等待文档准备就绪
   * @param {string} platform 平台名称
   * @returns {Promise<void>}
   */
  static async waitForDocumentReady(platform) {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
          DebugLogger.log(`[HoyoBlock-${platform}] Document is ready`);
          resolve();
        } else {
          DebugLogger.log(`[HoyoBlock-${platform}] Waiting for document to be ready...`);
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * 延迟执行函数
   * @param {number} ms 延迟时间（毫秒）
   * @returns {Promise<void>}
   */
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 安全地获取元素文本内容
   * @param {Element} element DOM元素
   * @returns {string} 文本内容
   */
  static getTextContent(element) {
    try {
      return element ? element.textContent?.trim() || '' : '';
    } catch (error) {
      console.warn('Failed to get text content:', error);
      return '';
    }
  }

  /**
   * 检查元素是否存在且可见
   * @param {Element} element DOM元素
   * @returns {boolean} 是否存在且可见
   */
  static isElementVisible(element) {
    if (!element) return false;

    try {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0';
    } catch (error) {
      console.warn('Failed to check element visibility:', error);
      return false;
    }
  }

  /**
   * 获取当前日期字符串
   * @returns {string} 日期字符串
   */
  static getCurrentDateString() {
    return new Date().toDateString();
  }

  /**
   * 清理字符串，移除多余的空白字符
   * @param {string} str 输入字符串
   * @returns {string} 清理后的字符串
   */
  static cleanString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/\s+/g, ' ').trim();
  }
}

// 导出供其他模块使用
window.Utils = Utils;
