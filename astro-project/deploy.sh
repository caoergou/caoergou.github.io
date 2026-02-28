#!/bin/bash

# 部署脚本 - 将 Astro 项目部署到 GitHub Pages

set -e

echo "🚀 开始部署..."

# 构建项目
echo "📦 构建项目..."
npm run build

# 复制 CNAME 文件
if [ -f "../CNAME" ]; then
  echo "📝 复制 CNAME 文件..."
  cp ../CNAME dist/
fi

# 进入构建输出目录
cd dist

# 初始化 git（如果需要）
if [ ! -d ".git" ]; then
  git init
  git checkout -b gh-pages
fi

# 添加所有文件
git add -A

# 提交
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到 gh-pages 分支
echo "🌐 推送到 GitHub Pages..."
git push -f origin gh-pages

echo "✅ 部署完成！"
echo "🔗 网站将在几分钟后更新：https://eric.run.place"

cd ..
