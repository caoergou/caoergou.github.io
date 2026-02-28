# Eric Cao - 个人网站

这是我的个人网站，使用 Hugo 构建，通过 GitHub Actions 自动部署到 GitHub Pages。

## 关于

一个简洁的个人网站，展示个人信息、项目和联系方式。

**在线访问**: [eric.run.place](https://eric.run.place)

## 技术栈

- **静态网站生成器**: [Hugo](https://gohugo.io/)
- **CI/CD**: [GitHub Actions](https://docs.github.com/en/actions)
- **托管平台**: [GitHub Pages](https://pages.github.com/)

## 项目结构

```
.
├── site/                 # Hugo 网站源码
│   ├── config.toml      # 网站配置
│   ├── layouts/         # HTML 模板
│   ├── static/          # 静态资源
│   └── data/            # 数据文件
├── .github/
│   └── workflows/       # GitHub Actions 工作流
└── CNAME                # 自定义域名配置
```

## 本地开发

1. 安装 Hugo（扩展版本）：
   ```bash
   # macOS
   brew install hugo

   # Linux
   snap install hugo --channel=extended
   ```

2. 克隆仓库：
   ```bash
   git clone https://github.com/caoergou/caoergou.github.io.git
   cd caoergou.github.io
   ```

3. 运行开发服务器：
   ```bash
   cd site
   hugo server -D
   ```

4. 在浏览器中访问 `http://localhost:1313`

## 部署

当代码推送到 `main` 分支时，网站会自动部署到 GitHub Pages。部署流程：

1. 构建 Hugo 网站
2. 部署到 `gh-pages` 分支
3. GitHub Pages 在自定义域名上提供服务

## 联系方式

- **邮箱**: itsericsmail@gmail.com
- **GitHub**: [@caoergou](https://github.com/caoergou)
- **即刻**: [个人主页](https://jike.city/ergou)

## 许可证

本项目开源，采用 MIT 许可证。
