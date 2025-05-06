@echo off
REM 导出数据并准备GitHub Pages部署脚本

echo ====== 准备GitHub Pages部署 ======
echo.

REM 确保数据库存在
if not exist "blog.db" (
  echo [错误] 数据库文件 blog.db 不存在，请先运行应用程序创建数据库
  exit /b 1
)

REM 创建data目录
echo [信息] 创建数据目录...
if not exist "data" mkdir data

REM 导出数据
echo [信息] 导出数据库内容...
node export-data.js

REM 确保uploads目录存在
echo [信息] 确保uploads目录存在...
if not exist "uploads" mkdir uploads

REM 创建部署目录
set DEPLOY_DIR=github-pages-deploy
echo [信息] 创建部署目录: %DEPLOY_DIR%
if not exist "%DEPLOY_DIR%" mkdir %DEPLOY_DIR%

REM 复制必要文件
echo [信息] 复制必要文件到部署目录...

REM 复制index.html
copy index.html %DEPLOY_DIR%\

REM 复制assets目录
if not exist "%DEPLOY_DIR%\assets" mkdir %DEPLOY_DIR%\assets
xcopy assets %DEPLOY_DIR%\assets\ /E /I /Y

REM 复制data目录
xcopy data %DEPLOY_DIR%\data\ /E /I /Y

REM 复制uploads目录
xcopy uploads %DEPLOY_DIR%\uploads\ /E /I /Y

REM 复制README和部署指南
copy README-gh-pages.md %DEPLOY_DIR%\README.md
copy github-pages-deploy.md %DEPLOY_DIR%\

REM 在部署目录中创建.nojekyll文件（防止GitHub Pages处理文件）
type nul > %DEPLOY_DIR%\.nojekyll

echo [成功] 部署文件准备完成
echo [信息] 所有文件已准备在 %DEPLOY_DIR% 目录中

REM 如果存在.github.io目录，则自动复制部署文件
if exist ".github.io" (
  echo.
  echo [信息] 检测到.github.io仓库目录，准备自动更新GitHub Pages内容...
  
  REM 清空.github.io目录中除了.git文件夹以外的所有内容
  echo [信息] 清理.github.io仓库目录...
  for /d %%i in (.github.io\*) do (
    if not "%%~nxi"==".git" rd /s /q "%%i"
  )
  del /q .github.io\*.* > nul 2>&1
  
  REM 复制部署文件到.github.io目录
  echo [信息] 复制部署文件到.github.io仓库目录...
  xcopy %DEPLOY_DIR%\* .github.io\ /E /I /Y
  
  echo [成功] GitHub Pages内容已自动更新!
  echo [下一步] 进入.github.io目录，提交并推送更改:
  echo   cd .github.io
  echo   git add .
  echo   git commit -m "更新博客内容"
  echo   git push
) else (
  echo.
  echo [信息] 未检测到.github.io仓库目录
  echo [下一步]
  echo 1. 创建GitHub仓库: ^<你的用户名^>.github.io
  echo 2. 将 %DEPLOY_DIR% 中的文件复制到该仓库
  echo 3. 提交并推送到GitHub
)

echo.
echo 详细说明请参考 github-pages-deploy.md

pause 