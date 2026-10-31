---
title: "How I Run Claude Code as a Small Team"
description: "One main session that coordinates, four subagents with clear jobs, and a few hard rules. What worked, what I borrowed from open-source agent setups, and what I refuse to automate."
publishedAt: 2026-11-01
tags: ["claude code", "ai agents", "workflow", "subagents", "developer experience"]
---

## One Session Is Not a Team

I am a frontend developer at a software agency. I use Claude Code every day. At first I used one long session for everything. It planned, coded, tested, and reviewed in the same chat.

It worked, until it did not. The context got huge. The model forgot early decisions. And it sometimes did things I never asked for.

So I stopped treating Claude as one person. I run it as a **small team** with roles, rules, and a paper trail.

<figure>
<svg viewBox="0 0 480 250" width="100%" role="img" aria-labelledby="ct1-t" style="max-width:100%;height:auto;display:block">
<title id="ct1-t">The user talks to the main session, which only coordinates. The main session delegates to four subagents: analyst plans, executor writes code, tester runs tests, reviewer reads code.</title>
<style>.ct-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.ct-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.ct-t{fill:var(--color-ink);font-size:13px}.ct-b{fill:var(--color-ink);font-size:13px;font-weight:700}.ct-s{fill:var(--color-mute);font-size:11px}.ct-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.ct-dash{stroke-dasharray:5 4}.ct-arrow{fill:var(--color-ink)}</style>
<defs><marker id="cta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ct-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="ct-box" x="10" y="10" width="460" height="64"/>
<text class="ct-b" x="240" y="36" text-anchor="middle">Main session (coordinator)</text>
<text class="ct-s" x="240" y="56" text-anchor="middle">talks to me, delegates, reports. Never edits code.</text>
<path class="ct-line" d="M60 74V120" marker-end="url(#cta)"/>
<path class="ct-line" d="M180 74V120" marker-end="url(#cta)"/>
<path class="ct-line" d="M300 74V120" marker-end="url(#cta)"/>
<path class="ct-line ct-dash" d="M420 74V120" marker-end="url(#cta)"/>
<rect class="ct-card" x="6" y="122" width="108" height="96"/>
<text class="ct-b" x="60" y="148" text-anchor="middle">Analyst</text>
<text class="ct-s" x="60" y="168" text-anchor="middle">Opus</text>
<text class="ct-s" x="60" y="186" text-anchor="middle">root cause</text>
<text class="ct-s" x="60" y="202" text-anchor="middle">and plan</text>
<rect class="ct-card" x="126" y="122" width="108" height="96"/>
<text class="ct-b" x="180" y="148" text-anchor="middle">Executor</text>
<text class="ct-s" x="180" y="168" text-anchor="middle">Sonnet</text>
<text class="ct-s" x="180" y="186" text-anchor="middle">writes code</text>
<rect class="ct-card" x="246" y="122" width="108" height="96"/>
<text class="ct-b" x="300" y="148" text-anchor="middle">Tester</text>
<text class="ct-s" x="300" y="168" text-anchor="middle">Sonnet</text>
<text class="ct-s" x="300" y="186" text-anchor="middle">runs tests,</text>
<text class="ct-s" x="300" y="202" text-anchor="middle">reports bugs</text>
<rect class="ct-card" x="366" y="122" width="108" height="96"/>
<text class="ct-b" x="420" y="148" text-anchor="middle">Reviewer</text>
<text class="ct-s" x="420" y="168" text-anchor="middle">Opus</text>
<text class="ct-s" x="420" y="186" text-anchor="middle">reads code</text>
<text class="ct-s" x="420" y="202" text-anchor="middle">only if asked</text>
<text class="ct-s" x="240" y="242" text-anchor="middle">dashed: runs only when I ask</text>
</svg>
<figcaption>One coordinator, four specialists.</figcaption>
</figure>

## The Roles

| Role | Model | Job | Limit |
| --- | --- | --- | --- |
| Main session | Opus, medium effort | Talk to me, delegate, report | Does not edit code |
| Analyst | Opus, high effort | Root cause, trade-offs, plan | Read-only, except the plan file |
| Executor | Sonnet, high effort | Write the code | Stays inside the task scope |
| Tester | Sonnet, high effort | Write and run tests, Playwright | Reports bugs, never fixes app code |
| Reviewer | Opus, high effort | Read a diff for bugs and risks | Only when I ask |

Thinking goes to Opus. Typing code goes to Sonnet. The main session stays small, because it never reads big diffs.

## Route by Risk

A plan for a one-line fix is waste.

<figure>
<svg viewBox="0 0 480 270" width="100%" role="img" aria-labelledby="ct2-t" style="max-width:100%;height:auto;display:block">
<title id="ct2-t">A new task is checked: is the cause and location clear? If yes, it goes straight to the executor. If no, or if it is a new feature or touches many files, the analyst writes a plan first, then the executor works from the plan. Reviewer and tester run only on request.</title>
<style>.ct-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.ct-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.ct-t{fill:var(--color-ink);font-size:13px}.ct-b{fill:var(--color-ink);font-size:13px;font-weight:700}.ct-s{fill:var(--color-mute);font-size:11px}.ct-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.ct-dash{stroke-dasharray:5 4}.ct-arrow{fill:var(--color-ink)}</style>
<defs><marker id="ctb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ct-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="ct-box" x="110" y="10" width="260" height="50"/>
<text class="ct-b" x="240" y="32" text-anchor="middle">New task</text>
<text class="ct-s" x="240" y="49" text-anchor="middle">Is the cause and place clear?</text>
<path class="ct-line" d="M170 60V90H100V120" marker-end="url(#ctb)"/>
<path class="ct-line" d="M310 60V90H380V120" marker-end="url(#ctb)"/>
<text class="ct-s" x="100" y="84" text-anchor="middle">yes: small</text>
<text class="ct-s" x="380" y="84" text-anchor="middle">no, or new feature</text>
<rect class="ct-card" x="10" y="122" width="180" height="46"/>
<text class="ct-b" x="100" y="150" text-anchor="middle">Executor</text>
<rect class="ct-card" x="290" y="122" width="180" height="46"/>
<text class="ct-b" x="380" y="143" text-anchor="middle">Analyst</text>
<text class="ct-s" x="380" y="159" text-anchor="middle">writes plan.md</text>
<path class="ct-line" d="M380 168V190H190V200" marker-end="url(#ctb)"/>
<rect class="ct-card" x="110" y="202" width="160" height="40"/>
<text class="ct-b" x="190" y="227" text-anchor="middle">Executor</text>
<text class="ct-s" x="380" y="216" text-anchor="middle">then, only if I ask:</text>
<text class="ct-s" x="380" y="233" text-anchor="middle">reviewer, tester</text>
</svg>
<figcaption>Small and clear goes straight to code. The rest gets a plan.</figcaption>
</figure>

- **Small**: the bug is at a known line, or the logic error is obvious. Straight to the executor.
- **Needs analysis**: unclear cause, a new feature, or many callers. Analyst first.
- The main session says the class in one line when it delegates. So I can disagree early.

## Paper Trail Instead of Long Prompts

I measured 14 days of transcripts before changing anything. The numbers surprised me:

| What | Median size |
| --- | --- |
| Prompt to executor | ~3,900 characters |
| Prompt to analyst | ~4,800 characters |
| Executor report | ~5,000 characters |
| Analyst report | ~13,000 characters (max ~29,000) |

Most of that was copy-paste between agents. So each task gets a folder inside the repo:

```text
<repo>/.ai/tasks/<id>/
  task.md      plan.md
  exec-1.md    test-1.md    revision-1.md
```

The folder is listed in `.git/info/exclude`, not `.gitignore`. So a client repo never changes, and nothing gets committed by accident.

<figure>
<svg viewBox="0 0 480 240" width="100%" role="img" aria-labelledby="ct3-t" style="max-width:100%;height:auto;display:block">
<title id="ct3-t">The main session sends a three-line prompt to an agent. The agent writes details into the task folder and replies with one status line plus at most fifteen lines. The main session reads files from the folder only when needed.</title>
<style>.ct-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.ct-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.ct-t{fill:var(--color-ink);font-size:13px}.ct-b{fill:var(--color-ink);font-size:13px;font-weight:700}.ct-s{fill:var(--color-mute);font-size:11px}.ct-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.ct-dash{stroke-dasharray:5 4}.ct-arrow{fill:var(--color-ink)}</style>
<defs><marker id="ctc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ct-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="ct-card" x="10" y="20" width="130" height="60"/>
<text class="ct-b" x="75" y="46" text-anchor="middle">Main session</text>
<text class="ct-s" x="75" y="64" text-anchor="middle">coordinator</text>
<rect class="ct-card" x="340" y="20" width="130" height="60"/>
<text class="ct-b" x="405" y="46" text-anchor="middle">Agent</text>
<text class="ct-s" x="405" y="64" text-anchor="middle">a subagent</text>
<line class="ct-line" x1="140" y1="38" x2="338" y2="38" marker-end="url(#ctc)"/>
<text class="ct-s" x="240" y="30" text-anchor="middle">3-line prompt</text>
<line class="ct-line" x1="340" y1="64" x2="142" y2="64" marker-end="url(#ctc)"/>
<text class="ct-s" x="240" y="82" text-anchor="middle">STATUS + max 15 lines</text>
<rect class="ct-box" x="120" y="150" width="240" height="70"/>
<text class="ct-b" x="240" y="176" text-anchor="middle">Task folder</text>
<text class="ct-s" x="240" y="196" text-anchor="middle">task.md  plan.md  exec-1.md ...</text>
<path class="ct-line" d="M405 80V185H362" marker-end="url(#ctc)"/>
<text class="ct-s" x="398" y="130" text-anchor="end">writes details</text>
<path class="ct-line ct-dash" d="M75 80V185H118" marker-end="url(#ctc)"/>
<text class="ct-s" x="82" y="130" text-anchor="start">reads if needed</text>
</svg>
<figcaption>The prompt points to files. The reply is short. Details live in the folder.</figcaption>
</figure>

The delegation prompt is now three lines: the task, which step to do, and whether to commit. Every reply starts with one status line:

| Agent | First line |
| --- | --- |
| Executor | `STATUS: DONE`, `PARTIAL`, or `BLOCKED` |
| Tester | `RESULT: PASS`, `FAIL`, or `PARTIAL` |
| Reviewer | `VERDICT: PASS` or `CHANGES` |
| Analyst | `PLAN: READY` or `NEEDS-DECISION` |

I have not measured the sizes again after the change. That is the next step. I will compare the same medians over another 14 days, and I will write down the result, good or bad.

## Rules That Do Not Bend

Some of these live in the agent files. Some are enforced by hooks.

- Commit, push, merge request, and task comments: **only when I ask**.
- Reviewer and tester never run automatically after the executor.
- At most 8 executors in parallel, and only if their files do not overlap. Otherwise each gets its own git worktree. Parallel executors never commit.
- Test runs only touch related files. The full suite runs only when I ask.
- Fixes go back to the **same** executor, with a limit of 2 rounds. After that, a human decides.
- A late change from me goes to a `revision-1.md` file, then to the same agent. It does not get lost in chat.

Prompts are soft. A model can ignore a sentence. So the dangerous parts have **hooks**, small scripts that run before a command:

- One hook blocks force-push to protected branches, `--no-verify`, `rm -r` outside the project, and reading production `.env` files. It asks me before a push to certain remotes.
- Another hook scans my prompt for pasted secrets.

This one paid off. I once pasted a secret into the chat by mistake. The hook flagged it. The agent did not copy it anywhere, asked me to rotate it, and I set the new value in the provider dashboard.

## Memory, and Why I Removed a Plugin

I keep memory in three small layers:

1. A global `CLAUDE.md` for how I work.
2. A `memory.md` for facts true in every repo, one line per fact.
3. Auto memory for each project.

I also tried a plugin that remembers everything automatically. I removed it. It started hundreds of summary sessions (441 folders), and it pushed a large block of context into every new session. Small hand-written files are cheaper and easier to trust.

## What I Borrowed, and What I Did Not

I learned a lot from open-source "software factory" setups, like the [examples in the zazencodes series](https://github.com/zazencodes/zazencodes-season-3). The flow there is spec, build, review, approve, with deterministic checks before any reviewer.

| Borrowed | Skipped |
| --- | --- |
| Status on the first line | Auto-merge and an autonomous approver |
| Artifacts as files | A queue of GitHub issues |
| Resume the same agent | Four reviewers on every job |
| Routing by risk | Full test suite every round |
| | Protected-path lists |

I skipped the right column on purpose. Agency work needs a human gate, merge request review, and cherry-picks across environments. The client trusts me, not an approver bot.

## Lessons From Real Sessions

- Feedback arrives **after** the agent finishes. A revision file solves this.
- A tester is great for live checks with a small budget, such as at most 12 questions to an LLM endpoint.
- Models copy markers they see in history. One agent kept adding a link to [my Ask Me post](/blog/generative-ui-ask-me) because earlier text had it. Clean the history, or say so in the prompt.

## Verdict

Roles, a paper trail, and a few hooks give me most of the benefit. They cost very little. A full autonomous pipeline would cost much more trust than it saves time.

To try this, start small: one executor agent, one rule that nothing is committed without you, one hook for secrets. Add the rest when something hurts.
