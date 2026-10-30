---
title: "Micro-Frontends with Vite Module Federation: What Actually Broke in Production"
description: "Lessons from a micro-frontend setup at work: a shell plus remotes with Vite Module Federation. The shared-dependency trap, styling bugs, failure handling, and the human cost that tutorials skip."
publishedAt: 2026-10-31
tags: ["micro-frontends", "vite", "module federation", "react", "architecture"]
---

## Why We Split the Frontend (and When You Shouldn't)

At work, I help build a large enterprise platform. Many teams own different parts of it. They release at different times. But users see one UI and log in once.

One huge repo slowed everyone down. So we split the frontend into **micro-frontends**: small apps, built and deployed on their own, shown together as one page.

<figure>
<svg viewBox="0 0 480 330" width="100%" role="img" aria-labelledby="mf1-t" style="max-width:100%;height:auto;display:block">
<title id="mf1-t">Left: one big app built and deployed as a single piece. Right: a shell with a catalog piece and a cart piece, each built and deployed on its own, shown to the user as one page.</title>
<style>.mf-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.mf-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.mf-t{fill:var(--color-ink);font-size:13px}.mf-b{fill:var(--color-ink);font-size:13px;font-weight:700}.mf-s{fill:var(--color-mute);font-size:11px}.mf-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.mf-dash{stroke-dasharray:5 4}.mf-arrow{fill:var(--color-ink)}</style>
<text class="mf-b" x="10" y="20">One big app</text>
<rect class="mf-box" x="10" y="30" width="460" height="70"/>
<text class="mf-t" x="24" y="58">Shell + catalog + cart</text>
<text class="mf-s" x="24" y="80">one repo, one build, one deploy</text>
<text class="mf-b" x="10" y="140">Micro-frontends</text>
<rect class="mf-box" x="10" y="150" width="460" height="170"/>
<text class="mf-t" x="24" y="176">Shell (the page frame)</text>
<rect class="mf-card" x="24" y="192" width="205" height="76"/>
<text class="mf-t" x="38" y="220">Catalog</text>
<text class="mf-s" x="38" y="242">own repo, own deploy</text>
<rect class="mf-card" x="251" y="192" width="205" height="76"/>
<text class="mf-t" x="265" y="220">Cart</text>
<text class="mf-s" x="265" y="242">own repo, own deploy</text>
<text class="mf-s" x="24" y="300">The user sees one page.</text>
</svg>
<figcaption>One big app versus a shell with independent pieces.</figcaption>
</figure>

The best part for me: many developers do not work in the same repo. Each piece is easier to maintain.

But it has a cost. You pay with build setup, deploy order, shared contracts, and onboarding.

| Worth it | Not worth it |
| --- | --- |
| Several teams, different release speeds | One team |
| One UI, one shared login | Everything releases together |
| A repo so big it blocks people | A small app |

If you are in the right column, use a monorepo with lazy-loaded routes. It is much cheaper.

## The Setup: A Shell and Its Remotes

Two words first.

- **Host (the shell)**: the app that users open. It owns the layout, login, routes, and role checks.
- **Remote**: a separate app that gives the host some pages. Its **`remoteEntry.js`** is a small file that tells the host what the remote offers and where to download it.

<figure>
<svg viewBox="0 0 480 340" width="100%" role="img" aria-labelledby="mf2-t" style="max-width:100%;height:auto;display:block">
<title id="mf2-t">The browser talks to a reverse proxy on one origin. The proxy serves the shell, the catalog remote and the cart remote. The shell loads remoteEntry.js from each remote at runtime. React, React DOM and the router are shared by all three.</title>
<style>.mf-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.mf-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.mf-t{fill:var(--color-ink);font-size:13px}.mf-b{fill:var(--color-ink);font-size:13px;font-weight:700}.mf-s{fill:var(--color-mute);font-size:11px}.mf-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.mf-dash{stroke-dasharray:5 4}.mf-arrow{fill:var(--color-ink)}</style>
<defs><marker id="mfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mf-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="mf-box" x="150" y="10" width="180" height="38"/>
<text class="mf-t" x="240" y="34" text-anchor="middle">Browser</text>
<line class="mf-line" x1="240" y1="48" x2="240" y2="74" marker-end="url(#mfa)"/>
<rect class="mf-box" x="80" y="76" width="320" height="42"/>
<text class="mf-t" x="240" y="94" text-anchor="middle">Reverse proxy</text>
<text class="mf-s" x="240" y="109" text-anchor="middle">one origin, no CORS</text>
<path class="mf-line" d="M130 118V148" marker-end="url(#mfa)"/>
<path class="mf-line" d="M240 118V148" marker-end="url(#mfa)"/>
<path class="mf-line" d="M350 118V148" marker-end="url(#mfa)"/>
<rect class="mf-card" x="20" y="150" width="130" height="60"/>
<text class="mf-b" x="85" y="176" text-anchor="middle">Shell</text>
<text class="mf-s" x="85" y="194" text-anchor="middle">host</text>
<rect class="mf-card" x="175" y="150" width="130" height="60"/>
<text class="mf-b" x="240" y="176" text-anchor="middle">Catalog</text>
<text class="mf-s" x="240" y="194" text-anchor="middle">remote</text>
<rect class="mf-card" x="330" y="150" width="130" height="60"/>
<text class="mf-b" x="395" y="176" text-anchor="middle">Cart</text>
<text class="mf-s" x="395" y="194" text-anchor="middle">remote</text>
<path class="mf-line mf-dash" d="M85 210V232H395V212" marker-end="url(#mfa)"/>
<path class="mf-line mf-dash" d="M240 232V212" marker-end="url(#mfa)"/>
<text class="mf-s" x="240" y="250" text-anchor="middle">dashed: shell loads remoteEntry.js from each remote</text>
<rect class="mf-box" x="20" y="272" width="440" height="52"/>
<text class="mf-t" x="240" y="294" text-anchor="middle">Shared at runtime</text>
<text class="mf-s" x="240" y="312" text-anchor="middle">react · react-dom · router</text>
</svg>
<figcaption>Request flow and shared dependencies.</figcaption>
</figure>

I use [`@originjs/vite-plugin-federation`](https://github.com/originjs/vite-plugin-federation). The code below is a fictional shop.

The remote:

```ts
// catalog/vite.config.ts (remote)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "catalog",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductList": "./src/expose/ProductList.tsx",
      },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  build: { target: "esnext" },
  preview: { port: 5001, strictPort: true },
});
```

The host:

```ts
// shell/vite.config.ts (host)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        catalog: "http://localhost:5001/assets/remoteEntry.js",
        cart: "http://localhost:5002/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  build: { target: "esnext" },
});
```

Using a remote page in the host:

```tsx
const ProductList = lazy(() => import("catalog/ProductList"));
// remotes.d.ts
declare module "catalog/ProductList" {
  const C: React.ComponentType<{ onAddToCart: (id: string) => void }>;
  export default C;
}
```

Good to know:

- The host owns routing and access.
- So every new page touches two repos: build it in the remote, then register it in the host.
- In production, remote URLs are relative and on the same origin, behind a reverse proxy. No CORS. No URL per environment.
- In dev, the host uses `server.proxy` to copy this.
- Only the host can use `vite` dev. A remote must use `vite build --watch` and `vite preview`.

## Sharing Dependencies: The "Two Reacts" Trap

Share `react`, `react-dom`, and the router. Two copies of React break hooks and context.

Here is what hurt us. A table library was CommonJS only. Inside it, `require("react")` was tied to the remote's own React at build time.

When the host rendered it, we got a hook-is-null error. The page crashed.

The fix:

- Install the library in the host.
- Add it to `shared`.
- Deploy the host first.

Lessons:

- Check CommonJS packages that touch React.
- Do not share everything. A shared package is a contract that both sides must keep.

## Auth, State, and Routing Across Boundaries

- The host owns the SSO/OIDC client and passes it to remotes as props.
- Each remote wraps its page in its own providers (query client, HTTP client).
- So each remote has its own query cache. That is fine, if nobody expects shared state.
- Navigation paths are a contract. Keep them in shared constants or in docs.

One general lesson about HTTP interceptors: always clean up. We once added one in `useEffect` without removing it. Every mount added another.

```ts
useEffect(() => {
  const id = http.interceptors.request.use(addAuthHeader);
  return () => http.interceptors.request.eject(id);
}, []);
```

## Styling: Fine Alone, Broken in the Shell

A remote looked perfect alone. In the shell, some classes were missing.

The cause: the host's Tailwind only scans the host's source. The remote's CSS was only imported by its own standalone entry.

The fix:

- The remote ships its own CSS: `@tailwind components; @tailwind utilities;`, with no preflight.
- Import it from the expose wrapper.
- Keep both Tailwind configs in sync.
- If styles may clash, use `prefix` or scoping.

## The Human Side: Setup, DevOps, and Onboarding

This part is from my own experience. The code was the smaller half of the work.

Setup in the client environment was hard. DevOps did not know how micro-frontends work yet. That is nobody's fault. It is a new way to deploy a UI.

So I often paired with DevOps. We connected each micro-frontend to the host service: proxy routes to `remoteEntry.js`, cache rules, and so on.

Other things I felt:

- New developers need to learn the architecture and how to develop in it.
- New components and pages must be registered in the host repo.
- To see one micro-frontend component, I run at least two repos: host and remote.

<figure>
<svg viewBox="0 0 480 270" width="100%" role="img" aria-labelledby="mf3-t" style="max-width:100%;height:auto;display:block">
<title id="mf3-t">Local development with two repos. The shell repo runs the vite dev server. The remote repo runs vite build --watch, which writes build files, and vite preview, which serves them on port 5001. The shell loads the remote from the preview server.</title>
<style>.mf-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.mf-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.mf-t{fill:var(--color-ink);font-size:13px}.mf-b{fill:var(--color-ink);font-size:13px;font-weight:700}.mf-s{fill:var(--color-mute);font-size:11px}.mf-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.mf-dash{stroke-dasharray:5 4}.mf-arrow{fill:var(--color-ink)}</style>
<defs><marker id="mfc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mf-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="mf-b" x="10" y="22">Shell repo</text>
<rect class="mf-card" x="10" y="90" width="130" height="64"/>
<text class="mf-t" x="75" y="118" text-anchor="middle">vite</text>
<text class="mf-s" x="75" y="136" text-anchor="middle">dev server</text>
<text class="mf-b" x="190" y="22">Remote repo</text>
<rect class="mf-card" x="190" y="32" width="280" height="44"/>
<text class="mf-t" x="330" y="59" text-anchor="middle">vite build --watch</text>
<line class="mf-line" x1="330" y1="76" x2="330" y2="104" marker-end="url(#mfc)"/>
<rect class="mf-box" x="190" y="106" width="280" height="40"/>
<text class="mf-t" x="330" y="131" text-anchor="middle">built files (dist)</text>
<line class="mf-line" x1="330" y1="146" x2="330" y2="174" marker-end="url(#mfc)"/>
<rect class="mf-card" x="190" y="176" width="280" height="44"/>
<text class="mf-t" x="330" y="203" text-anchor="middle">vite preview :5001</text>
<path class="mf-line mf-dash" d="M190 198H165V130H142" marker-end="url(#mfc)"/>
<text class="mf-s" x="10" y="190">shell loads the</text>
<text class="mf-s" x="10" y="205">remote from here</text>
<text class="mf-s" x="10" y="256">No hot reload for the remote. Refresh the page.</text>
</svg>
<figcaption>Daily workflow: two repos running at the same time.</figcaption>
</figure>

What I suggest:

- A setup guide and a request-flow diagram for DevOps.
- One command that starts the host and the remote.
- A different port for each remote, so all can run together.
- A checklist for "add a new page".
- A short onboarding session.

## Failure, Types, and Deployment

- **Error boundary per remote**, at route level, with retry. One broken remote must not crash the shell.
- `React.lazy` keeps a failed promise. To retry, create a new `lazy()` or reload the page.
- **Do not trust docs alone.** Read the wrapper code to see what it really does.
- **Type your remotes** with `declare module`, not `any`.
- **Cache:** `remoteEntry.js` gets `Cache-Control: no-cache`. Hashed chunks can be cached for a long time.
- **Deploy order:** when a contract changes, decide who goes first. A new shared package means host first.

Bonus: add owner info to each remote module. Then you can send an error to the team that owns that remote.

## Verdict

My checklist:

1. Share only what must be a single copy.
2. Treat props, routes, and shared packages as contracts.
3. Ship CSS with each remote.
4. Add an error boundary with retry per remote.
5. Type every exposed module.
6. `no-cache` for the entry file, long cache for hashed chunks.
7. Write the setup guide, script it, and onboard people.
8. Decide deploy order before changing a contract.

It is worth it when several teams release at different speeds in one UI, and one repo has become the bottleneck. If not, keep the monorepo.
