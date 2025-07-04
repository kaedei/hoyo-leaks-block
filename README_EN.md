# Hoyo Leaks Block

**Language / 语言**：[中文](README.md) | English

This is a browser extension specifically designed for players of games under Hoyoverse, such as Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, etc. It can automatically block content related to "leaks and smear campaigns" on major social platforms like Bilibili, YouTube, and Twitter (x.com).

> **Acknowledgment**: This project is a refactored browser extension based on the original Tampermonkey script developed by @凡云 from Bilibili. Thanks to the original author for their open-source contribution! Original project: https://github.com/LCYBFF/genshinLeaksBlock

## Features

- 🛡️ **Multi social platform Support**: Bilibili, YouTube, Twitter (x.com)
- 🔍 **Smart Recognition**: Automatic identification of leak content by keywords and usernames
- ⚡ **Real-time Blocking**: Real-time monitoring and automatic blocking of page content
- 📝 **Custom Rules**: Support for custom keywords, blacklists, and whitelists
- 🎯 **Area Management**: Visual management of blocking areas with precise control
- 💾 **Configuration Management**: Support for import/export, remote updates, and cloud sync
- 🎨 **Modern UI**: Clean and intuitive settings and popup interface
- 📊 **Statistics**: Count blocked content
- 🛠️ **Performance Optimization**: Debouncing/throttling with low resource usage
- 🔐 **Data Security**: Local storage, no user data upload
- 🌐 **Internationalization**: Multi-language interface (Simplified Chinese, Traditional Chinese, English, Japanese, etc.)

## Installation

### Install from Source

1. Download or clone this project to your local machine
2. Open Chrome and visit `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project folder

### Supported Browsers

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Usage

1. After installing the extension, a blue floating button will appear on the right side of the page
2. Click the browser toolbar icon to quickly toggle the blocking function
3. Click the floating button or right-click menu to enter the "Options" page
4. Customize keywords, blacklists/whitelists, and areas in the settings page

## Configuration

- **Blocking Keywords**: Separate multiple keywords with `|`, e.g., `内鬼|爆料|leak|beta`
- **Author Blacklist/Whitelist**: Separate usernames with `|`
- **Area Management**: Visual toggle, edit, and delete blocking areas for each platform
- **Configuration Import/Export**: Support for JSON file import/export and remote updates

## File Structure

```
hoyo-leaks-block/
├── manifest.json              # Extension manifest
├── background.js              # Background script
├── core/
│   └── block-core.js          # Core blocking logic
├── content-scripts/
│   ├── bilibili.js            # Bilibili content script
│   ├── youtube.js             # YouTube content script
│   └── twitter.js             # Twitter content script
├── popup/
│   ├── popup.html             # Popup page
│   ├── popup.css              # Popup styles
│   └── popup.js               # Popup script
├── options/
│   ├── options.html           # Settings page
│   ├── options.css            # Settings styles
│   ├── options.js             # Settings script
│   ├── area-manager.js        # Area management
│   ├── config-manager.js      # Configuration management
│   ├── chrome-api-mock.js     # Chrome API Mock
│   ├── ui-manager.js          # UI management
│   └── utils.js               # Utility functions
├── styles/
│   └── block-styles.css       # Blocking styles
├── icons/                     # Icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon512.png
├── build.bat / build.sh       # Build scripts
├── hoyo-leaks-block.zip       # Package file
├── README.md                  # Documentation
├── CHANGELOG.md               # Changelog
└── LICENSE                    # License
```

## Development

- **Tech Stack**: Manifest V3, Vanilla JavaScript, CSS3, Chrome Storage API
- **Modular Design**: Independent core functionality, easy to maintain
- **Platform Adaptation**: Special handling for different platforms
- **Real-time Updates**: Configuration changes take effect immediately
- **Performance Optimization**: Debouncing/throttling with low resource usage
- **Development Recommendations**:
  1. Node.js required (for formatting/packaging)
  2. VS Code recommended
  3. Build command: `build.bat` or `npm run build`
  4. Install dependencies: `npm install`

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Issues & Feedback

- Submit issues or suggestions at [GitHub Issues](https://github.com/kaedei/hoyo-leaks-block/issues)
- Please include detailed error information, reproduction steps, browser and OS versions

## License

MIT License

## Acknowledgments

Thanks to the original Tampermonkey script author and all contributors!

---

**Note**: This extension is for personal learning and research only. Please comply with relevant platform terms.
