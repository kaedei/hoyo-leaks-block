#!/bin/bash

# 构建Chrome扩展打包脚本

echo "🚀 开始构建 Hoyo Leaks Block Chrome Extension..."

# 检查必要文件
echo "📋 检查必要文件..."
required_files=("manifest.json" "background.js" "popup/popup.html" "options/options.html")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done

echo "✅ 所有必要文件都存在"

# 创建临时构建目录
echo "📁 创建构建目录..."
BUILD_DIR="build"
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"

# 复制必要文件
echo "📋 复制文件..."
cp -r manifest.json "$BUILD_DIR/"
cp -r background.js "$BUILD_DIR/"
cp -r core/ "$BUILD_DIR/"
cp -r content-scripts/ "$BUILD_DIR/"
cp -r popup/ "$BUILD_DIR/"
cp -r options/ "$BUILD_DIR/"
cp -r styles/ "$BUILD_DIR/"
cp -r icons/ "$BUILD_DIR/"

# 创建ZIP文件
echo "📦 创建ZIP包..."
cd "$BUILD_DIR"
zip -r "../hoyo-leaks-block.zip" .
cd ..

echo "🎉 构建完成！"
echo "📄 输出文件: hoyo-leaks-block.zip"
echo "📍 可以在Chrome扩展页面加载此ZIP文件或解压后的文件夹"

# 清理临时目录
rm -rf "$BUILD_DIR"

echo "✨ 构建脚本执行完成"
