// Twitter内容脚本
(function () {
  'use strict';

  function initTwitterBlock() {
    // 创建Twitter专用的屏蔽实例
    const blockInstance = new HoyoLeaksBlockCore('Twitter');

    // Twitter特定的处理逻辑
    blockInstance.platformSpecificInit = function () {
      // Twitter特殊的屏蔽逻辑
      this.blockTwitterContent = function () {
        const activeAreas = this.areaList.filter(area =>
          area.area === 'twitter' && area.on === true
        );

        activeAreas.forEach(area => {
          const items = document.querySelectorAll(area.item);
          items.forEach(item => {
            // Twitter特有的检查：确保元素有tabindex属性
            if (item.getAttribute('tabindex') !== '0') {
              return;
            }

            const textElement = item.querySelector(area.text);
            const userElement = item.querySelector(area.user);

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
      };

      // 重写blockContent方法使用Twitter特定逻辑
      this.blockContent = this.blockTwitterContent;

      // 监听页面变化
      let lastUrl = location.href;
      const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
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
  initTwitterBlock();

})();
