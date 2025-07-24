/**
 * 共享工具函数模块
 */

class SharedUtils {
  /**
   * 等待Chrome运行时准备就绪
   */
  static async waitForChromeRuntime(platform) {
    return new Promise((resolve) => {
      const checkRuntime = () => {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          if (platform && window.DebugLogger) {
            window.DebugLogger.log(`[HoyoBlock-${platform}] Chrome runtime is ready`);
          }
          resolve();
        } else {
          if (platform && window.DebugLogger) {
            window.DebugLogger.log(`[HoyoBlock-${platform}] Waiting for Chrome runtime...`);
          }
          setTimeout(checkRuntime, 100);
        }
      };
      checkRuntime();
    });
  }

  /**
   * 等待文档准备就绪
   */
  static async waitForDocumentReady(platform) {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
          if (platform && window.DebugLogger) {
            window.DebugLogger.log(`[HoyoBlock-${platform}] Document is ready`);
          }
          resolve();
        } else {
          if (platform && window.DebugLogger) {
            window.DebugLogger.log(`[HoyoBlock-${platform}] Waiting for document to be ready...`);
          }
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * 延迟执行函数
   */
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取平台显示名称
   */
  static getPlatformDisplayName(platform) {
    const names = {
      'bilibili': 'Bilibili',
      'youtube': 'YouTube',
      'twitter': 'Twitter'
    };
    return names[platform] || platform;
  }

  /**
   * 显示消息提示（用于选项页面）
   */
  static showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = `message ${type}`;
      messageEl.classList.add('show');

      setTimeout(() => {
        messageEl.classList.remove('show');
      }, 3000);
    } else {
      // 如果没有message元素，使用alert作为后备
      alert(text);
    }
  }

  /**
   * 创建并下载JSON文件
   */
  static downloadJSON(data, filename) {
    const configData = JSON.stringify(data, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 读取JSON文件
   */
  static async readJSONFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('没有选择文件'));
        return;
      }

      if (!file.name.endsWith('.json')) {
        reject(new Error('只支持JSON格式的文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          resolve(config);
        } catch (error) {
          reject(new Error('文件格式错误，请确保是有效的JSON文件'));
        }
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsText(file);
    });
  }

  /**
   * 防抖函数
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   */
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 安全地获取嵌套对象属性
   */
  static getNestedProperty(obj, path, defaultValue = null) {
    return path.split('.').reduce((current, key) => {
      return (current && current[key] !== undefined) ? current[key] : defaultValue;
    }, obj);
  }

  /**
   * 生成随机ID
   */
  static generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// 导出供其他模块使用
if (typeof window !== 'undefined') {
  window.SharedUtils = SharedUtils;
}
