---
title: "OpenClaw Is Not the Answer: After Burning 300 Million Tokens in a Week"
description: "After a week of deep testing and 300 million tokens burned: the problem isn't that AI isn't smart enough. It's that pure natural language interaction has a fundamental flaw for execution-type tasks. A framework of four interaction modes, analyzed through one question: who absorbs the ambiguity?"
author: "Eric Cao"
date: "2026-03-10"
---

OpenClaw is everywhere right now. After a week of deep testing and burning through roughly 300 million tokens, my conclusion: it's not the answer yet.

OpenClaw ignited expectations for real AI Agent deployment. But its current interaction design isn't mature enough. The problem isn't "AI isn't smart enough." The problem is that pure natural language interaction has a fundamental flaw in execution-type tasks.

I've mapped AI tools into four interaction modes, each suited to different scenarios. By the end, you'll be able to judge: Is OpenClaw right for you? And if not, what should you use instead?

## 1. The Gap: What Actually Happened After a Week with OpenClaw

OpenClaw has been everywhere — GitHub stars exploding, meetups filling up, even peripheral services can't keep up. The underlying expectation is real: who doesn't want their own Jarvis?

I went in with that expectation during the Spring Festival holiday, ran it hard for a week, burned about 300 million tokens. The result: a significant gap between expectation and reality.

It uploaded my work files to GitHub without authorization. I explained the rules sentence by sentence, and it still couldn't produce what I wanted. When I asked friends, they'd hit similar issues.

Why did OpenClaw generate so much buzz? Two structural reasons: first, competitive pressure between domestic open-source model providers has driven token costs down sharply, making 24-hour AI Agents economically viable. Second, natural language interaction's zero-learning-curve aligns perfectly with the core desire to "command lightly, free your hands" — which gave everyone unlimited imagination about what OpenClaw could do.

Before analyzing OpenClaw, we need to distinguish two fundamentally different types of AI:

**Conversational AI** (like ChatGPT): An advisor that gives suggestions, writes copy, answers questions — but "whether to use it" and "how to apply it" are still your decisions. Its output is *information*. You can easily verify correctness. Error cost is nearly zero.

**Execution AI Agent** (like OpenClaw): An assistant that directly *does things* — operates your computer, organizes files, accesses your work systems. Its output is *action*. It may modify your data, send your emails. Error cost can be very high.

The core problem: most users are trying to command execution AI with the conversational AI patterns they've internalized. It's like asking an assistant to interpret "use your judgment" without any context — the results are naturally unsatisfying.

## 2. The Guessing Game: Three Core Flaws of Natural Language Control

Natural language feels like the most intuitive way to direct AI — say a sentence, it does the thing. But the problem is exactly there: natural language is too vague, and AI execution needs precise instructions. This mismatch is OpenClaw's biggest weakness right now.

An example: "Organize my desktop files."

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22%F0%9F%97%A3%EF%B8%8F%20%E6%95%B4%E7%90%86%E4%B8%80%E4%B8%8B%E6%A1%8C%E9%9D%A2%E6%96%87%E4%BB%B6%22%5D%20--%3E%20B%7BAI%20%E7%B1%BB%E5%9E%8B%7D%0A%20%20%20%20B%20--%3E%7C%E5%AF%B9%E8%AF%9D%E5%9E%8B%7C%20C%5B%22%E6%8F%90%E4%BE%9B%E4%B8%89%E7%A7%8D%E6%96%B9%E6%A1%88%0A%E7%94%B1%E4%BD%A0%E9%80%89%E6%8B%A9%E6%89%A7%E8%A1%8C%22%5D%0A%20%20%20%20B%20--%3E%7C%E6%89%A7%E8%A1%8C%E5%9E%8B%7C%20D%5B%22%E7%9B%B4%E6%8E%A5%E6%8C%89%E6%9F%90%E7%A7%8D%E6%96%B9%E5%BC%8F%E6%95%B4%E7%90%86%0A%E6%93%8D%E4%BD%9C%E5%B7%B2%E5%8F%91%E7%94%9F%22%5D%0A%20%20%20%20C%20--%3E%20E%5B%22%E2%9C%85%20%E9%94%99%E8%AF%AF%E6%88%90%E6%9C%AC%EF%BC%9A%E5%87%A0%E4%B9%8E%E4%B8%BA%E9%9B%B6%22%5D%0A%20%20%20%20D%20--%3E%20F%5B%22%E2%9A%A0%EF%B8%8F%20%E9%94%99%E8%AF%AF%E6%88%90%E6%9C%AC%EF%BC%9A%E5%8F%AF%E8%83%BD%E4%B8%8D%E5%8F%AF%E9%80%86%22%5D&look=classic" style="width:100%;height:360px;border:none;border-radius:8px;"></iframe>

This is the core distinction between conversational and execution AI: one produces *suggestions*, the other produces *actions*. Actions require much higher controllability, because actions are often irreversible.

**Flaw 1: The fundamental conflict between natural language ambiguity and execution precision**

Words like "organize," "optimize," and "process" carry implicit context built from industry experience and work scenarios — context AI cannot infer. The same instruction produces completely different outcomes depending on interpretation. You say "improve this presentation," and the AI doesn't know if you mean visual layout, content reduction, or structural logic. A conversational AI gives you three options; an execution AI might just apply its own interpretation — and get it completely wrong.

**Flaw 2: Conversation can't carry complex workflow requirements**

For multi-step tasks requiring interruption, backtracking, or parallel execution, users can't track AI progress in real time. You can't tell if it's stuck, and you can't course-correct in time. You ask AI to "summarize my week's work and send a status update to the group" — the AI might finish the first two steps but fail on the sending step, and you have no idea where it got stuck.

**Flaw 3: Black-box execution can't build trust**

An AI with system-level access has unpredictable execution logic. Accidental file deletion and erroneous system operations have become common failure modes. Trust depends on transparency and controllability. An AI whose behavior you can't predict is one you'll never feel comfortable delegating core work to.

The explosion of the Edict "Three Provinces and Six Ministries" open-source project — which imposed classic bureaucratic review and execution logic onto AI to force workflow control — is a sideways confirmation of the problem. It cleverly addresses some flow-control issues, but it also reveals a deeper limitation: current AI Agents lack built-in controllable workflow mechanisms.

## 3. Four Interaction Paradigms: A Deep Comparison

If pure natural language is unreliable, what's the right interaction model?

I use a coordinate system:

- **Horizontal axis: AI execution autonomy** — how independently can AI make decisions and execute?
- **Vertical axis: human expression cost** — how much effort does the human need to expend to get AI to act on their intent?

**The real question this axis captures: who absorbs the ambiguity?**

<iframe src="https://eric.run.place/MermZen/embed.html?text=quadrantChart%0A%20%20%20%20title%20AI%20%E5%B7%A5%E5%85%B7%E4%BA%A4%E4%BA%92%E6%A8%A1%E5%BC%8F%EF%BC%9A%E8%B0%81%E6%9D%A5%E6%B6%88%E5%8C%96%E6%AD%A7%E4%B9%89%EF%BC%9F%0A%20%20%20%20x-axis%20%E4%BD%8E%E8%87%AA%E4%B8%BB%E6%80%A7%20--%3E%20%E9%AB%98%E8%87%AA%E4%B8%BB%E6%80%A7%0A%20%20%20%20y-axis%20%E4%BD%8E%E8%A1%A8%E8%BE%BE%E6%88%90%E6%9C%AC%20--%3E%20%E9%AB%98%E8%A1%A8%E8%BE%BE%E6%88%90%E6%9C%AC%0A%20%20%20%20%E5%8F%AF%E6%8B%96%E6%8B%BD%E5%B7%A5%E4%BD%9C%E6%B5%81%3A%20%5B0.15%2C%200.2%5D%0A%20%20%20%20IDE%20%E5%86%85%E5%B5%8C%E5%BC%8F%20AI%3A%20%5B0.48%2C%200.48%5D%0A%20%20%20%20AI%20%E5%8E%9F%E7%94%9F%E6%B5%8F%E8%A7%88%E5%99%A8%3A%20%5B0.65%2C%200.28%5D%0A%20%20%20%20OpenClaw%3A%20%5B0.85%2C%200.82%5D&look=classic" style="width:100%;height:420px;border:none;border-radius:8px;"></iframe>

**Draggable workflows** (bottom-left): The human absorbs ambiguity up front. Lower autonomy because the human pre-structured their intent as a flowchart — the human already did part of the "understanding" work for the AI. Ambiguity is eliminated before execution.

**AI-native browsers** (bottom-right): Context absorbs ambiguity. Expression cost is low because the task and context naturally align — you say "fill in this form" while looking at a form, and the AI sees what you see. Visual context acts as implicit constraint.

**IDE-embedded AI** (middle): Structured input reduces ambiguity. Moderate cost, because "select + instruct" naturally carries precise context — selecting a code block tells the AI exactly which part you care about. Structured input reduces the ambiguity space rather than leaving AI to guess.

**OpenClaw / pure natural language** (top-right): AI absorbs ambiguity throughout execution. Cost is high because the task chain is long and context must be manually constructed. The AI can't see your goals, so it requires constant realignment. Ambiguity keeps surfacing during execution; each recurrence requires user intervention.

The question isn't "is the AI smart enough?" It's **"where does ambiguity get absorbed, and by whom?"** Draggable workflows front-load ambiguity to the design phase. AI browsers use context to absorb it. IDE-embedded AI uses structured input to eliminate it. OpenClaw leaves all ambiguity absorption to runtime — requiring constant user correction every time the AI's interpretation drifts.

---

**Mode 1: Pure Natural Language (OpenClaw)**

User describes needs in plain language → AI infers intent and executes → execution invisible → result appears directly.

Strengths: zero learning curve, maximum theoretical flexibility, 24/7 availability.

Problems: the intent "guessing game" (every task needs supplementary clarification); execution black box (problems may be discovered after irreversible actions); error recovery困境 (cleanup often costs more than the task).

Best for: tasks where output is easily verifiable (copywriting, translation, Q&A). Low error cost, no material damage if wrong.

---

**Mode 2: IDE-Embedded AI (Claude Code, Cursor, Windsurf)**

Deep integration into the work environment → user describes intent via "select + instruct" → AI presents a plan, user confirms, then executes → process visible in real time, user can take over at any point.

Strengths: precise context injection (selecting code tells AI exactly what you care about); plan mode — see before doing (AI shows what it will do, you review before execution, effectively giving AI a "brake"); transparent execution (every step logged, can interrupt at any time).

Core insight: it's not that the AI is smarter — it's that the interaction mode is more controllable. This approach converts "AI guesses your intent" into "human expresses intent precisely."

**Extension: Claude Cowork — from code to knowledge work**

In January 2026, Anthropic released Claude Cowork, positioned as "Claude Code for the rest of your work." It extends Claude Code's controllable interaction design from programming to knowledge work scenarios — give Claude a folder, describe the outcome you want, it plans and executes steps autonomously.

Why is it more controllable than OpenClaw? It inherits Claude Code's framework: plan mode (show what it will do, confirm before executing); real-time logs (every step visible, you can take over); explicit scope (operates within the specified folder, doesn't "overstep").

This is exactly what OpenClaw is missing — not AI intelligence, but a controllable interaction framework.

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
