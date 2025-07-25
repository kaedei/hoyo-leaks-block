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
  }

  /**
   * 加载规则到UI
   */
  loadRulesToUI() {
    const platforms = ['bilibili', 'youtube', 'twitter'];

    platforms.forEach(platform => {
      const rules = this.config.blockRules?.[platform];
      if (rules) {
        this.renderTagList(platform, 'keywords', rules.keywords || []);
        this.renderTagList(platform, 'blacklist', rules.blacklist || []);
        this.renderTagList(platform, 'whitelist', rules.whitelist || []);
      }
    });
  }

  /**
   * 渲染Tag列表
   */
  renderTagList(platform, ruleType, rules) {
    const containerId = `${platform}-${ruleType}-list`;
    const container = document.getElementById(containerId);

    if (!container) {
      DebugLogger.log(`[ConfigManager] Container not found: ${containerId}`);
      return;
    }

    container.innerHTML = '';
    container.className = 'tag-container';

    // 创建Tag容器
    const tagsWrapper = document.createElement('div');
    tagsWrapper.className = 'tags-wrapper';

    // 渲染现有的Tags
    rules.forEach((rule, index) => {
      if (rule && rule.trim()) {
        const tag = this.createTag(platform, ruleType, rule, index);
        tagsWrapper.appendChild(tag);
      }
    });

    // 创建输入框
    const inputContainer = this.createTagInput(platform, ruleType);
    tagsWrapper.appendChild(inputContainer);

    container.appendChild(tagsWrapper);

    // 如果没有规则，显示提示信息
    if (rules.length === 0) {
      const hint = document.createElement('div');
      hint.className = 'tag-hint';
      hint.textContent = chrome.i18n.getMessage('rule_empty_hint').replace('{type}', this.getRuleTypeName(ruleType));
      container.appendChild(hint);
    }
  }

  /**
   * 创建Tag元素
   */
  createTag(platform, ruleType, text, index) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `
      <span class="tag-text">${this.escapeHtml(text)}</span>
      <span class="tag-close" data-platform="${platform}" data-type="${ruleType}" data-index="${index}">×</span>
    `;

    // 绑定删除事件
    const closeBtn = tag.querySelector('.tag-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeTag(platform, ruleType, index);
    });

    return tag;
  }

  /**
   * 创建Tag输入框
   */
  createTagInput(platform, ruleType) {
    const container = document.createElement('div');
    container.className = 'tag-input-container';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tag-input';
    input.placeholder = chrome.i18n.getMessage('add_rule_placeholder').replace('{type}', this.getRuleTypeName(ruleType));

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'tag-add-btn';
    addBtn.textContent = chrome.i18n.getMessage('btn_add');

    // 绑定事件
    const addTag = () => {
      const value = input.value.trim();
      if (value) {
        this.addTag(platform, ruleType, value);
        input.value = '';
        input.focus();
      }
    };

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    });

    addBtn.addEventListener('click', addTag);

    container.appendChild(input);
    container.appendChild(addBtn);

    return container;
  }

  /**
   * 添加Tag
   */
  addTag(platform, ruleType, value) {
    if (!this.config.blockRules) {
      this.config.blockRules = {};
    }
    if (!this.config.blockRules[platform]) {
      this.config.blockRules[platform] = { keywords: [], blacklist: [], whitelist: [] };
    }

    const rules = this.config.blockRules[platform][ruleType];

    // 检查是否已存在
    if (rules.includes(value)) {
      window.Utils.showMessage(chrome.i18n.getMessage('rule_already_exists').replace('{value}', value), 'warning');
      return;
    }

    rules.push(value);
    this.renderTagList(platform, ruleType, rules);
  }

  /**
   * 删除Tag
   */
  removeTag(platform, ruleType, index) {
    if (this.config.blockRules?.[platform]?.[ruleType]) {
      const rules = this.config.blockRules[platform][ruleType];
      const removedItem = rules[index];
      rules.splice(index, 1);
      this.renderTagList(platform, ruleType, rules);

      if (removedItem) {
        window.Utils.showMessage(chrome.i18n.getMessage('rule_deleted').replace('{item}', removedItem), 'success');
      }
    }
  }

  /**
   * HTML转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 获取规则类型名称
   */
  getRuleTypeName(ruleType) {
    const names = {
      keywords: chrome.i18n.getMessage('rule_type_keywords'),
      blacklist: chrome.i18n.getMessage('rule_type_blacklist'),
      whitelist: chrome.i18n.getMessage('rule_type_whitelist')
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
        window.Utils.showMessage(chrome.i18n.getMessage('save_failed').replace('{error}', chrome.runtime.lastError.message), 'error');
      } else {
        DebugLogger.log('[HoyoBlock-Options] Config saved successfully');
        window.Utils.showMessage(chrome.i18n.getMessage('rules_saved'), 'success');

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
    if (confirm(chrome.i18n.getMessage('confirm_reset_rules'))) {
      chrome.storage.sync.set(this.defaultConfig, () => {
        this.loadConfig();
        window.Utils.showMessage(chrome.i18n.getMessage('rules_reset'), 'success');
      });
    }
  }

  /**
   * 导出配置
   */
  exportConfig() {
    chrome.storage.sync.get(null, (result) => {
      window.Utils.downloadJSON(result, chrome.i18n.getMessage('config_filename'));
      window.Utils.showMessage(chrome.i18n.getMessage('config_exported'), 'success');
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
        window.Utils.showMessage(chrome.i18n.getMessage('config_imported'), 'success');
      });
    } catch (error) {
      window.Utils.showMessage(error.message, 'error');
    }
  }

  /**
   * 更新远程配置
   */
  async updateRemoteConfig() {
    if (!confirm(chrome.i18n.getMessage('confirm_load_remote_config'))) {
      return;
    }

    window.Utils.showMessage(chrome.i18n.getMessage('loading_remote_config'), 'info');

    try {
      const areaList = await this.remoteManager.fetchRemoteAreaList();

      chrome.storage.sync.set({ areaList }, () => {
        if (chrome.runtime.lastError) {
          window.Utils.showMessage(chrome.i18n.getMessage('save_config_failed').replace('{error}', chrome.runtime.lastError.message), 'error');
        } else {
          // 如果区域管理器可用，重新加载区域列表
          if (window.AreaManager) {
            window.AreaManager.loadAreaList();
          }
          window.Utils.showMessage(chrome.i18n.getMessage('remote_config_success').replace('{count}', areaList.length), 'success');
        }
      });
    } catch (error) {
      console.error('[HoyoBlock-Options] Remote config update failed:', error);
      window.Utils.showMessage(chrome.i18n.getMessage('remote_config_failed').replace('{error}', error.message), 'error');
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData() {
    if (confirm(chrome.i18n.getMessage('confirm_clear_all_data'))) {
      chrome.storage.sync.clear(() => {
        chrome.storage.local.clear(() => {
          this.loadConfig();
          // 如果区域管理器可用，也重新加载区域列表
          if (window.AreaManager) {
            window.AreaManager.loadAreaList();
          }
          window.Utils.showMessage(chrome.i18n.getMessage('all_data_cleared'), 'info');
        });
      });
    }
  }

  /**
   * 批量导入规则（从文本）
   */
  importRulesFromText(platform, ruleType, text) {
    if (!text.trim()) return;

    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    const existingRules = this.config.blockRules[platform][ruleType];
    const newRules = lines.filter(line => !existingRules.includes(line));

    if (newRules.length === 0) {
      window.Utils.showMessage(chrome.i18n.getMessage('no_new_rules'), 'info');
      return;
    }

    this.config.blockRules[platform][ruleType].push(...newRules);
    this.renderTagList(platform, ruleType, this.config.blockRules[platform][ruleType]);

    window.Utils.showMessage(chrome.i18n.getMessage('rules_imported_count').replace('{count}', newRules.length), 'success');
  }

  /**
   * 导出规则为文本
   */
  exportRulesToText(platform, ruleType) {
    const rules = this.config.blockRules?.[platform]?.[ruleType];
    if (!rules || rules.length === 0) {
      window.Utils.showMessage(chrome.i18n.getMessage('no_rules_to_export'), 'info');
      return;
    }

    const text = rules.join('\n');

    // 复制到剪贴板
    navigator.clipboard.writeText(text).then(() => {
      window.Utils.showMessage(chrome.i18n.getMessage('rules_copied'), 'success');
    }).catch(() => {
      // 降级方案：创建文本文件下载
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${platform}-${ruleType}-rules.txt`;
      a.click();
      URL.revokeObjectURL(url);
      window.Utils.showMessage(chrome.i18n.getMessage('rules_exported_file'), 'success');
    });
  }

  /**
   * 清空指定类型的所有规则
   */
  clearAllRules(platform, ruleType) {
    const rules = this.config.blockRules?.[platform]?.[ruleType];
    if (!rules || rules.length === 0) return;

    if (confirm(chrome.i18n.getMessage('confirm_clear_rules').replace('{type}', this.getRuleTypeName(ruleType)))) {
      this.config.blockRules[platform][ruleType] = [];
      this.renderTagList(platform, ruleType, []);
      window.Utils.showMessage(chrome.i18n.getMessage('rules_cleared').replace('{type}', this.getRuleTypeName(ruleType)), 'success');
    }
  }

  /**
   * 从云端同步规则
   */
  async syncRemoteRules() {
    try {
      // 显示确认对话框
      if (!confirm(chrome.i18n.getMessage('sync_remote_confirm'))) {
        return;
      }

      // 显示加载提示
      window.Utils.showMessage(chrome.i18n.getMessage('sync_remote_loading'), 'info');

      // 执行同步
      const result = await this.syncWithRemoteConfig(false);

      if (result.success) {
        // 重新加载UI
        this.loadRulesToUI();

        // 显示成功消息
        const message = chrome.i18n.getMessage('sync_remote_success')
          .replace('{merged}', result.mergedCount)
          .replace('{skipped}', result.skippedCount);

        window.Utils.showMessage(message, 'success');
      } else {
        // 显示错误消息
        const message = chrome.i18n.getMessage('sync_remote_error')
          .replace('{error}', result.error);

        window.Utils.showMessage(message, 'error');
      }
    } catch (error) {
      console.error('[ConfigManager] Sync remote rules failed:', error);
      const message = chrome.i18n.getMessage('sync_remote_error')
        .replace('{error}', error.message);

      window.Utils.showMessage(message, 'error');
    }
  }
}

// 导出配置管理器
window.ConfigManager = new OptionsConfigManager();
