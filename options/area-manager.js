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

        const editDialog = window.Utils.createDialog('编辑区域', `
          <form id="edit-area-form" data-index="${index}">
            <div class="form-group">
              <label for="edit-name">__MSG_area_name__:</label>
              <input type="text" id="edit-name" value="${area.name}" required>
            </div>
            <div class="form-group">
              <label for="edit-platform">__MSG_area_platform__:</label>
              <select id="edit-platform">
                <option value="bilibili" ${area.area === 'bilibili' ? 'selected' : ''}>B站</option>
                <option value="youtube" ${area.area === 'youtube' ? 'selected' : ''}>YouTube</option>
                <option value="twitter" ${area.area === 'twitter' ? 'selected' : ''}>Twitter</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-main">__MSG_area_main_selector__:</label>
              <textarea id="edit-main" rows="2" placeholder="__MSG_area_main_selector_placeholder__" required>${area.main || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="edit-item">__MSG_area_item_selector__:</label>
              <textarea id="edit-item" rows="2" placeholder="__MSG_area_item_selector_placeholder__" required>${area.item || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="edit-text">__MSG_area_text_selector__:</label>
              <textarea id="edit-text" rows="2" placeholder="__MSG_area_text_selector_placeholder__" required>${area.text || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="edit-media">__MSG_area_media_selector__:</label>
              <textarea id="edit-media" rows="2" placeholder="__MSG_area_media_selector_placeholder__">${area.media || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="edit-user">__MSG_area_user_selector__:</label>
              <textarea id="edit-user" rows="2" placeholder="__MSG_area_user_selector_placeholder__">${area.user || ''}</textarea>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="edit-home" ${area.home ? 'checked' : ''}>
                __MSG_area_home_enable__
              </label>
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
          <label for="add-name">__MSG_area_name__:</label>
          <input type="text" id="add-name" placeholder="请输入区域名称" required>
        </div>
        <div class="form-group">
          <label for="add-platform">__MSG_area_platform__:</label>
          <select id="add-platform">
            <option value="bilibili">B站</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>
        <div class="form-group">
          <label for="add-main">__MSG_area_main_selector__:</label>
          <textarea id="add-main" rows="2" placeholder="__MSG_area_main_selector_placeholder__" required></textarea>
        </div>
        <div class="form-group">
          <label for="add-item">__MSG_area_item_selector__:</label>
          <textarea id="add-item" rows="2" placeholder="__MSG_area_item_selector_placeholder__" required></textarea>
        </div>
        <div class="form-group">
          <label for="add-text">__MSG_area_text_selector__:</label>
          <textarea id="add-text" rows="2" placeholder="__MSG_area_text_selector_placeholder__" required></textarea>
        </div>
        <div class="form-group">
          <label for="add-media">__MSG_area_media_selector__:</label>
          <textarea id="add-media" rows="2" placeholder="__MSG_area_media_selector_placeholder__"></textarea>
        </div>
        <div class="form-group">
          <label for="add-user">__MSG_area_user_selector__:</label>
          <textarea id="add-user" rows="2" placeholder="__MSG_area_user_selector_placeholder__"></textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="add-home">
            __MSG_area_home_enable__
          </label>
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
    const newMain = document.getElementById('edit-main').value.trim();
    const newItem = document.getElementById('edit-item').value.trim();
    const newText = document.getElementById('edit-text').value.trim();
    const newMedia = document.getElementById('edit-media').value.trim();
    const newUser = document.getElementById('edit-user').value.trim();
    const newHome = document.getElementById('edit-home').checked;

    if (!newName || !newMain || !newItem || !newText) {
      window.Utils.showMessage('请填写完整的区域信息（名称、主容器、项目选择器、文本选择器为必填项）！', 'error');
      return;
    }

    const index = parseInt(form.getAttribute('data-index'));

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
    const main = document.getElementById('add-main').value.trim();
    const item = document.getElementById('add-item').value.trim();
    const text = document.getElementById('add-text').value.trim();
    const media = document.getElementById('add-media').value.trim();
    const user = document.getElementById('add-user').value.trim();
    const home = document.getElementById('add-home').checked;

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
