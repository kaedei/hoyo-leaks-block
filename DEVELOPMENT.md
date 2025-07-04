# 开发者指南

## 项目概述

Hoyo Leaks Block 是一个 Chrome/Edge 扩展，用于屏蔽 B 站、YouTube、Twitter 平台上的原神和星穹铁道内鬼爆料内容。本项目从原来的 Tampermonkey 脚本重构为独立的浏览器扩展。

## 开发环境设置

### 必要工具

- **Chrome 浏览器** 88+ 或 **Edge 浏览器** 88+
- **VS Code** 或其他代码编辑器
- **Node.js** 14+ （用于包管理和构建）
- **Git** 版本控制

### 项目设置

1. 克隆项目：

   ```bash
   git clone https://github.com/your-username/hoyo-leaks-block.git
   cd hoyo-leaks-block
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 在 Chrome 中加载扩展：
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹

## 项目结构

```
hoyo-leaks-block/
├── manifest.json              # 扩展配置文件
├── background.js             # 服务工作线程
├── core/
│   └── block-core.js         # 核心屏蔽逻辑
├── content-scripts/          # 内容脚本
│   ├── bilibili.js          # B站专用脚本
│   ├── youtube.js           # YouTube专用脚本
│   └── twitter.js           # Twitter专用脚本
├── popup/                    # 弹窗界面
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/                  # 设置页面
│   ├── options.html
│   ├── options.css
│   └── options.js
├── styles/                   # 样式文件
│   └── block-styles.css
├── icons/                    # 图标文件
├── test/                     # 测试文件
└── docs/                     # 文档
```

## 核心组件

### 1. Manifest 文件 (`manifest.json`)

- 定义扩展的基本信息、权限和入口点
- 使用 Manifest V3 规范
- 配置内容脚本和权限

### 2. Background Script (`background.js`)

- 扩展的服务工作线程
- 处理扩展生命周期事件
- 管理配置初始化和消息传递

### 3. Core Module (`core/block-core.js`)

- 核心屏蔽逻辑
- 平台无关的通用功能
- 配置管理和存储

### 4. Content Scripts (`content-scripts/`)

- 注入到目标网站的脚本
- 平台特定的处理逻辑
- DOM 操作和事件监听

### 5. 用户界面

- **Popup**: 快速操作面板
- **Options**: 详细设置页面
- **Styles**: 屏蔽效果样式

## 开发流程

### 1. 添加新功能

1. 在相应的模块中添加功能代码
2. 更新配置界面（如需要）
3. 测试功能是否正常工作
4. 更新文档和注释

### 2. 修改屏蔽逻辑

1. 编辑 `core/block-core.js` 中的通用逻辑
2. 或编辑特定平台的 content script
3. 测试屏蔽效果
4. 优化性能

### 3. 更新界面

1. 修改 HTML 结构
2. 更新 CSS 样式
3. 添加 JavaScript 交互
4. 测试响应式设计

## 调试技巧

### 1. Chrome DevTools

- **Background Script**: 在扩展页面点击"检查视图"
- **Content Script**: 在目标网页按 F12，查看 Console
- **Popup**: 右键弹窗选择"检查"

### 2. 调试输出

```javascript
// 在代码中添加调试信息
console.log("Debug info:", data);

// 检查扩展是否正常加载
if (typeof chrome !== "undefined") {
  console.log("Extension loaded");
}
```

### 3. 存储调试

```javascript
// 查看存储的配置
chrome.storage.sync.get(null, function (result) {
  console.log("Current config:", result);
});
```

## 测试方法

### 1. 手动测试

1. 打开测试页面 `test/test.html`
2. 访问支持的网站（B 站、YouTube、Twitter）
3. 验证屏蔽功能是否正常工作
4. 测试配置修改是否生效

### 2. 功能测试清单

- [ ] 扩展正常加载
- [ ] 配置界面可以打开
- [ ] 屏蔽规则可以保存
- [ ] 内容正确屏蔽
- [ ] 白名单功能正常
- [ ] 导入导出功能正常
- [ ] 不同平台都能正常工作

### 3. 性能测试

- 检查内存使用情况
- 监控 CPU 占用率
- 验证长时间运行的稳定性

## 构建和发布

### 1. 构建扩展包

```bash
# Windows
build.bat

# Mac/Linux
./build.sh

# 或使用npm
npm run build
```

### 2. 发布到 Chrome Web Store

1. 创建开发者账户
2. 上传扩展包
3. 填写商店信息
4. 等待审核

### 3. 版本管理

- 更新 `manifest.json` 中的版本号
- 更新 `CHANGELOG.md`
- 创建 Git 标签

## 贡献指南

### 1. 代码规范

- 使用一致的缩进（2 空格）
- 添加适当的注释
- 遵循 JavaScript 最佳实践
- 保持代码简洁易读

### 2. 提交规范

```bash
# 提交格式
git commit -m "feat: add new blocking feature"
git commit -m "fix: resolve popup display issue"
git commit -m "docs: update README"
```

### 3. Pull Request 流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request
5. 等待代码审查

## 常见问题

### Q: 扩展无法加载？

A: 检查 manifest.json 语法是否正确，确保所有文件路径都存在。

### Q: 内容脚本不工作？

A: 检查 permissions 和 host_permissions 配置，确保网站匹配正确。

### Q: 存储功能异常？

A: 检查 chrome.storage 权限，确保异步操作正确处理。

### Q: 样式不生效？

A: 检查 CSS 选择器优先级，可能需要使用!important。

## 技术参考

### 官方文档

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

### 相关技术

- JavaScript ES6+
- CSS3
- DOM API
- Web Storage API
- Chrome Storage API

## 联系方式

如有技术问题或建议，请通过以下方式联系：

- **GitHub Issues**: 提交问题和建议
- **Email**: your-email@example.com
- **Discord**: 开发者社区

感谢您的贡献！
