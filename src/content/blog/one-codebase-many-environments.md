---
title: "One Codebase, Many Environments: My Take on Cherry-Picking"
description: "An opinion from agency work: cherry-picking changes from dev to staging to production is sometimes the right call, always costs more than it looks, and needs a few guardrails."
publishedAt: 2026-11-01
tags: ["git", "workflow", "release management", "agency", "ci/cd"]
---

## My Position

Cherry-picking changes between environments is a tool for a bad situation. It is not a goal.

In agency work it is sometimes the right tool. But it costs more than people think. I would not start a new project this way.

Three points:

- It makes sense when the environments already diverged and the client approves feature by feature.
- It costs you copied commits, repeated conflicts, and code that slowly differs per environment.
- It is only safe with a few small guardrails.

## The Setup

I am a frontend developer at a software agency. On many projects, the client owns the repo where the environment branches live. We also keep our own repo on our own Git host. So each project has two remotes.

In the client's repo, each environment deploys from its own branch: dev, staging, and production. Merge into a branch, and its pipeline runs.

On our side, an integration branch deploys to our own dev server first. That is where the team checks work early.

## The Flow We Actually Use

A change starts on a topic branch. It goes to the integration branch by merge request. Then comes the manual part.

For each target environment, I cut a new branch **from that environment**. I cherry-pick the commits with `-x`, push to the client's repo, and open a PR into the environment branch.

<figure>
<svg viewBox="0 0 480 300" width="100%" role="img" aria-labelledby="ce1-t" style="max-width:100%;height:auto;display:block">
<title id="ce1-t">A topic branch is merged into our integration branch, which deploys to our dev server. From the integration branch, commits are cherry-picked with -x into three promote branches, each cut from its target environment. Each promote branch is opened as a pull request into the dev, staging or production branch, and each environment branch deploys to its own environment.</title>
<style>.ce-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.ce-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.ce-t{fill:var(--color-ink);font-size:13px}.ce-b{fill:var(--color-ink);font-size:13px;font-weight:700}.ce-s{fill:var(--color-mute);font-size:11px}.ce-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.ce-arrow{fill:var(--color-ink)}</style>
<defs><marker id="cea" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ce-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="ce-card" x="10" y="10" width="110" height="50"/>
<text class="ce-t" x="65" y="40" text-anchor="middle">Topic branch</text>
<line class="ce-line" x1="120" y1="35" x2="168" y2="35" marker-end="url(#cea)"/>
<text class="ce-s" x="144" y="28" text-anchor="middle">MR</text>
<rect class="ce-box" x="170" y="10" width="140" height="50"/>
<text class="ce-b" x="240" y="31" text-anchor="middle">Integration</text>
<text class="ce-s" x="240" y="48" text-anchor="middle">deploys to our dev</text>
<path class="ce-line" d="M240 60V128" marker-end="url(#cea)"/>
<path class="ce-line" d="M240 90H80V128" marker-end="url(#cea)"/>
<path class="ce-line" d="M240 90H400V128" marker-end="url(#cea)"/>
<text class="ce-s" x="160" y="84" text-anchor="middle">cherry-pick -x</text>
<rect class="ce-card" x="10" y="130" width="140" height="44"/>
<text class="ce-t" x="80" y="157" text-anchor="middle">promote/dev</text>
<rect class="ce-card" x="170" y="130" width="140" height="44"/>
<text class="ce-t" x="240" y="157" text-anchor="middle">promote/staging</text>
<rect class="ce-card" x="330" y="130" width="140" height="44"/>
<text class="ce-t" x="400" y="157" text-anchor="middle">promote/prod</text>
<path class="ce-line" d="M80 174V218" marker-end="url(#cea)"/>
<path class="ce-line" d="M240 174V218" marker-end="url(#cea)"/>
<path class="ce-line" d="M400 174V218" marker-end="url(#cea)"/>
<text class="ce-s" x="88" y="200">PR</text>
<text class="ce-s" x="248" y="200">PR</text>
<text class="ce-s" x="408" y="200">PR</text>
<rect class="ce-box" x="10" y="220" width="140" height="44"/>
<text class="ce-b" x="80" y="247" text-anchor="middle">dev branch</text>
<rect class="ce-box" x="170" y="220" width="140" height="44"/>
<text class="ce-b" x="240" y="247" text-anchor="middle">staging branch</text>
<rect class="ce-box" x="330" y="220" width="140" height="44"/>
<text class="ce-b" x="400" y="247" text-anchor="middle">prod branch</text>
<text class="ce-s" x="80" y="284" text-anchor="middle">deploys to dev</text>
<text class="ce-s" x="240" y="284" text-anchor="middle">deploys to staging</text>
<text class="ce-s" x="400" y="284" text-anchor="middle">deploys to production</text>
</svg>
<figcaption>One change, up to three promote branches, each cut from its target.</figcaption>
</figure>

One change can travel to up to four places, if you count our own release branch. Dev is relaxed: merges are fine there. Staging and production only get picked commits.

When the PRs exist, the task moves to testing.

## Why We Do It

Not because it is elegant. The environment branches had already diverged. None of them was an ancestor of the next one. Merging staging into production would drag in work the client never approved.

And the client says things like "ship A, but not B." Cherry-picking is the honest answer to that sentence.

But look at this: on two projects where we promoted by merge from the start, we have around ten copied commits. On the cherry-pick projects, we have hundreds.

That is not proof. The projects differ in age, team size, and client rules. But I feel the difference every week.

## Where It Hurts

These are the pains I hit again and again:

- **Missing prerequisites.** The fix depends on a refactor that was never promoted. The pick builds nowhere.
- **Dependencies that do not travel.** The code moves, the `package.json` change does not. Production CI breaks.
- **Conflict hotspots.** Shared constants, routes, layout imports, tests, lockfiles.
- **Bleed-through.** While resolving a conflict, code from an unpromoted feature slips in. The diff looks fine. It is not.
- **Wrong base branch.** One promote branch was cut from the wrong environment. The PR had a pile of surprise changes and was thrown away.
- **Different test baselines.** A test already fails in the target. The push hook fails. Someone is tempted to use `--no-verify`.

The worst part is slow drift. Every adapted pick makes two environments a little less equal. After a few months, "same feature" does not mean "same code".

## Guardrails That Help

I do not believe in heroic discipline. I believe in small checks.

- Always use `-x`. Never type the trailer by hand.
- Pick from the original commit, not from an earlier pick. Chains of trailers point to the wrong parent.
- One promote branch per environment, always cut from that environment.
- Promote in dependency order, and write the prerequisites in the ticket.
- Compare trees, not logs, to ask "do these environments run the same code?" `git diff --stat` answers that.
- Keep environment config out of commits. Use env vars, not hardcoded endpoints or mocks.

Here is a small sketch. The branch names are made up. I ran both scripts on a throwaway repo, but adjust them to your setup.

```bash
#!/usr/bin/env bash
# promote.sh <env> <commit>...   e.g. ./promote.sh staging 1a2b3c4 5d6e7f8
set -euo pipefail
target="$1"; shift
git fetch origin "$target"
branch="promote/${target}/$(date +%Y%m%d)-$(git rev-parse --short "$1")"
git switch -c "$branch" "origin/${target}"   # always cut from the target env
for c in "$@"; do
  git cherry-pick -x "$c"                    # adds "(cherry picked from commit <sha>)"
done
git push -u origin "$branch"                 # then open a PR into $target
```

Next, "what is still missing?" `git cherry` compares patches. A commit picked with conflict edits has a different patch, so it still shows up as missing. The `-x` trailer closes that gap:

```bash
#!/usr/bin/env bash
# missing.sh [source] [target]  - commits in source that target does not have yet
set -euo pipefail
src="${1:-origin/integration}"; dst="${2:-origin/staging}"
picked="$(git log "$dst" --format=%B | { grep -oE 'cherry picked from commit [0-9a-f]{40}' || true; } | awk '{print $5}' | sort -u)"
git cherry "$dst" "$src" | awk '$1=="+"{print $2}' | while read -r sha; do
  grep -qx "$sha" <<<"$picked" || git log -1 --format='%h %s' "$sha"
done
```

Two signals, one answer. It only works if `-x` was used from the start. On our projects, most picks this year carry it. Older ones do not.

## Cherry-Pick, Merge, or Trunk?

<figure>
<svg viewBox="0 0 480 250" width="100%" role="img" aria-labelledby="ce2-t" style="max-width:100%;height:auto;display:block">
<title id="ce2-t">Three strategies side by side. Cherry-pick: a change is copied into each environment as a new commit. Promote by merge: each environment merges from the one below, so everything below goes up. Trunk plus flags: one main branch, a release is cut from it, and unfinished features are hidden behind a flag.</title>
<style>.ce-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.ce-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.ce-t{fill:var(--color-ink);font-size:13px}.ce-b{fill:var(--color-ink);font-size:13px;font-weight:700}.ce-s{fill:var(--color-mute);font-size:11px}.ce-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.ce-dash{stroke-dasharray:5 4}.ce-arrow{fill:var(--color-ink)}.ce-dot{fill:var(--color-ink)}.ce-ring{fill:var(--color-surface-card);stroke:var(--color-ink);stroke-width:1.5}</style>
<defs><marker id="ceb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ce-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="ce-b" x="80" y="20" text-anchor="middle">Cherry-pick</text>
<rect class="ce-box" x="10" y="30" width="140" height="150"/>
<text class="ce-s" x="20" y="54">dev</text>
<text class="ce-s" x="20" y="94">staging</text>
<text class="ce-s" x="20" y="134">prod</text>
<circle class="ce-dot" cx="100" cy="50" r="6"/>
<circle class="ce-ring" cx="100" cy="90" r="6"/>
<circle class="ce-ring" cx="100" cy="130" r="6"/>
<path class="ce-line ce-dash" d="M100 56V82" marker-end="url(#ceb)"/>
<path class="ce-line ce-dash" d="M100 96V122" marker-end="url(#ceb)"/>
<text class="ce-s" x="80" y="166" text-anchor="middle">copy, new SHA</text>
<text class="ce-b" x="240" y="20" text-anchor="middle">Promote by merge</text>
<rect class="ce-box" x="170" y="30" width="140" height="150"/>
<text class="ce-s" x="180" y="54">dev</text>
<text class="ce-s" x="180" y="94">staging</text>
<text class="ce-s" x="180" y="134">prod</text>
<circle class="ce-dot" cx="260" cy="50" r="6"/>
<circle class="ce-dot" cx="260" cy="90" r="6"/>
<circle class="ce-dot" cx="260" cy="130" r="6"/>
<path class="ce-line" d="M260 56V82" marker-end="url(#ceb)"/>
<path class="ce-line" d="M260 96V122" marker-end="url(#ceb)"/>
<text class="ce-s" x="240" y="166" text-anchor="middle">all of it goes up</text>
<text class="ce-b" x="400" y="20" text-anchor="middle">Trunk + flags</text>
<rect class="ce-box" x="330" y="30" width="140" height="150"/>
<text class="ce-s" x="340" y="74">main</text>
<line class="ce-line" x1="372" y1="70" x2="460" y2="70"/>
<circle class="ce-dot" cx="390" cy="70" r="6"/>
<circle class="ce-dot" cx="420" cy="70" r="6"/>
<circle class="ce-ring ce-dash" cx="450" cy="70" r="6"/>
<path class="ce-line" d="M420 76V112H450" marker-end="url(#ceb)"/>
<text class="ce-s" x="340" y="116">release</text>
<text class="ce-s" x="400" y="146" text-anchor="middle">dashed: flag off</text>
<text class="ce-s" x="400" y="166" text-anchor="middle">ship all, show few</text>
<text class="ce-s" x="240" y="214" text-anchor="middle">Filled dot: the original commit. Empty dot: a copy.</text>
</svg>
<figcaption>Three ways to move a change up.</figcaption>
</figure>

| | Cherry-pick | Promote by merge | Trunk + flags |
| --- | --- | --- | --- |
| Fits when | The client approves per feature and branches already diverged | The client accepts "all that passed staging goes up" | You own the product long term |
| Cost | Copies, repeated conflicts, drift | One bad feature blocks the rest | Flag setup and cleanup |
| Main risk | Environments quietly differ | Half-done work goes up | Forgotten flags |

My rule of thumb is simple. If the client accepts "everything that passed staging goes up," promote by merge. If they approve per feature and the branches are already apart, cherry-pick with guardrails. If you own the product for years, use trunk and flags.

## Where AI Agents Fit

I let an agent do some of the picks. It is good at the boring part: run the script, resolve simple conflicts, report what is missing.

But bleed-through is the kind of bug a tired eye misses, and a model misses it too. So I read every conflict resolution myself, and a human opens the PR. I wrote about this split in [How I Run Claude Code as a Small Team](/blog/claude-code-small-team).

## What I Would Change

- On a new project, promote by merge, and keep each environment branch an ancestor of the next.
- Put `-x` and the "what is missing" check into the PR checklist, or into CI.
- Ask the client on day one: "Do you approve per feature or per release?" That answer decides the strategy more than any tool does.

Cherry-picking works. I just want it to be the exception that I chose, not the default that I inherited.
