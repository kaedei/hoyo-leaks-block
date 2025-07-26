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
      DebugLogger.log(`[HoyoBlock-${this.platform}] Checking content - Text: "${text}", User: "${user}"`);
    }

    const titleRules = this.configManager.getBlockRules(blockTitleKey);
    const userRules = this.configManager.getBlockRules(blockUsersKey);
    const whiteRules = this.configManager.getBlockRules(blockUsersWhiteKey);

    // 输出当前的屏蔽规则用于调试
    if (DebugLogger.isDebugMode && (text.length > 0 || user.length > 0)) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Block rules - Title rules: ${titleRules.length}, User rules: ${userRules.length}, White rules: ${whiteRules.length}`);
    }

    // 检查白名单 - 如果用户在白名单中，直接放行
    if (whiteRules.length > 0 && user.trim()) {
      const userLower = user.trim().toLowerCase();
      for (const rule of whiteRules) {
        if (userLower.includes(rule.toLowerCase())) {
          if (DebugLogger.isDebugMode) {
            DebugLogger.log(`[HoyoBlock-${this.platform}] User "${user}" matched whitelist rule "${rule}", allowing content`);
          }
          return false;
        }
      }
    }

    // 检查标题黑名单
    let titleMatch = false;
    if (titleRules.length > 0 && text.trim()) {
      const textLower = text.trim().toLowerCase();
      for (const rule of titleRules) {
        if (textLower.includes(rule.toLowerCase())) {
          titleMatch = true;
          if (DebugLogger.isDebugMode) {
            DebugLogger.log(`[HoyoBlock-${this.platform}] Title "${text}" matched rule "${rule}"`);
          }
          break;
        }
      }
    }

    // 检查用户黑名单
    let userMatch = false;
    if (userRules.length > 0 && user.trim()) {
      const userLower = user.trim().toLowerCase();
      for (const rule of userRules) {
        if (userLower.includes(rule.toLowerCase())) {
          userMatch = true;
          if (DebugLogger.isDebugMode) {
            DebugLogger.log(`[HoyoBlock-${this.platform}] User "${user}" matched rule "${rule}"`);
          }
          break;
        }
      }
    }

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
      DebugLogger.log(`[HoyoBlock-${this.platform}] Current URL: ${location.href}`);
      DebugLogger.log(`[HoyoBlock-${this.platform}] All areas for platform:`, areaList.filter(area => area.area === areaPlatformName).map(area => ({
        name: area.name,
        on: area.on,
        main: area.main,
        item: area.item
      })));
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

      // 检查主容器是否存在
      const mainContainer = document.querySelector(area.main);

      // 只在调试模式或容器不存在时输出详细日志
      if (!this.lastAreaLogTime || Date.now() - this.lastAreaLogTime > 120000 || !mainContainer) {
        DebugLogger.log(`[HoyoBlock-${this.platform}] Processing area: ${safeGetAreaName(area)}`);
        DebugLogger.log(`[HoyoBlock-${this.platform}] Area details:`, {
          name: area.name,
          main: area.main,
          item: area.item,
          text: area.text,
          mainContainerFound: !!mainContainer
        });
        if (!mainContainer) {
          DebugLogger.log(`[HoyoBlock-${this.platform}] WARNING: Main container not found for selector "${area.main}", skipping this area`);
        }
        this.lastAreaLogTime = Date.now();
      }

      // 如果主容器不存在，跳过这个区域
      if (!mainContainer) {
        return;
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
        const allTexts = Array.from(textElements).map(el => {
          // 使用 textContent 确保获取所有文本，包括子元素内的文本
          let textContent = el.textContent?.trim() || '';

          // 特别处理 Bilibili 搜索页面的情况，确保获取完整的标题文本
          if (this.platform === 'Bili' && el.classList.contains('bili-video-card__info--tit')) {
            // 如果元素有 title 属性，优先使用 title 属性的值，因为它通常包含完整的标题
            const titleAttr = el.getAttribute('title');
            if (titleAttr && titleAttr.trim()) {
              textContent = titleAttr.trim();
              DebugLogger.log(`[HoyoBlock-${this.platform}] Using title attribute: "${titleAttr}"`);
            } else {
              // 否则使用 textContent，但确保包含所有子元素的文本
              textContent = el.textContent?.trim() || '';
              DebugLogger.log(`[HoyoBlock-${this.platform}] Using textContent: "${textContent}"`);
            }
          }

          return textContent;
        }).filter(t => t);
        const text = allTexts.join(' ');
        const user = userElement ? userElement.textContent?.trim() : '';

        // 只在调试模式且前几个项目或有实际内容时输出详细日志
        if (DebugLogger.isDebugMode && (itemIndex < 3 || (text.length > 0 && user.length > 0))) {
          DebugLogger.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Found ${textElements.length} text elements, User element found: ${!!userElement}`);
          DebugLogger.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Area: ${area.name}, Selector: ${area.text}`);
          DebugLogger.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Element details:`, textElements[0] ? {
            className: textElements[0].className,
            title: textElements[0].getAttribute('title'),
            textContent: textElements[0].textContent,
            innerHTML: textElements[0].innerHTML.substring(0, 100)
          } : 'No text element found');
          DebugLogger.log(`[HoyoBlock-${this.platform}] Item ${itemIndex + 1}: Combined text: "${text}", User: "${user}"`);
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
