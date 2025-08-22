![](icons/icon128.png)

# 米游内鬼信息屏蔽 (Hoyo Leaks Block)

**Language / 语言**：中文 | [English](README_EN.md) | [繁體中文](README_ZHT.md) | [日本語](README_JA.md)

## 简介

这是一个专为米哈游旗下游戏（如原神、星穹铁道、绝区零等）玩家设计的浏览器扩展，能够在 B 站、YouTube、Twitter（x.com）等主流社交平台上自动屏蔽与“内鬼爆料、黑流量”相关的内容。

> **致谢**: 本项目基于 B 站大佬 @凡云 开发的原始 Tampermonkey 脚本重构而成，感谢原作者的开源贡献！原项目地址：https://github.com/LCYBFF/genshinLeaksBlock

## 立刻使用

- Chrome 浏览器： [Chrome 应用商店](https://chromewebstore.google.com/detail/dpomdmennbkghcafeplkkhbejoneccal?utm_source=item-share-cb)
- Edge 浏览器： [获取 Microsoft Edge 扩展](https://microsoftedge.microsoft.com/addons/detail/lkecpfnoeafijacmohjpffiekijjkmip)

## 使用方法

1. 安装扩展后，浏览受支持的网站时，页面右侧会出现蓝色悬浮按钮
   ![](docs/images/2025-08-22-09-52-35.png)
2. 点击悬浮按钮或浏览器工具栏图标可进入设置页面
   ![](docs/images/2025-08-22-09-54-20.png)
3. 在设置页面自定义关键词、黑白名单、区域等
   ![](docs/images/2025-08-22-09-55-41.png)
4. 使用"从云端同步规则"获取最新的屏蔽规则
   ![](docs/images/2025-08-22-09-56-30.png)
5. 在页面中即可看到屏蔽效果，大功告成！
   ![](docs/images/2025-08-22-10-18-05.png)

## 配置说明

- **屏蔽关键词**：添加屏蔽关键词，点击“保存规则”使其生效
- **作者黑名单/白名单**：添加作者黑名单/白名单，点击“保存规则”使其生效
- **区域管理**：可视化开关、编辑、删除各平台屏蔽区域。[开发者：区域配置指南](docs/AREA_CONFIGURATION_GUIDE.md)
- **配置导入导出**：支持 JSON 文件导入导出，远程更新
- **远程配置**：自动获取最新区域配置，保持屏蔽规则更新
- **调试模式**：开发者可在 `core/common.js` 中启用调试日志

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

### 从商店安装

- Chrome 浏览器： [Chrome 应用商店](https://chromewebstore.google.com/detail/dpomdmennbkghcafeplkkhbejoneccal?utm_source=item-share-cb)
- Edge 浏览器： [获取 Microsoft Edge 扩展](https://microsoftedge.microsoft.com/addons/detail/lkecpfnoeafijacmohjpffiekijjkmip)

### 从源码安装

1. 下载或克隆本项目到本地
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启“开发者模式”
4. 点击“加载解压缩的扩展”（Edge）/“加载未打包的扩展程序”（Chrome），选择项目文件夹

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)

## 问题反馈

- 在 [GitHub Issues](https://github.com/kaedei/hoyo-leaks-block/issues) 提交问题或建议
- 请附详细错误信息、复现步骤、浏览器与操作系统版本

## 许可证

[MIT License](./LICENSE)

额外条款：**在未经版权持有者明确书面许可的情况下，本软件不得用于商业目的。**

## 鸣谢

感谢原 Tampermonkey 脚本作者及所有贡献者！

---

**注意**：本扩展仅供个人学习与研究，请遵守相关平台条款。
