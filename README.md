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
| UI island | [Preact](https://preact.dev) via `@astrojs/preact` (`/ask` only) |
| Hosting | Cloudflare Pages (+ Pages Functions for `/api/ask`) |

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

## Ask me

`/ask` lets visitors ask about my experience, projects and writing. A Preact island (`src/components/ask/`) calls a Cloudflare Pages Function (`functions/api/ask.ts`), which verifies Turnstile, asks DeepSeek (OpenAI-compatible API, `fetch` only, no SDK) and streams NDJSON back. The model can only pick one of four UI components (project cards, timeline, code, suggested questions); `src/lib/ask/core.ts` validates every choice and fills the props from site content. The content the model sees is built at build time into `dist/ask-context.json` (`src/pages/ask-context.json.ts`).

Set these in the Cloudflare Pages dashboard, for both **Production and Preview**:

| Name | Type | Notes |
|------|------|-------|
| `DEEPSEEK_API_KEY` | secret | DeepSeek API key |
| `TURNSTILE_SECRET` | secret | Turnstile widget secret for the site's domain |
| `LLM_MODEL` | variable | optional, defaults to `deepseek-flash` |
| `LLM_BASE_URL` | variable | optional, defaults to `https://api.deepseek.com` |
| `PUBLIC_TURNSTILE_SITE_KEY` | build variable | Turnstile site key, inlined into the client at build time |

Local development (the Function needs `wrangler`, `astro dev` does not serve it):

```bash
cp .dev.vars.example .dev.vars   # fill DEEPSEEK_API_KEY; the example uses Cloudflare's Turnstile test secret
cp .env.example .env             # Turnstile test site key
bun run build && bunx wrangler pages dev dist
bun test src/lib/ask/core.test.ts
```

There is no per-IP rate limit; if the endpoint is abused, add a Workers rate-limit binding or a KV counter.

## Customization

- **Colors**: edit the CSS variables (light and dark sets) in `src/layouts/BaseLayout.astro`. `tailwind.config.mjs` maps them to classes like `bg-canvas`, `text-ink`, `border-hairline`.
- **Design rules**: see `DESIGN.md`.

## Deployment

Deployed on Cloudflare Pages through git integration (static site plus the `functions/` directory): build command `bun run build`, output directory `dist`. The `site` value in `astro.config.mjs` (`https://dhaniar.pages.dev`) is used for canonical URLs and the sitemap, so update it if the domain changes.
