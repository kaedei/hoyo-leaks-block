![](icons/icon128.png)

# 米游内鬼信息屏蔽 (Hoyo Leaks Block)

**Language / 语言**：中文 | [English](README_EN.md)

## 简介

这是一个专为米哈游（Hoyoverse）旗下游戏（如原神、星穹铁道、绝区零等）玩家设计的浏览器扩展，能够在 B 站、YouTube、Twitter（x.com）等主流社交平台上自动屏蔽与“内鬼爆料、黑流量”相关的内容。

> **致谢**: 本项目基于 B 站大佬 @凡云 开发的原始 Tampermonkey 脚本重构而成，感谢原作者的开源贡献！原项目地址：https://github.com/LCYBFF/genshinLeaksBlock

## 使用方法

1. 安装扩展后，页面右侧会出现蓝色悬浮按钮
2. 点击浏览器工具栏图标可快速开关屏蔽功能
3. 点击悬浮按钮或右键菜单进入"选项"页面
4. 在设置页面自定义关键词、黑白名单、区域等
5. 使用"在线加载最新区域配置"获取最新的屏蔽规则

## 配置说明

- **屏蔽关键词**：用 `|` 分隔多个关键词，如 `内鬼|爆料|leak|beta`
- **作者黑名单/白名单**：用 `|` 分隔用户名
- **区域管理**：可视化开关、编辑、删除各平台屏蔽区域
- **配置导入导出**：支持 JSON 文件导入导出，远程更新
- **远程配置**：自动获取最新区域配置，保持屏蔽规则更新
- **调试模式**：开发者可在 `core/constants.js` 中启用调试日志

详细的区域配置说明请参考：[区域配置指南](docs/AREA_CONFIGURATION_GUIDE.md)

## 功能特点

- 🛡️ **多个社交平台支持**：Bilibili、YouTube、Twitter（x.com）
- 🔍 **智能识别**：关键词与用户名自动识别爆料内容
- ⚡ **实时屏蔽**：页面内容实时监控与自动屏蔽
- 📝 **自定义规则**：支持自定义关键词、黑白名单
- 🎯 **区域管理**：可视化管理屏蔽区域，精准控制
- 💾 **配置管理**：支持导入导出、远程更新与云同步
- 🌐 **远程配置**：在线获取最新区域配置和屏蔽规则
- 🎨 **现代 UI**：简洁直观的设置与弹窗界面
- 📊 **统计功能**：统计屏蔽内容数量（每日/总计）
- 🛠️ **性能优化**：防抖/节流，低资源占用
- 🔐 **数据安全**：本地存储，不上传用户数据
- � **国际化支持**：多语言界面（简体中文、繁体中文、英语、日语等）
- 📋 **调试支持**：完整的调试日志系统

## 安装方法

### 从源码安装

1. 下载或克隆本项目到本地
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启“开发者模式”
4. 点击“加载已解压的扩展程序”，选择项目文件夹

### 支持的浏览器

- Chrome 88+
- Edge 88+
- 其他 Chromium 内核浏览器

## 使用方法

1. 安装扩展后，页面右侧会出现蓝色悬浮按钮
2. 点击浏览器工具栏图标可快速开关屏蔽功能
3. 点击悬浮按钮或右键菜单进入“选项”页面
4. 在设置页面自定义关键词、黑白名单、区域等

## 配置说明

- **屏蔽关键词**：用 `|` 分隔多个关键词，如 `内鬼|爆料|leak|beta`
- **作者黑名单/白名单**：用 `|` 分隔用户名
- **区域管理**：可视化开关、编辑、删除各平台屏蔽区域
- **配置导入导出**：支持 JSON 文件导入导出，远程更新

## 文件结构

```
hoyo-leaks-block/
├── manifest.json              # 扩展清单
├── background.js              # 后台脚本
├── core/
│   ├── block-core.js          # 核心屏蔽逻辑
│   ├── config-manager.js      # 配置管理
│   ├── constants.js           # 常量定义
│   ├── content-blocker.js     # 内容屏蔽器
│   ├── debug-logger.js        # 调试日志管理
│   ├── remote-config-manager.js # 远程配置管理
│   ├── stats-manager.js       # 统计数据管理
│   ├── ui-manager.js          # UI 管理
│   └── utils.js               # 工具函数
├── content-scripts/
│   ├── bilibili.js            # Bilibili内容脚本
│   ├── youtube.js             # YouTube内容脚本
│   └── twitter.js             # Twitter内容脚本
├── shared/
│   ├── base-config-manager.js # 基础配置管理
│   └── utils.js               # 共享工具函数
├── popup/
│   ├── popup.html             # 弹窗页面
│   ├── popup.css              # 弹窗样式
│   ├── popup.js               # 弹窗脚本
│   └── i18n.js                # 国际化支持
├── options/
│   ├── options.html           # 设置页面
│   ├── options.css            # 设置样式
│   ├── options.js             # 设置脚本
│   ├── area-manager.js        # 区域管理
│   ├── config-manager.js      # 配置管理
│   ├── chrome-api-mock.js     # Chrome API Mock
│   ├── i18n-manager.js        # 国际化管理
│   ├── ui-manager.js          # UI 管理
│   └── utils.js               # 工具函数
├── _locales/                  # 国际化资源
│   ├── en/messages.json       # 英语
│   ├── ja/messages.json       # 日语
│   ├── zh_CN/messages.json    # 简体中文
│   └── zh_TW/messages.json    # 繁体中文
├── config/
│   └── arealist.json          # 区域配置文件
├── styles/
│   └── block-styles.css       # 屏蔽样式
├── icons/                     # 图标
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon512.png
├── docs/
│   └── AREA_CONFIGURATION_GUIDE.md # 区域配置指南
├── test/                      # 测试文件
│   ├── i18n-test.html
│   └── title-test.html
├── build.bat / build.sh       # 构建脚本
├── hoyo-leaks-block.zip       # 打包文件
├── README.md                  # 说明文档
├── README_EN.md               # 英文说明
├── CHANGELOG.md               # 更新日志
└── LICENSE                    # 许可证
```

## 开发说明

- **技术栈**：Manifest V3、原生 JavaScript、CSS3、Chrome Storage API
- **模块化设计**：核心功能独立，易于维护和扩展
- **共享基础**：使用 `shared/` 目录存放公共模块，提高代码复用性
- **平台适配**：针对不同平台的特殊处理和优化
- **实时更新**：配置修改后立即生效，支持远程配置更新
- **性能优化**：防抖/节流技术，低资源占用
- **调试支持**：完整的调试日志系统，便于开发和问题定位
- **国际化**：完善的多语言支持机制
- **开发建议**：
  1. 需安装 Node.js（用于格式化/打包）
  2. 推荐使用 VS Code
  3. 构建命令：`build.bat` 或 `npm run build`
  4. 依赖安装：`npm install`
  5. 开发模式：修改 `core/constants.js` 中的 `DEBUG_MODE` 启用调试

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)

## 问题反馈

- 在 [GitHub Issues](https://github.com/kaedei/hoyo-leaks-block/issues) 提交问题或建议
- 请附详细错误信息、复现步骤、浏览器与操作系统版本

## 许可证

MIT License

## 鸣谢

感谢原 Tampermonkey 脚本作者及所有贡献者！

---

**注意**：本扩展仅供个人学习与研究，请遵守相关平台条款。
