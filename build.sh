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
cp manifest.json "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp -r core/ "$BUILD_DIR/"
cp -r content-scripts/ "$BUILD_DIR/"
cp -r popup/ "$BUILD_DIR/"
cp -r options/ "$BUILD_DIR/"
cp -r styles/ "$BUILD_DIR/"
cp -r icons/ "$BUILD_DIR/"
cp -r _locales/ "$BUILD_DIR/"

# 删除旧的ZIP文件（如果存在）
if [ -f "hoyo-leaks-block.zip" ]; then
    echo "🗑️  删除旧的ZIP文件..."
    rm "hoyo-leaks-block.zip"
fi

# 创建ZIP文件
echo "📦 创建ZIP包..."
cd "$BUILD_DIR"
zip -r "../hoyo-leaks-block.zip" .
cd ..

if [ -f "hoyo-leaks-block.zip" ]; then
    echo "🎉 构建完成！"
    echo "📄 输出文件: hoyo-leaks-block.zip"
    echo "📍 可以在Chrome扩展页面加载此ZIP文件或解压后的文件夹"
    echo "📁 构建目录: $BUILD_DIR"
else
    echo "⚠️  ZIP创建失败，但构建文件夹已准备就绪"
    echo "📍 请手动压缩 build 文件夹或直接加载 build 文件夹到Chrome扩展"
    echo "📁 构建目录: $BUILD_DIR"
fi

# 询问是否清理临时目录
echo
read -p "是否删除构建目录 build？[Y/N]: " cleanup
if [[ "$cleanup" =~ ^[Yy]$ ]]; then
    rm -rf "$BUILD_DIR"
    echo "✅ 构建目录已清理"
else
    echo "📁 构建目录保留: $BUILD_DIR"
fi

echo "✨ 构建脚本执行完成"
