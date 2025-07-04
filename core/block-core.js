// 核心功能模块
class HoyoLeaksBlockCore {
  constructor(platform) {
    this.platform = platform;
    this.config = {};
    this.areaList = [];
    this.blockTimeout = 500;
    this.intervalId = null;
    this.isInitialized = false;
    this.processedElements = new WeakSet(); // 缓存已处理的元素

    // 平台名称映射
    this.platformMapping = {
      'Bili': 'bilibili',
      'Ytb': 'youtube',
      'Twitter': 'twitter'
    };

    this.init();
  }

  // 获取area配置中使用的平台名称
  getAreaPlatformName() {
    return this.platformMapping[this.platform] || this.platform.toLowerCase();
  }

  async init() {
    try {
      console.log(`[HoyoBlock-${this.platform}] Starting initialization...`);

      // 添加延迟确保Chrome扩展API已准备好
      await this.waitForChromeRuntime();
      console.log(`[HoyoBlock-${this.platform}] Chrome runtime ready`);

      await this.loadConfig();
      console.log(`[HoyoBlock-${this.platform}] Config loaded:`, this.config);
      console.log(`[HoyoBlock-${this.platform}] Area list loaded:`, this.areaList);

      // 等待DOM加载完成后再设置UI
      await this.waitForDocumentReady();
      this.setupUI();
      console.log(`[HoyoBlock-${this.platform}] UI setup complete`);

      this.startBlocking();
      console.log(`[HoyoBlock-${this.platform}] Blocking started with interval ${this.blockTimeout}ms`);

      this.isInitialized = true;
      console.log(`[HoyoBlock-${this.platform}] Initialization complete!`);
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Failed to initialize:`, error);
    }
  }

  async waitForChromeRuntime() {
    return new Promise((resolve) => {
      const checkRuntime = () => {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          console.log(`[HoyoBlock-${this.platform}] Chrome runtime is ready`);
          resolve();
        } else {
          console.log(`[HoyoBlock-${this.platform}] Waiting for Chrome runtime...`);
          setTimeout(checkRuntime, 100);
        }
      };
      checkRuntime();
    });
  }

  async loadConfig() {
    console.log(`[HoyoBlock-${this.platform}] Loading config...`);

    return new Promise((resolve, reject) => {
      // 检查chrome.runtime是否可用
      if (!chrome || !chrome.runtime) {
        const error = 'Chrome runtime not available';
        console.warn(`[HoyoBlock-${this.platform}] ${error}`);
        reject(new Error(error));
        return;
      }

      try {
        // 先尝试直接从storage读取
        chrome.storage.sync.get(null, (directResult) => {
          if (chrome.runtime.lastError) {
            console.warn(`[HoyoBlock-${this.platform}] Direct storage read failed:`, chrome.runtime.lastError);
            // 如果直接读取失败，尝试通过消息传递
            this.loadConfigViaMessage(resolve, reject);
            return;
          }

          console.log(`[HoyoBlock-${this.platform}] Config loaded directly from storage:`, directResult);
          this.config = directResult || {};
          this.areaList = directResult?.areaList || [];

          // 验证配置的完整性
          this.validateConfig();
          resolve();
        });
      } catch (error) {
        console.warn(`[HoyoBlock-${this.platform}] Failed to load config directly:`, error);
        // 尝试通过消息传递
        this.loadConfigViaMessage(resolve, reject);
      }
    });
  }

  loadConfigViaMessage(resolve, reject) {
    console.log(`[HoyoBlock-${this.platform}] Loading config via background message...`);

    try {
      chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(`[HoyoBlock-${this.platform}] Error loading config via message:`, chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        console.log(`[HoyoBlock-${this.platform}] Config loaded via message:`, response);
        this.config = response || {};
        this.areaList = response?.areaList || [];

        // 验证配置的完整性
        this.validateConfig();
        resolve();
      });
    } catch (error) {
      console.warn(`[HoyoBlock-${this.platform}] Failed to send message:`, error);
      reject(error);
    }
  }

  validateConfig() {
    const requiredKeys = [
      `blockTitle${this.platform}`,
      `blockUsers${this.platform}`,
      `blockUsersWhite${this.platform}`
    ];

    console.log(`[HoyoBlock-${this.platform}] Validating config for keys:`, requiredKeys);

    requiredKeys.forEach(key => {
      if (!(key in this.config)) {
        console.warn(`[HoyoBlock-${this.platform}] Missing config key: ${key}`);
        this.config[key] = '';
      } else {
        console.log(`[HoyoBlock-${this.platform}] Config ${key}:`, this.config[key]);
      }
    });

    console.log(`[HoyoBlock-${this.platform}] Active area list count:`, this.areaList.length);
    const activeAreas = this.areaList.filter(area =>
      area.area === this.platform.toLowerCase() && area.on === true
    );
    console.log(`[HoyoBlock-${this.platform}] Areas for this platform:`, activeAreas);
  }

  async saveConfig(newConfig) {
    return new Promise((resolve, reject) => {
      if (!chrome || !chrome.runtime) {
        console.warn('Chrome runtime not available');
        reject(new Error('Chrome runtime not available'));
        return;
      }

      try {
        chrome.runtime.sendMessage({
          action: 'setConfig',
          config: newConfig
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Error saving config:', chrome.runtime.lastError);
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
        console.warn('Failed to send message:', error);
        reject(error);
      }
    });
  }

  getBlockRegExp(configKey) {
    const str = this.config[configKey] || '';
    console.log(`[HoyoBlock-${this.platform}] Building regex for ${configKey}:`, str);

    if (!str) {
      console.log(`[HoyoBlock-${this.platform}] No keywords for ${configKey}, returning null`);
      return null;
    }

    // 处理多个关键词，用|分隔
    const keywords = str.split('|').map(k => k.trim()).filter(k => k);
    console.log(`[HoyoBlock-${this.platform}] Keywords for ${configKey}:`, keywords);

    if (keywords.length === 0) {
      console.log(`[HoyoBlock-${this.platform}] No valid keywords for ${configKey}, returning null`);
      return null;
    }

    const pattern = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    console.log(`[HoyoBlock-${this.platform}] Regex pattern for ${configKey}:`, pattern);

    return new RegExp(pattern, 'i');
  }

  shouldBlock(text, user) {
    const blockTitleKey = `blockTitle${this.platform}`;
    const blockUsersKey = `blockUsers${this.platform}`;
    const blockUsersWhiteKey = `blockUsersWhite${this.platform}`;

    // 只在有实际内容时才输出详细日志
    if (text.length > 0 || user.length > 0) {
      console.log(`[HoyoBlock-${this.platform}] Checking content - Text: "${text.substring(0, 100)}...", User: "${user}"`);
    }

    const blockTitle = this.getBlockRegExp(blockTitleKey);
    const blockUsers = this.getBlockRegExp(blockUsersKey);
    const blockUsersWhite = this.getBlockRegExp(blockUsersWhiteKey);

    // 检查白名单
    if (blockUsersWhite && blockUsersWhite.test(user.trim())) {
      console.log(`[HoyoBlock-${this.platform}] User "${user}" is whitelisted, allowing content`);
      return false;
    }

    // 检查黑名单
    const titleMatch = blockTitle ? blockTitle.test(text) : false;
    const userMatch = blockUsers ? blockUsers.test(user) : false;

    if (titleMatch || userMatch) {
      console.log(`[HoyoBlock-${this.platform}] BLOCKING - Title match: ${titleMatch}, User match: ${userMatch}`);
      return true;
    }

    // 只在调试模式或有意义的情况下输出允许日志
    if (text.length > 0 || user.length > 0) {
      console.log(`[HoyoBlock-${this.platform}] Content allowed - no matches found`);
    }
    return false;
  }

  applyBlur(element, shouldBlur) {
    if (shouldBlur) {
      element.classList.add('hoyo-blur-block');
      element.setAttribute('data-hoyo-blocked', 'true');

      // 调试信息：检查样式是否正确应用
      console.log(`[HoyoBlock-${this.platform}] Applied blur to element:`, element);
      console.log(`[HoyoBlock-${this.platform}] Element classes:`, element.className);
      console.log(`[HoyoBlock-${this.platform}] Element computed style:`, window.getComputedStyle(element));

      // 强制应用样式作为内联样式（备用方案）
      const currentFilter = window.getComputedStyle(element).filter;
      const currentOpacity = window.getComputedStyle(element).opacity;

      console.log(`[HoyoBlock-${this.platform}] Current filter: ${currentFilter}, opacity: ${currentOpacity}`);

      // 如果CSS样式没有生效，使用内联样式作为备用
      if (currentFilter === 'none' || currentOpacity === '1') {
        console.log(`[HoyoBlock-${this.platform}] CSS styles not applied, using inline styles as fallback`);
        element.style.cssText += `
          filter: blur(5px) !important;
          opacity: 0.6 !important;
          transition: all 0.5s ease !important;
          position: relative !important;
        `;

        // 添加悬停效果
        element.addEventListener('mouseenter', () => {
          element.style.cssText += `
            filter: blur(0.5px) !important;
            opacity: 0.9 !important;
          `;
        });

        element.addEventListener('mouseleave', () => {
          element.style.cssText += `
            filter: blur(5px) !important;
            opacity: 0.6 !important;
          `;
        });
      }

    } else {
      element.classList.remove('hoyo-blur-block');
      element.removeAttribute('data-hoyo-blocked');

      // 清除内联样式
      element.style.filter = '';
      element.style.opacity = '';
      element.style.transition = '';
    }
  }

  blockContent() {
    const areaPlatformName = this.getAreaPlatformName();
    const activeAreas = this.areaList.filter(area =>
      area.area === areaPlatformName && area.on === true
    );

    console.log(`[HoyoBlock-${this.platform}] Starting content blocking check - Platform: ${this.platform} -> ${areaPlatformName}`);
    console.log(`[HoyoBlock-${this.platform}] Active areas: ${activeAreas.length}`);

    if (activeAreas.length === 0) {
      console.log(`[HoyoBlock-${this.platform}] No active areas for platform ${areaPlatformName}`);
      console.log(`[HoyoBlock-${this.platform}] Available areas:`, this.areaList.map(a => ({ name: a.name, area: a.area, on: a.on })));
      return;
    }

    let totalProcessed = 0;
    let totalBlocked = 0;

    activeAreas.forEach((area, areaIndex) => {
      console.log(`[HoyoBlock-${this.platform}] Processing area ${areaIndex + 1}: ${area.name}`);
      console.log(`[HoyoBlock-${this.platform}] Area config:`, area);

      const items = document.querySelectorAll(area.item);
      console.log(`[HoyoBlock-${this.platform}] Found ${items.length} items for selector "${area.item}"`);

      items.forEach((item, itemIndex) => {
        totalProcessed++;

        // 检查是否已经处理过这个元素
        if (this.processedElements.has(item)) {
          return; // 跳过已处理的元素
        }

        const textElement = item.querySelector(area.text);
        const userElement = area.home ?
          document.querySelector(area.user) :
          item.querySelector(area.user);

        // 提取所有可能的文本内容
        const textElements = item.querySelectorAll(area.text);
        const allTexts = Array.from(textElements).map(el => el.textContent?.trim() || '').filter(t => t);
        const text = allTexts.join(' ');
        const user = userElement ? userElement.textContent?.trim() : '';

        // 增强调试输出
        if (itemIndex < 3 || text.length > 0 || user.length > 0) {
          console.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Found ${textElements.length} text elements, User element found: ${!!userElement}`);
          console.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: All texts: [${allTexts.map(t => `"${t.substring(0, 30)}..."`).join(', ')}]`);
          console.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Combined text: "${text.substring(0, 100)}...", User: "${user}"`);
        }

        if (this.shouldBlock(text, user)) {
          this.applyBlur(item, true);
          // 也模糊媒体元素
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, true));
          totalBlocked++;
        } else {
          this.applyBlur(item, false);
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, false));
        }

        // 标记为已处理
        this.processedElements.add(item);
      });
    });

    console.log(`[HoyoBlock-${this.platform}] Content blocking completed - Processed: ${totalProcessed}, Blocked: ${totalBlocked}`);
  }

  startBlocking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    console.log(`[HoyoBlock-${this.platform}] Starting blocking timer with interval ${this.blockTimeout}ms`);

    this.intervalId = setInterval(() => {
      this.blockContent();
    }, this.blockTimeout);

    // 立即执行一次
    this.blockContent();
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
    // 清除缓存
    this.processedElements = new WeakSet();
  }

  async waitForDocumentReady() {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
          console.log(`[HoyoBlock-${this.platform}] Document is ready`);
          resolve();
        } else {
          console.log(`[HoyoBlock-${this.platform}] Waiting for document to be ready...`);
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
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

// 导出供content script使用
window.HoyoLeaksBlockCore = HoyoLeaksBlockCore;
