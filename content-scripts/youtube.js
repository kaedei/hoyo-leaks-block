// YouTube内容脚本
(function () {
  'use strict';

  function initYouTubeBlock() {
    // 创建YouTube专用的屏蔽实例
    const blockInstance = new HoyoLeaksBlockCore('youtube');

    // YouTube特定的处理逻辑
    blockInstance.platformSpecificInit = function () {
      // 监听页面变化（YouTube是SPA）
      let lastUrl = location.href;
      const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          // 页面变化时重新处理
          setTimeout(() => {
            this.blockContent();
          }, 1000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 监听YouTube特有的导航事件
      window.addEventListener('yt-navigate-finish', () => {
        setTimeout(() => {
          this.blockContent();
        }, 1000);
      });
    };

    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => blockInstance.platformSpecificInit(), 1000);
      });
    } else {
      setTimeout(() => blockInstance.platformSpecificInit(), 1000);
    }

    // 保存实例到全局，便于调试
    window.hoyoBlockInstance = blockInstance;
  }

  // 直接初始化，因为核心模块已经通过 manifest.json 加载
  initYouTubeBlock();

})();
