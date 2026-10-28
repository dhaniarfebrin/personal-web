# Dhaniar Febrin - Personal Portfolio

[![Astro](https://img.shields.io/badge/Astro-4.16.19-purple?style=flat-square&logo=astro)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.19-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-package%20manager-000000?style=flat-square&logo=bun)](https://bun.sh)

Personal portfolio and blog built as a static site with **Astro** and **Tailwind CSS**. Live at [dhaniar.pages.dev](https://dhaniar.pages.dev).

## Features

- **Terminal-style design** following [`DESIGN.md`](DESIGN.md) (OpenCode-inspired): all-monospace JetBrains Mono, ASCII bracket markers like `[-]`, warm cream canvas, 1px hairline borders.
- **Light / dark / system theme** toggle (`ThemeToggle.astro`), saved in `localStorage`, with an inline script in `BaseLayout.astro` that applies the theme before paint (no flash).
- **Content collections** for blog posts and projects, with frontmatter validated by Zod schemas.
- **SEO**: meta description, canonical URL, Open Graph and Twitter Card tags, generated sitemap, and `robots.txt`.
- **Responsive** layout, including a mobile navigation menu.
- **Estimated read time** on blog posts.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Astro](https://astro.build) 4 (static output) |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3 + `@tailwindcss/typography` |
| SEO | `@astrojs/sitemap` |
| Package manager | [Bun](https://bun.sh) (`bun.lock`) |
| Hosting | Cloudflare Pages |

## Project Structure

```
├── DESIGN.md              # Design system reference
├── astro.config.mjs       # Site URL + Tailwind and sitemap integrations
├── tailwind.config.mjs    # Maps CSS color vars to Tailwind tokens, fonts, typography
├── public/
│   └── robots.txt
└── src/
    ├── components/        # Navbar, ThemeToggle, Hero, About, FeaturedProjects, Contact, Footer
    ├── content/
    │   ├── config.ts      # Collection schemas
    │   ├── blog/          # Blog posts (.md)
    │   └── projects/      # Projects (.md)
    ├── layouts/
    │   └── BaseLayout.astro  # <head>/SEO tags, color tokens (CSS vars), theme script
    ├── pages/
    │   ├── index.astro
    │   ├── blog/
    │   │   ├── index.astro
    │   │   └── [slug].astro
    │   └── projects/
    │       ├── index.astro
    │       └── [slug].astro
    └── utils/
        └── readTime.ts    # Shared read-time helper
```

## Getting Started

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/dhaniarfebrin/personal-web.git
cd personal-web
bun install
bun run dev       # dev server at http://localhost:4321
bun run build     # static build to dist/
bun run preview   # preview the build locally
```

## Adding Content

### Blog post

Create `src/content/blog/my-post.md`. It is served at `/blog/my-post/`.

```markdown
---
title: "My Post Title"
description: "Short summary, also used for meta/OG description"
publishedAt: 2026-01-15
image: "/images/my-post.jpg"   # optional
tags: ["astro", "tailwind"]    # optional
---

Post content in Markdown...
```

### Project

Create `src/content/projects/my-project.md`. It is served at `/projects/my-project/`.

```markdown
---
title: "Project Title"
description: "Short project description"
technologies: ["Astro", "Tailwind CSS"]
image: "/images/my-project.jpg"           # optional
liveUrl: "https://example.com"            # optional
githubUrl: "https://github.com/user/repo" # optional
featured: true                            # optional, default false
---

Project details in Markdown...
```

Frontmatter that doesn't match `src/content/config.ts` fails the build.

## Customization

- **Colors**: edit the CSS variables (light and dark sets) in `src/layouts/BaseLayout.astro`. `tailwind.config.mjs` maps them to classes like `bg-canvas`, `text-ink`, `border-hairline`.
- **Design rules**: see `DESIGN.md`.

## Deployment

Deployed on Cloudflare Pages as a static site: build command `bun run build`, output directory `dist`. The `site` value in `astro.config.mjs` (`https://dhaniar.pages.dev`) is used for canonical URLs and the sitemap, so update it if the domain changes.
