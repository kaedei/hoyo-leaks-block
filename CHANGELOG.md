# 更新日志

> **致谢**: 本项目基于 B 站大佬 @凡云 开发的原始 Tampermonkey 脚本重构而成，感谢原作者的开源贡献！
> 原项目地址：https://github.com/LCYBFF/genshinLeaksBlock

## [103.0] - 2025-7-4

### 🎉 重大更新

- **重构为 Chrome 扩展**：从 Tampermonkey 用户脚本完全重构为独立的 Chrome/Edge 扩展
- **现代化架构**：使用 Manifest V3 标准，采用模块化设计
- **全新用户界面**：重新设计的设置页面和弹窗界面

### ✨ 新增功能

- **弹窗控制面板**：快速开关各平台屏蔽功能
- **统计功能**：显示屏蔽内容的统计数据
- **区域管理**：可视化管理屏蔽区域配置
- **配置同步**：使用 Chrome Storage API 实现配置云同步
- **实时更新**：配置修改后立即生效，无需刷新页面

### 🔧 功能改进

- **性能优化**：重写屏蔽逻辑，提高处理效率
- **兼容性提升**：支持 Twitter 新域名(x.com)
- **错误处理**：完善的错误处理和用户反馈机制
- **响应式设计**：支持不同屏幕尺寸的设备

### 🛠️ 技术更新

- **Manifest V3**：使用最新的 Chrome 扩展标准
- **模块化设计**：核心功能独立，易于维护和扩展
- **原生 JavaScript**：移除 jQuery 依赖，使用原生 API
- **CSS3 特性**：使用现代 CSS 特性优化样式

### 🎯 平台支持

- **B 站 (bilibili.com)**：完整支持所有页面类型
- **YouTube (youtube.com)**：支持首页、搜索、频道等页面
- **Twitter (twitter.com, x.com)**：支持新旧域名和新版界面

### 📱 用户体验

- **直观界面**：简洁现代的设计风格
- **快速操作**：一键开关各平台功能
- **状态反馈**：清晰的视觉反馈和操作提示
- **键盘支持**：支持键盘导航和快捷键

### 🔐 安全性

- **权限最小化**：只请求必要的权限
- **数据安全**：本地存储，不上传用户数据
- **内容安全**：使用 CSP 防止 XSS 攻击

### 📦 安装方式

- **开发者模式**：支持从源码直接安装
- **打包安装**：提供构建脚本生成安装包
- **未来计划**：准备上架 Chrome Web Store

---

## [2.x.x] - Tampermonkey 版本

### 历史版本

- 基于 Tampermonkey 的用户脚本
- 支持 B 站、YouTube、Twitter 三大平台
- 基础的关键词和用户屏蔽功能
- 简单的配置界面

---

## 开发计划

### 近期计划 (v104.0)

- [ ] 添加更多屏蔽区域配置
- [ ] 优化屏蔽准确性
- [ ] 添加导入导出功能增强
- [ ] 支持更多自定义选项

### 中期计划 (v110.0)

- [ ] 支持更多平台 (Instagram, TikTok 等)
- [ ] 添加机器学习内容识别
- [ ] 云端配置同步
- [ ] 多语言支持

### 长期计划 (v200.0)

- [ ] 重构为跨平台扩展
- [ ] 支持 Firefox 等其他浏览器
- [ ] 添加高级过滤规则
- [ ] 开发移动端版本

---

## 反馈与支持

如果您在使用过程中遇到任何问题，或者有新的功能建议，请：

1. **GitHub Issues**：在项目页面提交问题报告
2. **功能请求**：提交功能请求和改进建议
3. **Bug 报告**：提供详细的错误信息和复现步骤

感谢您的支持和反馈！
