# Dhaniar Febrin - Personal Portfolio

[![Astro](https://img.shields.io/badge/Astro-4.16.19-purple?style=flat-square&logo=astro)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.19-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.3.13-000000?style=flat-square&logo=bun)](https://bun.sh)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A high-performance, dark-mode portfolio website built with **Astro**, **Tailwind CSS**, and **TypeScript**. Designed to showcase exceptional digital experiences with native animations and optimized performance.

## ✨ Features

- **⚡ Extreme Performance**: Targets **Lighthouse Score 100** with GPU-accelerated animations and minimal JavaScript execution.
- **🎬 Native Animations**: 
  - Astro View Transitions for smooth page navigation
  - CSS-based scroll reveal animations using IntersectionObserver
  - Custom keyframe animations for ambient glowing effects and floating elements
- **📝 Content-Driven Architecture**: 
  - Blog posts and project portfolios managed via **Astro Content Collections**
  - Markdown-based content with TypeScript schema validation
  - Supports rich typography with `@tailwindcss/typography`
- **🌙 Modern Dark-Mode Design**:
  - Exclusive dark theme (Slate-900 background, Violet-500 accent)
  - Glassmorphism effects for elevated visual hierarchy
  - Micro-interactions on buttons, cards, and navigation
- **📱 Fully Responsive**: Optimized layouts for desktop, tablet, and mobile devices
- **🔍 Type-Safe**: Full TypeScript support throughout the project

## 🛠 Tech Stack

| Category | Technology |
|----------|-------------|
| **Framework** | [Astro.js](https://astro.build) 4.16.19 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) 3.4.19 |
| **Language** | [TypeScript](https://www.typescriptlang.org) 5.4.5 |
| **Package Manager** | [Bun](https://bun.sh) 1.3.13 |
| **Content** | Astro Content Collections (Markdown) |
| **Typography** | @tailwindcss/typography 0.5.19 |

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.3.13 or higher ([Install Bun](https://bun.sh))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhaniarfebrin/personal-web.git
   cd personal-web
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```
   The server will run at `http://localhost:3000`

### Available Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Check for type errors
bun run check
```

## 📂 Project Structure

```
src/
├── components/        # Reusable Astro components
│   ├── Navbar.astro   # Navigation bar with smooth transitions
│   ├── Hero.astro     # Hero section with typing effect & ambient glows
│   ├── About.astro    # About section with tech stack display
│   ├── FeaturedProjects.astro  # Project cards with hover effects
│   ├── Contact.astro  # Call-to-action contact section
│   └── Footer.astro   # Footer component
│
├── content/           # Markdown-based content collections
│   ├── blog/          # Blog posts with schema validation
│   │   ├── getting-started-with-astro.md
│   │   └── mastering-tailwind-css.md
│   ├── projects/      # Portfolio projects showcase
│   │   ├── ecommerce-platform.md
│   │   └── portfolio-website.md
│   └── config.ts      # Content Collections schema definitions
│
├── layouts/
│   └── BaseLayout.astro  # Master layout with ViewTransitions & scroll reveal script
│
├── pages/             # Astro file-based routing
│   ├── index.astro    # Homepage
│   ├── blog/
│   │   ├── index.astro        # Blog listing page
│   │   └── [slug].astro       # Dynamic blog post page
│   └── projects/
│       ├── index.astro        # Projects listing page
│       └── [slug].astro       # Dynamic project detail page
│
└── styles/            # Global styles (if needed)

dist/                 # Built static files (generated)
public/               # Static assets
```

## 📝 Content Management

### Adding a New Blog Post

1. Create a new Markdown file in `src/content/blog/`
   ```
   src/content/blog/my-awesome-post.md
   ```

2. Add frontmatter with required fields:
   ```markdown
   ---
   title: "My Awesome Post Title"
   description: "A brief description of the post"
   pubDate: "2026-01-15"
   tags: ["astro", "performance"]
   ---

   # Your Blog Content Here

   Write your content in Markdown...
   ```

3. The post will automatically appear on `/blog` and be accessible at `/blog/my-awesome-post/`

### Adding a New Project

1. Create a new Markdown file in `src/content/projects/`
   ```
   src/content/projects/my-project.md
   ```

2. Add frontmatter with required fields:
   ```markdown
   ---
   title: "Project Title"
   description: "Brief project description"
   image: "https://via.placeholder.com/400x300"
   technologies: ["React", "Tailwind CSS", "TypeScript"]
   githubUrl: "https://github.com/username/repo"
   liveUrl: "https://project-demo.com"
   featured: true
   ---

   # Project Details

   Detailed markdown content about your project...
   ```

3. The project will appear on `/projects` and at `/projects/my-project/`

### Content Schema Validation

All content is validated via TypeScript schemas defined in `src/content/config.ts`. Ensure frontmatter fields match the schema or the build will fail.

## 🎨 Customization

### Updating Colors

Colors are defined in `tailwind.config.mjs`. The current color scheme uses:
- **Background**: `slate-900` (Dark slate)
- **Surface**: `slate-800` (Lighter slate)
- **Accent**: `violet-500` / `violet-400` (Purple violet)

To change colors, update the `theme` section in `tailwind.config.mjs`.

### Modifying Navigation

Edit the `navLinks` array in `src/components/Navbar.astro` to add/remove navigation items.

### Adjusting Animations

Custom animations are defined in `tailwind.config.mjs` under the `keyframes` and `animation` sections. Modify timing and effects as desired.

## 📊 Performance

This portfolio is optimized for maximum performance:

- **Lighthouse Scores**: Target 100 across Performance, Accessibility, Best Practices, and SEO
- **Zero Layout Shift**: All elements have defined dimensions
- **GPU-Accelerated Animations**: All animations use CSS transforms (no JavaScript-driven animations)
- **Code Splitting**: Astro automatically splits code by page
- **Image Optimization**: Static images are optimized at build time
- **Minimal JavaScript**: Only essential JavaScript (typing effect, IntersectionObserver for scroll reveal)

## 🔗 Project Links

- **Repository**: [github.com/dhaniarfebrin/personal-web](https://github.com/dhaniarfebrin/personal-web)
- **Live Demo**: *(Coming soon)*

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💡 Issues & Contributions

Found a bug or have a feature request? Feel free to [open an issue](https://github.com/dhaniarfebrin/personal-web/issues) on GitHub!

---

**Built with ❤️ using Astro**
