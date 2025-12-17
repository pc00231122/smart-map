#!/bin/bash

echo "🚀 开始构建智能地图网站..."

# 清理旧的构建文件
echo "🧹 清理旧文件..."
rm -rf dist

# 安装依赖
echo "📦 安装依赖..."
npm install

# 代码检查
echo "🔍 代码检查..."
npm run lint

# 构建生产版本
echo "🏗️  构建生产版本..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo ""
    echo "📊 构建结果："
    echo "📁 输出目录: dist/"
    echo "📦 文件大小:"
    du -sh dist/*
    echo ""
    echo "🚀 部署选项："
    echo "1. 本地预览: npm run serve"
    echo "2. 部署到 GitHub Pages: npm run deploy"
    echo "3. 部署到 Vercel: 推送代码到 GitHub"
else
    echo "❌ 构建失败！"
    exit 1
fi