// 核心功能模块
class HoyoLeaksBlockCore {
  constructor(platform) {
    this.platform = platform;
    this.config = {};
    this.areaList = [];
    this.blockTimeout = 500;
    this.intervalId = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    try {
      // 添加延迟确保Chrome扩展API已准备好
      await this.waitForChromeRuntime();
      await this.loadConfig();
      this.setupUI();
      this.startBlocking();
      this.isInitialized = true;
      console.log(`Hoyo Leaks Block initialized for ${this.platform}`);
    } catch (error) {
      console.error('Failed to initialize Hoyo Leaks Block:', error);
      // 重试机制
      setTimeout(() => {
        console.log('Retrying initialization...');
        this.init();
      }, 2000);
    }
  }

  async waitForChromeRuntime() {
    return new Promise((resolve) => {
      const checkRuntime = () => {
        if (chrome && chrome.runtime) {
          resolve();
        } else {
          setTimeout(checkRuntime, 100);
        }
      };
      checkRuntime();
    });
  }

  async loadConfig() {
    return new Promise((resolve, reject) => {
      // 检查chrome.runtime是否可用
      if (!chrome || !chrome.runtime) {
        console.error('Chrome runtime not available');
        reject(new Error('Chrome runtime not available'));
        return;
      }

      try {
        chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error loading config:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          this.config = response || {};
          this.areaList = response?.areaList || [];
          resolve();
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        reject(error);
      }
    });
  }

  async saveConfig(newConfig) {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.runtime) {
        console.error('Chrome runtime not available');
        reject(new Error('Chrome runtime not available'));
        return;
      }

      try {
        chrome.runtime.sendMessage({
          action: 'setConfig',
          config: newConfig
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error saving config:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (response?.success) {
            this.config = { ...this.config, ...newConfig };
            resolve(true);
          } else {
            reject(new Error('Failed to save config'));
          }
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        reject(error);
      }
    });
  }

  getBlockRegExp(configKey) {
    const str = this.config[configKey] || '';
    if (!str) return new RegExp('', '');

    // 处理多个关键词，用|分隔
    const keywords = str.split('|').map(k => k.trim()).filter(k => k);
    const pattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(pattern, 'i');
  }

  shouldBlock(text, user) {
    const blockTitleKey = `blockTitle${this.platform}`;
    const blockUsersKey = `blockUsers${this.platform}`;
    const blockUsersWhiteKey = `blockUsersWhite${this.platform}`;

    const blockTitle = this.getBlockRegExp(blockTitleKey);
    const blockUsers = this.getBlockRegExp(blockUsersKey);
    const blockUsersWhite = this.getBlockRegExp(blockUsersWhiteKey);

    // 检查白名单
    if (blockUsersWhite.test(user.trim())) {
      return false;
    }

    // 检查黑名单
    return blockTitle.test(text) || blockUsers.test(user);
  }

  applyBlur(element, shouldBlur) {
    if (shouldBlur) {
      element.classList.add('hoyo-blur-block');
      element.setAttribute('data-hoyo-blocked', 'true');
    } else {
      element.classList.remove('hoyo-blur-block');
      element.removeAttribute('data-hoyo-blocked');
    }
  }

  blockContent() {
    const activeAreas = this.areaList.filter(area =>
      area.area === this.platform.toLowerCase() && area.on === true
    );

    activeAreas.forEach(area => {
      const items = document.querySelectorAll(area.item);
      items.forEach(item => {
        const textElement = item.querySelector(area.text);
        const userElement = area.home ?
          document.querySelector(area.user) :
          item.querySelector(area.user);

        const text = textElement ? textElement.textContent : '';
        const user = userElement ? userElement.textContent : '';

        if (this.shouldBlock(text, user)) {
          this.applyBlur(item, true);
          // 也模糊媒体元素
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, true));
        } else {
          this.applyBlur(item, false);
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, false));
        }
      });
    });
  }

  startBlocking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.blockContent();
    }, this.blockTimeout);
  }

  stopBlocking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setupUI() {
    if (document.getElementById('hoyo-block-button')) {
      return; // UI已存在
    }

    // 创建设置按钮
    const button = document.createElement('div');
    button.id = 'hoyo-block-button';
    button.innerHTML = '米哈游内鬼屏蔽';
    button.className = 'hoyo-block-open-button';

    button.addEventListener('click', () => {
      this.openSettings();
    });

    document.body.appendChild(button);
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  destroy() {
    this.stopBlocking();
    const button = document.getElementById('hoyo-block-button');
    if (button) {
      button.remove();
    }
    // 移除所有模糊效果
    const blockedElements = document.querySelectorAll('[data-hoyo-blocked="true"]');
    blockedElements.forEach(element => {
      element.classList.remove('hoyo-blur-block');
      element.removeAttribute('data-hoyo-blocked');
    });
  }
}

// 导出供content script使用
window.HoyoLeaksBlockCore = HoyoLeaksBlockCore;
