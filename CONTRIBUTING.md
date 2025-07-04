# 贡献指南

感谢您对 Hoyo Leaks Block 项目的关注！我们欢迎所有形式的贡献，包括代码、文档、测试、问题报告和功能建议。

## 🤝 贡献方式

### 1. 报告问题

- 使用 [Bug Report](https://github.com/your-username/hoyo-leaks-block/issues/new?template=bug_report.md) 模板
- 提供详细的问题描述和复现步骤
- 包含环境信息（操作系统、浏览器版本等）

### 2. 功能建议

- 使用 [Feature Request](https://github.com/your-username/hoyo-leaks-block/issues/new?template=feature_request.md) 模板
- 详细描述建议的功能和使用场景
- 解释为什么这个功能对用户有帮助

### 3. 代码贡献

- Fork 项目到您的账户
- 创建功能分支
- 提交代码并创建 Pull Request
- 等待代码审查和合并

### 4. 文档贡献

- 改进现有文档
- 添加新的使用示例
- 翻译文档到其他语言

## 🚀 开发环境设置

### 前置要求

- Node.js 14+
- Chrome 88+ 或 Edge 88+
- Git
- VS Code（推荐）

### 环境设置

1. **克隆项目**

   ```bash
   git clone https://github.com/your-username/hoyo-leaks-block.git
   cd hoyo-leaks-block
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **加载扩展**
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹

## 📋 代码规范

### 1. 代码风格

- 使用 2 空格缩进
- 使用分号结尾
- 使用单引号（除非需要转义）
- 每行最大长度 100 字符

### 2. 命名规范

- 变量和函数：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 类：`PascalCase`
- 文件名：`kebab-case`

### 3. 注释规范

```javascript
/**
 * 函数描述
 * @param {string} param1 - 参数1描述
 * @param {Object} param2 - 参数2描述
 * @returns {boolean} 返回值描述
 */
function exampleFunction(param1, param2) {
  // 单行注释
  return true;
}
```

### 4. 文件结构

```
├── manifest.json          # 扩展配置
├── background.js         # 后台脚本
├── core/                 # 核心模块
├── content-scripts/      # 内容脚本
├── popup/               # 弹窗界面
├── options/             # 设置页面
├── styles/              # 样式文件
└── test/                # 测试文件
```

## 🧪 测试指南

### 1. 功能测试

- 在所有支持的网站上测试
- 验证屏蔽功能正常工作
- 检查设置页面功能
- 测试配置导入导出

### 2. 兼容性测试

- Chrome 88+
- Edge 88+
- 不同操作系统（Windows、macOS、Linux）

### 3. 性能测试

- 监控内存使用
- 检查 CPU 占用
- 测试长时间运行稳定性

### 4. 测试清单

- [ ] 扩展可以正常加载
- [ ] 屏蔽功能工作正常
- [ ] 设置页面可以打开
- [ ] 配置可以保存和读取
- [ ] 没有控制台错误
- [ ] 不同网站都能正常工作
- [ ] 导入导出功能正常

## 📝 提交规范

### 1. 提交消息格式

```
type(scope): subject

body

footer
```

### 2. 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具更改

### 3. 提交示例

```
feat(core): add user whitelist functionality

- Add support for user whitelist in blocking logic
- Users in whitelist will not be blocked
- Add whitelist management in options page

Closes #123
```

## 🔄 Pull Request 流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 开发和测试

- 编写代码
- 添加测试
- 确保所有测试通过

### 3. 提交更改

```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

- 使用 PR 模板
- 填写详细的更改描述
- 包含测试结果
- 等待代码审查

### 5. 代码审查

- 响应审查意见
- 修复建议的问题
- 更新代码和文档

## 📚 开发资源

### 官方文档

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

### 项目文档

- [README.md](README.md) - 项目介绍
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
- [QUICKSTART.md](QUICKSTART.md) - 快速开始

### 有用的工具

- [Chrome Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin)
- [Extension Manager](https://chrome.google.com/webstore/detail/extension-manager/gjldcdngmdknpinoemndlidpcabkggco)

## 🏷️ 版本管理

### 版本号规则

遵循 [Semantic Versioning](https://semver.org/) 规范：

- `MAJOR.MINOR.PATCH`
- MAJOR: 不兼容的 API 更改
- MINOR: 向后兼容的功能添加
- PATCH: 向后兼容的 bug 修复

### 发布流程

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git 标签
4. 推送到 GitHub
5. 自动构建和发布

## 🎯 贡献优先级

### 高优先级

- Bug 修复
- 性能优化
- 安全问题
- 兼容性改进

### 中优先级

- 新功能开发
- 用户体验改进
- 代码重构
- 文档更新

### 低优先级

- 代码美化
- 注释补充
- 测试覆盖
- 工具改进

## 🏆 贡献者认可

我们认可每一位贡献者的努力：

- 代码贡献者会在 README.md 中列出
- 重要贡献者会在发布说明中特别感谢
- 持续贡献者可以获得项目维护权限

## 📞 联系我们

如果您有任何问题或建议，请通过以下方式联系：

- GitHub Issues
- GitHub Discussions
- Email: your-email@example.com

## 📄 行为准则

请遵循我们的行为准则：

- 尊重他人观点
- 提供建设性反馈
- 保持专业态度
- 帮助新贡献者

违反行为准则的行为将被禁止参与项目。

---

感谢您对 Hoyo Leaks Block 项目的贡献！🎉
