/**
 * 区域管理模块
 */

/**
 * 区域管理器
 */
class AreaManager {
  constructor() {
    this.remoteManager = new RemoteConfigManager();
    this.sampleAreas = this.remoteManager.getDefaultAreaList();
  }

  /**
   * 安全地获取国际化消息
   * @param {string} key 消息键
   * @param {string} fallback 备用文本
   * @returns {string} 本地化消息或备用文本
   */
  getI18nMessage(key, fallback = key) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.i18n) {
        return chrome.i18n.getMessage(key) || fallback;
      }
    } catch (error) {
      // 扩展上下文失效时静默处理
    }
    return fallback;
  }

  /**
   * 加载区域列表
   */
  loadAreaList() {
    DebugLogger.log('[HoyoBlock-Options] Loading area list...');

    chrome.storage.sync.get(['areaList'], (result) => {
      let areaList = result.areaList;

      // 确保 areaList 是数组
      if (!Array.isArray(areaList)) {
        DebugLogger.log('[HoyoBlock-Options] areaList is not an array, initializing as empty array. Received:', areaList);
        areaList = [];
      }

      DebugLogger.log('[HoyoBlock-Options] Area list loaded:', areaList);

      const container = document.getElementById('area-items');
      if (!container) {
        DebugLogger.log('[HoyoBlock-Options] Area items container not found');
        return;
      }

      container.innerHTML = '';

      if (areaList.length === 0) {
        container.innerHTML = `
          <div class="area-item" style="text-align: center; color: #666; font-style: italic;">
            <div style="grid-column: 1 / -1;">${this.getI18nMessage('area_empty', '暂无配置区域')}</div>
          </div>
        `;
        return;
      }

      areaList.forEach((area, index) => {
        const localizedName = window.SharedUtils.getLocalizedAreaName(area.name);
        DebugLogger.log(`[HoyoBlock-Options] Processing area ${index}: ${localizedName} (${area.area}) - ${area.on ? 'enabled' : 'disabled'}`);

        const areaItem = document.createElement('div');
        areaItem.className = 'area-item';
        areaItem.innerHTML = `
          <div class="area-name" title="${localizedName}">${localizedName}</div>
          <div class="area-platform">${window.Utils.getPlatformDisplayName(area.area)}</div>
          <div class="area-status">
            <span class="status-indicator ${area.on ? 'status-active' : 'status-inactive'}">
              ${area.on ? this.getI18nMessage('area_enabled', '已启用') : this.getI18nMessage('area_disabled', '已禁用')}
            </span>
          </div>
          <div class="area-actions">
            <button data-action="toggle-area" data-index="${index}" class="btn btn-${area.on ? 'secondary' : 'primary'}" style="padding: 4px 8px; font-size: 12px;">
              ${area.on ? this.getI18nMessage('btn_disable', '禁用') : this.getI18nMessage('btn_enable', '启用')}
            </button>
            <button data-action="edit-area" data-index="${index}" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;">${this.getI18nMessage('btn_edit', '编辑')}</button>
            <button data-action="delete-area" data-index="${index}" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">${this.getI18nMessage('btn_delete', '删除')}</button>
          </div>
        `;
        container.appendChild(areaItem);
      });

      DebugLogger.log('[HoyoBlock-Options] Area list UI updated');
    });
  }

  /**
   * 切换区域状态
   * @param {number} index 区域索引
   */
  toggleArea(index) {
    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      if (areaList[index]) {
        const area = areaList[index];
        const action = area.on ? this.getI18nMessage('btn_disable', '禁用') : this.getI18nMessage('btn_enable', '启用');
        const confirmMsg = this.getI18nMessage('confirm_toggle_area', '确定要{action}{name}吗？').replace('{action}', action).replace('{name}', window.SharedUtils.getLocalizedAreaName(area.name));

        if (confirm(confirmMsg)) {
          area.on = !area.on;
          chrome.storage.sync.set({ areaList }, () => {
            this.loadAreaList();
            const successMsg = this.getI18nMessage('area_toggled_success', '{name}已{action}').replace('{name}', window.SharedUtils.getLocalizedAreaName(area.name)).replace('{action}', action);
            window.Utils.showMessage(successMsg, 'success');
          });
        }
      }
    });
  }

  /**
   * 编辑区域
   * @param {number} index 区域索引
   */
  editArea(index) {
    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      if (areaList[index]) {
        const area = areaList[index];
        this.showAreaDialog('edit', area, index);
      }
    });
  }

  /**
   * 删除区域
   * @param {number} index 区域索引
   */
  deleteArea(index) {
    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      if (areaList[index]) {
        const area = areaList[index];
        const confirmMsg = chrome.i18n.getMessage('confirm_delete_area').replace('{name}', window.SharedUtils.getLocalizedAreaName(area.name));
        if (confirm(confirmMsg)) {
          areaList.splice(index, 1);
          chrome.storage.sync.set({ areaList }, () => {
            this.loadAreaList();
            const successMsg = chrome.i18n.getMessage('area_deleted_success').replace('{name}', window.SharedUtils.getLocalizedAreaName(area.name));
            window.Utils.showMessage(successMsg, 'success');
          });
        }
      }
    });
  }

  /**
   * 添加新区域
   */
  addArea() {
    this.showAreaDialog('add');
  }

  /**
   * 显示区域对话框
   * @param {string} mode 模式：'add' 或 'edit'
   * @param {Object} area 区域数据（编辑模式时使用）
   * @param {number} index 区域索引（编辑模式时使用）
   */
  showAreaDialog(mode, area = null, index = null) {
    // 获取模板
    const template = document.getElementById('area-dialog-template');
    if (!template) {
      console.error('[AreaManager] Area dialog template not found');
      return;
    }

    // 克隆模板内容
    const dialogElement = template.content.cloneNode(true);

    // 设置对话框标题和按钮文本
    const titleElement = dialogElement.getElementById('dialog-title');
    const saveButton = dialogElement.getElementById('dialog-save-btn');

    if (mode === 'add') {
      titleElement.textContent = chrome.i18n.getMessage('dialog_add_area');
      saveButton.textContent = chrome.i18n.getMessage('dialog_add');
    } else {
      titleElement.textContent = chrome.i18n.getMessage('dialog_edit_area');
      saveButton.textContent = chrome.i18n.getMessage('dialog_save');
    }

    // 如果是编辑模式，填充现有数据
    if (mode === 'edit' && area) {
      // 对于name字段，如果是国际化key则显示本地化文本，否则显示原值
      const displayName = window.SharedUtils.getLocalizedAreaName(area.name);
      dialogElement.getElementById('area-name').value = displayName || '';

      dialogElement.getElementById('area-platform').value = area.area || 'bilibili';
      dialogElement.getElementById('area-main').value = area.main || '';
      dialogElement.getElementById('area-item').value = area.item || '';
      dialogElement.getElementById('area-text').value = area.text || '';
      dialogElement.getElementById('area-media').value = area.media || '';
      dialogElement.getElementById('area-user').value = area.user || '';
      dialogElement.getElementById('area-home').checked = area.home || false;
    }

    // 设置表单的数据属性
    const form = dialogElement.getElementById('area-form');
    form.setAttribute('data-mode', mode);
    if (index !== null) {
      form.setAttribute('data-index', index);
    }

    // 添加到页面
    document.body.appendChild(dialogElement);

    // 获取刚添加的对话框元素（因为 appendChild 后 dialogElement 会变成空的 DocumentFragment）
    const dialog = document.querySelector('.edit-dialog-overlay:last-child');

    // 手动处理国际化标记
    this.localizeElement(dialog);

    // 绑定事件处理器
    this.bindDialogEvents(dialog, mode);
  }

  /**
   * 绑定对话框事件
   * @param {HTMLElement} dialog 对话框元素
   * @param {string} mode 模式
   */
  bindDialogEvents(dialog, mode) {
    const form = dialog.querySelector('#area-form');
    const cancelButton = dialog.querySelector('#dialog-cancel-btn');
    const overlay = dialog;

    if (!form || !cancelButton) {
      console.error('[AreaManager] Required dialog elements not found');
      return;
    }

    // 表单提交事件
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (mode === 'add') {
        this.saveNewAreaFromDialog(form);
      } else {
        this.saveEditedAreaFromDialog(form);
      }
    });

    // 取消按钮事件
    cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeDialog(dialog);
    });

    // 点击遮罩层关闭对话框
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        e.preventDefault();
        e.stopPropagation();
        this.closeDialog(dialog);
      }
    });

    // ESC 键关闭对话框
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.closeDialog(dialog);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * 关闭对话框
   * @param {HTMLElement} dialog 对话框元素
   */
  closeDialog(dialog) {
    if (dialog && dialog.parentNode) {
      dialog.parentNode.removeChild(dialog);
    }
  }

  /**
   * 本地化元素中的国际化标记
   * @param {HTMLElement} element 要处理的元素
   */
  localizeElement(element) {
    // 处理文本节点
    const textWalker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = textWalker.nextNode()) {
      if (node.textContent.includes('__MSG_')) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      node.textContent = node.textContent.replace(/__MSG_([a-zA-Z0-9_]+)__/g, (match, key) => {
        try {
          const message = chrome.i18n.getMessage(key);
          return message || match;
        } catch (error) {
          console.warn(`[AreaManager] Failed to get message for key: ${key}`, error);
          return match;
        }
      });
    });

    // 处理元素属性
    const elements = element.querySelectorAll('*');
    elements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.value.includes('__MSG_')) {
          const newValue = attr.value.replace(/__MSG_([a-zA-Z0-9_]+)__/g, (match, key) => {
            try {
              const message = chrome.i18n.getMessage(key);
              return message || match;
            } catch (error) {
              console.warn(`[AreaManager] Failed to get message for key: ${key}`, error);
              return match;
            }
          });
          el.setAttribute(attr.name, newValue);
        }
      });
    });
  }

  /**
   * 保存编辑的区域
   * @param {HTMLFormElement} form 表单元素
   */
  saveEditedAreaFromDialog(form) {
    const newName = form.querySelector('#area-name').value.trim();
    const newPlatform = form.querySelector('#area-platform').value;
    const newMain = form.querySelector('#area-main').value.trim();
    const newItem = form.querySelector('#area-item').value.trim();
    const newText = form.querySelector('#area-text').value.trim();
    const newMedia = form.querySelector('#area-media').value.trim();
    const newUser = form.querySelector('#area-user').value.trim();
    const newHome = form.querySelector('#area-home').checked;

    if (!newName || !newMain || !newItem || !newText) {
      window.Utils.showMessage(chrome.i18n.getMessage('area_form_validation'), 'error');
      return;
    }

    const index = parseInt(form.getAttribute('data-index'));
    const dialog = form.closest('.edit-dialog-overlay');

    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      if (areaList[index]) {
        areaList[index].name = newName;
        areaList[index].area = newPlatform;
        areaList[index].main = newMain;
        areaList[index].item = newItem;
        areaList[index].text = newText;
        areaList[index].media = newMedia;
        areaList[index].user = newUser;
        areaList[index].home = newHome;

        chrome.storage.sync.set({ areaList }, () => {
          this.closeDialog(dialog);
          this.loadAreaList();
          window.Utils.showMessage(chrome.i18n.getMessage('area_updated_success'), 'success');
        });
      }
    });
  }

  /**
   * 保存新添加的区域
   * @param {HTMLFormElement} form 表单元素
   */
  saveNewAreaFromDialog(form) {
    const name = form.querySelector('#area-name').value.trim();
    const platform = form.querySelector('#area-platform').value;
    const main = form.querySelector('#area-main').value.trim();
    const item = form.querySelector('#area-item').value.trim();
    const text = form.querySelector('#area-text').value.trim();
    const media = form.querySelector('#area-media').value.trim();
    const user = form.querySelector('#area-user').value.trim();
    const home = form.querySelector('#area-home').checked;

    if (!name || !main || !item || !text) {
      window.Utils.showMessage(chrome.i18n.getMessage('area_form_validation'), 'error');
      return;
    }

    const newArea = {
      name: name,
      area: platform,
      main: main,
      item: item,
      text: text,
      media: media,
      user: user,
      home: home,
      on: true
    };

    const dialog = form.closest('.edit-dialog-overlay');

    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      areaList.push(newArea);

      chrome.storage.sync.set({ areaList }, () => {
        this.closeDialog(dialog);
        this.loadAreaList();
        window.Utils.showMessage(chrome.i18n.getMessage('area_added_success'), 'success');
      });
    });
  }

  /**
   * 刷新区域列表
   */
  refreshAreas() {
    if (confirm(chrome.i18n.getMessage('confirm_refresh_areas'))) {
      this.loadAreaList();
      window.Utils.showMessage(chrome.i18n.getMessage('areas_refreshed_success'), 'success');
    }
  }

  /**
   * 加载示例区域数据
   */
  loadSampleAreaData() {
    chrome.storage.sync.set({ areaList: this.sampleAreas }, () => {
      this.loadAreaList();
      window.Utils.showMessage(chrome.i18n.getMessage('sample_area_loaded'), 'success');
    });
  }

  /**
   * 初始化区域数据
   */
  initAreaData() {
    chrome.storage.sync.get(['areaList'], (result) => {
      if (!result.areaList || result.areaList.length === 0) {
        DebugLogger.log('[HoyoBlock-Options] No area data found, loading sample data');
        this.loadSampleAreaData();
      }
    });
  }

  /**
   * 从远程更新区域列表
   */
  async updateRemoteAreas() {
    try {
      window.Utils.showMessage(chrome.i18n.getMessage('remote_update_fetching'), 'info');

      const areaList = await this.remoteManager.fetchRemoteAreaList();

      // 确认用户是否要覆盖当前配置
      const confirmMsg = chrome.i18n.getMessage('confirm_remote_update').replace('{count}', areaList.length);
      if (confirm(confirmMsg)) {
        chrome.storage.sync.set({ areaList }, () => {
          this.loadAreaList();
          const successMsg = chrome.i18n.getMessage('remote_update_success').replace('{count}', areaList.length);
          window.Utils.showMessage(successMsg, 'success');
        });
      }
    } catch (error) {
      console.warn('Failed to fetch remote area list:', error);
      const errorMsg = chrome.i18n.getMessage('remote_update_failed').replace('{error}', error.message);
      window.Utils.showMessage(errorMsg, 'error');
    }
  }
}

// 导出区域管理器
window.AreaManager = new AreaManager();
