# 米游内鬼信息屏蔽 (Hoyo Leaks Block)

> **致谢**: 本项目基于 B 站大佬 @凡云 开发的原始 Tampermonkey 脚本重构而成，感谢原作者的开源贡献！
> 原项目地址：https://github.com/LCYBFF/genshinLeaksBlock

这是一个专为米哈游（Hoyoverse）旗下游戏（如原神、星穹铁道、绝区零等）玩家设计的浏览器扩展，能够在 B 站、YouTube、Twitter（x.com）等主流社交平台上自动屏蔽与“内鬼爆料、黑流量”相关的内容。

## 功能特点

- 🛡️ **多平台支持**：B 站、YouTube、Twitter（x.com）
- 🔍 **智能识别**：关键词与用户名自动识别爆料内容
- ⚡ **实时屏蔽**：页面内容实时监控与自动屏蔽
- 📝 **自定义规则**：支持自定义关键词、黑白名单
- 🎯 **区域管理**：可视化管理屏蔽区域，精准控制
- 💾 **配置管理**：支持导入导出、远程更新与云同步
- 🎨 **现代 UI**：简洁直观的设置与弹窗界面
- 📊 **统计功能**：统计屏蔽内容数量
- 🛠️ **性能优化**：防抖/节流，低资源占用
- 🔐 **数据安全**：本地存储，不上传用户数据
- 🌐 **国际化支持**：多语言界面（简体中文、繁体中文、英语、日语等）

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
│   └── block-core.js          # 核心屏蔽逻辑
├── content-scripts/
│   ├── bilibili.js            # B站内容脚本
│   ├── youtube.js             # YouTube内容脚本
│   └── twitter.js             # Twitter内容脚本
├── popup/
│   ├── popup.html             # 弹窗页面
│   ├── popup.css              # 弹窗样式
│   └── popup.js               # 弹窗脚本
├── options/
│   ├── options.html           # 设置页面
│   ├── options.css            # 设置样式
│   ├── options.js             # 设置脚本
│   ├── area-manager.js        # 区域管理
│   ├── config-manager.js      # 配置管理
│   ├── chrome-api-mock.js     # Chrome API Mock
│   ├── ui-manager.js          # UI 管理
│   └── utils.js               # 工具函数
├── styles/
│   └── block-styles.css       # 屏蔽样式
├── icons/                     # 图标
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon512.png
├── build.bat / build.sh       # 构建脚本
├── hoyo-leaks-block.zip       # 打包文件
├── README.md                  # 说明文档
├── CHANGELOG.md               # 更新日志
└── LICENSE                    # 许可证
```

## 开发说明

- **技术栈**：Manifest V3、原生 JavaScript、CSS3、Chrome Storage API
- **模块化设计**：核心功能独立，易于维护
- **平台适配**：针对不同平台的特殊处理
- **实时更新**：配置修改后立即生效
- **性能优化**：防抖/节流，低资源占用
- **开发建议**：
  1. 需安装 Node.js（用于格式化/打包）
  2. 推荐使用 VS Code
  3. 构建命令：`build.bat` 或 `npm run build`
  4. 依赖安装：`npm install`

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
