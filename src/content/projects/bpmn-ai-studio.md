---
title: "BPMN AI Studio"
description: "A browser app that turns a plain-language description of a work process into a standard BPMN diagram. You can change it by chatting, ask questions about it, and export it as a picture. It uses your own AI key, keeps Camunda 7 and 8 settings from imported files, and has an English and Indonesian interface."
featured: true
technologies: ["React 19", "TypeScript", "Vite", "bpmn-js", "Vercel AI SDK", "Zod", "Zustand", "Tailwind CSS", "Camunda moddle", "bpmnlint", "Vitest", "Playwright"]
liveUrl: "https://bpmn-ai-studio.pages.dev/"
githubUrl: ""
image: "/images/bpmn-ai-studio/diagram-en.png"
---

## Project Overview

Every company has processes: approving leave, handling an order, fixing an IT problem. Most of the time they live in long documents or in someone's head. A process diagram shows the same thing as one picture: **who** does each step, **in which order**, and **where a decision** sends the work one way or the other.

**BPMN** (Business Process Model and Notation) is the international standard for these diagrams. Because it is a standard, a BPMN file can be opened in other tools like Camunda or bpmn.io. The problem is that drawing BPMN by hand takes time and training.

BPMN AI Studio lets you type a process the way you would explain it to a colleague, for example *"the employee submits a leave request, the manager approves or rejects it, and HR updates the records"*, and get a clean BPMN diagram back. It is for people who need to explain or improve a process but do not know BPMN: HR and operations staff, process owners, business analysts, auditors, and students.

## Goals

- Turn a description in **English or Indonesian** into a correct BPMN diagram, with no BPMN knowledge needed
- Let the user **change the diagram by chatting**, and **ask questions** about it without changing it
- Keep the user in control: manual changes on the canvas are kept, and every AI change can be undone
- Make the AI output **safe to show**: the diagram is checked before it reaches the screen
- Run with **no account and no app server**: the user brings their own AI key, and everything stays in the browser
- Do not lose data when a diagram comes from another tool: a **Camunda 7 or 8** file keeps its engine settings through an AI edit and an export

## Key Features

1. **Describe and generate**: type a process or click one of the example prompts. The start screen also says that you can import a `.bpmn` file.

![The start screen with an empty canvas, a "Describe a process in your own words" card with three example prompts (an online order, a leave request in Indonesian, and an IT incident), and the prompt box with the DeepSeek model selected](/images/bpmn-ai-studio/empty-state.png)

2. **Edit by chat**: ask for a change like *"Add a document check by HR before approval."* Small edits are patched into the canvas, and big changes (for example new lanes or pools) open a review dialog first. The assistant remembers the recent chat, so *"add that"* works, the changed shapes are highlighted with a *"Changed: ..."* summary, and it asks with clickable options when a request is ambiguous.
3. **Ask questions**: a question like *"Who approves the leave request?"* gets an answer based on the diagram, and the diagram stays the same.
4. **Undo AI change**: the last five AI changes can be rolled back, and a redo button brings the change back. A **Tidy layout** button lays the whole diagram out again.
5. **Import and export**: open a `.bpmn` file, and download the diagram as **PNG** (for documents and chat), SVG, or `.bpmn`. A file from **Camunda 7 or 8** keeps its `camunda:` and `zeebe:` settings, and the app warns before an export that would leave some of them out.
6. **Image input**: attach a photo of a whiteboard sketch, and the AI reads the process from it. The attach button follows the chosen model and is switched off for a model that cannot read images.
7. **Workspace**: keep several diagrams, each with its own chat and history, and back them all up to one JSON file. Six ready-made templates (English and Indonesian) let you start without a key.
8. **Two languages**: the interface is in English and Indonesian. It follows the browser language and can be changed in Settings. The AI answers in the language the user writes in.

![The same leave-request diagram with the interface in Indonesian: three lanes, the "Asisten" chat panel showing the Indonesian prompt, the AI summary, and the answer to "Siapa yang menyetujui cuti?" (Who approves the leave?)](/images/bpmn-ai-studio/diagram-id.png)

9. **Bring your own key**: choose OpenAI, Anthropic Claude, Google Gemini, DeepSeek (the default, because it is cheap), or any OpenAI-compatible endpoint. The model list is loaded from the provider and shows chat models only, and the defaults are current ones (Claude Sonnet 5.5, GPT-6 Luna, Gemini 3.5 Flash-Lite). There is a **Test connection** button, a **Clear stored key** button, and an approximate session cost in USD next to the token count.

![The AI Provider Configuration dialog: a language selector, DeepSeek selected as the provider with a short note on how to get a key, an empty API key field with a Test connection button, and a note that the key stays in this browser](/images/bpmn-ai-studio/settings.png)

## Architecture

The most important rule in this project: **the AI never draws the diagram**. The model only writes structured data (JSON) that describes the process: steps, lanes, decisions, and arrows. My own code turns that data into BPMN, checks it, and lays it out. This keeps the output valid, even when the model makes a mistake.

```
User prompt (English or Indonesian)
   │
   ▼
Intent check ── question? ──► explain answer (diagram stays the same)
   │ change
   ▼
LLM (user's own key) ──► RichGraph JSON (steps, lanes, flows, no coordinates)
   │
   ▼
Zod schema check → normalize → semantic validation ── errors? ──► one repair call
   │
   ▼
graphToXml (BPMN 2.0 XML + kept Camunda data) → layout engine (Web Worker) → layout check
   │
   ▼
bpmn-js canvas ── small edit: patch in place + verify │ big edit: review dialog
   │             └─ state check after each change: heal if canvas and saved graph differ
   ▼
localStorage (diagrams, chat, snapshots, settings; storage schema v2)
```

### Technology Stack
- **React 19 + Vite + TypeScript**: the frontend, with Tailwind CSS and Radix UI for the interface
- **bpmn-js**: the BPMN editor on the canvas, plus the properties panel. It loads as a separate chunk so the first page load stays small
- **Layout engine**: a maintained fork of `bpmn-auto-layout` that places the shapes and routes the arrows. Pools keep their order, message flows between pools get clear channels, and task boxes grow with their text. It runs in a Web Worker (a background thread in the browser) with a 5 second timeout, and changes are checked against about 250 sample diagrams
- **camunda-bpmn-moddle, zeebe-bpmn-moddle**: let the canvas read and write Camunda 7 and 8 attributes, so imported engine settings are not dropped
- **bpmnlint**: a developer script checks a `.bpmn` file with the Camunda compatibility rules for its target
- **Vercel AI SDK**: one way to talk to all the AI providers, with streaming
- **Zod**: checks that the model's JSON has the right shape
- **Zustand**: app state
- **Vitest, Testing Library, Playwright**: unit tests and browser tests
- **Cloudflare Pages**: static hosting

## Interesting Technical Decisions

### Validation before render
Before any diagram reaches the canvas, a set of rules checks it: duplicate ids, arrows that point to nothing, wrong event types, broken boundary events, unpaired links, and decisions with no way in or out. Errors block the render. Smaller problems (no start event, no end event) show a yellow warning but still render. If there are errors, the app sends them back to the model **once** to repair. After layout, another check looks at the geometry: no diagonal arrows, no arrows through shapes, no shapes outside their lane, no overlap. If the layout fails, the basic diagram still renders with a warning.

### Camunda files stay intact
A BPMN file from Camunda has data that the AI does not need and should not touch: `camunda:` and `zeebe:` attributes, extension elements, message and signal definitions, and the original process and participant ids. On import the app keeps this data aside, away from the model, and writes it back into the XML after the diagram is rebuilt. The target engine (Camunda 7 or 8) is read from the file. If an edit would leave out settings the app cannot keep, a banner lists what is affected and the export asks first. The AI cannot write engine settings, on purpose: the app only keeps what the file already had. No diagram was deployed to a real Camunda engine; the validator and real Camunda 7 and 8 fixtures are the checks.

### Small edits patch the canvas, then get checked
Re-importing the whole diagram after every edit would move shapes the user placed by hand. So for small edits, the app builds the target diagram first, then patches only the changed parts on the live canvas. New shapes are placed next to a neighbour, and only the arrows that touch changed elements are re-routed. After the patch, the app reads the canvas back and compares it with the target. If anything is different, it restores the old state and does a full import instead. Each fallback is saved in a local log with a reason code, and there are two switches to turn the patch path off. A separate state check runs after every change made by code (an AI edit, undo, import): if the canvas and the saved graph have drifted apart, the app re-renders from the saved graph once.

### Bring your own key, kept in the browser
There is no backend. The API key is saved only in the browser, and requests go straight from the browser to the AI provider the user picks. A first-run screen explains that prompts and diagrams are sent to that provider. The workspace backup never includes the key. A Content Security Policy header limits which scripts the page can load.

### Dynamic model catalog
Provider model lists change often, and a retired model id breaks the app. So the model list is loaded from the provider's own endpoint, filtered to chat models (no audio, image, embedding or search models), and deprecated models are marked. The default is picked from models with a known price, and a saved list that still holds a retired model moves to its replacement. A DeepSeek key that the provider refuses is not saved. Only DeepSeek was checked against the live service; the defaults for the other providers come from their documentation.

### Storage schema v2
Diagrams and undo snapshots moved to new storage keys in v0.4.0. On first open, the app copies the data of every diagram to v2, and removes the old key only after its v2 copy is written. If the browser storage is full, the old data stays. A diagram written by a newer version is shown empty with a notice and never overwritten. Workspace backups are version 2 too, and the app still imports version 1. The price is that rolling back to v0.3.x is not safe, so the release notes ask for a backup first.

### Plain-language errors
Provider errors (wrong key, no credit, rate limit, network) become short sentences with the provider name. Warnings use element names instead of ids. A **Copy diagnostics** button copies a report (with keys removed), and I can turn that report into a test fixture.

### A separate release branch
Daily work goes to `main`, where every merge runs CI. The live site deploys only from a `release` branch on Cloudflare Pages. I move `main` to `release` with a fast-forward merge after build, lint, unit tests, and browser tests are green, so testers only see a version that passed everything.

### Tests
- **16 selfcheck files**: small scripts that run the core pipeline modules in Node (schema, normalize, validation, XML, layout, diff)
- **1,981 Vitest tests** in 143 files, including property tests that generate random valid diagrams and check the round trip, and a corpus of about 250 diagrams for layout quality
- **119 Playwright browser tests** in 36 files, using a mock AI server that sends fixed answers. One suite runs the same edits through the patch path and the full import path, and both must give the same diagram
- A **live eval** with real prompts against a real provider, scoring each edit for compliance and precision (nothing else touched). It needs an API key, so it runs by hand, not in CI

## Milestones

- **M0, hardened prototype (done)**: bug fixes, the patch-and-verify edit path, request timeouts and cancel, workspace, image input, PNG export, backup, plain-language messages, the empty state with examples, a guard for multiple tabs, and the English + Indonesian UI. Merged on 2026-10-28.
- **M1, closed alpha (now)**: the app is live at [bpmn-ai-studio.pages.dev](https://bpmn-ai-studio.pages.dev/), deployed from the `release` branch. For testers I added a **Send feedback** dialog (it shows exactly what will be sent, and the diagram is included only if the tester chooses), a notice on small screens that says the app works best on a laptop, and link previews for WhatsApp and Telegram. The goal of this stage: a person who has never heard of BPMN can make, explain, edit, and export a diagram without help. Testers still bring their own key for now.

Releases on the way (the live site deploys from the `release` branch):

- **v0.1.0 (28 Oct 2026)**: first version for testers on Cloudflare Pages.
- **v0.2.0 (29 Oct)**: the assistant remembers the chat, highlights what it changed, asks clarifying questions, and the app gets six templates, a backup reminder, a session cost, and shrunk photos before sending.
- **v0.3.0 (29 Oct)**: the Tidy layout button, proper empty pools, and our own layout engine fork. **v0.3.1 (29 Oct)** fixed start events landing in the middle of a pool. **v0.3.2 (30 Oct)** moved the defaults to current models, limited the list to chat models, made image attach follow the model, and stopped saving a refused DeepSeek key.
- **v0.4.0 (30 Oct)**: Camunda 7 and 8 files keep their engine settings, with a warning and a confirmed export when some cannot be kept, the BPMN validator script, and storage schema v2.
- **Next**: a target picker and an engine-specific properties panel (the v0.4.0 notes list both as known limits), then a trial mode so testers can start without a key (a small server that holds a key with a daily limit), then an open beta with abuse protection and a template gallery. After that, an agent that can take several steps on its own with checks after each step, memory of the user's naming habits, and later a self-hosted version for companies.

## Development Time

I built this project together with AI coding agents, mostly **Claude Code**. The commits carry Claude co-author lines (Haiku, Sonnet, and Opus models), and the repo has config folders for several agent tools. Based on the commit timestamps (I added up the gaps between commits that were shorter than one hour):

- **Early prototype (May to July 2026)**: about 8 hours over 4 days. The first editor, multi-provider chat, the AI SDK, and the switch to the semantic pipeline (the model writes JSON, my code builds the BPMN)
- **Main build (24 to 28 October 2026)**: about 15 hours for 205 commits. Validation, auto-layout, BPMN import, the patch-and-verify edits, browser tests, the workspace, two languages, the M0 hardening, and the M1 alpha features
- **Releases v0.2.0 to v0.4.0 (29 to 30 October 2026)**: about 16 hours for 145 commits. Templates, the layout engine fork, the dynamic model catalog, Camunda data round trip, and storage v2
- **Total**: about 39 active hours for 407 commits, spread over 9 working days

This number is a lower bound, because the agents often made several commits at the same time and time between sessions is not counted. My role was mostly the plan and milestones, architecture decisions, review, and testing in the browser. The agents wrote most of the code, and the tests and CI kept it honest. For me, this is the main lesson: with AI agents and a good test suite, one person can ship a real product in a few days, not a few months.

## Future Plans

- A target picker and a properties panel per engine, so a diagram can be prepared for Camunda 7 or 8
- A trial provider so testers do not need their own key
- An open beta with a privacy page and a template gallery
- A bounded agent loop, long-term memory, and search over the user's own SOP documents
- A self-hosted version that a company can run inside its own network
