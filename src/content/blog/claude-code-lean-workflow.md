---
title: "My Claude Code 'Team' Cost 3 Billion Tokens in a Week. Here Is the Lean Version."
description: "I ran Claude Code like a small team of agents. For one side project that meant 3.1 billion tokens in seven days. I measured where the tokens went, rebuilt the workflow around one main session and one executor, and measured again."
publishedAt: 2026-11-15
tags: ["ai", "claude code", "workflow", "side project", "cost"]
---


## The Bill I Did Not Expect

A while ago I wrote [How I Run Claude Code as a Small Team](/blog/claude-code-small-team): an analyst plans, an executor writes code, a reviewer reads it, a tester tests it, and up to eight executors run in parallel. It felt productive. It was.

Then I looked at the numbers for one side project, [BPMN AI Studio](/projects/bpmn-ai-studio). In seven days it used **3.1 billion tokens**. At API prices that is about **$1,332**. It ran on a Max subscription, so I never saw a bill. But I want my side projects on a cheap personal plan, and the question was simple: does any of this fit into a $20 plan?

Not like this. So I measured first.

## Where the Tokens Went

Claude Code keeps a transcript of every session, including every subagent, with the token usage of each call. Two numbers explained almost everything:

- **97.6% of all tokens were cache reads.** Every turn, the model reads the whole conversation again. Thanks to prompt caching that reread costs only a tenth of the normal input price, but it is still the bulk of the bill. The answers themselves were a small part.
- **Subagents made 87% of the API calls and 71% of the cost.** Each subagent starts with a fresh context and reads the repo again: the plan, the files, the rules. A chain of four agents means four people reading the same code before anyone changes a line. Eight in parallel means eight.

The first number told me what does *not* help: tools that make the model answer in fewer words. If 97.6% is re-reading, a shorter answer saves almost nothing. The second number told me what does: fewer contexts, and shorter ones.

## The Lean Workflow

The new rules fit on one screen. They live in one file that every session in my personal folder loads, and a small sync script copies them into each repo so Codex and OpenCode see them too.

1. **The main session does the work.** Questions, small fixes and small changes happen right there. No plan, no review.
2. **A bigger change gets a plan first.** For a new feature, three or more files, or a schema change, the agent writes a short `.ai/plan.md` with the exact files and functions, and waits for my OK.
3. **One executor runs the plan, in a fresh context.** After the OK, the main session starts exactly one executor with one instruction: *implement .ai/plan.md*. It reads the plan, a generated map of the repo and the notes for that area, and nothing else. It does not see the chat, so the plan has to be complete.
4. **Review and tests only when I ask**, or when a diff touches risky areas such as auth, money or data deletion. No automatic chains.
5. **Checks cost zero tokens when they pass.** A hook records which files the agent edited. When its turn ends, a script runs lint, typecheck and the related tests for just those files. On a pass it prints nothing. On a failure the agent gets the errors and fixes them.
6. **Context that survives a session.** A generated `repo-map.md` (structure, commands, busy areas, made by a script, so no tokens) and a `NOTES.md` with the decisions, gotchas and verified commands. Agents update the notes themselves when they learn something durable.
7. **One topic per session.** Finish, write down what matters, then `/clear`.

<figure>
<svg viewBox="0 0 520 380" width="100%" role="img" aria-labelledby="lw1-t" style="max-width:100%;height:auto;display:block">
<title id="lw1-t">A request takes one of two paths. A small change is done by the main session directly. A feature or a change to three or more files first gets a written plan in .ai/plan.md, then waits for the user's OK, then one executor implements it in a fresh context. Both paths end in a stop hook that runs lint, typecheck and related tests, silent when they pass, and then a short report of at most five lines.</title>
<style>.lw-box{fill:var(--color-surface-soft);stroke:var(--color-hairline-strong);stroke-width:1.5}.lw-card{fill:var(--color-surface-card);stroke:var(--color-hairline-strong);stroke-width:1.5}.lw-t{fill:var(--color-ink);font-size:13px}.lw-b{fill:var(--color-ink);font-size:13px;font-weight:700}.lw-s{fill:var(--color-mute);font-size:12px}.lw-line{stroke:var(--color-ink);stroke-width:1.5;fill:none}.lw-arrow{fill:var(--color-ink)}</style>
<defs><marker id="lwa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="lw-arrow" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="lw-s" x="10" y="20">small change</text>
<text class="lw-s" x="270" y="20">3+ files</text>
<rect class="lw-box" x="10" y="30" width="230" height="44"/>
<text class="lw-t" x="125" y="49" text-anchor="middle">Main session</text>
<text class="lw-s" x="125" y="65" text-anchor="middle">edits directly</text>
<rect class="lw-box" x="270" y="30" width="240" height="44"/>
<text class="lw-t" x="390" y="49" text-anchor="middle">Write the plan</text>
<text class="lw-s" x="390" y="65" text-anchor="middle">.ai/plan.md</text>
<rect class="lw-box" x="270" y="94" width="240" height="44"/>
<text class="lw-t" x="390" y="121" text-anchor="middle">I say OK</text>
<rect class="lw-box" x="270" y="158" width="240" height="44" style="stroke-width:2.5"/>
<text class="lw-b" x="390" y="177" text-anchor="middle">One executor</text>
<text class="lw-s" x="390" y="193" text-anchor="middle">fresh context</text>
<rect class="lw-card" x="10" y="230" width="500" height="44"/>
<text class="lw-t" x="260" y="249" text-anchor="middle">Stop hook</text>
<text class="lw-s" x="260" y="265" text-anchor="middle">lint, types, tests · silent when they pass</text>
<rect class="lw-card" x="10" y="292" width="500" height="40"/>
<text class="lw-t" x="260" y="309" text-anchor="middle">Report</text>
<text class="lw-s" x="260" y="325" text-anchor="middle">at most 5 lines</text>
<line class="lw-line" x1="125" y1="74" x2="125" y2="228" marker-end="url(#lwa)"/>
<line class="lw-line" x1="390" y1="74" x2="390" y2="92" marker-end="url(#lwa)"/>
<line class="lw-line" x1="390" y1="138" x2="390" y2="156" marker-end="url(#lwa)"/>
<line class="lw-line" x1="390" y1="202" x2="390" y2="228" marker-end="url(#lwa)"/>
<line class="lw-line" x1="260" y1="274" x2="260" y2="290" marker-end="url(#lwa)"/>
<text class="lw-s" x="10" y="356">On a failure the hook sends the errors back to the same agent.</text>
<text class="lw-s" x="10" y="374">Both paths read repo-map.md and NOTES.md instead of the whole repo.</text>
</svg>
<figcaption>Two paths for a request. Only the bigger one starts a second context.</figcaption>
</figure>

## Why Not Just Switch Models?

A natural idea: plan with a strong model, then switch to a cheaper one to write the code. In the same session, that is often the expensive choice.

The prompt cache belongs to one model. When you switch, the cache is gone, and the next turn reads the whole conversation at full price. With an 80,000-token history that one turn costs about ten times a normal one. The new model also inherits everything from the planning discussion: rejected options, files read once and never needed again.

Handing the plan over as a file avoids both. The executor starts with a few thousand tokens of plan and the files it needs. That is the real reason step 3 exists. Automation is a nice bonus.

## What I Did Not Use

- **Shorter answers (caveman-style prompts).** See above: the cost is in re-reading, not in writing. I kept one rule instead: reports of at most five lines.
- **Ponytail** makes the agent write less code. Its own benchmark claims 22% fewer tokens; [JetBrains measured much less](https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/). Its rules are injected every turn and into every subagent. I took one idea as one line: before writing code, check if it is needed at all, then reuse, then use what is already in the repo, then write the smallest new code.
- **Headroom** compresses context through a local proxy. Changing earlier parts of the prompt can break the prompt cache, which is the one discount I rely on, and it would need a proxy in front of a subscription login. I skipped it.
- **RTK** stayed. It filters shell output before the model sees it, costs nothing per call, and saved 45.6% on the commands it handled.

One finding I did not expect: a script that counts the prompts I typed most often found "is it stuck?" six times. The agent was going quiet during long steps. The fix is one rule: send a one-line status when a step will take a while.

## The Result

Costs are API-equivalent, from the transcripts. The first evening was one project; the second was a full night with two projects running side by side: [BPMN AI Studio](/projects/bpmn-ai-studio) and a new exam practice app.

| | 7 days before | Evening 1 | Night 2 (two projects) |
|---|---|---|---|
| Cost per active hour | $16 | $5.7 | $6.1 |
| Cost per commit | $2.7 | $1.1 | $1.4 |
| Share of cost from subagents | 71% | 43% | 50% |
| Models | Opus and Sonnet | Sonnet only | Sonnet only |

About three times cheaper per hour, and the second night landed close to the first. The subagent share is still around half, but now that is one executor per plan, doing real work, instead of a chain. On night 2 all 19 subagents were executors started with the same instruction: *implement .ai/plan.md*.

What that night produced, from `git log`, lockfiles excluded:

- **22 commits** across the two repos.
- About **12,500 lines of source and 8,000 lines of tests**, plus docs.
- 95 million tokens and $31 API-equivalent, for 5 active hours spread over 10 hours of wall time.

Cache reads were still 96% of the input. The workflow did not change that ratio; it cut how many contexts pay it.

All dollar figures are a lower bound. Transcripts miss some calls, such as compaction and background summaries: on the sessions where I could compare, Claude Code's own counters came out about 30% higher.


**Does it fit in Pro?** Anthropic does not publish limits in tokens. It says Max 5x gives five times the usage of Pro, per five hours and per week. So I read the usage bars on the Max account during one evening of personal work and divided by five:

- The **weekly** bar moved 4%. That is about **20% of a Pro week**: roughly five evenings like this per week.
- The **5-hour** bar moved 16%. That is about **80% of a Pro window**: a dense session nearly fills one.

The second night, with two projects and all Sonnet, moved the **weekly** bar **3%**. That is about **15% of a Pro week**: six or seven nights like that per week. It also gives a rough exchange rate: 1% of the Max 5x week was about $10 API-equivalent on that night, so a Pro week is in the region of $200 of API usage. That assumes the bar tracks API cost linearly, which Anthropic does not promise.

So Pro is enough for my side projects with this workflow, and the limit I will feel is the five-hour window, not the week. A third of the first evening was a long research session on Opus; on Sonnet the window gets more room.


## Measure Your Own

- Your transcripts are in `~/.claude/projects/`. Each assistant message has a `usage` block with input, cache write, cache read and output tokens. Sum them per session, and split main session and subagents.
- Look at the cache-read share first. If it is high, shorter answers will not help; fewer and shorter contexts will.
- Read the 5-hour and weekly bars before and after a session. If you are on Max and wonder about Pro, divide by five.

## Sources

Official docs (fetched 2026-11-03):
- Claude Code: [memory and CLAUDE.md](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks) and the [hooks guide](https://code.claude.com/docs/en/hooks-guide), [permissions](https://code.claude.com/docs/en/permissions), [slash commands](https://code.claude.com/docs/en/commands), [subagents](https://code.claude.com/docs/en/sub-agents), [model configuration](https://code.claude.com/docs/en/model-config), [managing costs](https://code.claude.com/docs/en/costs)
- [OpenCode docs](https://opencode.ai/docs) (rules, commands, skills, plugins), [oh-my-pi docs](https://omp.sh/docs/context-files), [OpenAI Codex](https://github.com/openai/codex) (AGENTS.md, skills, hooks)
- Plans and limits: [claude.com/pricing](https://claude.com/pricing), [Using Claude Code with your Pro or Max plan](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)

Ideas I borrowed:
- [Kybern](https://github.com/Tresnanda/kybern): a generated repo map, a notes file with a human-owned brief and tagged memory, and keeping always-loaded files free of dates so the prompt cache holds.
- Lauren Tan, "Trust First, Then Parallel" ([post](https://x.com/poteto/status/2102050467505430555), [summary](https://redreamality.com/blog/lauren-tan-poteto-trust-before-parallel/), [pstack guide](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md)): reproduce a bug before fixing it, move a repeated correction to the strongest layer (code, then lint or tests, then notes), and make the easy path the correct path.
- Token-saving tools compared: [Pillitteri, July 2026](https://pasqualepillitteri.it/en/news/7881/caveman-rtk-pxpipe-headroom-claude-code-tokens), [JetBrains on Ponytail](https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/), [a Ponytail benchmark write-up](https://news.creeta.com/en/ponytail-claude-code-token-benchmark-2026/), [Headroom](https://github.com/headroomlabs-ai/headroom/wiki).

My own design choices, not from a source: handing the plan to a fresh executor instead of switching models (inferred from how the prompt cache works), and capping the automatic check at two rounds per turn.
