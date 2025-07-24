/**
 * 配置管理模块 - 选项页面版本
 */

/**
 * 配置管理器
 */
class OptionsConfigManager extends BaseConfigManager {
  constructor() {
    super();
    this.remoteManager = new RemoteConfigManager();
    this.defaultConfig = APP_CONSTANTS.DEFAULT_CONFIG;
  }

  /**
   * 加载配置到UI
   */
  loadConfig() {
    DebugLogger.log('[HoyoBlock-Options] Loading configuration...');

    chrome.storage.sync.get(null, (result) => {
      DebugLogger.log('[HoyoBlock-Options] Raw config loaded:', result);

      this.config = result;

      // 初始化配置结构
      this.initConfigStructure();

      // 加载到新的UI组件
      this.loadRulesToUI();

      DebugLogger.log('[HoyoBlock-Options] Configuration loaded to UI');
    });
  }  /**
   * 加载规则到UI
   */
  loadRulesToUI() {
    const platforms = ['bilibili', 'youtube', 'twitter'];

    platforms.forEach(platform => {
      const rules = this.config.blockRules?.[platform];
      if (rules) {
        this.renderRulesList(platform, 'keywords', rules.keywords || []);
        this.renderRulesList(platform, 'blacklist', rules.blacklist || []);
        this.renderRulesList(platform, 'whitelist', rules.whitelist || []);
      }
    });
  }

  /**
   * 渲染规则列表
   */
  renderRulesList(platform, ruleType, rules) {
    const containerId = `${platform}-${ruleType}-list`;
    const container = document.getElementById(containerId);

    if (!container) {
      DebugLogger.log(`[ConfigManager] Container not found: ${containerId}`);
      return;
    }

    container.innerHTML = '';

    // 创建规则列表容器
    const rulesContainer = document.createElement('div');
    rulesContainer.className = 'rules-container';

    rules.forEach((rule, index) => {
      const ruleItem = this.createRuleItem(platform, ruleType, rule, index);
      rulesContainer.appendChild(ruleItem);
    });

    // 如果没有规则，显示空状态
    if (rules.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无${this.getRuleTypeName(ruleType)}规则</div>
        <div class="empty-hint">点击下方按钮添加新规则</div>
      `;
      rulesContainer.appendChild(emptyState);
    }

    container.appendChild(rulesContainer);

    // 添加"添加新规则"按钮
    const addButton = this.createAddRuleButton(platform, ruleType);
    container.appendChild(addButton);

    // 添加批量操作按钮
    if (rules.length > 0) {
      const batchActions = this.createBatchActions(platform, ruleType);
      container.appendChild(batchActions);
    }
  }

  /**
   * 创建规则项元素
   */
  createRuleItem(platform, ruleType, rule, index) {
    const div = document.createElement('div');
    div.className = 'rule-item';
    div.setAttribute('data-rule-id', rule.id || `${platform}-${ruleType}-${index}`);

    const ruleContent = document.createElement('div');
    ruleContent.className = 'rule-content';

    // 启用/禁用复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = rule.enabled;
    checkbox.className = 'rule-checkbox';
    checkbox.addEventListener('change', () => {
      this.toggleRule(platform, ruleType, index);
    });

    // 规则值输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.value = rule.value;
    input.className = 'rule-input';
    input.placeholder = `输入${this.getRuleTypeName(ruleType)}...`;
    input.addEventListener('change', () => {
      this.updateRuleValue(platform, ruleType, index, input.value);
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });

    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm rule-delete-btn';
    deleteBtn.textContent = '删除';
    deleteBtn.addEventListener('click', () => {
      this.deleteRule(platform, ruleType, index);
    });

    // 拖拽手柄
    const dragHandle = document.createElement('div');
    dragHandle.className = 'rule-drag-handle';
    dragHandle.textContent = '⋮⋮';
    dragHandle.title = '拖拽排序';

    ruleContent.appendChild(dragHandle);
    ruleContent.appendChild(checkbox);
    ruleContent.appendChild(input);
    ruleContent.appendChild(deleteBtn);

    div.appendChild(ruleContent);

    return div;
  }

  /**
   * 创建添加规则按钮
   */
  createAddRuleButton(platform, ruleType) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary btn-sm add-rule-btn';
    button.innerHTML = `
      <span class="btn-icon">+</span>
      <span class="btn-text">添加${this.getRuleTypeName(ruleType)}</span>
    `;
    button.addEventListener('click', () => {
      this.addNewRule(platform, ruleType);
    });
    return button;
  }

  /**
   * 创建批量操作按钮组
   */
  createBatchActions(platform, ruleType) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'batch-actions';

    // 全选/全不选
    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.className = 'btn btn-secondary btn-sm';
    toggleAllBtn.textContent = '全选/全不选';
    toggleAllBtn.addEventListener('click', () => {
      this.toggleAllRules(platform, ruleType);
    });

    // 删除已禁用的规则
    const deleteDisabledBtn = document.createElement('button');
    deleteDisabledBtn.className = 'btn btn-warning btn-sm';
    deleteDisabledBtn.textContent = '删除已禁用';
    deleteDisabledBtn.addEventListener('click', () => {
      this.deleteDisabledRules(platform, ruleType);
    });

    // 导入规则
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-info btn-sm';
    importBtn.textContent = '导入规则';
    importBtn.addEventListener('click', () => {
      if (window.UIManager && window.UIManager.showImportDialog) {
        window.UIManager.showImportDialog(platform, ruleType);
      }
    });

    // 导出规则
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-info btn-sm';
    exportBtn.textContent = '导出规则';
    exportBtn.addEventListener('click', () => {
      this.exportRulesToText(platform, ruleType);
    });

    // 清空所有规则
    const clearAllBtn = document.createElement('button');
    clearAllBtn.className = 'btn btn-danger btn-sm';
    clearAllBtn.textContent = '清空所有';
    clearAllBtn.addEventListener('click', () => {
      this.clearAllRules(platform, ruleType);
    });

    actionsDiv.appendChild(toggleAllBtn);
    actionsDiv.appendChild(deleteDisabledBtn);
    actionsDiv.appendChild(importBtn);
    actionsDiv.appendChild(exportBtn);
    actionsDiv.appendChild(clearAllBtn);

    return actionsDiv;
  }

  /**
   * 获取规则类型名称
   */
  getRuleTypeName(ruleType) {
    const names = {
      keywords: '关键词',
      blacklist: '黑名单',
      whitelist: '白名单'
    };
    return names[ruleType] || ruleType;
  }

  /**
   * 保存配置
   */
  saveRules() {
    DebugLogger.log('[HoyoBlock-Options] Saving rules...');

    // 保存完整配置
    const configToSave = { ...this.config };

    DebugLogger.log('[HoyoBlock-Options] Config to save:', configToSave);

    chrome.storage.sync.set(configToSave, () => {
      if (chrome.runtime.lastError) {
        console.error('[HoyoBlock-Options] Error saving config:', chrome.runtime.lastError);
        window.Utils.showMessage('保存失败: ' + chrome.runtime.lastError.message, 'error');
      } else {
        DebugLogger.log('[HoyoBlock-Options] Config saved successfully');
        window.Utils.showMessage('规则保存成功！', 'success');

        // 验证保存结果
        chrome.storage.sync.get(null, (result) => {
          DebugLogger.log('[HoyoBlock-Options] Verification - saved config:', result);
        });
      }
    });
  }

  /**
   * 重置配置为默认值
   */
  resetRules() {
    if (confirm('确认重置所有规则为默认值？')) {
      chrome.storage.sync.set(this.defaultConfig, () => {
        this.loadConfig();
        window.Utils.showMessage('规则已重置为默认值！', 'success');
      });
    }
  }

  /**
   * 导出配置
   */
  exportConfig() {
    chrome.storage.sync.get(null, (result) => {
      window.Utils.downloadJSON(result, '米游内鬼信息屏蔽插件配置.json');
      window.Utils.showMessage('配置导出成功！', 'success');
    });
  }

  /**
   * 导入配置
   * @param {Event} event 文件选择事件
   */
  async importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const config = await window.Utils.readJSONFile(file);

      chrome.storage.sync.set(config, () => {
        this.loadConfig();
        // 如果区域管理器可用，也重新加载区域列表
        if (window.AreaManager) {
          window.AreaManager.loadAreaList();
        }
        window.Utils.showMessage('配置导入成功！', 'success');
      });
    } catch (error) {
      window.Utils.showMessage(error.message, 'error');
    }
  }

  /**
   * 更新远程配置
   */
  async updateRemoteConfig() {
    if (!confirm('确认在线加载最新区域配置？\n\n⚠️ 此操作将覆盖当前的区域配置，无法恢复！')) {
      return;
    }

    window.Utils.showMessage('正在加载最新区域配置...', 'info');

    try {
      const areaList = await this.remoteManager.fetchRemoteAreaList();

      chrome.storage.sync.set({ areaList }, () => {
        if (chrome.runtime.lastError) {
          window.Utils.showMessage('保存配置失败: ' + chrome.runtime.lastError.message, 'error');
        } else {
          // 如果区域管理器可用，重新加载区域列表
          if (window.AreaManager) {
            window.AreaManager.loadAreaList();
          }
          window.Utils.showMessage(`远程配置更新成功！加载了 ${areaList.length} 个区域配置`, 'success');
        }
      });
    } catch (error) {
      console.error('[HoyoBlock-Options] Remote config update failed:', error);
      window.Utils.showMessage('远程配置更新失败: ' + error.message, 'error');
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData() {
    if (confirm('⚠️ 确认清除所有数据？此操作无法恢复！')) {
      chrome.storage.sync.clear(() => {
        chrome.storage.local.clear(() => {
          this.loadConfig();
          // 如果区域管理器可用，也重新加载区域列表
          if (window.AreaManager) {
            window.AreaManager.loadAreaList();
          }
          window.Utils.showMessage('所有数据已清除！', 'info');
        });
      });
    }
  }

  /**
   * 添加新规则
   */
  addNewRule(platform, ruleType) {
    if (!this.config.blockRules) {
      this.config.blockRules = {};
    }
    if (!this.config.blockRules[platform]) {
      this.config.blockRules[platform] = { keywords: [], blacklist: [], whitelist: [] };
    }

    const newRule = {
      value: '',
      enabled: true,
      id: this.generateRuleId()
    };
    this.config.blockRules[platform][ruleType].push(newRule);

    this.renderRulesList(platform, ruleType, this.config.blockRules[platform][ruleType]);

  }

  /**
   * 删除规则
   */
  deleteRule(platform, ruleType, index) {
    if (this.config.blockRules?.[platform]?.[ruleType]) {
      this.config.blockRules[platform][ruleType].splice(index, 1);
      this.renderRulesList(platform, ruleType, this.config.blockRules[platform][ruleType]);

    }
  }

  /**
   * 切换规则启用状态
   */
  toggleRule(platform, ruleType, index) {
    if (this.config.blockRules?.[platform]?.[ruleType]?.[index]) {
      this.config.blockRules[platform][ruleType][index].enabled =
        !this.config.blockRules[platform][ruleType][index].enabled;

    }
  }

  /**
   * 更新规则值
   */
  updateRuleValue(platform, ruleType, index, value) {
    if (this.config.blockRules?.[platform]?.[ruleType]?.[index]) {
      this.config.blockRules[platform][ruleType][index].value = value.trim();

    }
  }

  /**
   * 全选/全不选规则
   */
  toggleAllRules(platform, ruleType) {
    const rules = this.config.blockRules?.[platform]?.[ruleType];
    if (!rules) return;

    // 检查是否全部启用
    const allEnabled = rules.every(rule => rule.enabled);
    const newState = !allEnabled;

    rules.forEach(rule => {
      rule.enabled = newState;
    });

    this.renderRulesList(platform, ruleType, rules);

  }

  /**
   * 删除已禁用的规则
   */
  deleteDisabledRules(platform, ruleType) {
    const rules = this.config.blockRules?.[platform]?.[ruleType];
    if (!rules) return;

    const disabledCount = rules.filter(rule => !rule.enabled).length;
    if (disabledCount === 0) {
      window.Utils.showMessage('没有已禁用的规则', 'info');
      return;
    }

    if (confirm(`确认删除 ${disabledCount} 个已禁用的规则？`)) {
      this.config.blockRules[platform][ruleType] = rules.filter(rule => rule.enabled);
      this.renderRulesList(platform, ruleType, this.config.blockRules[platform][ruleType]);

      window.Utils.showMessage(`已删除 ${disabledCount} 个已禁用的规则`, 'success');
    }
  }

  /**
   * 清空所有规则
   */
  clearAllRules(platform, ruleType) {
    const rules = this.config.blockRules?.[platform]?.[ruleType];
    if (!rules || rules.length === 0) return;

    if (confirm(`确认清空所有${this.getRuleTypeName(ruleType)}规则？`)) {
      this.config.blockRules[platform][ruleType] = [];
      this.renderRulesList(platform, ruleType, []);

      window.Utils.showMessage(`已清空所有${this.getRuleTypeName(ruleType)}规则`, 'success');
    }
  }

  /**
   * 导入规则（从文本）
   */
  importRulesFromText(platform, ruleType, text) {
    if (!text.trim()) return;

    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    const newRules = lines.map(line => ({
      value: line,
      enabled: true,
      id: this.generateRuleId()
    }));

    if (!this.config.blockRules) {
      this.config.blockRules = {};
    }
    if (!this.config.blockRules[platform]) {
      this.config.blockRules[platform] = { keywords: [], blacklist: [], whitelist: [] };
    }

    this.config.blockRules[platform][ruleType].push(...newRules);
    this.renderRulesList(platform, ruleType, this.config.blockRules[platform][ruleType]);


    window.Utils.showMessage(`成功导入 ${newRules.length} 个规则`, 'success');
  }

  /**
   * 导出规则为文本
   */
  exportRulesToText(platform, ruleType) {
    const rules = this.config.blockRules?.[platform]?.[ruleType];
    if (!rules || rules.length === 0) {
      window.Utils.showMessage('没有规则可导出', 'info');
      return;
    }

    const text = rules
      .filter(rule => rule.enabled)
      .map(rule => rule.value)
      .join('\n');

    if (!text) {
      window.Utils.showMessage('没有启用的规则可导出', 'info');
      return;
    }

    // 复制到剪贴板
    navigator.clipboard.writeText(text).then(() => {
      window.Utils.showMessage('规则已复制到剪贴板', 'success');
    }).catch(() => {
      // 降级方案：创建文本文件下载
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${platform}-${ruleType}-rules.txt`;
      a.click();
      URL.revokeObjectURL(url);
      window.Utils.showMessage('规则已导出为文件', 'success');
    });
  }
}

// 导出配置管理器
window.ConfigManager = new OptionsConfigManager();
