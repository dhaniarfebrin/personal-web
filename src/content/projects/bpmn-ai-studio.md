---
title: "BPMN AI Studio"
description: "A browser app that turns a plain-language description of a work process into a standard BPMN diagram. You can change it by chatting, ask questions about it, and export it. It also makes the form for each step and the decision tables behind a decision, and prepares the diagram for Camunda 7 or 8. From the same diagram it writes a requirements document (PRD or SRS) and films a video walkthrough of the process, right in the browser. It uses your own AI key and has an English and Indonesian interface."
featured: true
technologies: ["React 19", "TypeScript", "Vite", "bpmn-js", "dmn-js", "Vercel AI SDK", "Zod", "Zustand", "Tailwind CSS", "Camunda moddle", "bpmnlint", "FEEL lint", "dnd-kit", "docx", "WebCodecs", "mediabunny", "Vitest", "Playwright"]
liveUrl: "https://bpmn-ai-studio.pages.dev/"
githubUrl: ""
image: "/images/bpmn-ai-studio/diagram-v011-en.png"
---

## Project Overview

Every company has processes: approving leave, handling an order, fixing an IT problem. Most of the time they live in long documents or in someone's head. A process diagram shows the same thing as one picture: **who** does each step, **in which order**, and **where a decision** sends the work one way or the other.

**BPMN** (Business Process Model and Notation) is the international standard for these diagrams. Because it is a standard, a BPMN file can be opened in other tools like Camunda or bpmn.io. The problem is that drawing BPMN by hand takes time and training.

BPMN AI Studio lets you type a process the way you would explain it to a colleague, for example *"the employee submits a leave request, the manager approves or rejects it, and HR updates the records"*, and get a clean BPMN diagram back. Since then it has grown past the picture. Each step that a person does can get its own form, a decision can get a decision table, and the same diagram can be prepared for a Camunda 7 or 8 engine. For people who will never read BPMN, it writes a requirements document and films the process as a short video. It is for people who need to explain or improve a process but do not know BPMN: HR and operations staff, process owners, business analysts, auditors, and students, and for developers who prepare a process for Camunda.

## Goals

- Turn a description in **English or Indonesian** into a correct BPMN diagram, with no BPMN knowledge needed
- Let the user **change the diagram by chatting**, and **ask questions** about it without changing it
- Keep the user in control: manual changes on the canvas are kept, and every AI change can be undone
- Make the AI output **safe to show**: the diagram is checked before it reaches the screen
- Run with **no account and no app server**: the user brings their own AI key, and everything stays in the browser
- Help a diagram reach a real engine: a **Camunda 7 or 8** file keeps its engine settings through an AI edit and an export, and a new diagram can be prepared for either engine, with placeholders and checks
- Cover what a process needs around the diagram: the **form** each person fills in, and the **decision tables** behind a decision, both made and changed by chat
- Explain the process to people who do not read BPMN: a **requirements document** and a **video walkthrough**, both made from the diagram, with AI only as an option

## Key Features

Since v0.6.0 the diagram fills the whole window, and everything else floats over it as cards: the Assistant on the left, Properties on the right. **Ctrl/Cmd+K** opens the Assistant.

1. **Describe and generate**: type a process or click one of the example prompts. The diagram then draws itself: lanes first, then the steps in order, with a small AI cursor that shows where it is. A click or a key press skips to the end, and with reduced motion on it is one short fade.
2. **Edit by chat**: ask for a change like *"Add a document check by HR before approval."* Small edits are patched into the canvas, and big changes (for example new lanes or pools) open a review dialog first. The assistant remembers the recent chat, so *"add that"* works, the changed shapes are highlighted with a *"Changed: ..."* summary, and it asks with clickable options when a request is ambiguous. Select steps, flows or lanes on the canvas and the request works on exactly those: *"rename this to Approve"* or *"add an approval after this"*. An edit animates only what changed.
3. **Ask questions**: a question like *"Who approves the leave request?"* gets an answer based on the diagram, and the diagram stays the same. The answer also knows what is on screen: which steps have a form, the engine, and the warnings in the issues list. Questions about the app itself (*"Does it support DMN?"*) get a real answer, and off-topic requests are politely declined.
4. **Undo AI change**: the last five AI changes can be rolled back, and a redo button brings the change back. A **Tidy layout** button lays the whole diagram out again.
5. **Forms for every User Task**: a User Task is a step that a person does, and most of them need a form. **Generate with AI** drafts the forms for all User Tasks from the process, and you review the draft with **Apply** or **Discard**. You can also build a form by hand: drag fields from a palette (text, number, date, dropdown, file and more), set validation and "show only when" rules. Or ask in chat: *"make the email required"* or *"tambah kolom telepon"*. Fields you wrote by hand are only changed when you ask. **Walk through** steps through the process with sample data, fills each form, and follows the branch your answers choose.

![The form builder for the User Task "Fill in leave form": a field palette on the left, a form with five fields (full name, leave type, start and end date, and a reason that is shown only when the leave type is Other), and an inspector on the right with Field, Validation and Logic tabs for the selected "Leave type" dropdown](/images/bpmn-ai-studio/forms-v011.png)

6. **Decisions (DMN)**: DMN is the sister standard of BPMN, for decision tables. The **Decisions** button opens a workspace for decision tables next to the diagram. Ask *"buat tabel keputusan kredit: skor di bawah 600 ditolak, ..."* and the assistant writes the table. A Business Rule Task in the diagram links to the decision it calls, and one request can draw the process and write its tables together. `.dmn` files can be imported and exported, and **Delete all decisions** clears them in one step, with Undo.

![The Decisions workspace in table view: a "Leave approver" decision table with the inputs Leave type and Days, the output Approver, five rules and the UNIQUE hit policy, with a details panel next to it](/images/bpmn-ai-studio/decisions-v011.png)

7. **Ready for Camunda 7 or 8**: pick an engine for a diagram: None, Camunda 7, or Camunda 8. The Properties panel then shows that engine's settings (assignee, job type, listeners, timers), and the most used fields have a short help text in English and Indonesian. Empty required settings get a placeholder so the diagram can deploy, and **Engine checks** list what is still wrong, with a **Show** button that jumps to the field. A file from Camunda 7 or 8 keeps its `camunda:` and `zeebe:` settings, and the app warns before an export that would leave some of them out.

![A Camunda 8 diagram with the call activity "Check leave balance" selected, the Properties card open on its "Called element" field, and the issues card showing "Engine checks (2)" with a Show link for each check](/images/bpmn-ai-studio/properties-v011.png)

8. **Requirements document**: **Export → Requirements document…** reads the diagram, its forms and its decisions and writes a PRD or an SRS, in English or Indonesian: actors, steps, user stories, business rules from the gateways, acceptance criteria, a data dictionary from the forms, a traceability matrix and the open questions. Sections can be switched off or edited in place, and a section you edited is marked outdated when the diagram changes. **Write with AI** drafts only the narrative parts (summary, goals, scope), which you apply or discard. Download it as PDF (print), Word or Markdown.
9. **Video walkthrough**: **Export → Video walkthrough…** films the process as MP4 videos, rendered in the browser. You pick the main path (and which way each decision goes), what-if videos for the other branches and for exceptions, the message exchange between pools, and an optional requirements overview. Forms fill themselves in with sample values, decision tables are checked with sample inputs, and the walk goes inside subprocesses. Quality is one choice (Quick 720p, Sharp 1080p, Smooth 1080p at 60 fps), and finished videos can be previewed, downloaded one by one, or saved together as a zip. With AI narration off it costs 0 tokens, and the footer of the dialog shows the cost before anything is sent. How it works: [Turning a BPMN Diagram into a Video, Entirely in the Browser](/blog/bpmn-diagram-to-video).

![The Video walkthrough dialog for the leave-request process: the main scenario and the what-if "Approved by manager? > No" picked, the Sharp quality preset, and a footer with 2 videos, about 0:56 and 0 tokens](/images/bpmn-video/dialog.jpg)

![A frame of the exported main-scenario video: the decision "More than 5 days?" lit on the diagram, and the card on the right showing the chosen Yes branch](/images/bpmn-video/main-decision.jpg)

10. **Import and export**: open a `.bpmn` or `.dmn` file, and download the diagram as **PNG** (for documents and chat), SVG, or `.bpmn`. Decisions export as `.dmn`, the requirements document as PDF, Word or Markdown, and the walkthrough as MP4 (WebM where the browser has no MP4 encoder).
11. **Image input**: attach a photo of a whiteboard sketch, and the AI reads the process from it. The attach button follows the chosen model and is switched off for a model that cannot read images.
12. **Workspace**: keep several diagrams, each with its own chat, history, forms and decisions, and back them all up to one JSON file. Six ready-made templates (English and Indonesian) let you start without a key.
13. **Two languages**: the interface is in English and Indonesian. It follows the browser language and can be changed in Settings. The AI answers in the language the user writes in. The labels of the Properties panel are still English.
14. **Bring your own key**: choose OpenAI, Anthropic Claude, Google Gemini, DeepSeek (the default, because it is cheap), or any OpenAI-compatible endpoint. The model list is loaded from the provider and shows chat models only, and the defaults are current ones (Claude Sonnet 5.5, GPT-6 Luna, Gemini 3.5 Flash-Lite). There is a **Test connection** button, a **Clear stored key** button, and an approximate session cost in USD next to the token count. When the credit or quota of a key is used up, the app says so at once instead of retrying.

## Architecture

The most important rule in this project: **the AI never draws the diagram**. The model only writes structured data (JSON) that describes the process: steps, lanes, decisions, and arrows. My own code turns that data into BPMN, checks it, and lays it out. This keeps the output valid, even when the model makes a mistake. Forms and decisions follow the same rule. The model writes a list of typed changes, and my code applies them all together or not at all, checks them, and asks the model once to fix a failure.

```
User prompt (English or Indonesian) + what is selected
   │
   ▼
Router (code check first, a model call only when needed)
   ├─ question ──► answer from the diagram, forms and decisions (nothing changes)
   ├─ form ──► form changes → check → apply all or nothing
   ├─ decision ──► DMN changes → FEEL check → apply all or nothing
   │ diagram change
   ▼
LLM (user's own key) ──► RichGraph JSON (steps, lanes, flows, no coordinates)
   │
   ▼
Zod schema check → normalize → semantic validation ── errors? ──► one repair call
   │
   ▼
graphToXml (BPMN 2.0 XML + engine settings + placeholders) → layout engine (Web Worker) → layout check
   │
   ▼
bpmn-js canvas ── small edit: patch in place + verify │ big edit: review dialog
   │             ├─ state check after each change: heal if canvas and saved graph differ
   │             └─ engine checks (Camunda 7 or 8) → issues list
   ▼
localStorage (diagrams, chat, snapshots, forms, decisions, settings; storage schema v2)
```

### Technology Stack
- **React 19 + Vite + TypeScript**: the frontend, with Tailwind CSS and Radix UI for the interface
- **bpmn-js**: the BPMN editor on the canvas, plus the Camunda 7 and 8 properties panel. It loads as a separate chunk so the first page load stays small
- **dmn-js**: the decision table and DRD editor in the Decisions workspace. `@bpmn-io/feel-lint` checks FEEL expressions, and `dmn-migrate` converts older DMN 1.1 and 1.2 files to 1.3
- **Layout engine**: a maintained fork of `bpmn-auto-layout` that places the shapes and routes the arrows. Pools keep their order, message flows between pools get clear channels, and task boxes grow with their text. It runs in a Web Worker (a background thread in the browser) with a 5 second timeout, and changes are checked against about 250 sample diagrams
- **camunda-bpmn-moddle, zeebe-bpmn-moddle, camunda-dmn-moddle, zeebe-dmn-moddle**: let the canvas read and write Camunda 7 and 8 attributes, for diagrams and decisions, so imported engine settings are not dropped
- **bpmnlint**: runs in the app as **Engine checks**, with the Camunda compatibility rules for 7.20 to 7.24 and 8.6 to 8.11 plus my own Camunda 7 rules. It loads only for a Camunda diagram. A developer script still checks `.bpmn` files
- **dnd-kit**: drag and drop in the form builder, also with the keyboard
- **docx**: writes the Word version of the requirements document. It loads only when you click Word
- **WebCodecs + mediabunny**: encode the walkthrough videos in the browser, from a Canvas 2D renderer. Sound effects are synthesised with an `OfflineAudioContext`, so there are no audio files. mediabunny loads only when the first video is encoded
- **Vercel AI SDK**: one way to talk to all the AI providers, with streaming
- **Zod**: checks that the model's JSON has the right shape
- **Zustand**: app state
- **Vitest, Testing Library, Playwright**: unit tests and browser tests. A Docker smoke test deploys sample diagrams to Camunda 7.22 and 8.8.5 (outside CI)
- **Cloudflare Pages**: static hosting

## Interesting Technical Decisions

### Validation before render
Before any diagram reaches the canvas, a set of rules checks it: duplicate ids, arrows that point to nothing, wrong event types, broken boundary events, unpaired links, and decisions with no way in or out. Errors block the render. Smaller problems (no start event, no end event) show a yellow warning but still render. If there are errors, the app sends them back to the model **once** to repair. After layout, another check looks at the geometry: no diagonal arrows, no arrows through shapes, no shapes outside their lane, no overlap. If the layout fails, the basic diagram still renders with a warning.

### Camunda settings: kept, filled, and checked
A BPMN file from Camunda has data that the AI does not need and should not touch: `camunda:` and `zeebe:` attributes, extension elements, and the original ids. On import the app keeps this data aside, away from the model, and writes it back after the diagram is rebuilt. If an edit would leave out settings the app cannot keep, a banner lists them and the export asks first.

A new diagram can be prepared for an engine too. The app fills every empty required setting (a job type, a timer, a gateway condition, a history time to live) with a placeholder that deploys, counts the steps that still use one, and removes the placeholders again if you go back to None. The AI still does not write engine settings like an assignee or a job type, on purpose: you set them in the Properties panel, and **Engine checks** run while you edit. The checks never block an export. I deployed sample diagrams with these values to real Camunda 7.22 and 8.8.5 engines in Docker; Camunda 8.6 is not tested yet.

### Forms and decisions: typed changes, all or nothing
A form or a decision table is not drawn by the model either. The model returns a short list of typed changes ("add field email", "make it required", "add a row"). The app applies the whole list to a copy, checks it (field rules, FEEL syntax, columns per row), and writes it only when everything holds. If a check fails, the model gets the errors once to fix them. One request is one undo step. To keep cost down, a plain diagram request never pays for routing: a code check looks for form or decision words first, and only then one small model call decides where the request goes.

### Small edits patch the canvas, then get checked
Re-importing the whole diagram after every edit would move shapes the user placed by hand. So for small edits, the app builds the target diagram first, then patches only the changed parts on the live canvas. New shapes are placed next to a neighbour, and only the arrows that touch changed elements are re-routed. After the patch, the app reads the canvas back and compares it with the target. If anything is different, it restores the old state and does a full import instead. Each fallback is saved in a local log with a reason code, and there are two switches to turn the patch path off. A separate state check runs after every change made by code (an AI edit, undo, import): if the canvas and the saved graph have drifted apart, the app re-renders from the saved graph once.

### Text in the diagram is data, not instructions
A diagram, an imported file and the chat history all go back to the model, so they can carry a hidden instruction. The app treats that text as data and neutralises its block markers. Element ids from the model are escaped and must be valid XML names, because a crafted id could smuggle an attribute such as `camunda:class` into the exported file.

### Bring your own key, kept in the browser
There is no backend. The API key is saved only in the browser, and requests go straight from the browser to the AI provider the user picks. A first-run screen explains that prompts and diagrams are sent to that provider. The workspace backup never includes the key. A Content Security Policy header limits which scripts the page can load.

### Dynamic model catalog
Provider model lists change often, and a retired model id breaks the app. So the model list is loaded from the provider's own endpoint, filtered to chat models (no audio, image, embedding or search models), and deprecated models are marked. The default is picked from models with a known price, and a saved list that still holds a retired model moves to its replacement. A DeepSeek key that the provider refuses is not saved. Only DeepSeek was checked against the live service; the defaults for the other providers come from their documentation.

### Storage schema v2
Diagrams and undo snapshots moved to new storage keys in v0.4.0. On first open, the app copies the data of every diagram to v2, and removes the old key only after its v2 copy is written. If the browser storage is full, the old data stays. A diagram written by a newer version is shown empty with a notice and never overwritten. Workspace backups are version 2 too, and the app still imports version 1. The price is that rolling back to v0.3.x is not safe, so the release notes ask for a backup first. v0.5.0 moved saved diagrams once more, to new fields for documentation, messages, signals and errors, with the same rule: back up first.

### Plain-language errors
Provider errors (wrong key, no credit, rate limit, network) become short sentences with the provider name. Warnings use element names instead of ids. A **Copy diagnostics** button copies a report (with keys removed), and I can turn that report into a test fixture. A used-up credit or quota now says so at once instead of retrying six times.

### The video walks the process like a token
The forms walkthrough only followed sequence flows from the first start event. Measured on the 26 sample diagrams in the repo, 14 had parts it never reached (boundary events, subprocesses, link jumps, other pools). So the video has its own pure walker that moves like a BPMN token: parallel splits as one group, loops walked once, branches that rejoin the main path, subprocesses entered and left. After it come a storyboard (scenes as plain data), a renderer that draws any moment `t`, and the encoder. The optional AI only rewrites captions, and a scene it gets wrong keeps its data caption, so the video never depends on the model.

### A separate release branch
Daily work goes to `main`, where every push runs build and lint (about one minute). The live site deploys only from a `release` branch on Cloudflare Pages. I move `main` to `release` with a fast-forward merge after build, lint, unit tests, and browser tests are green, so testers only see a version that passed everything.

### Tests
- **16 selfcheck files**: small scripts that run the core pipeline modules in Node (schema, normalize, validation, XML, layout, diff)
- **3,629 Vitest tests** in 338 files, including property tests that generate random valid diagrams and check the round trip, and a corpus of about 250 diagrams for layout quality
- **452 Playwright browser tests** in 70 files, using a mock AI server that sends fixed answers. They run in parallel against a production build in about two minutes. One suite runs the same edits through the patch path and the full import path, and both must give the same diagram
- A **live eval** with real prompts against a real provider, scoring each edit for compliance and precision (nothing else touched), now also for decision tables and the router. It needs an API key, so it runs by hand, not in CI
- A **Docker smoke test** that deploys sample diagrams and decisions to Camunda 7.22 and 8.8.5. It is not part of CI

## Milestones

- **M0, hardened prototype (done)**: bug fixes, the patch-and-verify edit path, request timeouts and cancel, workspace, image input, PNG export, backup, plain-language messages, the empty state with examples, a guard for multiple tabs, and the English + Indonesian UI. Merged on 2026-10-28.
- **M1, closed alpha (now)**: the app is live at [bpmn-ai-studio.pages.dev](https://bpmn-ai-studio.pages.dev/), deployed from the `release` branch. For testers I added a **Send feedback** dialog (it shows exactly what will be sent, and the diagram is included only if the tester chooses), a notice on small screens that says the app works best on a laptop, and link previews for WhatsApp and Telegram. The goal of this stage: a person who has never heard of BPMN can make, explain, edit, and export a diagram without help. Testers still bring their own key for now.

Releases on the way (the live site deploys from the `release` branch):

- **v0.1.0 (28 Oct 2026)**: first version for testers on Cloudflare Pages.
- **v0.2.0 (29 Oct)**: the assistant remembers the chat, highlights what it changed, asks clarifying questions, and the app gets six templates, a backup reminder, a session cost, and shrunk photos before sending.
- **v0.3.0 (29 Oct)**: the Tidy layout button, proper empty pools, and our own layout engine fork. **v0.3.1 (29 Oct)** fixed start events landing in the middle of a pool. **v0.3.2 (30 Oct)** moved the defaults to current models, limited the list to chat models, made image attach follow the model, and stopped saving a refused DeepSeek key.
- **v0.4.0 (30 Oct)**: Camunda 7 and 8 files keep their engine settings, with a warning and a confirmed export when some cannot be kept, the BPMN validator script, and storage schema v2.
- **v0.5.0 (31 Oct)**: pick an engine (None, Camunda 7, Camunda 8), the engine's properties panel, placeholders so a diagram deploys, and more of BPMN (documentation, messages, signals, errors) as fields the AI can read. **v0.5.1 to v0.5.3** fixed exports that Camunda rejected and message flows that got lost.
- **v0.6.0 (1 Nov)**: the floating layout. **v0.6.2** treats diagram text as data, escapes ids from the model, and keeps the assistant on topic. **v0.6.3** reports a used-up quota at once.
- **v0.7.0 (1 Nov)**: forms for every User Task, the walkthrough, and an easier-to-read layout. **v0.8.0 (1 Nov)**: selection as context. **v0.8.1** lets answers see forms and the screen.
- **v0.9.0 (2 Nov)**: decisions (DMN). **v0.10.0 (2 Nov)**: forms by chat, the Forms button, and the diagram that draws itself. **v0.10.1** adds ranking tables and batches for many forms.
- **v0.11.0 (2 Nov)**: help in the Properties panel and Engine checks for Camunda 7 and 8.
- **v0.12.0 (2 Nov)**: the requirements document (PRD or SRS) with PDF, Word and Markdown download, and Write with AI for the narrative sections.
- **v0.13.0 (4 Nov)**: the video walkthrough: main path, what-ifs, exceptions, message exchange, subprocesses, decision tables, a requirements overview video, and optional AI narration.
- **v0.14.0 (4 Nov)**: an easier video form (quality presets, a footer with progress, Advanced options, remembered settings), Download all as zip, and Delete all decisions.
- **Next**: an engine version picker, a link from a form to its User Task in the exported file, FEEL autocomplete, and Indonesian labels in the Properties panel. Then a trial mode so testers can start without a key (a small server that holds a key with a daily limit), an open beta with abuse protection and a template gallery, an agent that can take several steps on its own with checks after each step, memory of the user's naming habits, and later a self-hosted version for companies.

## Development Time

I built this project together with AI coding agents, mostly **Claude Code**. The commits carry Claude co-author lines (Haiku, Sonnet, and Opus models), and the repo has config folders for several agent tools. Based on the commit timestamps (I added up the gaps between commits that were shorter than one hour):

- **Early prototype (May to July 2026)**: about 8 hours over 4 days. The first editor, multi-provider chat, the AI SDK, and the switch to the semantic pipeline (the model writes JSON, my code builds the BPMN)
- **Main build (24 to 28 October 2026)**: about 15 hours for 205 commits. Validation, auto-layout, BPMN import, the patch-and-verify edits, browser tests, the workspace, two languages, the M0 hardening, and the M1 alpha features
- **Releases v0.2.0 to v0.4.0 (29 to 30 October 2026)**: about 16 hours for 145 commits. Templates, the layout engine fork, the dynamic model catalog, Camunda data round trip, and storage v2
- **Releases v0.5.0 to v0.11.0 (31 October to 2 November 2026)**: about 25 hours for 199 commits. Engine settings and placeholders, the floating layout, forms, decisions (DMN), and engine checks
- **Releases v0.12.0 to v0.14.0 (2 to 4 November 2026)**: 48 commits on `main`. The requirements document and the video walkthrough. Much of the video work was squashed into a few commits before the merge, so the commit gaps do not give a useful hour count for this part
- **Total up to v0.11.0**: about 64 active hours for about 605 commits, spread over 12 working days. With v0.12.0 to v0.14.0 it is about 655 commits over 14 working days

This number is a lower bound, because the agents often made several commits at the same time and time between sessions is not counted. My role was mostly the plan and milestones, architecture decisions, review, and testing in the browser. The agents wrote most of the code, and the tests and CI kept it honest. For me, this is the main lesson: with AI agents and a good test suite, one person can ship a real product in a few days, not a few months.

## Future Plans

- An engine version picker, Indonesian labels in the Properties panel, and a link from a form to its User Task in the exported file
- A trial provider so testers do not need their own key
- An open beta with a privacy page and a template gallery
- A bounded agent loop, long-term memory, and search over the user's own SOP documents
- A self-hosted version that a company can run inside its own network
