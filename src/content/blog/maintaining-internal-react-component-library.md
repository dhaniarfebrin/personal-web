---
title: "Maintaining an Internal React Component Library: The Parts Nobody Plans For"
description: "Lessons from maintaining a shared React UI library used by several projects at work: bundling, component APIs that grow too many props, theming, versioning, docs, and CI."
publishedAt: 2026-10-31
tags: ["react", "design system", "component library", "vite", "monorepo"]
---

## One Library, Many Projects

At work, several projects share one internal React UI library. It gives them the same look and the same building blocks. It also helps them ship CRUD screens fast, because some components are *schema-driven*: you pass a description, you get a table or a form.

I did not start this library. I joined as a maintainer after it already had real users. So this is not a "how to build one" post. It is a retro: what I would keep, and what I would change.

The shape is simple:

- A pnpm monorepo with two members: the library and a docs app.
- Storybook lives inside the library package.
- Other apps install the library from a registry.

<figure>
<svg viewBox="0 0 480 252" width="100%" role="img" aria-labelledby="cl1-t" style="max-width:100%;height:auto;display:block">
<title id="cl1-t">The library package goes to a build that makes ES modules, CSS and types. The build publishes to a registry with several channels, which apps install. The build also feeds docs and Storybook. Version bump, publish and changelog are manual steps. A CI gate with typecheck, lint and tests is missing.</title>
<style>.cl-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.cl-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.cl-t{fill:var(--color-ink);font-size:13px}.cl-b{fill:var(--color-ink);font-size:13px;font-weight:700}.cl-s{fill:var(--color-mute);font-size:11px}.cl-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.cl-dash{stroke-dasharray:5 4}.cl-arrow{fill:var(--color-ink)}.cl-ghost{fill:none;stroke:var(--color-hairline-strong);stroke-width:1.5;stroke-dasharray:5 4}</style>
<defs><marker id="cla1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="cl-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="cl-ghost" x="10" y="8" width="460" height="30"/>
<text class="cl-s" x="240" y="27" text-anchor="middle">manual today: version bump · publish · changelog page</text>
<rect class="cl-card" x="10" y="52" width="140" height="56"/>
<text class="cl-b" x="80" y="76" text-anchor="middle">Library</text>
<text class="cl-s" x="80" y="94" text-anchor="middle">package in monorepo</text>
<rect class="cl-card" x="170" y="52" width="140" height="56"/>
<text class="cl-b" x="240" y="76" text-anchor="middle">Build</text>
<text class="cl-s" x="240" y="94" text-anchor="middle">ES + CSS + types</text>
<rect class="cl-card" x="330" y="52" width="140" height="56"/>
<text class="cl-b" x="400" y="76" text-anchor="middle">Registry</text>
<text class="cl-s" x="400" y="94" text-anchor="middle">several channels</text>
<line class="cl-line" x1="150" y1="80" x2="168" y2="80" marker-end="url(#cla1)"/>
<line class="cl-line" x1="310" y1="80" x2="328" y2="80" marker-end="url(#cla1)"/>
<line class="cl-line" x1="240" y1="108" x2="240" y2="146" marker-end="url(#cla1)"/>
<line class="cl-line" x1="400" y1="108" x2="400" y2="146" marker-end="url(#cla1)"/>
<rect class="cl-box" x="170" y="148" width="140" height="70"/>
<text class="cl-b" x="240" y="176" text-anchor="middle">Storybook</text>
<text class="cl-s" x="240" y="194" text-anchor="middle">+ docs site</text>
<rect class="cl-box" x="330" y="148" width="140" height="70"/>
<text class="cl-b" x="400" y="176" text-anchor="middle">Apps A · B · C</text>
<text class="cl-s" x="400" y="194" text-anchor="middle">install a version</text>
<rect class="cl-ghost" x="10" y="148" width="140" height="70"/>
<text class="cl-b" x="80" y="172" text-anchor="middle">CI gate</text>
<text class="cl-s" x="80" y="190" text-anchor="middle">missing today:</text>
<text class="cl-s" x="80" y="205" text-anchor="middle">types · lint · tests</text>
<path class="cl-line cl-dash" d="M80 148V110" marker-end="url(#cla1)"/>
<text class="cl-s" x="240" y="244" text-anchor="middle">dashed = manual or missing</text>
</svg>
<figcaption>The release path. The dashed parts are what I would automate first.</figcaption>
</figure>

## The Build: Decide Your Externals on Day One

The build uses Vite in library mode. It makes one ES entry, one CSS file, and bundled type files. That part is simple and fine.

The trap was *externals*. Only React was marked external. The DOM renderer, the form library, a select, and a date picker were bundled into the output. Some of them were also listed as `peerDependencies`. So an app could install a package and also get its own copy inside the library.

I never measured the size, so I will not give a number. But the mechanism is clear: duplicated code is likely. A bundled `react-dom` can also cause the "two Reacts" bug I describe in [my micro-frontends post](/blog/microfrontends-vite-module-federation).

Rules I would use now:

- Every peer dependency is external. Build the list from `package.json`, so it cannot drift.
- Set `sideEffects` so apps can tree-shake.
- Look at the bundle report on each release. A visualizer was already installed. Nobody opened it.

```ts
// vite.config.ts (fictional library)
import pkg from './package.json'

const external = [...Object.keys(pkg.peerDependencies ?? {}), 'react/jsx-runtime']

export default defineConfig({
  build: { lib: { entry: 'src/index.ts', formats: ['es'] }, rollupOptions: { external } },
})
```

## Component APIs: When Every Request Becomes a Prop

The biggest component, the data table, grew to about 80 props. Roughly a third are hooks: `custom*`, `on*`, `extra*`.

It happens for a human reason. Each project asks for one small thing. A prop is the cheapest way to say yes.

<figure>
<svg viewBox="0 0 480 190" width="100%" role="img" aria-labelledby="cl2-t" style="max-width:100%;height:auto;display:block">
<title id="cl2-t">Two bars. The data table has about 80 props: about 55 core props and about 25 hook props named custom, on or extra. A slot-based design has a goal of about 15 props.</title>
<style>.cl-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.cl-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.cl-hook{fill:var(--color-ink);stroke:var(--color-ink);stroke-width:1.5}.cl-t{fill:var(--color-ink);font-size:13px}.cl-b{fill:var(--color-ink);font-size:13px;font-weight:700}.cl-s{fill:var(--color-mute);font-size:11px}.cl-inv{fill:var(--color-canvas);font-size:11px}</style>
<text class="cl-b" x="10" y="20">Data table today: about 80 props</text>
<rect class="cl-box" x="10" y="30" width="302" height="36"/>
<text class="cl-t" x="161" y="53" text-anchor="middle">core · about 55</text>
<rect class="cl-hook" x="312" y="30" width="138" height="36"/>
<text class="cl-inv" x="381" y="52" text-anchor="middle">hooks · about 25</text>
<text class="cl-s" x="10" y="84">hooks = custom*, on*, extra* props</text>
<text class="cl-b" x="10" y="116">Slots + hooks: goal of about 15</text>
<rect class="cl-box" x="10" y="126" width="82" height="36"/>
<text class="cl-t" x="51" y="149" text-anchor="middle">core</text>
<text class="cl-s" x="104" y="149">the rest becomes slots and headless hooks</text>
<text class="cl-s" x="10" y="180">bar length = prop count (rounded)</text>
</svg>
<figcaption>Prop growth, and the size I would aim for.</figcaption>
</figure>

Some patterns aged well, and I would keep them:

- **Render props that hand back the default.** A footer callback receives the default back and submit buttons. The app can rearrange them without rewriting them.
- **An injected HTTP client.** The app controls auth and interceptors, not the library.
- **A registry for custom field types.** Apps add their own input without forking.

What I would add: composition and headless hooks for big components, and one rule: **a new prop needs a second consumer.**

## Theming and Text

Brand colors were hex values compiled into the library CSS. An app could not rebrand without rebuilding the library.

More small problems:

- The color API mixed raw names (`blue`) and meaning names (`primary`).
- A partial theme from an app **replaced** all defaults. It did not merge with them.
- Dynamic class names need a Tailwind `safelist`, or they vanish.
- A language context existed, but no component read it. Validation messages were copied in a few places, and UI text mixed two languages.

<figure>
<svg viewBox="0 0 480 215" width="100%" role="img" aria-labelledby="cl3-t" style="max-width:100%;height:auto;display:block">
<title id="cl3-t">Before: the library CSS has brand colors baked in at build time, so the app has no way to change them. After: the app passes a partial theme, which is merged over defaults into CSS variables, and the library classes read those variables.</title>
<style>.cl-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.cl-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.cl-t{fill:var(--color-ink);font-size:13px}.cl-b{fill:var(--color-ink);font-size:13px;font-weight:700}.cl-s{fill:var(--color-mute);font-size:11px}.cl-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.cl-dash{stroke-dasharray:5 4}.cl-arrow{fill:var(--color-ink)}</style>
<defs><marker id="cla3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="cl-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="cl-b" x="10" y="20">Before</text>
<rect class="cl-card" x="10" y="30" width="200" height="50"/>
<text class="cl-t" x="110" y="52" text-anchor="middle">Library CSS</text>
<text class="cl-s" x="110" y="68" text-anchor="middle">brand colors baked in</text>
<rect class="cl-card" x="270" y="30" width="200" height="50"/>
<text class="cl-t" x="370" y="52" text-anchor="middle">App</text>
<text class="cl-s" x="370" y="68" text-anchor="middle">wants another brand</text>
<line class="cl-line cl-dash" x1="270" y1="55" x2="212" y2="55"/>
<text class="cl-s" x="241" y="96" text-anchor="middle">no way in</text>
<text class="cl-b" x="10" y="132">After</text>
<rect class="cl-card" x="10" y="142" width="130" height="56"/>
<text class="cl-t" x="75" y="165" text-anchor="middle">App theme</text>
<text class="cl-s" x="75" y="183" text-anchor="middle">only what changes</text>
<rect class="cl-card" x="175" y="142" width="130" height="56"/>
<text class="cl-t" x="240" y="165" text-anchor="middle">Tokens</text>
<text class="cl-s" x="240" y="183" text-anchor="middle">CSS vars, merged</text>
<rect class="cl-card" x="340" y="142" width="130" height="56"/>
<text class="cl-t" x="405" y="165" text-anchor="middle">Library classes</text>
<text class="cl-s" x="405" y="183" text-anchor="middle">read the tokens</text>
<line class="cl-line" x1="140" y1="170" x2="173" y2="170" marker-end="url(#cla3)"/>
<line class="cl-line" x1="305" y1="170" x2="338" y2="170" marker-end="url(#cla3)"/>
</svg>
<figcaption>Baked-in colors versus tokens the app can override.</figcaption>
</figure>

What I would do: CSS variables as tokens, merge themes instead of replacing them, and one message catalog behind an i18n hook. A small version:

```tsx
const defaults = { primary: '#2563eb', radius: '8px' }
type Theme = typeof defaults
const ThemeCtx = createContext<Theme>(defaults)

export function UiThemeProvider({ theme, children }: { theme?: Partial<Theme>; children: ReactNode }) {
  const value = useMemo(() => ({ ...defaults, ...theme }), [theme]) // merge, never replace
  const vars = { '--ui-primary': value.primary, '--ui-radius': value.radius } as CSSProperties
  return <ThemeCtx.Provider value={value}><div style={vars}>{children}</div></ThemeCtx.Provider>
}
```

## Versioning: Patch Is Not a Strategy

The release script always bumped the patch number. After hundreds of releases, they were almost all patches. That included one that renamed the core props of a big component. Apps upgraded and broke.

One idea I would steal: **dist-tags as channels.** The new major went out under a `beta` tag, while older projects stayed on the old major. Nobody was forced to move. A channel costs almost nothing, and it gives you room to ship big changes safely.

The weak parts:

- Publishing happened by hand, from one person's laptop and account.
- The changelog was a hand-written docs page. It fell far behind the real versions.

What I would do: Changesets or conventional commits, a CI job that publishes with a scoped token, and a deprecation window before anything is removed.

## Docs, Storybook, and the CI We Didn't Have

There were two doc surfaces: an MDX docs site and Storybook. Storybook became the real playground. The docs site drifted, and the README described a deploy flow that no longer existed.

CI only built and deployed the docs and Storybook images. It ran no lint, no type check, and no tests. The repo had zero test files. The only gate was the type check inside the build script, run by hand at publish time.

The Storybook image also used a different package manager than the monorepo, and no lockfile. So what you saw in Storybook might not match what was published. I did not verify that, but nothing prevented it.

What I would do: one CI gate (type check, lint, build, Storybook interaction tests), and docs generated from the same stories.

## If I Started Again Tomorrow

A short checklist:

1. Externals from `peerDependencies`, plus `sideEffects`.
2. Tokens as CSS variables, and themes that merge.
3. A semver tool, not a hand-edited number.
4. A CI gate before every publish.
5. A "second consumer" rule for every new prop.

None of this is exciting. But it is what keeps a shared library from becoming a shared problem.

The common thread is that a library has many users and few owners. Every missing gate is a cost that someone else pays later, in an app they did not write.
