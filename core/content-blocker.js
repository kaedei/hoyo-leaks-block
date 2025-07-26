// 内容屏蔽模块
class ContentBlocker {
  constructor(platform, configManager) {
    this.platform = platform;
    this.configManager = configManager;
    this.processedElements = new WeakSet(); // 缓存已处理的元素
    this.blockTimeout = 1000; // 增加到1秒，减少检查频率
    this.intervalId = null;

    // 日志控制变量
    this.lastLogTime = null;
    this.lastAreaLogTime = null;
    this.lastItemCounts = {};
    this.noActiveAreasLogged = false;
    this.lastPageContentHash = null; // 添加页面内容哈希缓存

    // 平台名称映射
    this.platformMapping = {
      'Bili': 'bilibili',
      'Ytb': 'youtube',
      'Twitter': 'twitter'
    };
  }

  // 获取area配置中使用的平台名称
  getAreaPlatformName() {
    return this.platformMapping[this.platform] || this.platform.toLowerCase();
  }

  shouldBlock(text, user) {
    const blockTitleKey = `blockTitle${this.platform}`;
    const blockUsersKey = `blockUsers${this.platform}`;
    const blockUsersWhiteKey = `blockUsersWhite${this.platform}`;

    // 只在调试模式且有实际内容时才输出详细日志
    if (DebugLogger.isDebugMode && (text.length > 0 || user.length > 0)) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Checking content - Text: "${text.substring(0, 50)}...", User: "${user}"`);
    }

    const blockTitle = this.configManager.getBlockRegExp(blockTitleKey);
    const blockUsers = this.configManager.getBlockRegExp(blockUsersKey);
    const blockUsersWhite = this.configManager.getBlockRegExp(blockUsersWhiteKey);

    // 检查白名单
    if (blockUsersWhite && blockUsersWhite.test(user.trim())) {
      if (DebugLogger.isDebugMode) {
        DebugLogger.log(`[HoyoBlock-${this.platform}] User "${user}" is whitelisted, allowing content`);
      }
      return false;
    }

    // 检查黑名单
    const titleMatch = blockTitle ? blockTitle.test(text) : false;
    const userMatch = blockUsers ? blockUsers.test(user) : false;

    if (titleMatch || userMatch) {
      if (DebugLogger.isDebugMode) {
        DebugLogger.log(`[HoyoBlock-${this.platform}] BLOCKING - Title match: ${titleMatch}, User match: ${userMatch}`);
      }
      return true;
    }

    // 只在调试模式且有意义的情况下输出允许日志
    if (DebugLogger.isDebugMode && (text.length > 0 || user.length > 0)) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Content allowed - no matches found`);
    }
    return false;
  }

  applyBlur(element, shouldBlur) {
    if (shouldBlur) {
      element.classList.add('hoyo-blur-block');
      element.setAttribute('data-hoyo-blocked', 'true');

      // 调试信息：检查样式是否正确应用
      DebugLogger.log(`[HoyoBlock-${this.platform}] Applied blur to element:`, element);
      DebugLogger.log(`[HoyoBlock-${this.platform}] Element classes:`, element.className);
      DebugLogger.log(`[HoyoBlock-${this.platform}] Element computed style:`, window.getComputedStyle(element));

      // 强制应用样式作为内联样式（备用方案）
      const currentFilter = window.getComputedStyle(element).filter;
      const currentOpacity = window.getComputedStyle(element).opacity;

      DebugLogger.log(`[HoyoBlock-${this.platform}] Current filter: ${currentFilter}, opacity: ${currentOpacity}`);

      // 如果CSS样式没有生效，使用内联样式作为备用
      if (currentFilter === 'none' || currentOpacity === '1') {
        DebugLogger.log(`[HoyoBlock-${this.platform}] CSS styles not applied, using inline styles as fallback`);
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
    // 检查扩展上下文是否有效
    if (typeof DebugLogger !== 'undefined' && DebugLogger.isExtensionContextValid && !DebugLogger.isExtensionContextValid()) {
      // 扩展上下文失效，停止屏蔽并清理
      DebugLogger.log(`[HoyoBlock-${this.platform}] Extension context invalidated, stopping content blocking`);
      this.stopBlocking();
      return 0;
    }

    const areaPlatformName = this.getAreaPlatformName();
    const areaList = this.configManager.getAreaList();
    const activeAreas = areaList.filter(area =>
      area.area === areaPlatformName && area.on === true
    );

    // 快速检查：计算页面内容的简单哈希
    const pageItemsCount = activeAreas.reduce((count, area) => {
      return count + document.querySelectorAll(area.item).length;
    }, 0);

    const currentContentHash = `${pageItemsCount}-${activeAreas.length}-${location.href}`;

    // 如果页面内容没有变化，跳过处理（但每60秒至少执行一次）
    if (this.lastPageContentHash === currentContentHash &&
      this.lastLogTime && Date.now() - this.lastLogTime < 60000) {
      return 0;
    }

    this.lastPageContentHash = currentContentHash;

    // 只在首次执行或有意义的状态变化时输出日志
    if (!this.lastLogTime || Date.now() - this.lastLogTime > 60000) { // 增加到60秒间隔
      DebugLogger.log(`[HoyoBlock-${this.platform}] Content blocking check - Platform: ${this.platform} -> ${areaPlatformName}, Active areas: ${activeAreas.length}, Items: ${pageItemsCount}`);
      this.lastLogTime = Date.now();
    }

    if (activeAreas.length === 0) {
      // 只在第一次或状态改变时输出详细信息
      if (!this.noActiveAreasLogged) {
        DebugLogger.log(`[HoyoBlock-${this.platform}] No active areas for platform ${areaPlatformName}`);
        // 安全地获取区域名称，避免扩展上下文失效时的错误
        const safeGetAreaName = (area) => {
          try {
            return window.SharedUtils ? window.SharedUtils.getLocalizedAreaName(area.name) : area.name;
          } catch (error) {
            return area.name; // 降级方案
          }
        };
        DebugLogger.log(`[HoyoBlock-${this.platform}] Available areas:`, areaList.map(a => ({
          name: safeGetAreaName(a),
          area: a.area,
          on: a.on
        })));
        this.noActiveAreasLogged = true;
      }
      return 0;
    }

    // 重置标志，如果有活跃区域
    this.noActiveAreasLogged = false;

    let totalProcessed = 0;
    let totalBlocked = 0;

    activeAreas.forEach((area, areaIndex) => {
      // 安全地获取区域名称
      const safeGetAreaName = (area) => {
        try {
          return window.SharedUtils ? window.SharedUtils.getLocalizedAreaName(area.name) : area.name;
        } catch (error) {
          return area.name; // 降级方案
        }
      };

      // 减少区域处理日志的频率
      if (!this.lastAreaLogTime || Date.now() - this.lastAreaLogTime > 120000) { // 增加到120秒间隔
        DebugLogger.log(`[HoyoBlock-${this.platform}] Processing area: ${safeGetAreaName(area)}`);
        this.lastAreaLogTime = Date.now();
      }

      const items = document.querySelectorAll(area.item);

      // 只在items数量有变化时输出日志
      const areaKey = `${area.item}_count`;
      if (this.lastItemCounts && this.lastItemCounts[areaKey] !== items.length) {
        DebugLogger.log(`[HoyoBlock-${this.platform}] Found ${items.length} items for selector "${area.item}"`);
      }
      if (!this.lastItemCounts) this.lastItemCounts = {};
      this.lastItemCounts[areaKey] = items.length;

      items.forEach((item, itemIndex) => {
        totalProcessed++;

        // 检查是否已经处理过这个元素
        if (this.processedElements.has(item)) {
          return; // 跳过已处理的元素
        }

        const userElement = area.home ?
          document.querySelector(area.user) :
          item.querySelector(area.user);

        // 提取所有可能的文本内容
        const textElements = item.querySelectorAll(area.text);
        const allTexts = Array.from(textElements).map(el => el.textContent?.trim() || '').filter(t => t);
        const text = allTexts.join(' ');
        const user = userElement ? userElement.textContent?.trim() : '';

        // 只在调试模式且前几个项目或有实际内容时输出详细日志
        if (DebugLogger.isDebugMode && (itemIndex < 2 || (text.length > 0 && user.length > 0))) {
          DebugLogger.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Found ${textElements.length} text elements, User element found: ${!!userElement}`);
          DebugLogger.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Combined text: "${text.substring(0, 50)}...", User: "${user}"`);
        }

        const shouldBlockThis = this.shouldBlock(text, user);

        if (shouldBlockThis) {
          this.applyBlur(item, true);
          // 也模糊媒体元素
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, true));
          totalBlocked++;
          // 只在调试模式下输出屏蔽日志
          if (DebugLogger.isDebugMode) {
            DebugLogger.log(`[HoyoBlock-${this.platform}] Blocked item: "${text.substring(0, 50)}..." from user: "${user}"`);
          }
        } else {
          this.applyBlur(item, false);
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, false));
        }

        // 标记为已处理
        this.processedElements.add(item);
      });
    });

    // 只在有屏蔽内容或调试模式时输出完成日志
    if (totalBlocked > 0 || DebugLogger.isDebugMode) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Content blocking completed - Processed: ${totalProcessed}, Blocked: ${totalBlocked}`);
    }
    return totalBlocked;
  }

  startBlocking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    DebugLogger.log(`[HoyoBlock-${this.platform}] Starting blocking timer with interval ${this.blockTimeout}ms`);

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

  // 清理所有屏蔽效果
  clearAllBlocks() {
    // 移除所有模糊效果
    const blockedElements = document.querySelectorAll('[data-hoyo-blocked="true"]');
    blockedElements.forEach(element => {
      element.classList.remove('hoyo-blur-block');
      element.removeAttribute('data-hoyo-blocked');
      element.style.filter = '';
      element.style.opacity = '';
      element.style.transition = '';
    });
    // 清除缓存
    this.processedElements = new WeakSet();
  }
}

// 导出供其他模块使用
window.ContentBlocker = ContentBlocker;
