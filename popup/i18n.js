/**
 * 简化的国际化工具 - 用于popup页面
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
    console.log('Title localized:', titleElement.textContent);
  }
}

// 页面加载完成后立即处理本地化
document.addEventListener('DOMContentLoaded', function () {
  localizeHTML();
});

// 为了兼容性，在页面加载时也处理一次
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', localizeHTML);
} else {
  localizeHTML();
}
