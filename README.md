# Eric Cao - Personal Website

[中文版介绍](README-zh-CN.md)

This is my personal website built with Hugo and deployed via GitHub Actions to GitHub Pages.

## About

A minimalist personal website showcasing my profile, projects, and contact information.

**Live Site**: [eric.run.place](https://eric.run.place)

## Tech Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/)
- **CI/CD**: [GitHub Actions](https://docs.github.com/en/actions)
- **Hosting**: [GitHub Pages](https://pages.github.com/)

## Project Structure

```
.
├── site/                 # Hugo site source
│   ├── config.toml      # Site configuration
│   ├── layouts/         # HTML templates
│   ├── static/          # Static assets
│   └── data/            # Data files
├── .github/
│   └── workflows/       # GitHub Actions workflows
└── CNAME                # Custom domain configuration
```

## Local Development

1. Install Hugo (extended version):
   ```bash
   # macOS
   brew install hugo

   # Linux
   snap install hugo --channel=extended
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/caoergou/caoergou.github.io.git
   cd caoergou.github.io
   ```

3. Run the development server:
   ```bash
   cd site
   hugo server -D
   ```

4. Visit `http://localhost:1313` in your browser

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The workflow:

1. Builds the Hugo site
2. Deploys to the `gh-pages` branch
3. GitHub Pages serves the site at the custom domain

## Contact

- **Email**: itsericsmail@gmail.com
- **GitHub**: [@caoergou](https://github.com/caoergou)
- **Jike**: [Personal Page](https://jike.city/ergou)

## License

This project is open source and available under the MIT License.
