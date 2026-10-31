---
title: "Building a Drag-and-Drop Form Builder in React: Schema, Conditions, and What I'd Change"
description: "How I built a schema-driven form builder with a visual editor at work: the schema, a component registry, validation, conditional fields, undo/redo, and the performance and safety mistakes I'd fix first."
publishedAt: 2026-10-31
tags: ["react", "forms", "react-hook-form", "form builder", "architecture"]
---

## Why a Form Builder, and Three Generations of It

Forms change more often than releases do. A new field should not need a new deploy. So at work, we moved forms out of code and into a spec.

I wrote most of the later versions. This post is what I learned, including the mistakes.

- **Generation 1:** the server sends a field spec. The form fetches it and calls the CRUD endpoints itself.
- **Generation 2:** a flat array spec. The app owns submit.
- **Generation 3:** a tree spec and a drag-and-drop editor. It reuses generation 2's field renderer.

Each one fixed the coupling of the one before. Generation 1 had odd coupling. It found the "create" endpoint by matching the visible button label. Rename the label, and submit broke.

Rule: never use display text as an identifier.

<figure>
<svg viewBox="0 0 480 300" width="100%" role="img" aria-labelledby="fb1-t" style="max-width:100%;height:auto;display:block">
<title id="fb1-t">Top: three generations of the form builder. Generation 1 is a server-sent spec, generation 2 is a flat array spec, generation 3 is a tree spec with an editor. Bottom: the generation 3 pipeline. Palette and drag go to tree operations, then to history, then to the saved JSON spec, then to the renderer, then to the form store and the API.</title>
<style>.fb-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.fb-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.fb-t{fill:var(--color-ink);font-size:13px}.fb-b{fill:var(--color-ink);font-size:13px;font-weight:700}.fb-s{fill:var(--color-mute);font-size:12px}.fb-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.fb-arrow{fill:var(--color-ink)}</style>
<defs><marker id="fba" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="fb-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="fb-b" x="10" y="20">Three generations</text>
<rect class="fb-card" x="10" y="30" width="140" height="48"/>
<text class="fb-b" x="80" y="51" text-anchor="middle">Gen 1</text>
<text class="fb-s" x="80" y="69" text-anchor="middle">server sends spec</text>
<rect class="fb-card" x="170" y="30" width="140" height="48"/>
<text class="fb-b" x="240" y="51" text-anchor="middle">Gen 2</text>
<text class="fb-s" x="240" y="69" text-anchor="middle">flat array spec</text>
<rect class="fb-card" x="330" y="30" width="140" height="48"/>
<text class="fb-b" x="400" y="51" text-anchor="middle">Gen 3</text>
<text class="fb-s" x="400" y="69" text-anchor="middle">tree + editor</text>
<line class="fb-line" x1="150" y1="54" x2="168" y2="54" marker-end="url(#fba)"/>
<line class="fb-line" x1="310" y1="54" x2="328" y2="54" marker-end="url(#fba)"/>
<text class="fb-b" x="10" y="112">Generation 3 pipeline</text>
<rect class="fb-box" x="10" y="122" width="130" height="50"/>
<text class="fb-t" x="75" y="144" text-anchor="middle">Palette + drag</text>
<text class="fb-s" x="75" y="161" text-anchor="middle">user action</text>
<rect class="fb-box" x="175" y="122" width="130" height="50"/>
<text class="fb-t" x="240" y="144" text-anchor="middle">Tree operations</text>
<text class="fb-s" x="240" y="161" text-anchor="middle">pure functions</text>
<rect class="fb-box" x="340" y="122" width="130" height="50"/>
<text class="fb-t" x="405" y="144" text-anchor="middle">History</text>
<text class="fb-s" x="405" y="161" text-anchor="middle">undo and redo</text>
<line class="fb-line" x1="140" y1="147" x2="173" y2="147" marker-end="url(#fba)"/>
<line class="fb-line" x1="305" y1="147" x2="338" y2="147" marker-end="url(#fba)"/>
<line class="fb-line" x1="405" y1="172" x2="405" y2="208" marker-end="url(#fba)"/>
<rect class="fb-card" x="340" y="210" width="130" height="50"/>
<text class="fb-t" x="405" y="232" text-anchor="middle">JSON spec</text>
<text class="fb-s" x="405" y="249" text-anchor="middle">saved output</text>
<rect class="fb-card" x="165" y="210" width="150" height="50"/>
<text class="fb-t" x="240" y="232" text-anchor="middle">Renderer</text>
<text class="fb-s" x="240" y="249" text-anchor="middle">registry + widget</text>
<rect class="fb-card" x="10" y="210" width="130" height="50"/>
<text class="fb-t" x="75" y="232" text-anchor="middle">Form store</text>
<text class="fb-s" x="75" y="249" text-anchor="middle">submit to API</text>
<line class="fb-line" x1="340" y1="235" x2="317" y2="235" marker-end="url(#fba)"/>
<line class="fb-line" x1="165" y1="235" x2="142" y2="235" marker-end="url(#fba)"/>
<text class="fb-s" x="10" y="288">The editor and the renderer read the same spec.</text>
</svg>
<figcaption>Three generations, and how generation 3 flows from editor to API.</figcaption>
</figure>

## The Schema: Two Kinds of "Type", and Identity

A node in generation 3 looks like this:

- `kind`: layout, text, or input
- `widget`: which input to show, for input nodes
- `name`, `label` (multi-language), `constraints`, `logic`, `children`

There are two levels of type because layout, text, and inputs live in one tree. The kind decides how to render. The widget decides which input.

The mistake was identity. A node was known by its position path, like `0.2.1`. React keys were array indexes. Field names were generated at render time by changing the spec in place, outside the history. Later we added a counter just to force a remount.

<figure>
<svg viewBox="0 0 480 295" width="100%" role="img" aria-labelledby="fb2-t" style="max-width:100%;height:auto;display:block">
<title id="fb2-t">Two lists of three nodes, Name, Email and Phone, before and after moving Phone to the top. Left, identity by position: the selection stays on path 0.2, which is now Email, the wrong node. Right, identity by stable id: the selection id c3 still points at Phone.</title>
<style>.fb-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.fb-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.fb-sel{fill:var(--color-ink);stroke:var(--color-ink);stroke-width:1.5}.fb-t{fill:var(--color-ink);font-size:13px}.fb-b{fill:var(--color-ink);font-size:13px;font-weight:700}.fb-inv{fill:var(--color-canvas);font-size:13px;font-weight:700}.fb-s{fill:var(--color-mute);font-size:12px}.fb-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.fb-arrow{fill:var(--color-ink)}</style>
<defs><marker id="fbb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="fb-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="fb-b" x="10" y="20">Identity = position</text>
<text class="fb-b" x="255" y="20">Identity = stable id</text>
<text class="fb-s" x="10" y="42">before</text>
<text class="fb-s" x="255" y="42">before</text>
<rect class="fb-card" x="10" y="50" width="215" height="24"/>
<text class="fb-t" x="20" y="67">0.0  Name</text>
<rect class="fb-card" x="10" y="78" width="215" height="24"/>
<text class="fb-t" x="20" y="95">0.1  Email</text>
<rect class="fb-sel" x="10" y="106" width="215" height="24"/>
<text class="fb-inv" x="20" y="123">0.2  Phone</text>
<rect class="fb-card" x="255" y="50" width="215" height="24"/>
<text class="fb-t" x="265" y="67">a1  Name</text>
<rect class="fb-card" x="255" y="78" width="215" height="24"/>
<text class="fb-t" x="265" y="95">b2  Email</text>
<rect class="fb-sel" x="255" y="106" width="215" height="24"/>
<text class="fb-inv" x="265" y="123">c3  Phone</text>
<line class="fb-line" x1="30" y1="134" x2="30" y2="158" marker-end="url(#fbb)"/>
<line class="fb-line" x1="275" y1="134" x2="275" y2="158" marker-end="url(#fbb)"/>
<text class="fb-s" x="42" y="151">move Phone to top</text>
<text class="fb-s" x="287" y="151">move Phone to top</text>
<text class="fb-s" x="10" y="176">after</text>
<text class="fb-s" x="255" y="176">after</text>
<rect class="fb-card" x="10" y="184" width="215" height="24"/>
<text class="fb-t" x="20" y="201">0.0  Phone</text>
<rect class="fb-card" x="10" y="212" width="215" height="24"/>
<text class="fb-t" x="20" y="229">0.1  Name</text>
<rect class="fb-sel" x="10" y="240" width="215" height="24"/>
<text class="fb-inv" x="20" y="257">0.2  Email</text>
<rect class="fb-sel" x="255" y="184" width="215" height="24"/>
<text class="fb-inv" x="265" y="201">c3  Phone</text>
<rect class="fb-card" x="255" y="212" width="215" height="24"/>
<text class="fb-t" x="265" y="229">a1  Name</text>
<rect class="fb-card" x="255" y="240" width="215" height="24"/>
<text class="fb-t" x="265" y="257">b2  Email</text>
<text class="fb-s" x="10" y="283">selection 0.2 is now Email</text>
<text class="fb-s" x="255" y="283">selection c3 is still Phone</text>
</svg>
<figcaption>Filled row = selected node. A path points at a slot. An id points at the node.</figcaption>
</figure>

Move a node, and every path after it changes. The selection ends up on the wrong node.

Rules:

- Give every node a stable id when you create it.
- Never change the spec outside the history.

## Rendering with a Registry

The kind maps to a component through a registry. Apps can register their own kinds. The widget is a second lookup.

The bug: "override" entries were added after the built-ins, and the lookup used `find()`. First match wins. So apps could add new kinds, but never replace a built-in.

The fix is small. Build a `Map`, and let the last entry win. In dev, warn on duplicates.

```ts
const registry = new Map(
  [...builtIns, ...overrides].map((r) => [r.kind, r] as const)
); // last one wins
```

A pattern that worked well: a custom field callback that also receives the default renderer. Apps can wrap it, not rewrite it.

```ts
customField: (spec, renderDefault) =>
  spec.widget === "phone" ? <PhoneInput spec={spec} /> : renderDefault(spec)
```

## Validation: Parse Once, Map Once

We had three rule formats across the generations:

1. Backend-style strings.
2. A `constraints` object.
3. Constraints plus date relations and required-if.

Stringly-typed rules caused real bugs:

- `"false"` became `true`.
- `min: 0` was ignored, because the check was "is it truthy?".
- `max:` always meant max length, even for numbers.
- `required_if:` was read as plain `required`.

Some fields also got their rules registered twice, with different messages.

Rules:

- Turn the spec into typed rules once, when you load it.
- Use one mapper from those rules to the form library.
- Keep the server as the final authority.

## Conditional Fields Without `eval`

Conditions are where a shortcut is tempting. A string like `country == "ID" && age > 17` is easy for a non-programmer to type. One call to `eval` makes it work.

Don't.

- A spec is data. Data is stored, edited, and imported. If you run it as code, anyone who can write a spec can run code in every viewer's browser.
- Checking the string in the editor is not enough. The renderer sees whatever is stored.
- Errors need an answer. When a condition fails to evaluate, should the field show or hide? Choose on purpose.

The same goes for computed fields. Parse them into tokens and compute them yourself.

Better: write conditions as data, and run them with a tiny interpreter. A small JSON tree is enough.

```ts
type Cond =
  | { all: Cond[] }
  | { any: Cond[] }
  | { field: string; op: "eq" | "neq" | "gt" | "lt" | "in"; value: unknown };

export function matches(c: Cond, v: Record<string, unknown>): boolean {
  if ("all" in c) return c.all.every((x) => matches(x, v));
  if ("any" in c) return c.any.some((x) => matches(x, v));
  const left = v[c.field];
  switch (c.op) {
    case "eq": return left === c.value;
    case "neq": return left !== c.value;
    case "gt": return Number(left) > Number(c.value);
    case "lt": return Number(left) < Number(c.value);
    case "in": return Array.isArray(c.value) && c.value.includes(left);
  }
}

export const depsOf = (c: Cond): string[] =>
  "all" in c ? c.all.flatMap(depsOf) : "any" in c ? c.any.flatMap(depsOf) : [c.field];
// in a node: useWatch({ control, name: depsOf(node.hideIf) })
```

A bonus: `depsOf` tells each node which fields it needs. We come back to this in the performance section.

Also write down what happens to a hidden field's value. Is it dropped? Is its validation skipped? Pick one, and test it.

## The Editor: Undo/Redo and Tree Operations

The history is a reducer with `past`, `present`, and `future`, plus keyboard shortcuts (with Mac detection). It was simple, and it worked.

What I would fix:

- Every edit stored a full deep copy of the spec, with no limit.
- Some tree operations returned `undefined` on a bad path. That became the new state.
- "Don't drop a node into its own child" was checked in the drag UI, not in the operation.
- The selection stored a path, which goes stale after a move.

Rules:

- Tree operations are pure functions. The invariants live inside them.
- On failure, return the previous state.
- Unit test them. They are the easiest tests you will ever write.
- Cap the history, or use structural sharing (for example, Immer).

## Performance: Big Forms Re-render Everything

Every node watched the whole form. So one keystroke re-rendered the whole tree. Other causes:

- Hovering in the editor updated a context that every node read.
- A default `[]` prop made a memo recompute on each render.
- Each select fetched its own options.

I did not measure these with a profiler, so I won't give numbers. The mechanism is clear enough.

<figure>
<svg viewBox="0 0 480 190" width="100%" role="img" aria-labelledby="fb3-t" style="max-width:100%;height:auto;display:block">
<title id="fb3-t">Two rows of five nodes, A to E, while the user types in A. Left, watch everything: all five nodes re-render. Right, watch dependencies: only A, B and D re-render, because B and D depend on A. C and E are skipped.</title>
<style>.fb-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.fb-skip{fill:none;stroke:var(--color-hairline-strong);stroke-width:1.5;stroke-dasharray:5 4}.fb-sel{fill:var(--color-ink);stroke:var(--color-ink);stroke-width:1.5}.fb-t{fill:var(--color-mute);font-size:13px}.fb-b{fill:var(--color-ink);font-size:13px;font-weight:700}.fb-inv{fill:var(--color-canvas);font-size:13px;font-weight:700}.fb-s{fill:var(--color-mute);font-size:12px}</style>
<text class="fb-b" x="10" y="20">Watch everything</text>
<text class="fb-b" x="255" y="20">Watch dependencies</text>
<rect class="fb-sel" x="10" y="34" width="36" height="36"/><text class="fb-inv" x="28" y="57" text-anchor="middle">A</text>
<rect class="fb-sel" x="54" y="34" width="36" height="36"/><text class="fb-inv" x="72" y="57" text-anchor="middle">B</text>
<rect class="fb-sel" x="98" y="34" width="36" height="36"/><text class="fb-inv" x="116" y="57" text-anchor="middle">C</text>
<rect class="fb-sel" x="142" y="34" width="36" height="36"/><text class="fb-inv" x="160" y="57" text-anchor="middle">D</text>
<rect class="fb-sel" x="186" y="34" width="36" height="36"/><text class="fb-inv" x="204" y="57" text-anchor="middle">E</text>
<rect class="fb-sel" x="255" y="34" width="36" height="36"/><text class="fb-inv" x="273" y="57" text-anchor="middle">A</text>
<rect class="fb-sel" x="299" y="34" width="36" height="36"/><text class="fb-inv" x="317" y="57" text-anchor="middle">B</text>
<rect class="fb-skip" x="343" y="34" width="36" height="36"/><text class="fb-t" x="361" y="57" text-anchor="middle">C</text>
<rect class="fb-sel" x="387" y="34" width="36" height="36"/><text class="fb-inv" x="405" y="57" text-anchor="middle">D</text>
<rect class="fb-skip" x="431" y="34" width="36" height="36"/><text class="fb-t" x="449" y="57" text-anchor="middle">E</text>
<text class="fb-s" x="28" y="90" text-anchor="middle">typing</text>
<text class="fb-s" x="273" y="90" text-anchor="middle">typing</text>
<text class="fb-s" x="10" y="122">All five re-render</text>
<text class="fb-s" x="10" y="140">on every keystroke.</text>
<text class="fb-s" x="255" y="122">Only A, B and D re-render.</text>
<text class="fb-s" x="255" y="140">B and D depend on A.</text>
<text class="fb-s" x="10" y="176">Filled = re-renders. Dashed = skipped.</text>
</svg>
<figcaption>One keystroke in field A: everything versus only its dependents.</figcaption>
</figure>

Fixes:

- Compute each node's dependencies from its condition. Watch only those fields.
- Split the context: one for the spec, one for the selection.
- Use stable keys and `memo`.
- Share one options cache between selects.

If I started again, I would change three things first:

1. Stable ids on every node.
2. Conditions as data, with a small interpreter.
3. Pure, tested tree operations with a capped history.

A form builder looks like a drag-and-drop problem. In my experience, it is mostly a data-model problem. Get identity, rules, and conditions right, and the UI is the easy part.
