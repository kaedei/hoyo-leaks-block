# 区域配置详细指南

本指南将详细介绍如何在 HoyoLeaks Block 扩展中新增自定义的内容屏蔽区域配置，包括每个选择器的作用原理和配置方法。

## 📖 目录

1. [基础概念](#基础概念)
2. [区域配置结构](#区域配置结构)
3. [选择器详解](#选择器详解)
4. [配置步骤](#配置步骤)
5. [实战示例](#实战示例)
6. [调试技巧](#调试技巧)
7. [常见问题](#常见问题)

## 🔧 基础概念

### 什么是区域配置？

区域配置（Area Configuration）是定义扩展在特定网站页面上如何识别和屏蔽内容的规则集合。每个区域配置包含了：

- **目标平台**：如 bilibili、youtube、twitter
- **页面定位**：在哪个页面容器中查找内容
- **内容识别**：如何识别每个具体的内容项
- **信息提取**：从内容项中提取标题、用户、媒体等信息

### 工作原理

扩展通过以下步骤工作：

1. **页面扫描**：根据 `main` 选择器定位页面中的内容区域
2. **项目识别**：在内容区域中使用 `item` 选择器找到每个具体的内容项
3. **信息提取**：从每个内容项中提取文本（`text`）、用户（`user`）等信息
4. **规则匹配**：将提取的信息与用户设置的屏蔽规则进行匹配
5. **应用效果**：对匹配的内容应用模糊效果

## 🏗️ 区域配置结构

每个区域配置是一个 JSON 对象，包含以下字段：

```json
{
  "name": "配置名称", // 配置的显示名称
  "area": "平台名称", // 目标平台：bilibili/youtube/twitter
  "main": "主容器选择器", // 定位页面中的主要内容区域
  "item": "项目选择器", // 在主容器中找到每个内容项
  "text": "文本选择器", // 从内容项中提取文本内容
  "media": "媒体选择器", // 从内容项中找到媒体元素（图片/视频）
  "user": "用户选择器", // 从内容项中提取用户信息
  "on": true, // 是否启用此配置
  "home": false // 是否为首页模式（特殊处理）
}
```

## 🎯 选择器详解

### 1. Main Selector（主容器选择器）

**作用**：定位页面中包含要处理内容的主要区域。

**原理**：

- 扩展首先使用此选择器在整个页面中定位内容区域
- 后续的所有操作都在这个区域内进行
- 可以提高性能，避免在整个页面中搜索

**示例**：

```css
/* B站首页推荐区域 */
.recommended-container_floor-aside

/* YouTube 主要内容网格 */
/* YouTube 主要内容网格 */
/* YouTube 主要内容网格 */
/* YouTube 主要内容网格 */
ytd-rich-grid-renderer

/* Twitter 推文列表 */
[aria-labelledby='accessible-list-1'];
```

**选择技巧**：

- 选择包含所有目标内容的最小容器
- 避免选择会动态变化或不稳定的元素
- 优先选择有明确语义的容器

### 2. Item Selector（项目选择器）

**作用**：在主容器内识别每个独立的内容项。

**原理**：

- 使用 `document.querySelectorAll(area.item)` 查找所有内容项
- 每个找到的元素代表一个可能需要屏蔽的内容单元
- 后续的文本提取和用户信息提取都在此元素范围内进行

**示例**：

```css
/* B站视频卡片 */
.bili-video-card

/* YouTube 视频项 */
/* YouTube 视频项 */
/* YouTube 视频项 */
/* YouTube 视频项 */
ytd-rich-item-renderer

/* Twitter 推文 */
[data-testid=tweet];
```

**选择技巧**：

- 选择包含完整内容信息的元素
- 确保选择器能匹配到页面上所有相关内容项
- 避免选择过于细粒度的元素

### 3. Text Selector（文本选择器）

**作用**：从每个内容项中提取文本内容用于关键词匹配。

**原理**：

```javascript
// 代码中的处理逻辑
const textElements = item.querySelectorAll(area.text);
const allTexts = Array.from(textElements)
  .map((el) => el.textContent?.trim() || "")
  .filter((t) => t);
const text = allTexts.join(" ");
```

**多选择器支持**：

- 可以使用逗号分隔多个选择器
- 所有匹配元素的文本会被合并
- 例如：`.title, .description, .summary`

**示例**：

```css
/* B站视频标题 */
.bili-video-card__info--tit a

/* YouTube 视频标题 */
#video-title

/* B站动态多种文本 */
.bili-dyn-content__orig__desc, .bili-dyn-card-video__title, .bili-dyn-card-video__desc;
```

**选择技巧**：

- 包含所有可能包含敏感词的文本元素
- 优先选择主要内容（如标题）
- 可以包含描述、标签等辅助文本

### 4. Media Selector（媒体选择器）

**作用**：识别内容项中的图片、视频等媒体元素。

**原理**：

```javascript
// 当内容被屏蔽时，媒体元素也会被应用模糊效果
const mediaElements = item.querySelectorAll(area.media);
mediaElements.forEach((media) => this.applyBlur(media, true));
```

**示例**：

```css
/* B站视频封面 */
.bili-video-card__image

/* YouTube 缩略图 */
/* YouTube 缩略图 */
ytd-thumbnail

/* Twitter 图片和视频 */
[data-testid=tweetPhoto], video;
```

**选择技巧**：

- 包含所有需要模糊的媒体元素
- 可以使用多选择器匹配不同类型的媒体
- 确保选择器稳定，不会因页面更新而失效

### 5. User Selector（用户选择器）

**作用**：从内容项中提取发布者/用户信息。

**原理**：

```javascript
// 根据 home 参数决定查找范围
const userElement = area.home
  ? document.querySelector(area.user) // 全页面查找（适用于个人主页）
  : item.querySelector(area.user); // 在内容项内查找
const user = userElement ? userElement.textContent?.trim() : "";
```

**示例**：

```css
/* B站UP主名称 */
.bili-video-card__info--author

/* YouTube 频道名 */
/* YouTube 频道名 */
/* YouTube 频道名 */
/* YouTube 频道名 */
ytd-channel-name

/* Twitter 用户名 */
[data-testid=User-Name];
```

**选择技巧**：

- 确保能准确识别内容发布者
- 对于个人主页，可能需要设置 `home: true`
- 可以为空字符串（如果不需要用户信息）

### 6. Home 参数

**作用**：指示是否为个人主页模式。

**区别**：

- `home: false`：用户信息在每个内容项内查找
- `home: true`：用户信息在整个页面中查找（适用于个人主页）

**使用场景**：

- 个人主页：所有内容都来自同一个用户
- 列表页面：每个内容项有不同的发布者

## 📋 配置步骤

### 步骤 1：打开开发者工具

1. 在目标网站页面上按 `F12` 打开开发者工具
2. 切换到 `Elements` 标签页
3. 使用选择工具（📍 图标）或 `Ctrl+Shift+C` 进入元素选择模式

### 步骤 2：分析页面结构

1. **识别主容器**：

   - 找到包含所有目标内容的容器元素
   - 右键点击 → Copy → Copy selector

2. **识别内容项**：

   - 在主容器内找到单个内容项
   - 获取其选择器

3. **识别文本元素**：

   - 在内容项内找到标题、描述等文本元素
   - 记录所有相关的文本选择器

4. **识别媒体元素**：

   - 找到图片、视频等媒体元素

5. **识别用户信息**：
   - 找到发布者/用户名元素

### 步骤 3：编写配置

```json
{
  "name": "自定义配置名称",
  "area": "bilibili", // 或 youtube、twitter
  "main": "主容器选择器",
  "item": "内容项选择器",
  "text": "文本选择器1, 文本选择器2",
  "media": "媒体选择器",
  "user": "用户选择器",
  "on": true,
  "home": false
}
```

### 步骤 4：添加配置

1. 打开扩展选项页面
2. 切换到"区域管理"标签
3. 点击"添加新区域"
4. 填写配置信息
5. 点击"保存"

### 步骤 5：测试配置

1. 在目标页面刷新
2. 设置一个测试关键词
3. 观察是否正确屏蔽内容
4. 使用开发者工具检查控制台日志

## 🚀 实战示例

### 示例 1：B 站专栏页面

**目标**：屏蔽 B 站专栏文章列表

**分析过程**：

```html
<!-- 页面结构分析 -->
<div class="article-list">
  <!-- 主容器 -->
  <div class="article-item">
    <!-- 内容项 -->
    <h3 class="title">文章标题</h3>
    <!-- 文本 -->
    <img class="cover" />
    <!-- 媒体 -->
    <span class="author">作者名</span>
    <!-- 用户 -->
  </div>
  <!-- 更多文章项... -->
</div>
```

**配置结果**：

```json
{
  "name": "B站专栏列表",
  "area": "bilibili",
  "main": ".article-list",
  "item": ".article-item",
  "text": ".title",
  "media": ".cover",
  "user": ".author",
  "on": true,
  "home": false
}
```

### 示例 2：YouTube Shorts

**目标**：屏蔽 YouTube Shorts 短视频

**分析过程**：

```html
<!-- YouTube Shorts 结构 -->
<ytd-shorts>
  <!-- 主容器 -->
  <ytd-shorts-video-renderer>
    <!-- 内容项 -->
    <h2 id="video-title">视频标题</h2>
    <!-- 文本 -->
    <video></video>
    <!-- 媒体 -->
    <ytd-channel-name>频道名</ytd-channel-name>
    <!-- 用户 -->
  </ytd-shorts-video-renderer>
</ytd-shorts>
```

**配置结果**：

```json
{
  "name": "YouTube Shorts",
  "area": "youtube",
  "main": "ytd-shorts",
  "item": "ytd-shorts-video-renderer",
  "text": "#video-title",
  "media": "video",
  "user": "ytd-channel-name",
  "on": true,
  "home": false
}
```

### 示例 3：Twitter 趋势话题

**目标**：屏蔽 Twitter 趋势话题列表

**配置结果**：

```json
{
  "name": "Twitter 趋势",
  "area": "twitter",
  "main": "[data-testid=trend]",
  "item": "[data-testid=trendItem]",
  "text": "[data-testid=trendName]",
  "media": "",
  "user": "",
  "on": true,
  "home": false
}
```

## 🐛 调试技巧

### 1. 启用调试日志

扩展会在控制台输出详细的调试信息：

```javascript
// 查看区域配置是否正确加载
[HoyoBlock-bilibili] Area config: {name: "B站首页列表", area: "bilibili", ...}

// 查看找到的内容项数量
[HoyoBlock-bilibili] Found 20 items for selector ".bili-video-card"

// 查看提取的文本和用户信息
[HoyoBlock-bilibili] Combined text: "某某游戏最新爆料", User: "爆料君"
```

### 2. 验证选择器

在开发者工具的 Console 中测试选择器：

```javascript
// 测试主容器选择器
document.querySelector(".recommended-container_floor-aside");

// 测试内容项选择器
document.querySelectorAll(".bili-video-card");

// 测试文本选择器
document.querySelectorAll(".bili-video-card__info--tit a");
```

### 3. 常见调试命令

```javascript
// 查看当前页面所有匹配的元素
$(".bili-video-card");

// 查看元素的文本内容
$(".bili-video-card__info--tit a").map((el) => el.textContent);

// 检查元素是否存在
!!document.querySelector(".target-selector");
```

## ❓ 常见问题

### Q1: 选择器不稳定，页面更新后失效

**原因**：网站更新了 HTML 结构或 CSS 类名

**解决方案**：

- 选择更稳定的选择器（如 data 属性）
- 使用相对稳定的父子关系
- 避免使用可能变化的类名

### Q2: 找到的内容项数量为 0

**原因**：

- 主容器选择器错误
- 内容项选择器错误
- 页面内容动态加载，选择器执行时内容还未加载

**解决方案**：

- 检查选择器是否正确
- 确认页面内容已加载完成
- 使用更通用的选择器

### Q3: 提取不到文本或用户信息

**原因**：

- 文本/用户选择器错误
- 元素内容为空
- 选择器范围错误（item 内找不到对应元素）

**解决方案**：

- 验证选择器是否正确
- 检查元素是否包含期望的内容
- 调整选择器的相对路径

### Q4: 屏蔽效果不生效

**原因**：

- 区域配置未启用（`on: false`）
- 屏蔽关键词未设置或不匹配
- CSS 样式被网站样式覆盖

**解决方案**：

- 确认区域配置已启用
- 检查屏蔽关键词设置
- 检查浏览器控制台是否有样式相关错误

### Q5: home 参数何时使用

**使用 `home: true` 的场景**：

- 个人主页：所有内容都来自同一用户
- 用户信息在页面外部，不在每个内容项内

**使用 `home: false` 的场景**：

- 列表页面：每个内容项有不同的发布者
- 用户信息在每个内容项内部

## 📝 配置模板

### 通用配置模板

```json
{
  "name": "配置名称",
  "area": "平台名称",
  "main": "主容器选择器",
  "item": "内容项选择器",
  "text": "文本选择器",
  "media": "媒体选择器",
  "user": "用户选择器",
  "on": true,
  "home": false
}
```

### B 站配置模板

```json
{
  "name": "B站-页面名称",
  "area": "bilibili",
  "main": ".容器类名",
  "item": ".视频卡片类名",
  "text": ".标题选择器",
  "media": ".封面选择器",
  "user": ".用户名选择器",
  "on": true,
  "home": false
}
```

### YouTube 配置模板

```json
{
  "name": "YouTube-页面名称",
  "area": "youtube",
  "main": "ytd-主容器元素",
  "item": "ytd-视频项元素",
  "text": "#video-title",
  "media": "ytd-thumbnail",
  "user": "ytd-channel-name",
  "on": true,
  "home": false
}
```

### Twitter 配置模板

```json
{
  "name": "Twitter-页面名称",
  "area": "twitter",
  "main": "[data-testid=主容器]",
  "item": "[data-testid=内容项]",
  "text": "[data-testid=文本]",
  "media": "[data-testid=媒体]",
  "user": "[data-testid=用户]",
  "on": true,
  "home": false
}
```

## 🎉 总结

通过本指南，您应该能够：

1. ✅ 理解区域配置的工作原理
2. ✅ 掌握各个选择器的作用和配置方法
3. ✅ 能够分析网页结构并编写配置
4. ✅ 学会调试和解决常见问题
5. ✅ 为任何网站创建自定义屏蔽规则

如果在配置过程中遇到问题，建议：

1. 仔细阅读调试日志
2. 使用开发者工具验证选择器
3. 参考现有的成功配置示例
4. 在项目 GitHub 页面提交 Issue 寻求帮助

祝您使用愉快！🚀
