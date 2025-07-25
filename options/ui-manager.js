/**
 * UI管理模块
 */

/**
 * UI管理器
 */
class UIManager {
  constructor() {
    this.activeTab = 'rules';
    this.activePlatform = 'bilibili';
  }

  /**
   * 初始化UI
   */
  init() {
    DebugLogger.log('[UIManager] Starting initialization...');
    DebugLogger.log('[UIManager] this =', this);
    DebugLogger.log('[UIManager] typeof this =', typeof this);
    DebugLogger.log('[UIManager] this.constructor =', this.constructor);
    DebugLogger.log('[UIManager] this.constructor.name =', this.constructor.name);

    try {
      this.initTabNavigation();
      this.initPlatformTabs();
      this.bindEventListeners();
      this.bindKeyboardEvents();

      DebugLogger.log('[UIManager] Initialization completed successfully');
    } catch (error) {
      console.error('[UIManager] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 初始化标签页切换
   */
  initTabNavigation() {
    // 恢复上次的标签页状态
    const savedTab = localStorage.getItem('hoyo-block-active-tab') || 'rules';
    this.activeTab = savedTab;

    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // 设置初始状态
    navItems.forEach(nav => nav.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const activeNavItem = document.querySelector(`[data-tab="${savedTab}"]`);
    const activeTabContent = document.getElementById(`${savedTab}-tab`);

    if (activeNavItem && activeTabContent) {
      activeNavItem.classList.add('active');
      activeTabContent.classList.add('active');
    }

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');

        // 更新导航项状态
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // 更新标签页内容
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${targetTab}-tab`).classList.add('active');

        this.activeTab = targetTab;
        // 保存状态到 localStorage
        localStorage.setItem('hoyo-block-active-tab', targetTab);
      });
    });
  }

  /**
   * 初始化平台标签页切换
   */
  initPlatformTabs() {
    // 恢复上次的平台标签页状态
    const savedPlatform = localStorage.getItem('hoyo-block-active-platform') || 'bilibili';
    this.activePlatform = savedPlatform;

    const platformBtns = document.querySelectorAll('.platform-tab-btn');
    const platformPanels = document.querySelectorAll('.platform-config-panel');

    // 设置初始状态
    platformBtns.forEach(btn => btn.classList.remove('active'));
    platformPanels.forEach(panel => panel.classList.remove('active'));

    const activePlatformBtn = document.querySelector(`[data-platform="${savedPlatform}"]`);
    const activePlatformPanel = document.getElementById(`${savedPlatform}-config`);

    if (activePlatformBtn && activePlatformPanel) {
      activePlatformBtn.classList.add('active');
      activePlatformPanel.classList.add('active');
    }

    platformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPlatform = btn.getAttribute('data-platform');

        // 更新平台按钮状态
        platformBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 更新平台面板
        platformPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${targetPlatform}-config`).classList.add('active');

        this.activePlatform = targetPlatform;
        // 保存状态到 localStorage
        localStorage.setItem('hoyo-block-active-platform', targetPlatform);
      });
    });
  }

  /**
   * 绑定事件监听器
   */
  bindEventListeners() {
    DebugLogger.log('[UIManager] Binding event listeners...');

    // 安全获取元素的辅助函数
    const getElement = (id) => {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`[UIManager] Element with id '${id}' not found`);
      }
      return element;
    };

    // 配置相关按钮
    const saveRulesBtn = getElement('save-rules');
    if (saveRulesBtn) {
      saveRulesBtn.addEventListener('click', () => {
        window.ConfigManager.saveRules();
      });
    }

    const resetRulesBtn = getElement('reset-rules');
    if (resetRulesBtn) {
      resetRulesBtn.addEventListener('click', () => {
        window.ConfigManager.resetRules();
      });
    }

    const syncRemoteRulesBtn = getElement('sync-remote-rules');
    if (syncRemoteRulesBtn) {
      syncRemoteRulesBtn.addEventListener('click', () => {
        window.ConfigManager.syncRemoteRules();
      });
    }

    const exportConfigBtn = getElement('export-config');
    if (exportConfigBtn) {
      exportConfigBtn.addEventListener('click', () => {
        window.ConfigManager.exportConfig();
      });
    }

    const importConfigBtn = getElement('import-config');
    const importFileInput = getElement('import-file');
    if (importConfigBtn && importFileInput) {
      importConfigBtn.addEventListener('click', () => {
        importFileInput.click();
      });

      importFileInput.addEventListener('change', (event) => {
        window.ConfigManager.importConfig(event);
      });
    }

    const clearAllBtn = getElement('clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        window.ConfigManager.clearAllData();
      });
    }

    // 区域管理相关按钮
    const addAreaBtn = getElement('add-area');
    if (addAreaBtn) {
      addAreaBtn.addEventListener('click', () => {
        window.AreaManager.addArea();
      });
    }

    const refreshAreasBtn = getElement('refresh-areas');
    if (refreshAreasBtn) {
      refreshAreasBtn.addEventListener('click', () => {
        window.AreaManager.refreshAreas();
      });
    }

    const updateRemoteAreasBtn = getElement('update-remote-areas');
    if (updateRemoteAreasBtn) {
      updateRemoteAreasBtn.addEventListener('click', () => {
        window.AreaManager.updateRemoteAreas();
      });
    }

    // 动态创建的按钮事件委托
    this.bindDynamicEvents();

    // 表单提交事件委托
    this.bindFormEvents();

    DebugLogger.log('[UIManager] Event listeners bound successfully');
  }

  /**
   * 绑定动态创建的按钮事件
   */
  bindDynamicEvents() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      const action = target.getAttribute('data-action');
      const index = target.getAttribute('data-index');

      switch (action) {
        case 'toggle-area':
          if (index !== null) {
            window.AreaManager.toggleArea(parseInt(index));
          }
          break;

        case 'edit-area':
          if (index !== null) {
            window.AreaManager.editArea(parseInt(index));
          }
          break;

        case 'delete-area':
          if (index !== null) {
            window.AreaManager.deleteArea(parseInt(index));
          }
          break;

        case 'close-edit-dialog':
        case 'close-add-dialog':
          window.Utils.closeDialog();
          break;
      }
    });
  }

  /**
   * 绑定表单提交事件
   */
  bindFormEvents() {
    document.addEventListener('submit', (event) => {
      if (event.target.id === 'edit-area-form') {
        event.preventDefault();
        window.AreaManager.saveEditedArea(event.target);
      } else if (event.target.id === 'add-area-form') {
        event.preventDefault();
        window.AreaManager.saveNewArea();
      }
    });
  }

  /**
   * 绑定键盘事件
   */
  bindKeyboardEvents() {
    // ESC键关闭对话框
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        window.Utils.closeDialog();
      }
    });

    // 点击对话框外部关闭
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('edit-dialog-overlay')) {
        event.target.remove();
      }
    });
  }

  /**
   * 切换到指定标签页
   * @param {string} tabName 标签页名称
   */
  switchToTab(tabName) {
    const navItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (navItem) {
      navItem.click();
    }
  }

  /**
   * 切换到指定平台
   * @param {string} platformName 平台名称
   */
  switchToPlatform(platformName) {
    const platformBtn = document.querySelector(`[data-platform="${platformName}"]`);
    if (platformBtn) {
      platformBtn.click();
    }
  }

  /**
   * 获取当前激活的标签页
   * @returns {string} 当前标签页名称
   */
  getCurrentTab() {
    return this.activeTab;
  }

  /**
   * 获取当前激活的平台
   * @returns {string} 当前平台名称
   */
  getCurrentPlatform() {
    return this.activePlatform;
  }

  /**
   * 显示导入规则对话框
   */
  showImportDialog(platform, ruleType) {
    const dialog = document.createElement('div');
    dialog.className = 'import-dialog';
    dialog.innerHTML = `
      <div class="import-dialog-content">
        <h3>导入${window.ConfigManager.getRuleTypeName(ruleType)}规则</h3>
        <p>请将规则内容粘贴到下方文本框中，每行一个规则：</p>
        <textarea class="import-textarea" placeholder="规则1
规则2
规则3
..."></textarea>
        <div class="import-actions">
          <button class="btn btn-secondary cancel-import">取消</button>
          <button class="btn btn-primary confirm-import">导入</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // 绑定事件
    const textarea = dialog.querySelector('.import-textarea');
    const cancelBtn = dialog.querySelector('.cancel-import');
    const confirmBtn = dialog.querySelector('.confirm-import');

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });

    confirmBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (text) {
        window.ConfigManager.importRulesFromText(platform, ruleType, text);
      }
      document.body.removeChild(dialog);
    });

    // 点击背景关闭
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });

    // 聚焦到文本框
    setTimeout(() => textarea.focus(), 100);
  }
}

// 导出UI管理器
DebugLogger.log('[UIManager] Creating UIManager instance...');
const uiManagerInstance = new UIManager();
DebugLogger.log('[UIManager] UIManager instance created:', uiManagerInstance);
DebugLogger.log('[UIManager] UIManager instance init method:', typeof uiManagerInstance.init);

window.UIManager = uiManagerInstance;
DebugLogger.log('[UIManager] UIManager exported to window:', window.UIManager);
DebugLogger.log('[UIManager] window.UIManager.init:', typeof window.UIManager.init);
