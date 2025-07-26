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
      let mutationCount = 0;
      let lastMutationLog = 0;

      const observer = new MutationObserver(() => {
        mutationCount++;

        // 清除之前的定时器
        if (mutationTimeout) {
          clearTimeout(mutationTimeout);
        }

        // 使用防抖机制，避免频繁触发
        mutationTimeout = setTimeout(() => {
          // 只在URL实际变化时才处理
          if (location.href !== lastUrl) {
            DebugLogger.log('[HoyoBlock-Bilibili] Page URL changed from', lastUrl, 'to', location.href);
            lastUrl = location.href;
            // 页面变化时重新初始化
            setTimeout(() => {
              DebugLogger.log('[HoyoBlock-Bilibili] Re-running block content after URL change');
              this.blockContent();
            }, 1000);
          } else {
            // 对于DOM变化但URL未变化的情况，减少日志输出
            const now = Date.now();
            if (DebugLogger.isDebugMode && now - lastMutationLog > 10000) { // 10秒间隔
              DebugLogger.log(`[HoyoBlock-Bilibili] DOM mutations detected (${mutationCount} total), but URL unchanged`);
              lastMutationLog = now;
            }
          }
          mutationCount = 0; // 重置计数器
        }, 1000); // 增加到1秒防抖延迟，减少频繁触发
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      DebugLogger.log('[HoyoBlock-Bilibili] MutationObserver set up');
    };

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      DebugLogger.log('[HoyoBlock-Bilibili] Document still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        DebugLogger.log('[HoyoBlock-Bilibili] DOMContentLoaded triggered');
        setTimeout(() => blockInstance.platformSpecificInit(), 1000);
      });
    } else {
      DebugLogger.log('[HoyoBlock-Bilibili] Document already loaded, initializing immediately');
      setTimeout(() => blockInstance.platformSpecificInit(), 1000);
    }

    // 保存实例到全局，便于调试
    window.hoyoBlockInstance = blockInstance;
    DebugLogger.log('[HoyoBlock-Bilibili] Instance saved to window.hoyoBlockInstance');
  }

  // 直接初始化，因为核心模块已经通过 manifest.json 加载
  initBilibiliBlock();

})();
