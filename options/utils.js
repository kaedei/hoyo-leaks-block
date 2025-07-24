/**
 * 工具函数模块 - 选项页面版本
 */

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

// 导出工具函数（合并共享工具和本地特有工具）
window.Utils = {
  // 从SharedUtils继承的方法
  getPlatformDisplayName: SharedUtils.getPlatformDisplayName,
  showMessage: SharedUtils.showMessage,
  downloadJSON: SharedUtils.downloadJSON,
  readJSONFile: SharedUtils.readJSONFile,
  debounce: SharedUtils.debounce,
  throttle: SharedUtils.throttle,
  getNestedProperty: SharedUtils.getNestedProperty,
  generateId: SharedUtils.generateId,

  // 本地特有的方法
  createDialog,
  closeDialog
};
