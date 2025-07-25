![](icons/icon128.png)

# Hoyo Leaks Block

**Language / 语言**：[中文](README.md) | English

This is a browser extension specifically designed for players of games under Hoyoverse, such as Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, etc. It can automatically block content related to "leaks and smear campaigns" on major social platforms like Bilibili, YouTube, and Twitter (x.com).

> **Special Thanks**: This project is a refactored browser extension based on the original Tampermonkey script developed by @凡云 from Bilibili. Thanks to the original author for their open-source contribution! Original project: https://github.com/LCYBFF/genshinLeaksBlock

## Features

- 🛡️ **Multi-platform Support**: Bilibili, YouTube, Twitter (x.com)
- 🔍 **Smart Recognition**: Automatic identification of leak content by keywords and usernames
- ⚡ **Real-time Blocking**: Real-time monitoring and automatic blocking of page content
- 📝 **Custom Rules**: Support for custom keywords, blacklists, and whitelists
- 🎯 **Area Management**: Visual management of blocking areas with precise control
- 💾 **Configuration Management**: Support for import/export, remote updates, and cloud sync
- � **Remote Configuration**: Online retrieval of latest area configs and blocking rules
- �🎨 **Modern UI**: Clean and intuitive settings and popup interface
- 📊 **Statistics**: Count blocked content (daily/total)
- 🛠️ **Performance Optimization**: Debouncing/throttling with low resource usage
- 🔐 **Data Security**: Local storage, no user data upload
- � **Internationalization**: Multi-language interface (Simplified Chinese, Traditional Chinese, English, Japanese, etc.)
- 📋 **Debug Support**: Complete debug logging system

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
5. Use "Load Latest Area Config Online" to get the latest blocking rules

## Configuration

- **Blocking Keywords**: Separate multiple keywords with `|`, e.g., `内鬼|爆料|leak|beta`
- **Author Blacklist/Whitelist**: Separate usernames with `|`
- **Area Management**: Visual toggle, edit, and delete blocking areas for each platform
- **Configuration Import/Export**: Support for JSON file import/export and remote updates
- **Remote Configuration**: Automatically retrieve latest area configurations to keep blocking rules updated
- **Debug Mode**: Developers can enable debug logging in `core/constants.js`

For detailed area configuration instructions, please refer to: [Area Configuration Guide](docs/AREA_CONFIGURATION_GUIDE.md)

## File Structure

```
hoyo-leaks-block/
├── manifest.json              # Extension manifest
├── background.js              # Background script
├── core/
│   ├── block-core.js          # Core blocking logic
│   ├── config-manager.js      # Configuration management
│   ├── constants.js           # Constants definition
│   ├── content-blocker.js     # Content blocker
│   ├── debug-logger.js        # Debug logging management
│   ├── remote-config-manager.js # Remote configuration management
│   ├── stats-manager.js       # Statistics data management
│   ├── ui-manager.js          # UI management
│   └── utils.js               # Utility functions
├── content-scripts/
│   ├── bilibili.js            # Bilibili content script
│   ├── youtube.js             # YouTube content script
│   └── twitter.js             # Twitter content script
├── shared/
│   ├── base-config-manager.js # Base configuration management
│   └── utils.js               # Shared utility functions
├── popup/
│   ├── popup.html             # Popup page
│   ├── popup.css              # Popup styles
│   ├── popup.js               # Popup script
│   └── i18n.js                # Internationalization support
├── options/
│   ├── options.html           # Settings page
│   ├── options.css            # Settings styles
│   ├── options.js             # Settings script
│   ├── area-manager.js        # Area management
│   ├── config-manager.js      # Configuration management
│   ├── chrome-api-mock.js     # Chrome API Mock
│   ├── i18n-manager.js        # Internationalization management
│   ├── ui-manager.js          # UI management
│   └── utils.js               # Utility functions
├── _locales/                  # Internationalization resources
│   ├── en/messages.json       # English
│   ├── ja/messages.json       # Japanese
│   ├── zh_CN/messages.json    # Simplified Chinese
│   └── zh_TW/messages.json    # Traditional Chinese
├── config/
│   └── arealist.json          # Area configuration file
├── styles/
│   └── block-styles.css       # Blocking styles
├── icons/                     # Icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon512.png
├── docs/
│   └── AREA_CONFIGURATION_GUIDE.md # Area configuration guide
├── test/                      # Test files
│   ├── i18n-test.html
│   └── title-test.html
├── build.bat / build.sh       # Build scripts
├── hoyo-leaks-block.zip       # Package file
├── README.md                  # Documentation
├── README_EN.md               # English documentation
├── CHANGELOG.md               # Changelog
└── LICENSE                    # License
```

## Development

- **Tech Stack**: Manifest V3, Vanilla JavaScript, CSS3, Chrome Storage API
- **Modular Design**: Independent core functionality, easy to maintain and extend
- **Shared Foundation**: Use `shared/` directory for common modules, improving code reusability
- **Platform Adaptation**: Special handling and optimization for different platforms
- **Real-time Updates**: Configuration changes take effect immediately, support remote config updates
- **Performance Optimization**: Debouncing/throttling techniques with low resource usage
- **Debug Support**: Complete debug logging system for development and troubleshooting
- **Internationalization**: Comprehensive multi-language support mechanism
- **Development Recommendations**:
  1. Node.js required (for formatting/packaging)
  2. VS Code recommended
  3. Build command: `build.bat` or `npm run build`
  4. Install dependencies: `npm install`
  5. Development mode: Modify `DEBUG_MODE` in `core/constants.js` to enable debugging

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
