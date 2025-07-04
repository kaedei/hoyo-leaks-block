// B站内容脚本
(function () {
  'use strict';

  function initBilibiliBlock() {
    // 创建B站专用的屏蔽实例
    const blockInstance = new HoyoLeaksBlockCore('Bili');

    // B站特定的处理逻辑
    blockInstance.platformSpecificInit = function () {
      // 监听页面变化（B站是SPA）
      let lastUrl = location.href;
      const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          // 页面变化时重新初始化
          setTimeout(() => {
            this.blockContent();
          }, 1000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
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
  initBilibiliBlock();

})();
