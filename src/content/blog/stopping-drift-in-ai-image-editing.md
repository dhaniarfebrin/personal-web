---
title: "Stopping Drift in AI Image Editing: Change One Thing, Freeze the Rest"
description: "Why a photo slowly changes when you edit it again and again with AI, and how I fought it with a JSON breakdown, small delta edits applied in code, and reference images."
publishedAt: 2026-10-28
tags: ["ai", "llm", "typescript", "image editing", "side project"]
---

## The Problem: Every Edit Changes a Little Bit More

I built a small Telegram bot for editing photos with AI. You send a photo, then you type what you want in plain Indonesian, like "make the hair pink" or "wear a white t-shirt". The bot sends back the edited photo. Then you type the next change, and the next.

It worked on the first try. The problems started on the third or fourth try.

The image model does not really "edit" a photo. It draws the whole picture again every time. So even when I only asked for a new hair color, other things moved a little. The shirt got a bit darker. The head turned a few degrees. The jacket looked one size bigger. One round alone looked fine. But after five rounds, it was clearly a different photo. This slow change is what I call **drift**.

This post is about how I fought drift, and what I learned from the things that failed.

## Step 1: Turn the Photo Into JSON

The first idea was to give the bot a memory that does not change by accident.

When you send a photo, the bot asks a multimodal LLM to describe it. (An LLM, or large language model, is the kind of AI behind chat tools. *Multimodal* means it can read images, not only text.) But I do not ask for a paragraph. I ask for JSON, a simple text format for structured data, and I check it with a fixed schema. It has the main subject, other objects, background objects, and the scene. If there is a person, it also has hair, face details, top, bottom, shoes, and accessories.

This JSON is the bot's internal state. The user only sees a one-line description. I call this step the **breakdown chain**.

## My First Version Still Drifted

In the first version of the edit step, I gave the LLM the JSON and the user's command, and asked it to return the **whole updated JSON**. Then I pasted that full JSON into the prompt for the image model.

This had two problems:

1. The LLM rewrote every field, not just the one I asked for. "Red silk shirt" could come back as "dark red satin shirt". Nobody asked for that. Now the text was drifting too, not only the pixels.
2. A big block of JSON inside an image prompt is mostly noise. The image model does not read it like a program does.

## Step 2: Ask for a Delta, Not a Rewrite

The fix was to stop letting the LLM write the state. Now it only writes a **delta**. A delta is a short list of changes, not the full thing. Each change is one operation:

```ts
const operationSchema = z.object({
  op: z.enum(["set", "add", "remove"]),
  path: z.string(),   // e.g. "main_subject.person.hair.color"
  value: z.string(),  // the new value ("" for remove)
});
```

Then my own code applies the delta. This function is called `applyDelta`. It is plain TypeScript, with no AI inside. Here is the core of it, a bit simplified:

```ts
export function applyDelta(breakdown, operations) {
  const draft = structuredClone(breakdown); // never touch the original

  operations.forEach((op, i) => {
    const tokens = parsePath(op.path); // "a.b[2].c" -> keys and indexes

    if (op.op === "add") {
      resolve(draft, tokens).push(parseValue(op.value, i, "add"));
      return;
    }

    const { parent, last } = resolveParent(draft, tokens);
    if (op.op === "remove") {
      if (last.type === "index") parent.splice(last.index, 1);
      else parent[last.key] = null;
      return;
    }

    // "set"
    parent[last.key ?? last.index] = parseValue(op.value, i, "set");
  });

  return breakdownSchema.parse(draft); // result must still match the schema
}
```

The important part: any field that no operation points to is copied as it is. The LLM cannot "accidentally" rename my red shirt, because it never writes the shirt at all. Code does.

Here is a small example with made-up values. The user types "make the hair pink". The LLM returns:

```json
[{ "op": "set", "path": "main_subject.person.hair.color", "value": "pink" }]
```

And the state goes from this:

```json
"hair": { "color": "black", "length": "short", "style": "messy" },
"top":  { "type": "shirt", "color": "red", "material": "silk" }
```

to this:

```json
"hair": { "color": "pink", "length": "short", "style": "messy" },
"top":  { "type": "shirt", "color": "red", "material": "silk" }
```

Only one value changed. I have unit tests for exactly this: change one field, and check that the other fields and the input object stay the same.

## Step 3: A Prompt That Points, Not Describes

The JSON is now stable. But the image model still draws a new picture, so the pixels can still drift. So the LLM also writes the prompt for the image model, in a fixed shape:

```
REFERENCE MAP:   which image is which (image[0] = the current photo, ...)
STRUCTURE LOCK:  match image[0]. Pose UNCHANGED. Head angle UNCHANGED. ...
MUTATION:        the one change, with clear values
IDENTITY LOCK:   match image[0]. Hair UNCHANGED. Background UNCHANGED. ...
BOUNDARY:        no beauty filter, no new color grade, no new framing
```

The idea is simple: say the change once, then freeze everything else.

## Step 4: Always Show the Original Photo

The last piece is reference images. The image edit request can take more than one image, so the bot sends:

- the current photo, at index 0, which is the one to edit,
- one or more recent versions from the same session,
- and **iteration 0**, the very first photo the user sent, at the last index.

```ts
// latest versions first, then the original photo at the end
const history = [];
for (const r of priorCanvasRows) history.push({ iteration: r.iteration, bytes: await readBytes(r.file_path) });
if (canvasLatest.iteration > 0) history.push({ iteration: 0, bytes: await readBytes(canvasIter0.file_path) });

const images = [
  { bytes: canvasBytes, filename: "subject.jpg" },
  ...history.map((h, i) => ({ bytes: h.bytes, filename: `history-${i + 1}.jpg` })),
];
```

In the prompt, iteration 0 is called `CANONICAL_ORIGINAL`. The prompt tells the model to take color, fabric, and fit for the parts that did not change *only* from that image. So round five is compared with the real photo, not with round four, which already drifted a bit. The recent versions are there so you can say "put it back like before" and the LLM can see what "before" looked like.

The whole pipeline looks like this:

```
photo ──> [breakdown LLM] ──> JSON state (iteration 0)
                                   │
"make the hair pink" ──────────────┤
                                   ▼
                [edit LLM: current photo + history + JSON]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          delta ops [{op,path,value}]     anchored prompt
                    │                             │
       applyDelta (plain code)                    │
                    │                             ▼
              new JSON state      [image model: current photo
               (saved to DB)       + recent photos + iteration 0]
                                                  │
                                                  ▼
                                              new photo
```

## What Went Wrong, and What I Learned

All of this happened in about two days, and almost every step came from something breaking.

**Pose drift, round one.** Even with the delta, the pose kept moving. My guess was that the long "keep this, keep that" text was too weak next to the change. So I split the lock into STRUCTURE LOCK (pose, head angle, framing) and IDENTITY LOCK (face, clothes), and put STRUCTURE LOCK first. I also started sending a `strength` value of `0.35` to the Grok image edit endpoint. This setting pushes the model to stay closer to the source image.

**Pose drift, round two.** After round three, the pose still moved. I lowered `strength` to `0.25` and made STRUCTURE LOCK louder: capital letters, repeated orders, and the pose written out word for word from the JSON.

**Writing the pose in words made it worse.** This one surprised me. A prompt from my logs said something like "PRESERVE POSE EXACTLY, leaning forward over the pool table aiming a shot". The result? The person's stance changed. The words I wrote to *protect* the pose were read by the image model as an order to *draw* that pose again, in its own way. So I flipped the rule. The LOCK blocks now have no describing words at all. Only "match image[0]" and short lines like "Pose UNCHANGED". Words that describe things go only in the MUTATION block. **Point at the reference. Do not describe it.**

**Colors and sizes still moved.** The pose was better, but shirt shades and sizes still shifted a little each round. This happened because each round was drawn from the last round, which had already drifted. That is when I started attaching iteration 0 at the last index as the source of truth.

**The LLM did not follow my format.** My first rule said `value` must always be a JSON string. So "silver" had to be sent as `"\"silver\""`. The LLM often just sent `silver round Korean frames`, and `JSON.parse` crashed the whole edit. I made the parser more forgiving: for `set`, if the value is not valid JSON, use it as a plain string. For `add`, which adds a whole new object, valid JSON is still required. It is better to fail loudly on a broken object than to save garbage.

```ts
function parseValue(value, i, opKind) {
  try {
    return JSON.parse(value);
  } catch {
    if (opKind === "add") throw new Error(`op ${i} add value must be valid JSON`);
    return value; // plain phrase like "silver round frames"
  }
}
```

One honest note: later I found that the image endpoint only takes three images per request, so the list is now cut to three. That means on later rounds, iteration 0 can fall off the end of the list for the image model, even though the LLM still sees it. That is the next thing I need to fix.

## The Short Version

If you edit the same thing again and again with AI, here is what I would keep:

- **Do not let the AI rewrite state it should not touch.** Ask for a small delta and apply it in normal code.
- **Check the result against a schema** so a bad delta fails right away.
- **In the prompt, point at reference images instead of describing them.** Describing words can cause the change you are trying to stop.
- **Always compare with the original**, not with the last version. Small errors add up when each step builds on the last one.

Some drift is still there. But now I can see in the logs exactly which field each delta touched, and that makes the problem much easier to work on.
