---
title: "OpenClaw Isn't the Answer Yet: Reflections After Burning 300 Million
  Tokens in a Week"
description: "After a week of deep use and 300 million tokens burned, the
  verdict on OpenClaw: the problem isn't that AI isn't smart enough — it's that
  pure natural language interaction has fundamental flaws for execution-based
  tasks. An analysis of four interaction modes through the lens of one core
  question: who absorbs the ambiguity?"
author: Eric Cao
date: 2026-03-10
---

OpenClaw is having a moment — but after a week of deep use and burning through 300 million tokens, my conclusion is: it's not the answer yet.

OpenClaw has ignited excitement around "AI agents finally working in the real world," but its interaction design still isn't mature enough. The problem isn't that "AI isn't smart enough" — it's that "pure natural language interaction" has fundamental flaws when it comes to execution-based tasks.

I've broken AI tools down into four interaction modes, each suited to different scenarios. By the end of this, you'll be able to judge: Is OpenClaw right for you? And if not, what should you be using instead?

## 1. Hype vs. Reality: What Actually Happened After a Week with OpenClaw

OpenClaw has been absolutely everywhere lately — GitHub stars skyrocketing, meetups happening back to back, even the merch is sold out. Behind all this is a collective longing for "AI that can actually get things done" — after all, who wouldn't want their own Jarvis?

I dove in with exactly that hope, spending a week tinkering over the Lunar New Year holiday and burning through roughly 300 million tokens. The result? A pretty significant letdown.

It uploaded my work files to GitHub without authorization. I explained the rules line by line, and it still couldn't produce what I wanted. When I asked friends, I found I was far from alone in running into these kinds of issues.

I think OpenClaw's rapid rise comes down to two foundational conditions finally maturing: first, market competition between domestic open-source model providers and cloud vendors has driven token costs down dramatically, turning a 24/7 AI agent from a technical concept into a deployable reality; second, the low barrier of natural language interaction aligns perfectly with the mainstream desire to "give light commands and free up your hands" — giving people unlimited imagination about what OpenClaw might be capable of.

Before we dig into OpenClaw, we need to distinguish between two fundamentally different types of AI:

**Conversational AI** (e.g., ChatGPT): Like a consultant — it gives you advice, helps you write copy, answers questions, but ultimately you decide whether and how to act on it. Its output is *information*. You can easily judge whether it's right or wrong, and the cost of an error is nearly zero.

**Executive AI Agents** (e.g., OpenClaw): Like an assistant who actually does things for you — operates your computer, organizes your files, even accesses your work systems. Its output is *action*. It can modify your data, send your emails, and the cost of an error can be very high.

The core problem is this: we — or most users, at least — are used to directing "executive AI" the way we'd talk to "conversational AI," using natural language. It's like telling an assistant to "just figure it out" and expecting a precise result. Naturally, that rarely goes well.

## 2. The Guessing Game: Three Core Flaws of Natural Language AI Control

Directing AI with natural language seems like the most intuitive approach — say something, and it gets done. But that's exactly where the problem lies: natural language is too ambiguous, and AI execution demands precise instructions. This tension is OpenClaw's biggest weakness right now.

Consider a simple example: asking an AI to "tidy up the files on my desktop."

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22%F0%9F%97%A3%EF%B8%8F%20%E6%95%B4%E7%90%86%E4%B8%80%E4%B8%8B%E6%A1%8C%E9%9D%A2%E6%96%87%E4%BB%B6%22%5D%20--%3E%20B%7BAI%20%E7%B1%BB%E5%9E%8B%7D%0A%20%20%20%20B%20--%3E%7C%E5%AF%B9%E8%AF%9D%E5%9E%8B%7C%20C%5B%22%E6%8F%90%E4%BE%9B%E4%B8%89%E7%A7%8D%E6%96%B9%E6%A1%88%0A%E7%94%B1%E4%BD%A0%E9%80%89%E6%8B%A9%E6%89%A7%E8%A1%8C%22%5D%0A%20%20%20%20B%20--%3E%7C%E6%89%A7%E8%A1%8C%E5%9E%8B%7C%20D%5B%22%E7%9B%B4%E6%8E%A5%E6%8C%89%E6%9F%90%E7%A7%8D%E6%96%B9%E5%BC%8F%E6%95%B4%E7%90%86%0A%E6%93%8D%E4%BD%9C%E5%B7%B2%E5%8F%91%E7%94%9F%22%5D%0A%20%20%20%20C%20--%3E%20E%5B%22%E2%9C%85%20%E9%94%99%E8%AF%AF%E6%88%90%E6%9C%AC%EF%BC%9A%E5%87%A0%E4%B9%8E%E4%B8%BA%E9%9B%B6%22%5D%0A%20%20%20%20D%20--%3E%20F%5B%22%E2%9A%A0%EF%B8%8F%20%E9%94%99%E8%AF%AF%E6%88%90%E6%9C%AC%EF%BC%9A%E5%8F%AF%E8%83%BD%E4%B8%8D%E5%8F%AF%E9%80%86%22%5D&look=classic" style="width:100%;height:360px;border:none;border-radius:8px;"></iframe>

This is the fundamental difference between "conversational" and "executive" AI: one outputs *suggestions*, the other outputs *actions*. Actions require much greater controllability — because actions are often irreversible.

**Flaw #1: The inherent conflict between the ambiguity of natural language and the precision required for AI execution**

Words like "organize," "optimize," and "handle" carry hidden context rooted in industry experience and workplace norms — context that AI cannot perceive. The same instruction can produce completely different outcomes depending on how the AI interprets it.

You say "polish this slide deck a bit," and the AI has no idea whether you mean clean up the design, trim the content, or restructure the logic. With a conversational AI, it would offer three versions of suggestions and let you choose. With an executive AI, it might just go ahead and make changes based on its own interpretation — and the result could be nothing like what you had in mind.

**Flaw #2: Pure conversational interaction can't support the workflow demands of complex tasks**

For multi-step tasks that require pausing, backtracking, or parallel execution, users have no real-time visibility into what the AI is doing. You can't tell if it's stuck, and you can't intervene in time. You ask the AI to "summarize my week and send the report to the group chat," and it may have completed the first two steps just fine — but then failed at the "send to the group" part. You have no idea where it got stuck, and no clear way to correct it.

**Flaw #3: Black-box execution provides no foundation for safety or trust**

An AI with system-level permissions is completely unpredictable in its logic and next steps. Cases of accidental data deletion and unintended system changes are far from rare. Trust requires transparency and the ability to intervene. An AI whose behavior you can't predict is one you'll never feel comfortable handing your core work to.

The wildly popular open-source project Edict, with its "Three Provinces and Six Ministries" framework, inadvertently confirms this core problem — it force-fits the AI into a structured process modeled on classical imperial governance, covering planning, review, execution, and checks and balances. While clever in partly solving the controllability problem, it also reveals something uncomfortable: today's AI agents lack built-in controllable workflow mechanisms, and pure natural language interaction simply doesn't hold up in professional, closed-loop work environments.

## 3. Human-AI Collaboration: A Deep Dive into Four Interaction Modes

So here's the question: if pure natural language isn't reliable, what's the right way to interact?

I use a two-axis framework to analyze this —

- **Horizontal axis: AI execution autonomy** — How independently can the AI make decisions and act?
- **Vertical axis: Human expression cost** — How much effort does a person need to invest to get the AI to execute their intent?

**The real point of this framework is: who absorbs the ambiguity?**

<iframe src="https://eric.run.place/MermZen/embed.html?text=quadrantChart%0A%20%20%20%20title%20AI%20%E5%B7%A5%E5%85%B7%E4%BA%A4%E4%BA%92%E6%A8%A1%E5%BC%8F%EF%BC%9A%E8%B0%81%E6%9D%A5%E6%B6%88%E5%8C%96%E6%AD%A7%E4%B9%89%EF%BC%9F%0A%20%20%20%20x-axis%20%E4%BD%8E%E8%87%AA%E4%B8%BB%E6%80%A7%20--%3E%20%E9%AB%98%E8%87%AA%E4%B8%BB%E6%80%A7%0A%20%20%20%20y-axis%20%E4%BD%8E%E8%A1%A8%E8%BE%BE%E6%88%90%E6%9C%AC%20--%3E%20%E9%AB%98%E8%A1%A8%E8%BE%BE%E6%88%90%E6%9C%AC%0A%20%20%20%20%E5%8F%AF%E6%8B%96%E6%8B%BD%E5%B7%A5%E4%BD%9C%E6%B5%81%3A%20%5B0.15%2C%200.2%5D%0A%20%20%20%20IDE%20%E5%86%85%E5%B5%8C%E5%BC%8F%20AI%3A%20%5B0.48%2C%200.48%5D%0A%20%20%20%20AI%20%E5%8E%9F%E7%94%9F%E6%B5%8F%E8%A7%88%E5%99%A8%3A%20%5B0.65%2C%200.28%5D%0A%20%20%20%20OpenClaw%3A%20%5B0.85%2C%200.82%5D&look=classic" style="width:100%;height:420px;border:none;border-radius:8px;"></iframe>

**Drag-and-drop workflow** (bottom-left): The human absorbs ambiguity upfront. Cost is low but so is autonomy — because the person has pre-structured their intent into a flowchart, effectively doing part of the "understanding" work for the AI. Ambiguity is eliminated before execution ever begins.

**AI-native browser** (bottom-right): Context absorbs the ambiguity. Expression cost is low because the task and context are naturally aligned — when you're on a page and say "fill out this form for me," the AI can see exactly what you see, leaving almost no room for ambiguity. Visual context acts as an implicit constraint.

**IDE-embedded AI** (center): Structure reduces ambiguity. Cost is moderate because the "select + instruct" interaction pattern itself carries precise context — when you highlight a block of code, you're telling the AI "this is the only part I care about." This structured input naturally narrows the ambiguity space, rather than leaving the AI to guess.

**OpenClaw / pure natural language** (top-right): The AI has to repeatedly absorb ambiguity on its own. Cost is high because the task chain is long, context must be manually constructed, and the AI can't see the goal in your head — so realignment is constantly required. Ambiguity keeps surfacing throughout execution, demanding user intervention each time.

So the real question isn't "is the AI smart enough?" — it's **"at what stage is ambiguity absorbed, and by whom?"** Drag-and-drop workflows move ambiguity resolution to the design stage. AI browsers let context do the work. IDE-embedded AI uses structured input to keep ambiguity low. OpenClaw, on the other hand, pushes all ambiguity resolution into the execution phase — users end up repeatedly correcting the AI every time it misreads the intent, and the cost compounds accordingly.

---

**Mode 1: Pure Natural Language Interaction (Representative: OpenClaw)**

How it works: The user describes their needs in everyday language → AI interprets intent and executes → the execution process is invisible → results are presented directly.

Strengths: Zero learning curve, accessible to anyone; maximum flexibility, theoretically handles any task; always on, always responsive.

Problems: Intent interpretation becomes a "guessing game" (every task requires follow-up clarification, making communication costly); execution is a "black box" (by the time you notice a problem, irreversible damage may already be done); error recovery is painful (accidentally deleted files, sent to the wrong person — the cost of fixing mistakes is enormous).

Best for: Tasks where the output is easy to verify (writing copy, translating, answering questions) — low error cost, no real material downside if something goes wrong.

---

**Mode 2: IDE-Embedded AI (Representatives: Claude Code, Cursor, Windsurf)**

How it works: AI is deeply integrated into the work environment → users describe intent precisely using "select + instruct" → AI outputs a plan first, executes only after user confirmation → the entire process is visible in real time and can be taken over at any point.

Strengths: Precise context injection (selecting a code snippet is the same as explicitly telling the AI "this is the only part I care about"); plan mode — look before you leap (AI shows you what it's going to do, you review it before it executes — essentially giving the AI a "brake"); transparent, controllable execution (every step is logged, you can stop at any time if something looks off).

Key insight: It's not that the AI is smarter — it's that the interaction model is more controllable. The core of this approach is replacing "having the AI guess your intent" with "having humans express their intent precisely."

**Extension: Claude Cowork — From Coding to Knowledge Work**

In January 2026, Anthropic launched Claude Cowork, positioned as "Claude Code for the rest of your work." It extends the controlled-interaction principles of Claude Code from programming into knowledge work — point Claude at a folder, describe the outcome you want, and it autonomously plans and executes the steps.

It's more controllable than OpenClaw because it inherits Claude Code's design framework: plan mode (shows what it intends to do, waits for your confirmation before acting); real-time logging (every step is visible, you can take over at any time); clear boundaries (operates within the specified folder, no "going out of bounds"). This is precisely what OpenClaw is missing — not intelligence, but a controllable interaction framework.

---

**Mode 3: AI-Native Browsers (Dia, Tabbit)**

AI "sees" the webpage and operates like a human — clicking, inputting, scrolling → user describes tasks in natural language → AI executes in the browser.

Strengths: web page becomes context, drastically reducing expression cost; theoretically handles tasks like "book a flight" or "fill a form."

Problems: product category is new and trajectory is unclear — the Doubao AI phone's blocking by Chinese device manufacturers illustrates that this category's business model and ecosystem acceptance are still being established.

Best for: information retrieval, web browsing, simple automation tasks. Good for early adopters.

---

**Mode 4: Draggable Workflows (Coze, Dify, n8n, Zapier)**

Visual flowchart design → each node defines explicit input/output → AI only executes specified tasks at specified nodes.

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%E8%A7%A6%E5%8F%91%E6%9D%A1%E4%BB%B6%5D%20--%3E%20B%5B%22%E8%8A%82%E7%82%B9%201%0A%E8%8E%B7%E5%8F%96%E8%BE%93%E5%85%A5%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%22%E8%8A%82%E7%82%B9%202%0AAI%20%E5%A4%84%E7%90%86%22%5D%0A%20%20%20%20C%20--%3E%20D%7B%E6%9D%A1%E4%BB%B6%E5%88%A4%E6%96%AD%7D%0A%20%20%20%20D%20--%3E%7C%E6%BB%A1%E8%B6%B3%7C%20E%5B%22%E8%8A%82%E7%82%B9%203a%0A%E5%8F%91%E9%80%81%E9%80%9A%E7%9F%A5%22%5D%0A%20%20%20%20D%20--%3E%7C%E4%B8%8D%E6%BB%A1%E8%B6%B3%7C%20F%5B%22%E8%8A%82%E7%82%B9%203b%0A%E8%AE%B0%E5%BD%95%E6%97%A5%E5%BF%97%22%5D&look=classic" style="width:100%;height:360px;border:none;border-radius:8px;"></iframe>

Strengths: full process visibility (debug and test individual nodes); clear scope (what AI can and can't do is defined in the flow); reusable (design once, run repeatedly).

Problems: low flexibility (can only handle cases within the predefined flow); high design cost (requires thinking through every step in advance, bad for ad-hoc or rapidly changing tasks).

Best for: fixed, repeating workflows with a dedicated team to design and maintain them.

---

Back to OpenClaw: it chose "high autonomy + high expression cost" without solving the expression cost problem. Users must repeatedly explain their intent, the AI still misinterprets, the execution process is invisible, and results are consistently unsatisfying.

**What AI actually needs to reliably "do the work" isn't higher autonomy. It's lower expression cost and higher transparency.**

## 4. A Practical Guide: How to Choose the Right AI Tool

| What you need | Recommended tool | Why |
|------|------|------|
| Information output (copy, translation, Q&A) | Conversational AI (ChatGPT, Claude) | Low error cost, verifiable output |
| Executing operations (code, files) | Claude Code / Claude Cowork | High controllability, transparent process |
| Web operations (browsing, comparison) | AI browser (Dia, Tabbit) | Visual understanding, web interaction |
| Repeating processes (batch tasks) | Draggable workflows (Coze, Dify) | Fixed flow, reusable |

**Who is OpenClaw for right now?**

Honestly, before its interaction design is fundamentally improved, I wouldn't rush to install it.

Good fit: curious users who want to experience "what AI Agents can do"; exploratory tasks that don't involve sensitive data.

Not a good fit yet: production work requiring precise execution; operations involving sensitive data.

If you want to try "AI doing real work," start with Claude Cowork — it inherits a controllable interaction framework and is significantly more reliable.

## 5. Core Conclusion: Why OpenClaw Isn't the Final Answer

First, credit where it's due: OpenClaw is an undisputed pioneer in the AI Agent space. It gave millions of users their first direct experience of what AI Agents can actually do. It accelerated the spread of Skills, MCP, and other core infrastructure. It's genuinely a cool product.

But at the end of the day, OpenClaw is still just a starting point. It demonstrated "AI can do work" as a possibility — it hasn't delivered "AI can do work reliably, at scale."

The core issue is the interaction design: a lack of low-cost, high-control interaction modes. Pure natural language forces users to pay high communication costs while still failing to guarantee accurate execution. In contrast, IDE-embedded AI uses "select + instruct," plan preview, and real-time logs to deliver high-control execution at moderate cost.

OpenClaw showed me the potential of AI Agent deployment. It just hasn't crossed the gap from "capable" to "reliable, scalable, production-ready." That's exactly why it's not the final answer.

## Afterward: Find Your Own AI Rhythm

After burning three hundred million tokens, my biggest takeaway: OpenClaw isn't the answer yet — but it showed us clearly where the problem is.

The problem isn't "is AI strong enough?" It's "how are we collaborating with AI?" Pure natural language is a black box — you speak, it acts, and you're left guessing at the result. A genuinely reliable AI tool should let you see the process, stay in control, and keep expression cost low.

**Different AI interaction modes are all trying to find cheaper, more reliable ways to inject more context — to get dependable output. But more context still lives in our heads. We still need to express it precisely, clearly, to AI or to other people.**

OpenClaw? Wait for 2.0, when it adds a controllable interaction framework.

*Written after a week of intense AI use, Hangzhou.*
