// Bilibili内容脚本
(function () {
  'use strict';

  DebugLogger.log('[HoyoBlock-Bilibili] Content script loaded');

  function initBilibiliBlock() {
    DebugLogger.log('[HoyoBlock-Bilibili] Initializing Bilibili block instance');

    // 创建Bilibili专用的屏蔽实例
    const blockInstance = new HoyoLeaksBlockCore('bilibili');

    // Bilibili特定的处理逻辑
    blockInstance.platformSpecificInit = function () {
      DebugLogger.log('[HoyoBlock-Bilibili] Platform specific initialization starting');

      // 监听页面变化（Bilibili是SPA）
      let lastUrl = location.href;
      let mutationTimeout = null;
      let contentChangeTimeout = null;
      let mutationCount = 0;
      let lastMutationLog = 0;

      const triggerContentCheck = (reason = 'unknown', delay = 500) => {
        if (contentChangeTimeout) {
          clearTimeout(contentChangeTimeout);
        }
        contentChangeTimeout = setTimeout(() => {
          DebugLogger.log(`[HoyoBlock-Bilibili] Triggering content check due to: ${reason}`);
          blockInstance.forceBlockContent();
        }, delay);
      };

      // 获取当前平台的活跃区域配置
      let cachedSelectors = null;
      let lastConfigCheck = 0;

      const getActiveItemSelectors = () => {
        try {
          // 缓存选择器，每5秒更新一次（配置可能会更新）
          const now = Date.now();
          if (!cachedSelectors || now - lastConfigCheck > 5000) {
            const areaList = blockInstance.configManager.getAreaList();
            const activeAreas = areaList.filter(area =>
              area.area === 'bilibili' && area.on === true
            );
            cachedSelectors = activeAreas.map(area => area.item);
            lastConfigCheck = now;

            if (DebugLogger.isDebugMode && cachedSelectors.length > 0) {
              DebugLogger.log(`[HoyoBlock-Bilibili] Updated selectors: ${cachedSelectors.join(', ')}`);
            }
          }
          return cachedSelectors || [];
        } catch (error) {
          DebugLogger.log(`[HoyoBlock-Bilibili] Error getting selectors: ${error.message}`);
          // 降级方案：使用一些通用的Bilibili选择器
          return ['.video-item', '.bili-video-card', '.video-card', '.feed-card', '.search-video-card'];
        }
      };

      const observer = new MutationObserver((mutations) => {
        mutationCount++;
        let hasContentChanges = false;
        let urlChanged = false;

        // 检查URL是否变化
        if (location.href !== lastUrl) {
          DebugLogger.log('[HoyoBlock-Bilibili] Page URL changed from', lastUrl, 'to', location.href);
          lastUrl = location.href;
          urlChanged = true;
        }

        // 检查是否有实质性的内容变化
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // 检查新增的节点是否包含视频内容
            Array.from(mutation.addedNodes).forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // 使用配置中的选择器
                const itemSelectors = getActiveItemSelectors();
                const selectorString = itemSelectors.join(', ');

                if (node.matches && (
                  node.matches(selectorString) ||
                  (node.querySelector && node.querySelector(selectorString))
                )) {
                  hasContentChanges = true;
                }
              }
            });
          }
        });

        // 清除之前的定时器
        if (mutationTimeout) {
          clearTimeout(mutationTimeout);
        }

        // 使用防抖机制，避免频繁触发
        mutationTimeout = setTimeout(() => {
          if (urlChanged) {
            triggerContentCheck('URL change', 1000);
          } else if (hasContentChanges) {
            triggerContentCheck('content addition', 300);
          } else {
            // 对于DOM变化但URL未变化且无明显内容变化的情况，减少日志输出
            const now = Date.now();
            if (DebugLogger.isDebugMode && now - lastMutationLog > 10000) { // 10秒间隔
              DebugLogger.log(`[HoyoBlock-Bilibili] DOM mutations detected (${mutationCount} total), but no significant content changes`);
              lastMutationLog = now;
            }
          }
          mutationCount = 0; // 重置计数器
        }, 100); // 减少防抖延迟，提高响应速度
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false, // 不监听属性变化，减少噪音
        characterData: false // 不监听文本变化，减少噪音
      });

      // 监听滚动事件，检测可能的懒加载
      let scrollTimeout = null;
      window.addEventListener('scroll', () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
          triggerContentCheck('scroll load', 200);
        }, 500);
      });

      // 监听搜索和分页相关的事件
      const handleSearchOrPagination = () => {
        triggerContentCheck('search/pagination', 500);
      };

      // 监听点击事件，检测搜索按钮和分页按钮
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.matches && (
          target.matches('.search-button, .page-item, .pagination button, .load-more') ||
          target.closest('.search-button, .page-item, .pagination, .load-more')
        )) {
          handleSearchOrPagination();
        }
      });

      DebugLogger.log('[HoyoBlock-Bilibili] Enhanced content monitoring initialized');
    };

    // 等待页面加载完成和配置加载完成
    const waitForConfigAndInit = async () => {
      // 等待blockInstance初始化完成
      let retries = 0;
      const maxRetries = 50; // 最多等待5秒

      while (retries < maxRetries) {
        if (blockInstance.isInitialized && blockInstance.configManager) {
          try {
            // 尝试访问配置，确保已加载
            const areaList = blockInstance.configManager.getAreaList();
            if (areaList && Array.isArray(areaList)) {
              DebugLogger.log('[HoyoBlock-Bilibili] Config loaded, starting platform-specific initialization');
              blockInstance.platformSpecificInit();
              return;
            }
          } catch (error) {
            DebugLogger.log(`[HoyoBlock-Bilibili] Config not ready yet: ${error.message}`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      DebugLogger.log('[HoyoBlock-Bilibili] Timeout waiting for config, starting with fallback');
      blockInstance.platformSpecificInit();
    };

    if (document.readyState === 'loading') {
      DebugLogger.log('[HoyoBlock-Bilibili] Document still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        DebugLogger.log('[HoyoBlock-Bilibili] DOMContentLoaded triggered');
        setTimeout(waitForConfigAndInit, 1000);
      });
    } else {
      DebugLogger.log('[HoyoBlock-Bilibili] Document already loaded, initializing immediately');
      setTimeout(waitForConfigAndInit, 1000);
    }

    // 保存实例到全局，便于调试
    window.hoyoBlockInstance = blockInstance;
    DebugLogger.log('[HoyoBlock-Bilibili] Instance saved to window.hoyoBlockInstance');
  }

  // 直接初始化，因为核心模块已经通过 manifest.json 加载
  initBilibiliBlock();

})();
