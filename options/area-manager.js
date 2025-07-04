/**
 * 区域管理模块
 */

/**
 * 区域管理器
 */
class AreaManager {
  constructor() {
    this.sampleAreas = [
      {
        name: "B站视频卡片",
        area: "bilibili",
        selector: ".video-item",
        on: true
      },
      {
        name: "YouTube视频缩略图",
        area: "youtube",
        selector: "ytd-video-renderer",
        on: true
      },
      {
        name: "Twitter推文",
        area: "twitter",
        selector: "[data-testid='tweet']",
        on: false
      }
    ];
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

        const editDialog = window.Utils.createDialog('编辑区域', `
          <form id="edit-area-form" data-index="${index}">
            <div class="form-group">
              <label for="edit-name">区域名称:</label>
              <input type="text" id="edit-name" value="${area.name}" required>
            </div>
            <div class="form-group">
              <label for="edit-platform">平台:</label>
              <select id="edit-platform">
                <option value="bilibili" ${area.area === 'bilibili' ? 'selected' : ''}>B站</option>
                <option value="youtube" ${area.area === 'youtube' ? 'selected' : ''}>YouTube</option>
                <option value="twitter" ${area.area === 'twitter' ? 'selected' : ''}>Twitter</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-selector">CSS选择器:</label>
              <textarea id="edit-selector" rows="3" required>${area.selector}</textarea>
            </div>
            <div class="dialog-actions">
              <button type="submit" class="btn btn-primary">保存</button>
              <button type="button" class="btn btn-secondary" data-action="close-edit-dialog">取消</button>
            </div>
          </form>
        `);

        document.body.appendChild(editDialog);
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
    const addDialog = window.Utils.createDialog('添加新区域', `
      <form id="add-area-form">
        <div class="form-group">
          <label for="add-name">区域名称:</label>
          <input type="text" id="add-name" placeholder="请输入区域名称" required>
        </div>
        <div class="form-group">
          <label for="add-platform">平台:</label>
          <select id="add-platform">
            <option value="bilibili">B站</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>
        <div class="form-group">
          <label for="add-selector">CSS选择器:</label>
          <textarea id="add-selector" rows="3" placeholder="请输入CSS选择器，例如：.video-item" required></textarea>
        </div>
        <div class="dialog-actions">
          <button type="submit" class="btn btn-primary">添加</button>
          <button type="button" class="btn btn-secondary" data-action="close-add-dialog">取消</button>
        </div>
      </form>
    `);

    document.body.appendChild(addDialog);
  }

  /**
   * 保存编辑的区域
   * @param {HTMLFormElement} form 表单元素
   */
  saveEditedArea(form) {
    const newName = document.getElementById('edit-name').value.trim();
    const newPlatform = document.getElementById('edit-platform').value;
    const newSelector = document.getElementById('edit-selector').value.trim();

    if (!newName || !newSelector) {
      window.Utils.showMessage('请填写完整的区域信息！', 'error');
      return;
    }

    const index = parseInt(form.getAttribute('data-index'));

    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      if (areaList[index]) {
        areaList[index].name = newName;
        areaList[index].area = newPlatform;
        areaList[index].selector = newSelector;

        chrome.storage.sync.set({ areaList }, () => {
          window.Utils.closeDialog();
          this.loadAreaList();
          window.Utils.showMessage('区域信息已更新！', 'success');
        });
      }
    });
  }

  /**
   * 保存新添加的区域
   */
  saveNewArea() {
    const name = document.getElementById('add-name').value.trim();
    const platform = document.getElementById('add-platform').value;
    const selector = document.getElementById('add-selector').value.trim();

    if (!name || !selector) {
      window.Utils.showMessage('请填写完整的区域信息！', 'error');
      return;
    }

    const newArea = {
      name: name,
      area: platform,
      selector: selector,
      on: true
    };

    chrome.storage.sync.get(['areaList'], (result) => {
      const areaList = result.areaList || [];
      areaList.push(newArea);

      chrome.storage.sync.set({ areaList }, () => {
        window.Utils.closeDialog();
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
}

// 导出区域管理器
window.AreaManager = new AreaManager();
