// 简单的测试内容脚本
console.log('测试扩展已加载');

// 基本的测试功能
(function () {
  'use strict';

  console.log('当前页面URL:', window.location.href);
  console.log('页面标题:', document.title);

  // 简单的DOM操作测试
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      console.log('DOM已加载');
    });
  } else {
    console.log('DOM已就绪');
  }
})();
