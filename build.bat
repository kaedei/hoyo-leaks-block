@echo off
setlocal enabledelayedexpansion

echo 🚀 开始构建 Hoyo Leaks Block Chrome Extension...

:: 检查必要文件
echo 📋 检查必要文件...
set "required_files=manifest.json background.js popup\popup.html options\options.html config\arealist.json config\default-v1.json"

for %%f in (%required_files%) do (
    if not exist "%%f" (
        echo ❌ 缺少必要文件: %%f
        exit /b 1
    )
)

echo ✅ 所有必要文件都存在

:: 创建临时构建目录
echo 📁 创建构建目录...
set "BUILD_DIR=build"
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
)
mkdir "%BUILD_DIR%"

:: 复制必要文件
echo 📋 复制文件...
copy manifest.json "%BUILD_DIR%\" >nul
copy background.js "%BUILD_DIR%\" >nul
xcopy core "%BUILD_DIR%\core\" /e /i /q >nul
xcopy content-scripts "%BUILD_DIR%\content-scripts\" /e /i /q >nul
xcopy popup "%BUILD_DIR%\popup\" /e /i /q >nul
xcopy options "%BUILD_DIR%\options\" /e /i /q >nul
xcopy styles "%BUILD_DIR%\styles\" /e /i /q >nul
xcopy icons "%BUILD_DIR%\icons\" /e /i /q >nul
xcopy _locales "%BUILD_DIR%\_locales\" /e /i /q >nul
xcopy shared "%BUILD_DIR%\shared\" /e /i /q >nul
xcopy config "%BUILD_DIR%\config\" /e /i /q >nul

:: 删除旧的ZIP文件（如果存在）
if exist "hoyo-leaks-block.zip" (
    echo 🗑️  删除旧的ZIP文件...
    del "hoyo-leaks-block.zip"
)

:: 创建ZIP文件（如果有PowerShell）
echo 📦 创建ZIP包...
powershell -Command "Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('%~dp0%BUILD_DIR%', '%~dp0hoyo-leaks-block.zip', 'Optimal', $false);" 2>nul

if exist "hoyo-leaks-block.zip" (
    echo 🎉 构建完成！
    echo 📄 输出文件: hoyo-leaks-block.zip
    echo 📍 可以在Chrome扩展页面加载此ZIP文件或解压后的文件夹
    echo 📁 构建目录: %BUILD_DIR%
) else (
    echo ⚠️  ZIP创建失败，但构建文件夹已准备就绪
    echo 📍 请手动压缩 build 文件夹或直接加载 build 文件夹到Chrome扩展
    echo 📁 构建目录: %BUILD_DIR%
)

:: 清理临时目录
echo 🗑️  清理构建目录...
rmdir /s /q "%BUILD_DIR%"
echo ✅ 构建目录已清理

echo ✨ 构建脚本执行完成
