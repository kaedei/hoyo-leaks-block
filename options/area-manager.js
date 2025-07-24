/**
 * 区域管理模块
 */

/**
 * 区域管理器
 */
class AreaManager {
  constructor() {
    this.remoteManager = new RemoteConfigManager();
    this.sampleAreas = this.remoteManager.getDefaultAreaList().slice(0, 3); // 只取前3个作为示例
  }

  /**
   * 加载区域列表
   */
  loadAreaList() {
    DebugLogger.log('[HoyoBlock-Options] Loading area list...');

    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      DebugLogger.log('[HoyoBlock-Options] Area list loaded:', areaList);

      const container = document.getElementById('area-items');
      container.innerHTML = '';

      if (areaList.length === 0) {
        container.innerHTML = `
          <div class="area-item" style="text-align: center; color: #666; font-style: italic;">
            <div style="grid-column: 1 / -1;">暂无区域配置</div>
          </div>
        `;
        return;
      }

      areaList.forEach((area, index) => {
        DebugLogger.log(`[HoyoBlock-Options] Processing area ${index}: ${area.name} (${area.area}) - ${area.on ? 'enabled' : 'disabled'}`);

        const areaItem = document.createElement('div');
        areaItem.className = 'area-item';
        areaItem.innerHTML = `
          <div class="area-name" title="${area.name}">${area.name}</div>
          <div class="area-platform">${window.Utils.getPlatformDisplayName(area.area)}</div>
          <div class="area-status">
            <span class="status-indicator ${area.on ? 'status-active' : 'status-inactive'}">
              ${area.on ? '启用' : '禁用'}
            </span>
          </div>
          <div class="area-actions">
            <button data-action="toggle-area" data-index="${index}" class="btn btn-${area.on ? 'secondary' : 'primary'}" style="padding: 4px 8px; font-size: 12px;">
              ${area.on ? '禁用' : '启用'}
            </button>
            <button data-action="edit-area" data-index="${index}" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;">编辑</button>
            <button data-action="delete-area" data-index="${index}" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">删除</button>
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
        const action = area.on ? '禁用' : '启用';

        if (confirm(`确认${action}区域 "${area.name}" 吗？`)) {
          area.on = !area.on;
          chrome.storage.sync.set({ areaList }, () => {
            this.loadAreaList();
            window.Utils.showMessage(`区域 "${area.name}" 已${action}！`, 'success');
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
        if (confirm(`确认删除区域 "${area.name}" 吗？`)) {
          areaList.splice(index, 1);
          chrome.storage.sync.set({ areaList }, () => {
            this.loadAreaList();
            window.Utils.showMessage(`区域 "${area.name}" 已删除！`, 'success');
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
      titleElement.textContent = '添加新区域';
      saveButton.textContent = '添加';
    } else {
      titleElement.textContent = '编辑区域';
      saveButton.textContent = '保存';
    }

    // 如果是编辑模式，填充现有数据
    if (mode === 'edit' && area) {
      dialogElement.getElementById('area-name').value = area.name || '';
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
      window.Utils.showMessage('请填写完整的区域信息（名称、主容器、项目选择器、文本选择器为必填项）！', 'error');
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
          window.Utils.showMessage('区域信息已更新！', 'success');
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
      window.Utils.showMessage('请填写完整的区域信息（名称、主容器、项目选择器、文本选择器为必填项）！', 'error');
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
        window.Utils.showMessage('新区域已添加！', 'success');
      });
    });
  }

  /**
   * 刷新区域列表
   */
  refreshAreas() {
    if (confirm('确认刷新区域列表？\n\n这将重新从配置中读取区域数据。')) {
      this.loadAreaList();
      window.Utils.showMessage('区域列表已刷新！', 'success');
    }
  }

  /**
   * 加载示例区域数据
   */
  loadSampleAreaData() {
    chrome.storage.sync.set({ areaList: this.sampleAreas }, () => {
      this.loadAreaList();
      window.Utils.showMessage('示例区域数据已加载！', 'success');
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
      window.Utils.showMessage('正在从服务器获取最新区域配置...', 'info');

      const areaList = await this.remoteManager.fetchRemoteAreaList();

      // 确认用户是否要覆盖当前配置
      if (confirm(`从服务器获取到 ${areaList.length} 个区域配置。\n\n是否要覆盖当前的区域设置？`)) {
        chrome.storage.sync.set({ areaList }, () => {
          this.loadAreaList();
          window.Utils.showMessage(`区域配置已更新！共加载了 ${areaList.length} 个区域。`, 'success');
        });
      }
    } catch (error) {
      console.warn('Failed to fetch remote area list:', error);
      window.Utils.showMessage(`更新失败：${error.message}`, 'error');
    }
  }
}

// 导出区域管理器
window.AreaManager = new AreaManager();
