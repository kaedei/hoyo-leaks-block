/**
 * 配置管理模块
 */

/**
 * 配置管理器
 */
class ConfigManager {
  constructor() {
    this.defaultConfig = {
      blockTitleBili: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开',
      blockUsersBili: '',
      blockUsersWhiteBili: '',
      blockTitleYtb: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开',
      blockUsersYtb: '',
      blockUsersWhiteYtb: '',
      blockTitleTwitter: '内鬼|爆料|泄露|leak|beta|测试服|内部|剧透|预告|未公开',
      blockUsersTwitter: '',
      blockUsersWhiteTwitter: ''
    };
  }

  /**
   * 加载配置到UI
   */
  loadConfig() {
    console.log('[HoyoBlock-Options] Loading configuration...');

    chrome.storage.sync.get(null, (result) => {
      console.log('[HoyoBlock-Options] Raw config loaded:', result);

      // 加载B站配置
      document.getElementById('bili-title').value = result.blockTitleBili || '';
      document.getElementById('bili-users').value = result.blockUsersBili || '';
      document.getElementById('bili-whitelist').value = result.blockUsersWhiteBili || '';

      // 加载YouTube配置
      document.getElementById('ytb-title').value = result.blockTitleYtb || '';
      document.getElementById('ytb-users').value = result.blockUsersYtb || '';
      document.getElementById('ytb-whitelist').value = result.blockUsersWhiteYtb || '';

      // 加载Twitter配置
      document.getElementById('twitter-title').value = result.blockTitleTwitter || '';
      document.getElementById('twitter-users').value = result.blockUsersTwitter || '';
      document.getElementById('twitter-whitelist').value = result.blockUsersWhiteTwitter || '';

      console.log('[HoyoBlock-Options] Configuration loaded to UI');
    });
  }

  /**
   * 保存配置
   */
  saveRules() {
    console.log('[HoyoBlock-Options] Saving rules...');

    const config = {
      blockTitleBili: document.getElementById('bili-title').value,
      blockUsersBili: document.getElementById('bili-users').value,
      blockUsersWhiteBili: document.getElementById('bili-whitelist').value,

      blockTitleYtb: document.getElementById('ytb-title').value,
      blockUsersYtb: document.getElementById('ytb-users').value,
      blockUsersWhiteYtb: document.getElementById('ytb-whitelist').value,

      blockTitleTwitter: document.getElementById('twitter-title').value,
      blockUsersTwitter: document.getElementById('twitter-users').value,
      blockUsersWhiteTwitter: document.getElementById('twitter-whitelist').value
    };

    console.log('[HoyoBlock-Options] Config to save:', config);

    chrome.storage.sync.set(config, () => {
      if (chrome.runtime.lastError) {
        console.error('[HoyoBlock-Options] Error saving config:', chrome.runtime.lastError);
        window.Utils.showMessage('保存失败: ' + chrome.runtime.lastError.message, 'error');
      } else {
        console.log('[HoyoBlock-Options] Config saved successfully');
        window.Utils.showMessage('规则保存成功！', 'success');

        // 验证保存结果
        chrome.storage.sync.get(null, (result) => {
          console.log('[HoyoBlock-Options] Verification - saved config:', result);
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
  updateRemoteConfig() {
    if (!confirm('确认在线加载最新区域配置？\n\n⚠️ 此操作将覆盖当前的区域配置，无法恢复！')) {
      return;
    }

    window.Utils.showMessage('正在加载最新区域配置...', 'info');

    const apiUrl = 'https://lcybff.github.io/helper/mihoyoLeaksBlock/arealist.json';

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络请求失败');
        }
        return response.json();
      })
      .then(data => {
        if (data.arealist && Array.isArray(data.arealist)) {
          chrome.storage.sync.set({ areaList: data.arealist }, () => {
            if (chrome.runtime.lastError) {
              window.Utils.showMessage('保存配置失败: ' + chrome.runtime.lastError.message, 'error');
            } else {
              // 如果区域管理器可用，重新加载区域列表
              if (window.AreaManager) {
                window.AreaManager.loadAreaList();
              }
              window.Utils.showMessage(`远程配置更新成功！加载了 ${data.arealist.length} 个区域配置`, 'success');
            }
          });
        } else {
          window.Utils.showMessage('远程配置数据格式错误！', 'error');
        }
      })
      .catch(error => {
        console.error('[HoyoBlock-Options] Remote config update failed:', error);
        window.Utils.showMessage('远程配置更新失败: ' + error.message, 'error');
      });
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
}

// 导出配置管理器
window.ConfigManager = new ConfigManager();
