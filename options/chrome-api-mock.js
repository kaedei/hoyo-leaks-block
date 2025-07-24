/**
 * Chrome API 模拟 - 用于测试环境
 */

// 模拟Chrome API用于测试
if (!window.chrome || !window.chrome.storage) {
  DebugLogger.log('[HoyoBlock-Options] Creating mock Chrome API for testing...');

  window.chrome = {
    storage: {
      sync: {
        get: function (keys, callback) {
          // 模拟数据
          const mockData = {
            areaList: [
              {
                name: "Bilibili视频卡片",
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
            ]
          };

          setTimeout(() => {
            callback(keys === null ? mockData :
              (Array.isArray(keys) ?
                keys.reduce((result, key) => {
                  result[key] = mockData[key];
                  return result;
                }, {}) :
                { [keys]: mockData[keys] }
              )
            );
          }, 100);
        },
        set: function (items, callback) {
          DebugLogger.log('[HoyoBlock-Options] Mock storage set:', items);
          setTimeout(() => {
            if (callback) callback();
          }, 100);
        },
        clear: function (callback) {
          DebugLogger.log('[HoyoBlock-Options] Mock storage clear');
          setTimeout(() => {
            if (callback) callback();
          }, 100);
        }
      },
      local: {
        clear: function (callback) {
          DebugLogger.log('[HoyoBlock-Options] Mock local storage clear');
          setTimeout(() => {
            if (callback) callback();
          }, 100);
        }
      }
    },
    runtime: {
      lastError: null
    },
    i18n: {
      getMessage: function (key, substitutions) {
        // 模拟的本地化数据（英文）
        const messages = {
          'name': 'HoYo Leaks Block',
          'description': 'Block HoYo games leak content on Bilibili, YouTube, Twitter and other platforms',
          'options_title': 'HoYo Leaks Block - Settings',
          'options_subtitle': 'Configure blocking rules and manage area settings',
          'nav_rules': '🛡️ Blocking Rules',
          'nav_areas': '📍 Area Management',
          'nav_import_export': '📦 Import/Export',
          'nav_about': 'ℹ️ About',
          'rules_title': 'Blocking Rules Configuration',
          'platform_bilibili': 'Bilibili',
          'platform_youtube': 'YouTube',
          'platform_twitter': 'Twitter',
          'keywords_label': 'Block Keywords (separated by |)',
          'keywords_placeholder_bili': 'e.g.: 内鬼|爆料|泄露|leak|beta',
          'keywords_placeholder_ytb': 'e.g.: leak|beta|insider|spoiler',
          'keywords_placeholder_twitter': 'e.g.: leak|beta|insider|spoiler',
          'blacklist_label': 'Author Blacklist (separated by |)',
          'blacklist_placeholder_bili': 'e.g.: username1|username2',
          'blacklist_placeholder_ytb': 'e.g.: channel1|channel2',
          'blacklist_placeholder_twitter': 'e.g.: @user1|@user2',
          'whitelist_label': 'Author Whitelist (separated by |)',
          'whitelist_placeholder_bili': 'e.g.: official|trusted_user',
          'whitelist_placeholder_ytb': 'e.g.: official_channel|trusted_channel',
          'whitelist_placeholder_twitter': 'e.g.: @official|@trusted',
          'btn_save_rules': 'Save Rules',
          'btn_reset_rules': 'Reset to Default',
          'areas_title': 'Area Management',
          'areas_subtitle': 'Manage blocking area settings for different platforms',
          'area_name': 'Area Name',
          'area_platform': 'Platform',
          'area_status': 'Status',
          'area_actions': 'Actions',
          'btn_add_area': 'Add Area',
          'btn_refresh_areas': 'Refresh Areas',
          'btn_update_remote': 'Update Remote Area Config',
          'import_export_title': 'Import/Export Configuration',
          'export_section_title': 'Export Configuration',
          'export_description': 'Export current configuration as JSON file',
          'btn_export': 'Export Configuration',
          'import_section_title': 'Import Configuration',
          'import_description': 'Import configuration from JSON file',
          'btn_import': 'Select File to Import',
          'clear_section_title': 'Clear All Data',
          'clear_warning': '⚠️ This operation will clear all configurations and data, cannot be undone',
          'btn_clear_all': 'Clear All Data',
          'about_title': 'About',
          'about_author': 'Author: kaedei',
          'about_version': 'Version: 103.0',
          'about_description': 'This is a browser extension for blocking HoYo games leak content on Bilibili, YouTube, Twitter and other platforms.',
          'features_title': 'Features',
          'feature_1': 'Multi-platform content blocking',
          'feature_2': 'Custom keywords and user blocking',
          'feature_3': 'Whitelist mechanism',
          'feature_4': 'Area management',
          'feature_5': 'Configuration import/export',
          'usage_title': 'Usage',
          'usage_1': 'Configure keywords and users to block in "Blocking Rules"',
          'usage_2': 'Manage blocking areas for different platforms in "Area Management"',
          'usage_3': 'Support configuration file import/export',
          'usage_4': 'Remote area configuration update available',
          'contact_title': 'Contact',
          'contact_description': 'For questions or suggestions, please visit:',
          'github_link': 'GitHub Project Page',
          'footer_text': '2025 (c) HoYo Leaks Block',
          'popup_subtitle': 'Block Genshin Impact, Honkai Star Rail leak content',
          'platform_bilibili_short': 'Bilibili',
          'btn_settings': 'Settings',
          'btn_refresh': 'Refresh Page',
          'btn_clear_cache': 'Clear Cache',
          'stat_today': 'Today Blocked',
          'stat_total': 'Total Blocked',
          'version': 'Version 103.0',
          'help_link': 'Help Documentation',
          'block_button': 'HoYo Leaks Block'
        };

        const message = messages[key];
        if (message && substitutions) {
          if (Array.isArray(substitutions)) {
            return substitutions.reduce((result, sub, index) => {
              return result.replace(`$${index + 1}`, sub);
            }, message);
          } else {
            return message.replace('$1', substitutions);
          }
        }
        return message || key;
      },
      getUILanguage: function () {
        return navigator.language || 'en';
      }
    }
  };
}
