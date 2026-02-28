# Developer Documentation

This document contains technical details about the project architecture, build process, and development workflow.

## 🚀 Project Migration

This project has been migrated from Hugo to Astro, providing a more modern experience with 3D animations.

## Tech Stack

- **Framework**: Astro 4.x
- **UI Library**: React 19
- **3D Graphics**: Three.js
- **Styling**: Custom CSS
- **Markdown**: @astrojs/mdx
- **Code Highlighting**: Shiki (Nord theme)
- **CI/CD**: [GitHub Actions](https://docs.github.com/en/actions)
- **Hosting**: [GitHub Pages](https://pages.github.com/)
- **Custom Domain**: eric.run.place (HTTPS enabled)

## Project Structure

```
caoergou.github.io/
├── astro-project/          # New Astro project (main project)
│   ├── src/
│   │   ├── components/     # React components (3D background, etc.)
│   │   ├── layouts/        # Astro layouts
│   │   └── pages/          # Pages and blog posts
│   ├── public/             # Static assets
│   │   └── llms.txt        # LLM configuration file
│   └── dist/               # Build output
├── site/                   # Old Hugo project (deprecated)
├── .github/
│   └── workflows/
│       ├── main.yml            # Hugo deployment (deprecated)
│       └── deploy-astro.yml    # Astro deployment (active)
└── CNAME                   # Domain configuration
```

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/caoergou/caoergou.github.io.git
   cd caoergou.github.io
   ```

2. Navigate to the Astro project:
   ```bash
   cd astro-project
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and visit `http://localhost:4321`

The site will automatically reload when you make changes to the source files.

### Building for Production

To build the site for production:

```bash
cd astro-project
npm run build
```

The generated site will be in the `astro-project/dist/` directory.

## Deployment

### Automatic Deployment

The site is automatically deployed when changes are pushed to the `main` branch.

**Workflow** (`.github/workflows/deploy-astro.yml`):

1. Checkout code
2. Setup Node.js
3. Install dependencies in `astro-project/`
4. Build the Astro site with `npm run build`
5. Deploy to `gh-pages` branch using `peaceiris/actions-gh-pages@v3`
6. GitHub Pages serves the site from the `gh-pages` branch

### Manual Deployment

```bash
cd astro-project
./deploy.sh
```

### GitHub Pages Configuration

- **Source Branch**: `gh-pages`
- **Source Path**: `/` (root)
- **Custom Domain**: eric.run.place
- **HTTPS**: Enabled (certificate valid until 2026-05-29)
- **Build Type**: Legacy (using gh-pages branch)

## Configuration

### Site Configuration

Edit `astro-project/astro.config.mjs` to modify:

- Site URL and base path
- Build settings
- Integrations (React, MDX, etc.)

### Content Management

#### Adding Blog Posts

Create `.mdx` files in `astro-project/src/pages/blog/`:

```mdx
---
layout: ../../layouts/BlogPost
title: "Post Title"
date: "2024-01-01"
description: "Post description"
---

# Content

Your post content...
```

#### Modifying Pages

Edit files in `astro-project/src/pages/` to modify page content.

### Custom Domain

The custom domain is configured via the `CNAME` file in the repository root. GitHub Pages automatically reads this file and configures the domain.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## llms.txt Mechanism

This website integrates the llms.txt standard to help large language models understand the site structure:

- **Location**: `/llms.txt`
- **Content**: Site overview, content structure, author info, tech stack, project list
- **Updates**: Update this file when the site structure changes

### What is llms.txt?

llms.txt is an emerging web standard that provides structured website information for AI and large language models, including:
- Site purpose and content overview
- Navigation structure and page hierarchy
- Author information and professional skills
- Tech stack and architecture information
- Metadata and SEO information

## Troubleshooting

### Build Fails

If the build fails, check:

1. Node.js version (requires 18+)
2. Dependencies are installed (`npm install`)
3. Component syntax errors in `src/components/`
4. Configuration errors in `astro.config.mjs`
5. GitHub Actions logs for detailed error messages

### Custom Domain Issues

If the custom domain isn't working:

1. Verify DNS records are correctly configured
2. Check that the `CNAME` file exists in the repository root
3. Ensure GitHub Pages is enabled in repository settings
4. Wait for DNS propagation (can take up to 24 hours)

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [llms.txt Standard](https://llmstxt.org/)

## License

MIT License - see LICENSE file for details.
