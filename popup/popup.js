// 弹窗脚本
document.addEventListener('DOMContentLoaded', function () {
  // 初始化弹窗
  initPopup();

  // 绑定事件监听器
  bindEventListeners();

  // 加载统计数据
  loadStats();
});

function initPopup() {
  // 加载当前配置状态
  chrome.storage.sync.get(null, function (result) {
    // 设置平台开关状态
    const platforms = ['bili', 'ytb', 'twitter'];
    platforms.forEach(platform => {
      const toggle = document.getElementById(`${platform}-enabled`);
      const areaList = result.areaList || [];
      const platformAreas = areaList.filter(area =>
        area.area === (platform === 'bili' ? 'bilibili' :
          platform === 'ytb' ? 'youtube' : 'twitter')
      );

      // 如果有任何区域是启用的，则认为平台是启用的
      const isEnabled = platformAreas.some(area => area.on === true);
      toggle.checked = isEnabled;
    });
  });
}

function bindEventListeners() {
  // 平台开关切换
  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', function () {
      const platform = this.id.replace('-enabled', '');
      togglePlatform(platform, this.checked);
    });
  });

  // 设置按钮
  document.getElementById('open-settings').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // 刷新页面按钮
  document.getElementById('refresh-page').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
      window.close();
    });
  });

  // 清除缓存按钮
  document.getElementById('clear-cache').addEventListener('click', function () {
    if (confirm('确认清除所有缓存配置？')) {
      chrome.storage.sync.clear(function () {
        showMessage('缓存已清除');
        // 重新设置默认配置
        chrome.runtime.sendMessage({ action: 'resetToDefault' });
        setTimeout(() => {
          window.close();
        }, 1000);
      });
    }
  });

  // 帮助链接
  document.getElementById('help-link').addEventListener('click', function (e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/kaedei/hoyo-leaks-block'
    });
  });
}

function togglePlatform(platform, enabled) {
  chrome.storage.sync.get(['areaList'], function (result) {
    const areaList = result.areaList || [];
    const platformName = platform === 'bili' ? 'bilibili' :
      platform === 'ytb' ? 'youtube' : 'twitter';

    // 更新该平台的所有区域状态
    areaList.forEach(area => {
      if (area.area === platformName) {
        area.on = enabled;
      }
    });

    chrome.storage.sync.set({ areaList: areaList }, function () {
      showMessage(`${getPlatformName(platform)} ${enabled ? '已启用' : '已禁用'}`);

      // 通知content script更新
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'configUpdated',
          platform: platform,
          enabled: enabled
        }).catch(() => {
          // 忽略错误，可能是在不支持的页面
        });
      });
    });
  });
}

function getPlatformName(platform) {
  const names = {
    'bili': 'Bilibili',
    'ytb': 'YouTube',
    'twitter': 'Twitter'
  };
  return names[platform] || platform;
}

function loadStats() {
  chrome.storage.local.get(['todayBlocked', 'totalBlocked'], function (result) {
    document.getElementById('today-blocked').textContent = result.todayBlocked || 0;
    document.getElementById('total-blocked').textContent = result.totalBlocked || 0;
  });
}

function showMessage(message) {
  // 创建临时消息元素
  const messageEl = document.createElement('div');
  messageEl.className = 'popup-message';
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(messageEl);

  // 显示消息
  setTimeout(() => {
    messageEl.style.opacity = '1';
  }, 10);

  // 隐藏消息
  setTimeout(() => {
    messageEl.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 300);
  }, 2000);
}
