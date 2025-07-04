<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 米哈游内鬼屏蔽工具 - Chrome 扩展开发指南

## 项目概述

这是一个 Chrome/Edge 浏览器扩展，用于屏蔽 B 站、YouTube、Twitter 平台上的原神和星穹铁道内鬼爆料内容。

**致谢**: 本项目基于 B 站大佬 @凡云 开发的原始 Tampermonkey 脚本重构而成，感谢原作者的开源贡献。原项目地址：https://github.com/LCYBFF/genshinLeaksBlock

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- 优先使用原生 JavaScript，避免引入不必要的库
- 使用现代 CSS 特性，支持响应式设计
- 注释要清晰，特别是复杂的业务逻辑

### 项目文件结构

```
hoyo-leaks-block/
├── manifest.json             # 扩展清单文件 (Manifest V3)
├── background.js            # 后台服务工作线程
├── package.json             # 项目依赖和构建配置
├── LICENSE                  # MIT 许可证
├── .gitignore               # Git 忽略文件
├── core/
│   └── block-core.js        # 核心屏蔽逻辑类
├── content-scripts/         # 平台特定的内容脚本
│   ├── bilibili.js         # B站内容脚本
│   ├── youtube.js          # YouTube内容脚本
│   └── twitter.js          # Twitter内容脚本
├── popup/                   # 弹窗界面
│   ├── popup.html          # 弹窗页面结构
│   ├── popup.css           # 弹窗样式
│   └── popup.js            # 弹窗交互逻辑
├── options/                 # 设置页面
│   ├── options.html        # 设置页面结构
│   ├── options.css         # 设置页面样式
│   └── options.js          # 设置页面逻辑
├── styles/
│   └── block-styles.css    # 内容屏蔽样式
├── icons/                   # 扩展图标文件
│   ├── icon16.png          # 16x16 图标 (需要提供)
│   ├── icon48.png          # 48x48 图标 (需要提供)
│   ├── icon128.png         # 128x128 图标 (需要提供)
│   ├── icon-temp.svg       # 临时 SVG 参考图标
│   └── README.md           # 图标说明文档
├── test/                    # 测试文件
│   ├── test.html           # 测试页面
│   └── test.js             # 测试脚本
├── .github/                 # GitHub 配置
│   ├── workflows/          # GitHub Actions
│   │   └── build.yml       # 构建工作流
│   ├── ISSUE_TEMPLATE/     # Issue 模板
│   │   ├── bug_report.md   # Bug 报告模板
│   │   └── feature_request.md # 功能请求模板
│   ├── PULL_REQUEST_TEMPLATE.md # PR 模板
│   └── copilot-instructions.md # Copilot 开发指南
├── .vscode/                 # VS Code 配置
│   ├── tasks.json          # VS Code 任务配置
│   ├── extensions.json     # 推荐扩展
│   ├── launch.json         # 调试配置
│   └── settings.json       # 工作区设置
├── build.bat               # Windows 构建脚本
├── build.sh                # Linux/macOS 构建脚本
└── 文档文件                # 项目文档
    ├── README.md           # 项目说明
    ├── CHANGELOG.md        # 更新日志
    ├── INSTALL.md          # 安装指南
    ├── QUICKSTART.md       # 快速开始
    ├── DEVELOPMENT.md      # 开发指南
    ├── CONTRIBUTING.md     # 贡献指南
    ├── STATUS.md           # 项目状态
    └── ICON_SETUP.md       # 图标安装说明
```

### 技术要点

#### Chrome Extensions API

- 使用 Manifest V3 规范
- 使用`chrome.storage.sync`存储配置
- 使用`chrome.storage.local`存储临时数据
- 使用`chrome.runtime.sendMessage`进行跨脚本通信

#### 内容屏蔽逻辑

- 使用 CSS 模糊滤镜实现视觉屏蔽
- 通过 MutationObserver 监听 DOM 变化
- 使用正则表达式匹配关键词
- 支持白名单机制

#### 平台特殊处理

- **B 站**: 处理 SPA 页面变化，监听路由变化
- **YouTube**: 处理动态加载内容，监听`yt-navigate-finish`事件
- **Twitter**: 处理特殊的 DOM 结构，检查`tabindex`属性

### 开发建议

1. **性能优化**

   - 使用防抖技术减少频繁的 DOM 操作
   - 合理设置检查间隔，避免过度消耗 CPU
   - 使用事件委托减少监听器数量

2. **用户体验**

   - 提供清晰的视觉反馈
   - 支持键盘导航
   - 确保在不同屏幕尺寸下的可用性

3. **错误处理**

   - 对网络请求添加错误处理
   - 对用户输入进行验证
   - 提供友好的错误提示

4. **安全性**
   - 验证用户输入，防止 XSS 攻击
   - 使用内容安全策略(CSP)
   - 谨慎处理敏感数据

### 测试建议

1. **功能测试**

   - 在所有支持的平台上测试屏蔽功能
   - 测试配置导入导出功能
   - 测试不同浏览器的兼容性

2. **性能测试**

   - 监控内存使用情况
   - 检查 CPU 占用率
   - 测试长时间运行的稳定性

3. **用户界面测试**
   - 测试响应式设计
   - 检查颜色对比度
   - 验证键盘导航功能

### 常见问题解决

1. **内容脚本注入失败**

   - 检查 manifest.json 中的 permissions 和 host_permissions
   - 确认内容脚本的 matches 配置正确

2. **存储数据丢失**

   - 使用 chrome.storage.sync 而不是 localStorage
   - 添加适当的错误处理

3. **样式冲突**

   - 使用 CSS 特异性或!important
   - 考虑使用 CSS-in-JS 或 Shadow DOM

4. **跨域请求失败**
   - 在 manifest.json 中添加相应的 host_permissions
   - 使用 chrome.runtime.sendMessage 进行跨脚本通信

### 部署和发布

1. **构建检查**

   - 确保所有文件都在正确的位置
   - 检查 manifest.json 的版本号
   - 验证所有权限都是必需的

2. **Chrome Web Store 发布**

   - 准备高质量的截图和描述
   - 遵守 Chrome Web Store 的政策
   - 提供详细的隐私政策

3. **版本管理**
   - 使用语义化版本号
   - 维护详细的更新日志
   - 提供平滑的升级路径
