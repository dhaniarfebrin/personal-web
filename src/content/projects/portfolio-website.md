---
title: "Personal Portfolio Website"
description: "The site you are reading: a static portfolio and blog built with Astro, Tailwind CSS, and markdown content collections, with a terminal-style design, light/dark/system themes, and hosting on Cloudflare Pages."
featured: true
technologies: ["Astro", "Tailwind CSS", "Markdown", "Shiki", "Bun", "Cloudflare Pages"]
liveUrl: "https://dhaniar.pages.dev"
githubUrl: "https://github.com/dhaniarfebrin/personal-web"
---

## Project Overview

This is my personal portfolio and blog. It is a static site: every page is built to plain HTML at build time, and the only JavaScript is a few small inline scripts (theme, code copy button, table of contents). I wanted a place for project write-ups and articles that is fast, easy to maintain, and written in markdown.

## Goals

- Keep content in **markdown files**, validated at build time
- Ship **static HTML** with very little JavaScript
- Support **light, dark, and system** themes without a flash on load
- Make long articles comfortable to read, including code samples

## Key Features

1. **Content collections**: blog posts and projects are markdown files. Frontmatter is validated with Zod schemas, so a missing field fails the build instead of breaking a page.
2. **Theme toggle**: light, dark, or system. The choice is saved in `localStorage`, and an inline script applies it before the first paint, so there is no flash.
3. **Table of contents**: long articles get a sticky contents list on desktop and a collapsible one on mobile. The current section is highlighted as you scroll.
4. **Code blocks**: syntax highlighting with Shiki using a light and a dark theme that follow the site theme, plus a **copy button** on each block. Token colors are adjusted to pass the WCAG AA contrast ratio.
5. **Estimated read time** on every blog post.
6. **SEO basics**: meta description, canonical URL, Open Graph and Twitter Card tags, a generated sitemap, and `robots.txt`.
7. **Responsive layout** with a mobile navigation menu and touch targets of at least 44px.

## Architecture

### Technology Stack
- **Astro 4** with static output: pages and content collections
- **Tailwind CSS 3** with `@tailwindcss/typography`: styling, mapped to CSS variables for the color tokens
- **Markdown**: all posts and project pages (no MDX)
- **Shiki**: build-time syntax highlighting with dual themes
- **@astrojs/sitemap**: sitemap generation
- **Bun**: package manager
- **Cloudflare Pages**: static hosting

### Design
The visual style follows a terminal look: one monospace font (JetBrains Mono), ASCII markers such as `[+]` and `[-]`, a warm cream canvas in light mode, and 1px hairline borders. The colors are CSS variables defined in the base layout, so light and dark themes only swap the variable values.

## Interesting Technical Decisions

### Almost no client-side JavaScript
Astro renders everything at build time. The client only runs small scripts for the theme, the copy buttons, and the table of contents highlight (an `IntersectionObserver`). There is no UI framework on the page.

### Theme before paint
A tiny inline script in the `<head>` reads the saved theme (or the system preference) and sets the class on `<html>` before the page renders. The `theme-color` meta tag is kept in sync with the effective theme.

### Content validation at build time
The Zod schemas in `src/content/config.ts` define what a blog post and a project need. Adding content is just adding a markdown file, and the build tells me if the frontmatter is wrong.
