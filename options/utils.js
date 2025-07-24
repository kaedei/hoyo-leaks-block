/**
 * 工具函数模块
 */

/**
 * 获取平台显示名称
 * @param {string} platform 平台标识
 * @returns {string} 平台显示名称
 */
function getPlatformDisplayName(platform) {
  const names = {
    'bilibili': 'Bilibili',
    'youtube': 'YouTube',
    'twitter': 'Twitter'
  };
  return names[platform] || platform;
}

/**
 * 显示消息提示
 * @param {string} text 消息文本
 * @param {string} type 消息类型 ('info', 'success', 'error')
 */
function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.add('show');

    setTimeout(() => {
      messageEl.classList.remove('show');
    }, 3000);
  } else {
    // 如果没有message元素，使用alert作为后备
    alert(text);
  }
}

/**
 * 创建并下载JSON文件
 * @param {Object} data 要下载的数据
 * @param {string} filename 文件名
 */
function downloadJSON(data, filename) {
  const configData = JSON.stringify(data, null, 2);
  const blob = new Blob([configData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 从文件读取JSON数据
 * @param {File} file 文件对象
 * @returns {Promise<Object>} 解析后的JSON数据
 */
function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('配置文件格式错误'));
      }
    };
    reader.onerror = function () {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });
}

/**
 * 创建对话框元素
 * @param {string} title 对话框标题
 * @param {string} content 对话框内容HTML
 * @param {string} className 对话框CSS类名
 * @returns {HTMLElement} 对话框元素
 */
function createDialog(title, content, className = 'edit-dialog') {
  const dialog = document.createElement('div');
  dialog.className = 'edit-dialog-overlay';
  dialog.innerHTML = `
    <div class="${className}">
      <h3>${title}</h3>
      ${content}
    </div>
  `;
  return dialog;
}

/**
 * 关闭对话框
 */
function closeDialog() {
  const dialog = document.querySelector('.edit-dialog-overlay');
  if (dialog) {
    dialog.remove();
  }
}

// 导出工具函数
window.Utils = {
  getPlatformDisplayName,
  showMessage,
  downloadJSON,
  readJSONFile,
  createDialog,
  closeDialog
};
