@echo off
echo 🚀 创建测试扩展...

:: 创建测试目录
set "TEST_DIR=test-build"
if exist "%TEST_DIR%" (
    rmdir /s /q "%TEST_DIR%"
)
mkdir "%TEST_DIR%"

:: 复制必要文件
copy test-manifest.json "%TEST_DIR%\manifest.json" >nul
copy test-content.js "%TEST_DIR%\test-content.js" >nul
copy background.js "%TEST_DIR%\" >nul
xcopy popup "%TEST_DIR%\popup\" /e /i /q >nul
xcopy icons "%TEST_DIR%\icons\" /e /i /q >nul

:: 删除旧的ZIP文件
if exist "test-extension.zip" (
    del "test-extension.zip"
)

:: 创建ZIP文件
powershell -Command "& {Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('%TEST_DIR%', 'test-extension.zip', 'Optimal', $false);}"

if exist "test-extension.zip" (
    echo ✅ 测试扩展构建完成！
    echo 📄 输出文件: test-extension.zip
) else (
    echo ❌ 构建失败
)

:: 清理临时目录
rmdir /s /q "%TEST_DIR%"

echo 完成！
pause
