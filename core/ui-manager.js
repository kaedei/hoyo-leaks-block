// UI管理模块
class UIManager {
  constructor(platform) {
    this.platform = platform;
  }

  setupUI() {
    if (document.getElementById('hoyo-block-button')) {
      return; // UI已存在
    }

    // 检查 document.body 是否可用
    if (!document.body) {
      console.warn(`[HoyoBlock-${this.platform}] Document body not available, UI setup skipped`);
      return;
    }

    // 创建设置按钮
    const button = document.createElement('div');
    button.id = 'hoyo-block-button';
    button.innerHTML = this.getLocalizedMessage('block_button');
    button.className = 'hoyo-block-open-button';

    button.addEventListener('click', () => {
      this.openSettings();
    });

    document.body.appendChild(button);
  }

  openSettings() {
    // 检查扩展上下文是否有效
    try {
      if (!chrome.runtime || !chrome.runtime.id) {
        console.warn(`[HoyoBlock-${this.platform}] Extension context invalidated, cannot open settings`);
        return;
      }
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Extension context check failed:`, error);
      return;
    }

    // 使用消息传递方式通知 background script 打开选项页面
    chrome.runtime.sendMessage({ action: 'openOptionsPage' }, (response) => {
      if (chrome.runtime.lastError) {
        // 安全地获取错误消息
        let errorMsg = 'Failed to open settings';
        try {
          if (chrome.i18n && chrome.i18n.getMessage) {
            errorMsg = chrome.i18n.getMessage('open_settings_error') || errorMsg;
          }
        } catch (e) {
          // 扩展上下文失效时使用默认消息
        }
        console.warn(errorMsg, chrome.runtime.lastError);
        // 备用方案：尝试直接打开选项页面
        this.openOptionsPageFallback();
      }
    });
  }

  openOptionsPageFallback() {
    // 备用方案：直接在新标签页中打开选项页面
    try {
      if (chrome.runtime && chrome.runtime.getURL) {
        const optionsUrl = chrome.runtime.getURL('options/options.html');
        window.open(optionsUrl, '_blank');
      } else {
        console.warn(`[HoyoBlock-${this.platform}] Cannot open options page: extension context invalidated`);
      }
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Failed to open options page:`, error);
    }
  }

  removeUI() {
    const button = document.getElementById('hoyo-block-button');
    if (button) {
      button.remove();
    }
  }

  /**
   * 获取本地化消息
   * @param {string} key 消息键
   * @param {string|string[]} substitutions 替换参数
   * @returns {string} 本地化后的消息
   */
  getLocalizedMessage(key, substitutions = null) {
    try {
      // 检查扩展上下文是否有效
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        // 扩展上下文无效，返回备用消息
        const fallbackMessages = {
          'block_button': 'HoYo Leaks Block'
        };
        return fallbackMessages[key] || key;
      }

      if (chrome.i18n && chrome.i18n.getMessage) {
        const message = chrome.i18n.getMessage(key, substitutions);
        return message || key;
      }
    } catch (error) {
      // 静默处理错误，避免控制台噪音
      if (typeof DebugLogger !== 'undefined' && DebugLogger.isDebugMode) {
        DebugLogger.log(`[HoyoBlock-${this.platform}] Failed to get localized message for key: ${key}`, error.message);
      }
    }

    // 备用方案：返回默认文本
    const fallbackMessages = {
      'block_button': 'HoYo Leaks Block'
    };

    return fallbackMessages[key] || key;
  }
}

// 导出供其他模块使用
window.UIManager = UIManager;
