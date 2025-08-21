// 弹窗脚本 - 合并了国际化功能
/**
 * ==================== 国际化工具函数 ====================
 */

/**
 * 简化的国际化处理函数
 */
function localizeHTML() {
  // 获取所有包含 __MSG_*__ 的文本节点和属性（包括head和body）
  const walker = document.createTreeWalker(
    document.documentElement, // 从根元素开始，包括head和body
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  const textNodesToProcess = [];
  const attributesToProcess = [];

  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.includes('__MSG_')) {
        textNodesToProcess.push(node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 检查元素的属性
      if (node.hasAttributes()) {
        Array.from(node.attributes).forEach(attr => {
          if (attr.value.includes('__MSG_')) {
            attributesToProcess.push({ element: node, attribute: attr });
          }
        });
      }
    }
  }

  // 处理文本节点
  textNodesToProcess.forEach(node => {
    node.textContent = processText(node.textContent);
  });

  // 处理属性
  attributesToProcess.forEach(({ element, attribute }) => {
    const newValue = processText(attribute.value);
    element.setAttribute(attribute.name, newValue);
  });

  // 特别处理title标签
  localizeTitle();
}

/**
 * 处理文本中的本地化标记
 * @param {string} text 包含 __MSG_*__ 标记的文本
 * @returns {string} 本地化后的文本
 */
function processText(text) {
  return text.replace(/__MSG_([a-zA-Z0-9_]+)__/g, (match, key) => {
    try {
      const message = chrome.i18n.getMessage(key);
      return message || match;
    } catch (error) {
      console.warn(`Failed to get message for key: ${key}`, error);
      return match;
    }
  });
}

/**
 * 获取本地化消息
 * @param {string} key 消息键
 * @param {string|string[]} substitutions 替换参数
 * @returns {string} 本地化后的消息
 */
function getMessage(key, substitutions = null) {
  try {
    return chrome.i18n.getMessage(key, substitutions);
  } catch (error) {
    console.warn(`Failed to get message for key: ${key}`, error);
    return key;
  }
}

/**
 * 特别处理title标签的本地化
 */
function localizeTitle() {
  const titleElement = document.querySelector('title');
  if (titleElement && titleElement.textContent.includes('__MSG_')) {
    titleElement.textContent = processText(titleElement.textContent);
  }
}

/**
 * ==================== 弹窗主要功能 ====================
 */

document.addEventListener('DOMContentLoaded', function () {
  // 先处理国际化
  localizeHTML();

  // 初始化弹窗
  initPopup();

  // 绑定事件监听器
  bindEventListeners();

  // 加载统计数据
  loadStats();

  // 更新版本显示
  updateVersionDisplay();
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

  // 清除缓存按钮
  document.getElementById('clear-cache').addEventListener('click', function () {
    if (confirm(chrome.i18n.getMessage('confirm_clear_cache'))) {
      chrome.storage.sync.clear(function () {
        showMessage(chrome.i18n.getMessage('cache_cleared'));
        // 重新设置默认配置
        chrome.runtime.sendMessage({ action: 'resetToDefault' });
        setTimeout(() => {
          window.close();
        }, 1000);
      });
    }
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
      const statusMsg = chrome.i18n.getMessage('platform_status_changed')
        .replace('{platform}', getPlatformName(platform))
        .replace('{status}', enabled ? chrome.i18n.getMessage('status_enabled') : chrome.i18n.getMessage('status_disabled'));
      showMessage(statusMsg);
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

/**
 * 更新版本显示
 */
function updateVersionDisplay() {
  const versionElement = document.getElementById('version-text');
  if (versionElement) {
    try {
      // 获取当前显示的本地化文本（如"版本"）
      const currentText = versionElement.textContent;
      // 获取版本号并组合显示
      const version = SharedUtils.getExtensionVersion();
      versionElement.textContent = `${currentText}: ${version}`;
    } catch (error) {
      console.warn('[HoyoBlock-Popup] Failed to update version display:', error);
    }
  }
}
