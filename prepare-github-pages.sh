#!/bin/bash

# 导出数据并准备GitHub Pages部署脚本

echo "====== 准备GitHub Pages部署 ======"
echo

# 确保数据库存在
if [ ! -f "blog.db" ]; then
  echo "❌ 数据库文件 blog.db 不存在，请先运行应用程序创建数据库"
  exit 1
fi

# 创建data目录
echo "📁 创建数据目录..."
mkdir -p data

# 导出数据
echo "💾 导出数据库内容..."
node export-data.js

# 确保uploads目录存在
echo "📁 确保uploads目录存在..."
mkdir -p uploads

# 创建部署目录
DEPLOY_DIR="github-pages-deploy"
echo "📁 创建部署目录: $DEPLOY_DIR"
mkdir -p $DEPLOY_DIR

# 复制必要文件
echo "📋 复制必要文件到部署目录..."

# 复制index.html
cp index.html $DEPLOY_DIR/

# 复制assets目录
mkdir -p $DEPLOY_DIR/assets
cp -r assets $DEPLOY_DIR/

# 复制data目录
cp -r data $DEPLOY_DIR/

# 复制uploads目录
cp -r uploads $DEPLOY_DIR/

# 复制README和部署指南
cp README-gh-pages.md $DEPLOY_DIR/README.md
cp github-pages-deploy.md $DEPLOY_DIR/

# 在部署目录中创建.nojekyll文件（防止GitHub Pages处理文件）
touch $DEPLOY_DIR/.nojekyll

echo "✅ 部署文件准备完成"
echo "📂 所有文件已准备在 $DEPLOY_DIR 目录中"
echo 
echo "🚀 下一步:"
echo "1. 创建GitHub仓库: <你的用户名>.github.io"
echo "2. 将 $DEPLOY_DIR 中的文件复制到该仓库"
echo "3. 提交并推送到GitHub"
echo
echo "详细说明请参考 github-pages-deploy.md" 