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
    // 使用消息传递方式通知 background script 打开选项页面
    chrome.runtime.sendMessage({ action: 'openOptionsPage' }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('打开设置页面时出错:', chrome.runtime.lastError);
        // 备用方案：尝试直接打开选项页面
        this.openOptionsPageFallback();
      }
    });
  }

  openOptionsPageFallback() {
    // 备用方案：直接在新标签页中打开选项页面
    const optionsUrl = chrome.runtime.getURL('options/options.html');
    window.open(optionsUrl, '_blank');
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
      if (chrome && chrome.i18n && chrome.i18n.getMessage) {
        const message = chrome.i18n.getMessage(key, substitutions);
        return message || key;
      }
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Failed to get localized message for key: ${key}`, error);
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
