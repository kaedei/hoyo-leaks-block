// 设置页面脚本
document.addEventListener('DOMContentLoaded', function () {
  initOptionsPage();
});

function initOptionsPage() {
  // 初始化标签页切换
  initTabNavigation();

  // 加载配置
  loadConfig();

  // 绑定事件监听器
  bindEventListeners();

  // 加载区域列表
  loadAreaList();
}

function initTabNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const targetTab = this.dataset.tab;

      // 移除所有活动状态
      navItems.forEach(nav => nav.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // 添加活动状态
      this.classList.add('active');
      document.getElementById(targetTab + '-tab').classList.add('active');
    });
  });
}

function loadConfig() {
  chrome.storage.sync.get(null, function (result) {
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
  });
}

function bindEventListeners() {
  // 保存规则按钮
  document.getElementById('save-rules').addEventListener('click', saveRules);

  // 重置规则按钮
  document.getElementById('reset-rules').addEventListener('click', resetRules);

  // 导出配置按钮
  document.getElementById('export-config').addEventListener('click', exportConfig);

  // 导入配置按钮
  document.getElementById('import-config').addEventListener('click', function () {
    document.getElementById('import-file').click();
  });

  // 文件选择处理
  document.getElementById('import-file').addEventListener('change', importConfig);

  // 远程更新按钮
  document.getElementById('update-remote').addEventListener('click', updateRemoteConfig);

  // 清除所有数据按钮
  document.getElementById('clear-all').addEventListener('click', clearAllData);

  // 添加区域按钮
  document.getElementById('add-area').addEventListener('click', addArea);

  // 刷新区域按钮
  document.getElementById('refresh-areas').addEventListener('click', loadAreaList);
}

function saveRules() {
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

  chrome.storage.sync.set(config, function () {
    showMessage('规则保存成功！', 'success');
  });
}

function resetRules() {
  if (confirm('确认重置所有规则为默认值？')) {
    // 设置默认值
    const defaultConfig = {
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

    chrome.storage.sync.set(defaultConfig, function () {
      loadConfig();
      showMessage('规则已重置为默认值！', 'success');
    });
  }
}

function exportConfig() {
  chrome.storage.sync.get(null, function (result) {
    const configData = JSON.stringify(result, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = '米哈游内鬼屏蔽插件配置.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('配置导出成功！', 'success');
  });
}

function importConfig(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const config = JSON.parse(e.target.result);

      chrome.storage.sync.set(config, function () {
        loadConfig();
        loadAreaList();
        showMessage('配置导入成功！', 'success');
      });
    } catch (error) {
      showMessage('配置文件格式错误！', 'error');
    }
  };
  reader.readAsText(file);
}

function updateRemoteConfig() {
  const apiUrl = 'https://lcybff.github.io/helper/mihoyoLeaksBlock/arealist.json';

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.arealist) {
        chrome.storage.sync.set({ areaList: data.arealist }, function () {
          loadAreaList();
          showMessage('远程配置更新成功！', 'success');
        });
      }
    })
    .catch(error => {
      showMessage('远程配置更新失败！', 'error');
    });
}

function clearAllData() {
  if (confirm('⚠️ 确认清除所有数据？此操作无法恢复！')) {
    chrome.storage.sync.clear(function () {
      chrome.storage.local.clear(function () {
        loadConfig();
        loadAreaList();
        showMessage('所有数据已清除！', 'info');
      });
    });
  }
}

function loadAreaList() {
  chrome.storage.sync.get(['areaList'], function (result) {
    const areaList = result.areaList || [];
    const container = document.getElementById('area-items');
    container.innerHTML = '';

    areaList.forEach((area, index) => {
      const areaItem = document.createElement('div');
      areaItem.className = 'area-item';
      areaItem.innerHTML = `
        <div>${area.name}</div>
        <div>${getPlatformDisplayName(area.area)}</div>
        <div>
          <span class="status-indicator ${area.on ? 'status-active' : 'status-inactive'}">
            ${area.on ? '启用' : '禁用'}
          </span>
        </div>
        <div class="area-actions">
          <button onclick="toggleArea(${index})" class="btn btn-primary">
            ${area.on ? '禁用' : '启用'}
          </button>
          <button onclick="editArea(${index})" class="btn btn-secondary">编辑</button>
          <button onclick="deleteArea(${index})" class="btn btn-danger">删除</button>
        </div>
      `;
      container.appendChild(areaItem);
    });
  });
}

function getPlatformDisplayName(platform) {
  const names = {
    'bilibili': 'B站',
    'youtube': 'YouTube',
    'twitter': 'Twitter'
  };
  return names[platform] || platform;
}

function toggleArea(index) {
  chrome.storage.sync.get(['areaList'], function (result) {
    const areaList = result.areaList || [];
    areaList[index].on = !areaList[index].on;

    chrome.storage.sync.set({ areaList }, function () {
      loadAreaList();
      showMessage(`区域 ${areaList[index].name} 已${areaList[index].on ? '启用' : '禁用'}`, 'success');
    });
  });
}

function editArea(index) {
  // 这里可以实现编辑区域的功能
  showMessage('编辑功能开发中...', 'info');
}

function deleteArea(index) {
  if (confirm('确认删除此区域？')) {
    chrome.storage.sync.get(['areaList'], function (result) {
      const areaList = result.areaList || [];
      areaList.splice(index, 1);

      chrome.storage.sync.set({ areaList }, function () {
        loadAreaList();
        showMessage('区域已删除！', 'success');
      });
    });
  }
}

function addArea() {
  // 这里可以实现添加区域的功能
  showMessage('添加功能开发中...', 'info');
}

function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.classList.add('show');

  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 3000);
}

// 全局函数供HTML调用
window.toggleArea = toggleArea;
window.editArea = editArea;
window.deleteArea = deleteArea;
