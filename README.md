# Eric Cao - Personal Website

[中文版介绍](README-zh-CN.md)

## 🚀 项目迁移到 Astro

本项目已从 Hugo 迁移到 Astro，提供更现代化的体验和 3D 动画效果。

**Live Site**: [eric.run.place](https://eric.run.place)

## ✨ 新特性

- **3D 动画背景** - 使用 Three.js 创建的动态几何图形和粒子效果
- **现代化架构** - 基于 Astro + React 的组件化开发
- **博客系统** - 支持 Markdown/MDX 格式
- **LLM 友好** - 集成 llms.txt 机制，方便 AI 理解网站结构
- **自动化部署** - GitHub Actions 自动构建和部署

## 📁 项目结构

```
caoergou.github.io/
├── astro-project/          # 新的 Astro 项目（主项目）
│   ├── src/
│   │   ├── components/     # React 组件（3D 背景等）
│   │   ├── layouts/        # Astro 布局
│   │   └── pages/          # 页面
│   ├── public/             # 静态资源
│   │   └── llms.txt        # LLM 配置文件
│   └── dist/               # 构建输出
├── site/                   # 旧的 Hugo 项目（已弃用）
├── .github/
│   └── workflows/
│       └── deploy-astro.yml # 自动部署配置
└── CNAME                   # 域名配置
```

## 🛠️ 技术栈

- **框架**: Astro 4.x
- **UI 库**: React 19
- **3D 图形**: Three.js
- **样式**: 自定义 CSS
- **Markdown**: @astrojs/mdx
- **代码高亮**: Shiki (Nord 主题)
- **CI/CD**: GitHub Actions
- **托管**: GitHub Pages

## 💻 本地开发

1. 克隆仓库：
   ```bash
   git clone https://github.com/caoergou/caoergou.github.io.git
   cd caoergou.github.io
   ```

2. 进入 Astro 项目目录：
   ```bash
   cd astro-project
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 访问 `http://localhost:4321`

## 📦 构建

```bash
cd astro-project
npm run build
```

构建输出在 `dist/` 目录。

## 🚢 部署

项目配置了 GitHub Actions 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建 Astro 项目
3. 自动部署到 GitHub Pages

### 手动部署

```bash
cd astro-project
./deploy.sh
```

## 📝 添加博客文章

在 `astro-project/src/pages/blog/` 创建 `.mdx` 文件：

```mdx
---
layout: ../../layouts/BlogPost
title: "文章标题"
date: "2024-01-01"
description: "文章描述"
---

# 内容

文章正文...
```

## 🤖 llms.txt 机制

本网站集成了 llms.txt 标准，帮助大语言模型理解网站结构：

- **位置**: `/llms.txt`
- **内容**: 网站概述、内容结构、作者信息、技术栈、项目列表
- **更新**: 网站结构变化时需要更新此文件

### 什么是 llms.txt？

llms.txt 是一个新兴的 Web 标准，为 AI 和大语言模型提供结构化的网站信息，包括：
- 网站目的和内容概述
- 导航结构和页面层次
- 作者信息和专业技能
- 技术栈和架构信息
- 元数据和 SEO 信息

## 👤 作者

Eric Cao (@caoergou)

- **GitHub**: [@caoergou](https://github.com/caoergou)
- **Website**: [truer.ai](https://truer.ai)
- **Location**: Shanghai, China
- **Email**: itsericsmail@gmail.com
- **Jike**: [Personal Page](https://jike.city/ergou)

### 主要项目

- [airflow-extended-api-plugin](https://github.com/caoergou/airflow-extended-api-plugin) ⭐ 78
- [cnpip](https://github.com/caoergou/cnpip) ⭐ 43
- [Truer.ai](https://truer.ai) ⭐ 5
- [COVID-19Simulation](https://github.com/caoergou/COVID-19Simulation) ⭐ 12

## 📄 许可证

This project is open source and available under the MIT License.

