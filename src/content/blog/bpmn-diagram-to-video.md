---
title: "Turning a BPMN Diagram into a Video, Entirely in the Browser"
description: "Most people do not read BPMN diagrams. So BPMN AI Studio now films them: it walks the process like a token, writes a storyboard, draws every frame on a canvas and encodes an MP4 with WebCodecs. No server, no ffmpeg, and AI only if you ask for it."
publishedAt: 2026-11-04
image: "/images/bpmn-video/main-decision.jpg"
tags: ["side project", "bpmn", "typescript", "webcodecs", "canvas", "ai"]
---

## The Problem: Nobody Reads the Diagram

[BPMN AI Studio](/projects/bpmn-ai-studio) turns a plain description of a process into a BPMN diagram. In the [last post](/blog/llm-bpmn-without-xml) I wrote about how it makes an LLM draw a *correct* diagram.

But a correct diagram is only half the job. The people who must agree on a process (a manager, HR, a client) usually do not read BPMN. They see boxes, diamonds and arrows, nod, and miss the part where a request is rejected and nobody is told.

So in version 0.13.0 I added **Export → Video walkthrough**. It films the process: step by step, role by role, with the decisions it takes and the forms people fill in. Each scenario becomes its own MP4 that you can send in a chat.

![The leave-request process in BPMN AI Studio, with three lanes and three forms](/images/bpmn-video/diagram.jpg)

## What You Get

You pick what to film:

- **The main scenario**, the "happy path". You choose which way each decision goes.
- **What-if videos**, one per decision branch ("what if the manager says No?"), one per boundary event (a timer or an error on a task), and one for the messages between pools.
- **A requirements overview**, made from the requirements document the app already builds, without AI.

You also pick 720p or 1080p, 30 or 60 fps, sound effects and an optional AI narration. Before anything runs, the dialog shows what it will cost. With narration off, the answer is *0 tokens*: everything happens in your browser.

![The Video walkthrough dialog: the main scenario and one what-if picked, 1080p, and the cost block saying 0 tokens](/images/bpmn-video/dialog.jpg)

This is the main scenario exactly as the app exported it (41 seconds, scaled down to 720p for this page, no sound):

<video controls muted playsinline preload="metadata" poster="/images/bpmn-video/main-intro.jpg" style="width:100%;height:auto;border-radius:8px" aria-label="Main scenario video of the leave-request process">
  <source src="/images/bpmn-video/main-scenario.mp4" type="video/mp4" />
  <a href="/images/bpmn-video/main-scenario.mp4">Download the video (MP4)</a>
</video>

It opens with the roles and how the process ends (the frame above), then walks every step. Two frames from the middle:

![A user task scene: the leave form fills itself in with sample values](/images/bpmn-video/main-form.jpg)

![A decision scene: the gateway lights up and the chosen branch gets a check mark](/images/bpmn-video/main-decision.jpg)

And a what-if video shows the other branch, in red, until the process ends without success (14 seconds):

<video controls muted playsinline preload="metadata" poster="/images/bpmn-video/whatif-branch.jpg" style="width:100%;height:auto;border-radius:8px" aria-label="What-if video: the manager rejects the leave request">
  <source src="/images/bpmn-video/whatif-manager-no.mp4" type="video/mp4" />
  <a href="/images/bpmn-video/whatif-manager-no.mp4">Download the video (MP4)</a>
</video>


![What-if scene: the manager says No and the path turns red](/images/bpmn-video/whatif-branch.jpg)

![The end of the what-if video: Leave rejected, not passed](/images/bpmn-video/whatif-end.jpg)

## The Pipeline

The feature is a chain of small steps. Only the first part knows BPMN, and only the last part knows about video:

```text
diagram graph
  → token walker      which steps happen, in which order
  → scenarios         main path, what-ifs, exceptions, messages
  → storyboard        scenes with titles, captions, form values, timings
  → (optional) AI     rewrites captions into spoken-style sentences
  → canvas renderer   draws one frame for any time t
  → encoder           frames + synthesised sound → MP4 (or WebM)
```

The first four steps are pure TypeScript in `src/lib/video`: no DOM, no canvas, and all text comes in through a translate function, so the same code makes English and Indonesian videos. That makes them easy to test. The canvas, the encoder and the dialog live in `src/features/video`.

## Step 1: Walk the Process Like a Token

The app already had a "walkthrough" for forms. My first idea was to reuse it. Before I did, I measured it against the 26 BPMN fixtures in the repo.

It only followed sequence flows from the first start event. Boundary events, subprocess internals, link jumps, loops and every pool after the first were never reached. **14 of the 26 fixtures had content it never visited**, and the two diagrams with only black-box pools gave zero steps. Good enough for forms, not for a video that claims to show "the process".

So the video has its own walker. It moves like a BPMN *token*:

- A parallel or inclusive split becomes one group of branches, not a random pick.
- An event-based gateway waits for its first event.
- A loop is walked once and ends with a "back to X" step instead of running forever.
- A branch that meets the main path again ends with a "joins X" step.
- It goes inside subprocesses and transactions (two levels deep), follows a link throw to its catch, and treats an event subprocess as its own what-if.

It is a pure function: the same graph and the same choices always give the same steps. That one rule made the rest testable, because a storyboard test can pin exactly which scenes a fixture produces.

## Step 2: A Storyboard Before Any Pixel

The storyboard turns walked steps into **scenes**. A scene is plain data: which shapes to highlight, which lane is active, a title, a caption, chips like "Approved: Yes", the form values to type in, and cue times for each animation.

Form values come from the forms you built in the app. A sampler picks a believable value per field (a name, a date, a leave type) and respects the "show only when" rules, so hidden fields stay hidden. A form whose fields are all hidden plays as a plain step. I found that one only because a test diagram did exactly that.

Separating the storyboard from drawing paid off when the layout broke. Rows of a decision card or a form overflowed the card on bigger diagrams. The fix was one module, `layout.ts`, that both the storyboard (for timing) and the renderer (for drawing) import. Before that, the renderer started field *i* at `0.9 + 0.65i` seconds while the sound cues used `0.95 + 0.7i`, so the typing sound drifted away from the typing.

## Step 3: Draw Every Frame on a Canvas

The renderer is a single function, `drawFrame(t)`, built on Canvas 2D. Given a time, it draws that moment: the diagram on the left with the camera zoomed on the active shape, the card on the right, the step tracker and the caption at the bottom. Because it only depends on `t`, it can render faster than real time, and I can test single frames by calling it at a fixed time.

The diagram itself is rendered once into a bitmap and shared by every scenario. Each frame only pans, zooms and paints highlights on top.

Small things took the most time:

- **Shadows do not scale.** `shadowBlur` and `shadowOffset` ignore the canvas transform. At 1080p the shadows looked half as soft as at 720p until I multiplied them by the output scale myself.
- **Text must fit, always.** Long process names, a dozen lane names, a chip with a 120-character value. Text fitting is a binary search over code points, memoised per string and width. What does not fit is shortened with an ellipsis, never dropped and never drawn outside the card.
- **Endings need meaning, not words.** My first version guessed failure from the end event's *name* ("rejected"). That breaks in Indonesian and with names like "Closed". Now the outcome comes from the event *definition*: error, escalation, cancel and terminate ends are failures in any language.

## Step 4: Encode in the Browser

For encoding I use [mediabunny](https://mediabunny.dev/), a TypeScript library on top of the browser's **WebCodecs** API. It takes the canvas as a video source and writes an MP4. If the browser cannot encode any MP4 video codec, the same code writes WebM instead. The library is large, so it loads only when the first video is encoded, not with the app.

Sound effects are not audio files. They are synthesised with an `OfflineAudioContext` from the cues of each scene: filtered noise for a whoosh or a click, short oscillator sweeps for a pop, a tick, a ding or a chime. Nothing to download, and the sound always matches the animation because both come from the same cue times.

Rendering runs in a queue, one scenario after another. Cancel stops between frames, and each finished video can be previewed in the dialog before you download it.

![The dialog after a run: two MP4 files, 9.6 MB and 3.9 MB, each with a preview button](/images/bpmn-video/dialog-done.jpg)

## Where AI Fits (and Where It Does Not)

The video never depends on the model. Every scene already has a data caption like *Manager: decision "Approved by manager?" goes to "Yes".* That is correct, but a little robotic.

If you turn on **AI narration**, the app sends one request per scenario. The model gets only the facts the scenes already show (step names, roles, sample values) and answers with JSON: `{ sceneId: sentence }`. A scene it skips, or answers badly, simply keeps its data caption. The model can make the video friendlier; it cannot make it wrong or break it.

The cost estimate is shown before the run and the real token count after. The estimate is a heuristic (about 3.5 characters per token, one sentence of about 25 words per scene, room for one retry), tuned against real runs. It is the same idea as in the rest of the app: the AI proposes, plain code decides.

## Limits

- It needs WebCodecs. Chrome and Edge are fine. Firefox works but renders slower than real time and cannot write AAC audio. Where WebCodecs is missing, the menu item is hidden.
- A call activity is one step; the process it calls is not filmed. Subprocesses deeper than two levels stay one step.
- Sample values for decision tables are made up from the table, so they are illustrative, not real data.
- Elements no video reaches are listed in the dialog, so nothing disappears silently.

## What I Took From It

The best decision was not technical. It was measuring the old walker against the fixtures *before* reusing it. The number (14 of 26) made the choice for me.

The second one was keeping each step pure and separate. When something looked wrong in a video, I could ask which layer was wrong: the walk, the storyboard, or the drawing. Most bugs turned out to be two layers disagreeing about the same number, and the fix was to make them share it.

---

Try it in the closed alpha at [bpmn-ai-studio.pages.dev](https://bpmn-ai-studio.pages.dev/): open the **Leave request** template, then **Export → Video walkthrough**. No API key is needed unless you want the AI narration.
