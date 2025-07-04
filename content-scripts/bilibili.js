// B站内容脚本
(function () {
  'use strict';

  console.log('[HoyoBlock-Bilibili] Content script loaded');

  function initBilibiliBlock() {
    console.log('[HoyoBlock-Bilibili] Initializing B站 block instance');

    // 创建B站专用的屏蔽实例
    const blockInstance = new HoyoLeaksBlockCore('Bili');

    // B站特定的处理逻辑
    blockInstance.platformSpecificInit = function () {
      console.log('[HoyoBlock-Bilibili] Platform specific initialization starting');

      // 监听页面变化（B站是SPA）
      let lastUrl = location.href;
      let mutationTimeout = null;

      const observer = new MutationObserver(() => {
        // 清除之前的定时器
        if (mutationTimeout) {
          clearTimeout(mutationTimeout);
        }

        // 使用防抖机制，避免频繁触发
        mutationTimeout = setTimeout(() => {
          if (location.href !== lastUrl) {
            console.log('[HoyoBlock-Bilibili] Page URL changed from', lastUrl, 'to', location.href);
            lastUrl = location.href;
            // 页面变化时重新初始化
            setTimeout(() => {
              console.log('[HoyoBlock-Bilibili] Re-running block content after URL change');
              this.blockContent();
            }, 1000);
          }
        }, 500); // 500ms 防抖延迟
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[HoyoBlock-Bilibili] MutationObserver set up');
    };

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      console.log('[HoyoBlock-Bilibili] Document still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[HoyoBlock-Bilibili] DOMContentLoaded triggered');
        setTimeout(() => blockInstance.platformSpecificInit(), 1000);
      });
    } else {
      console.log('[HoyoBlock-Bilibili] Document already loaded, initializing immediately');
      setTimeout(() => blockInstance.platformSpecificInit(), 1000);
    }

    // 保存实例到全局，便于调试
    window.hoyoBlockInstance = blockInstance;
    console.log('[HoyoBlock-Bilibili] Instance saved to window.hoyoBlockInstance');
  }

  // 直接初始化，因为核心模块已经通过 manifest.json 加载
  initBilibiliBlock();

})();
