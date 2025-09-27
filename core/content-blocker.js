// 内容屏蔽模块
class ContentBlocker {
  constructor(platform, configManager) {
    this.platform = platform;
    this.configManager = configManager;
    this.processedElements = new WeakSet(); // 缓存已处理的元素
    this.blockTimeout = 500; // 减少到500ms，提高响应速度
    this.intervalId = null;

    // 日志控制变量
    this.lastLogTime = null;
    this.lastAreaLogTime = null;
    this.lastItemCounts = {};
    this.noActiveAreasLogged = false;
    this.lastPageContentHash = null; // 添加页面内容哈希缓存
    this.lastContentCheckTime = 0; // 添加最后检查时间记录
  }

  // 获取area配置中使用的平台名称
  getAreaPlatformName() {
    return this.platform;
  }

  // 判断是否需要屏蔽，并返回原因信息
  // 返回值：
  // { blocked: boolean, reasonType?: 'keyword'|'user', reasonValue?: string }
  shouldBlock(text, user) {
    // 转换平台名称为配置键格式：首字母大写
    const platformKey = this.platform.charAt(0).toUpperCase() + this.platform.slice(1);
    const blockTitleKey = `blockTitle${platformKey}`;
    const blockUsersKey = `blockUsers${platformKey}`;
    const blockUsersWhiteKey = `blockUsersWhite${platformKey}`;

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
    let titleMatchedRule = null;
    if (titleRules.length > 0 && text.trim()) {
      const textLower = text.trim().toLowerCase();
      for (const rule of titleRules) {
        if (textLower.includes(rule.toLowerCase())) {
          titleMatch = true;
          titleMatchedRule = rule;
          if (DebugLogger.isDebugMode) {
            DebugLogger.log(`[HoyoBlock-${this.platform}] Title "${text}" matched rule "${rule}"`);
          }
          break;
        }
      }
    }

    // 检查用户黑名单
    let userMatch = false;
    let userMatchedRule = null;
    if (userRules.length > 0 && user.trim()) {
      const userLower = user.trim().toLowerCase();
      for (const rule of userRules) {
        if (userLower.includes(rule.toLowerCase())) {
          userMatch = true;
          userMatchedRule = rule;
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
      // 优先展示用户黑名单原因，其次展示关键词
      if (userMatch) {
        return { blocked: true, reasonType: 'user', reasonValue: userMatchedRule || (user || '').slice(0, 20) };
      }
      return { blocked: true, reasonType: 'keyword', reasonValue: titleMatchedRule || '' };
    }

    // 只在调试模式且有意义的情况下输出允许日志
    if (DebugLogger.isDebugMode && (text.length > 0 || user.length > 0)) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Content allowed - no matches found`);
    }
    return { blocked: false };
  }

  // 获取原因文本（带本地化与降级）
  getReasonText(reasonType, reasonValue) {
    const safe = (s) => (typeof s === 'string' ? s : String(s || ''));
    const val = safe(reasonValue);
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
        if (reasonType === 'keyword') {
          const msg = chrome.i18n.getMessage('block_reason_keyword', [val]);
          if (msg) return msg;
        } else if (reasonType === 'user') {
          const msg = chrome.i18n.getMessage('block_reason_user_blacklist', [val]);
          if (msg) return msg;
        }
      }
    } catch (e) {
      // ignore
    }
    // 回退文案（简短）
    if (reasonType === 'keyword') return `关键词屏蔽：${val}`;
    if (reasonType === 'user') return `用户黑名单：${val}`;
    return '';
  }

  // 在被屏蔽元素上增加/更新覆盖层与标签（居中显示，不影响布局）
  addOrUpdateReasonLabel(element, reasonType, reasonValue) {
    if (!element) return;
    try {
      const overlayClass = 'hoyo-block-overlay';
      const labelClass = 'hoyo-block-label';
      let overlay = element.querySelector(`:scope > .${overlayClass}`);
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = overlayClass;
        // 覆盖层内联样式兜底，避免站点样式干扰导致参与布局
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '99998';
        element.appendChild(overlay);
      }

      // 确保容器是定位元素
      try {
        const pos = window.getComputedStyle(element).position;
        if (!pos || pos === 'static') {
          element.style.position = 'relative';
        }
      } catch (_) { }

      let label = overlay.querySelector(`:scope > .${labelClass}`);
      const text = this.getReasonText(reasonType, reasonValue);

      if (!label) {
        label = document.createElement('div');
        label.className = labelClass;
        overlay.appendChild(label);
      }
      label.textContent = text;
      label.title = text;
      label.setAttribute('data-hoyo-reason-type', reasonType || '');
    } catch (e) {
      DebugLogger.log(`[HoyoBlock-${this.platform}] Failed to render reason label:`, e);
    }
  }

  // 移除原因标签
  removeReasonLabel(element) {
    if (!element) return;
    try {
      const overlay = element.querySelector(':scope > .hoyo-block-overlay');
      if (overlay) overlay.remove();
    } catch (e) {
      // ignore
    }
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
            opacity: 1.0 !important;
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
      // 同时移除标签
      this.removeReasonLabel(element);
    }
  }

  // 对容器的直接子元素应用模糊（避免容器内的标签一起被模糊）
  applyBlurToItemContents(container, shouldBlur) {
    if (!container) return;
    const children = Array.from(container.children || []);
    children.forEach((child) => {
      // 跳过原因标签
      if (child.classList && (child.classList.contains('hoyo-block-label') || child.classList.contains('hoyo-block-overlay'))) return;
      // 跳过骨架/占位/加载等元素，避免改变其隐藏状态导致撑高布局
      try {
        const cls = (child.className || '').toString();
        if (
          (child.classList && child.classList.contains('hide')) ||
          /skeleton|placeholder|loading|suspense/i.test(cls) ||
          child.getAttribute('aria-hidden') === 'true'
        ) {
          return;
        }
        const style = window.getComputedStyle(child);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return; // 本就不可见的子元素无需处理
        }
      } catch (_) { }
      this.applyBlur(child, shouldBlur);
    });
  }

  // 纠正：如骨架/占位元素被误加了模糊样式，移除之，避免撑高布局
  fixSkeletonsIfNeeded(container) {
    try {
      const nodes = container.querySelectorAll('.hide, [class*="skeleton"], [class*="placeholder"], [class*="loading"], [aria-hidden="true"]');
      nodes.forEach((el) => {
        el.classList && el.classList.remove('hoyo-blur-block');
        if (el.getAttribute && el.getAttribute('data-hoyo-blocked') === 'true') {
          el.removeAttribute('data-hoyo-blocked');
        }
        el.style && (el.style.filter = '');
        el.style && (el.style.opacity = '');
        el.style && (el.style.transition = '');
      });
    } catch (_) { }
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

    // 改进的页面内容检查：计算更详细的内容哈希
    const pageItemsInfo = activeAreas.map(area => {
      const items = document.querySelectorAll(area.item);
      return {
        selector: area.item,
        count: items.length,
        // 为了检测新内容，我们记录每个item的基本信息
        itemIds: Array.from(items).slice(0, 10).map(item => {
          // 尝试获取唯一标识符
          return item.id || item.getAttribute('data-id') || item.getAttribute('href') ||
            (item.textContent || '').slice(0, 50);
        }).join('|')
      };
    });

    const currentContentHash = `${JSON.stringify(pageItemsInfo)}-${location.href}`;

    // 如果页面内容没有变化，跳过处理（但每30秒至少执行一次）
    const now = Date.now();
    if (this.lastPageContentHash === currentContentHash &&
      this.lastContentCheckTime && now - this.lastContentCheckTime < 30000) {
      return 0;
    }

    this.lastPageContentHash = currentContentHash;
    this.lastContentCheckTime = now;

    // 只在首次执行或有意义的状态变化时输出日志
    if (!this.lastLogTime || now - this.lastLogTime > 60000) { // 保持60秒间隔
      const totalItems = pageItemsInfo.reduce((sum, info) => sum + info.count, 0);
      DebugLogger.log(`[HoyoBlock-${this.platform}] Content blocking check - Platform: ${this.platform} -> ${areaPlatformName}, Active areas: ${activeAreas.length}, Items: ${totalItems}`);
      DebugLogger.log(`[HoyoBlock-${this.platform}] Current URL: ${location.href}`);
      DebugLogger.log(`[HoyoBlock-${this.platform}] All areas for platform:`, areaList.filter(area => area.area === areaPlatformName).map(area => ({
        name: area.name,
        on: area.on,
        main: area.main,
        item: area.item
      })));
      this.lastLogTime = now;
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
          // 通用的文本提取策略：优先使用 title 属性获取完整文本，然后使用 textContent
          let textContent = '';

          // 1. 首先尝试从 title 属性获取完整文本（通常包含未被截断的内容）
          const titleAttr = el.getAttribute('title');
          if (titleAttr && titleAttr.trim()) {
            textContent = titleAttr.trim();
            if (DebugLogger.isDebugMode) {
              DebugLogger.log(`[HoyoBlock-${this.platform}] Using title attribute: "${titleAttr}"`);
            }
          } else {
            // 2. 否则使用 textContent，确保包含所有子元素的文本
            textContent = el.textContent?.trim() || '';
            if (DebugLogger.isDebugMode && textContent) {
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

        const blockDecision = this.shouldBlock(text, user);

        if (blockDecision && blockDecision.blocked) {
          // 标记容器，用于定位标签
          item.classList.add('hoyo-blur-container');
          // 模糊容器的内容（而不是容器本身），确保标签清晰
          this.applyBlurToItemContents(item, true);
          // 双保险：纠正骨架/占位元素被误处理的情况
          this.fixSkeletonsIfNeeded(item);
          // 也模糊媒体元素
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, true));
          totalBlocked++;
          // 渲染原因标签（仅在item上显示一次）
          this.addOrUpdateReasonLabel(item, blockDecision.reasonType, blockDecision.reasonValue);
          // 只在调试模式下输出屏蔽日志
          if (DebugLogger.isDebugMode) {
            DebugLogger.log(`[HoyoBlock-${this.platform}] Blocked item: "${text.substring(0, 50)}..." from user: "${user}"`);
          }
        } else {
          item.classList.remove('hoyo-blur-container');
          this.applyBlurToItemContents(item, false);
          const mediaElements = item.querySelectorAll(area.media);
          mediaElements.forEach(media => this.applyBlur(media, false));
          // 移除原因标签
          this.removeReasonLabel(item);
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

  // 立即检查内容，无视缓存（供外部调用）
  forceBlockContent() {
    const previousHash = this.lastPageContentHash;
    const previousCheckTime = this.lastContentCheckTime;

    // 临时重置缓存，强制执行检查
    this.lastPageContentHash = null;
    this.lastContentCheckTime = 0;

    const result = this.blockContent();

    // 如果没有找到新内容，恢复之前的缓存状态
    if (result === 0) {
      this.lastPageContentHash = previousHash;
      this.lastContentCheckTime = previousCheckTime;
    }

    return result;
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
    // 移除容器标记与原因标签
    const containers = document.querySelectorAll('.hoyo-blur-container');
    containers.forEach(c => c.classList.remove('hoyo-blur-container'));
    const overlays = document.querySelectorAll('.hoyo-block-overlay');
    overlays.forEach(o => o.remove());
    // 清除缓存
    this.processedElements = new WeakSet();
  }
}

// 导出供其他模块使用
window.ContentBlocker = ContentBlocker;
