---
title: "Generative UI, Explained With a Small AI Page on My Site"
description: "Most chatbots only reply with text. With Generative UI, the AI also picks how the answer looks. Here is what that means, and how I built a safe version on my own site."
publishedAt: 2026-10-30
tags: ["ai", "generative ui", "llm", "astro", "side project"]
---

## Text Is Not Always the Best Answer

Ask a normal chatbot "what projects has Dhaniar built?" and you get a paragraph. A list of cards with images and links would be easier to read.

**Generative UI** fixes that. The AI does not only write words. It also helps choose the *look* of the answer: a card, a timeline, a piece of code.

Think of a waiter. A normal chatbot tells you what is on the menu. With Generative UI, the waiter puts the plate in front of you.

## Three Ways to Do It

[CopilotKit's generative-ui guide](https://github.com/CopilotKit/generative-ui) names three styles. I use its words:

- **Controlled.** I build the screen pieces. The AI picks a piece and fills in the blanks. Safest.
- **Declarative.** The AI writes a description of the layout. The app turns it into a screen. More freedom.
- **Open-ended.** The AI makes the interface itself, for example raw HTML. Most freedom, most risk.

## What I Built: "Ask me"

Try it on the [/ask](/ask) page. You ask about my work. An **LLM** (large language model, the kind of AI behind ChatGPT) answers. Here it is DeepSeek.

The answer is short text, plus a piece picked from these four:

1. **Project cards**
2. **Experience timeline**
3. **Code snippet**
4. **Suggested questions**

This is the Controlled style. The AI cannot invent a new piece. It can only pick from these four. In technical words, the AI uses **tool calling**: it does not draw anything, it asks my app to show one of the pieces I already made.

The flow:

1. You type a question.
2. My server sends it to the AI, together with my site's content.
3. The AI writes a short reply and picks a piece to show.
4. My server checks that pick.
5. Your browser shows the piece.

Step 4 is the important one.

## Why It Is Safe

The AI never gets the last word. My code does. These are the guardrails:

- **Only real projects.** The AI can only choose from projects that exist on the site. A made-up one is rejected.
- **The AI does not write titles, links or images.** My server copies them from the site's own content. The AI only picks *which* project.
- **Code must be real.** A code snippet is shown only if that exact code appears in one of my posts or projects.
- **Off-topic questions get a polite no.** The AI is told to answer only from my content, and to say "I don't know" when it is not there.
- **Bot check.** [Cloudflare Turnstile](https://www.cloudflare.com/application-services/products/turnstile/) runs before the AI is called, so scripts cannot spam it.
- **Size limits.** Questions, history, replies and the number of pieces per answer all have a cap.

If a pick fails the check, it is dropped and you still get the text.

One honest note: the AI can still get things wrong. That is why every card and timeline item links back to its source, so you can check.

## What I Learned

**You may not need a big framework.** This is one small server function, one file of plain logic, and four small components. The key part is just validation: the AI proposes, the server checks.

**The AI copies what it sees.** To help the AI remember what it already showed, I put notes like `[ui: timeline ...]` in the chat history. Soon the AI began writing those notes *as text* in its answers, instead of showing a real timeline. It was imitating the history.

My first fix was to rewrite the notes as plain sentences, such as "(Showed a timeline: ...)", and tell the AI in the prompt never to write them. It still copied the new form. A rule in the prompt was weaker than an example in the history.

So I removed the notes entirely. The history now holds only the text of each answer. If there is nothing to copy, the AI cannot copy it.

## Try It

Generative UI sounds big, but a small, controlled version is a good start: a few pieces, one check, and sources everywhere.

Ask my site something on the [/ask](/ask) page. Try "What projects has Dhaniar built?".
