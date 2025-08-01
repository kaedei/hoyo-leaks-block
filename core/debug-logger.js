/**
 * 调试管理模块
 * 只在本地调试模式下输出日志，打包发布时禁用调试日志
 */

// 是否为调试模式
const IS_DEBUG_MODE = false; // 本地调试时可以改为 true 来启用调试日志

// 创建调试工具对象
const DebugLogger = {
  // 是否为调试模式
  isDebugMode: IS_DEBUG_MODE,

  // 调试日志（只在调试模式下输出）
  log: function (...args) {
    if (this.isDebugMode) {
      console.log(...args);
    }
  },

  // 信息日志（只在调试模式下输出）
  info: function (...args) {
    if (this.isDebugMode) {
      console.info(...args);
    }
  },

  // 警告日志（总是输出，因为可能涉及功能问题）
  warn: function (...args) {
    console.warn(...args);
  },

  // 错误日志（总是输出，因为涉及严重错误）
  error: function (...args) {
    console.error(...args);
  },

  // 调试信息（包含调试状态）
  debugInfo: function () {
    if (this.isDebugMode) {
      try {
        // 检查Chrome扩展上下文是否有效
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
          console.log('[Debug] Extension ID:', chrome.runtime.id);
          console.log('[Debug] Debug mode enabled');
        } else {
          console.log('[Debug] Extension context unavailable or invalidated');
          console.log('[Debug] Debug mode enabled (offline)');
        }
      } catch (error) {
        console.log('[Debug] Extension context check failed:', error.message);
        console.log('[Debug] Debug mode enabled (context error)');
      }
    }
  },

  // 检查扩展上下文是否有效
  isExtensionContextValid: function () {
    try {
      return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    } catch (error) {
      return false;
    }
  }
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
  window.DebugLogger = DebugLogger;
}

// 如果是Node.js环境，导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebugLogger;
}
