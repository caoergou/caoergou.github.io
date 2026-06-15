---
title: Can an AI Get Smarter on Its Own, the Way an Intern Does?
description: "Hermes Agent leads with the tagline \"the agent that grows with
  you\" — like an intern that learns on the job. I decided to take that claim
  seriously: without changing a single model weight, relying purely on the agent
  accumulating skills on its own, can it actually get smarter with use? The
  answer is a little counterintuitive — one well-written human skill can take
  the same model from 10% to 74% accuracy, but when the agent writes its own, it
  can't close even half that gap."
author: Eric Cao
date: 2026-06-12
---

Hermes Agent has a tagline that really lands: **the agent that grows with you** — an agent that gets smarter the more you use it, like hiring a great intern who picks things up after one explanation and never needs to be told twice.

But I was skeptical: **if the model's weights never change and you're just adding skills, can an agent really be "trained up" like an intern and genuinely get smarter over time?** That's a testable question, so I dug in — and found that the answer is a lot more interesting than the slogan.

## 1. What is this "growing," exactly?

The "growth" Hermes describes isn't retraining — it takes the in-context route: after each task, the agent distills what it learned into a **skill** (a `SKILL.md` file), which gets loaded back into context on the next task.

A background "curator" process then decides which skills to keep and which to discard, based on how recently they were used and how often. The model itself never changes — only the pile of skills it accumulates.

One aspect of this mechanism is worth pausing on: **at no point does it ever verify whether a given skill actually improved the outcome**. A skill earns its place in the library by being "recently used," not by being genuinely useful — the system just keeps accumulating, never validating.

At first glance, that might not seem like a problem: the more skills you accumulate, the more you have to draw on, right? But it bets everything on an assumption no one has verified — **that simply accumulating skills will make the agent progressively better**. Whether that assumption actually holds is exactly what this article sets out to answer.

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22agent%20%E5%81%9A%E4%BB%BB%E5%8A%A1%22%5D%20--%3E%20B%5B%22%E5%86%99%E4%B8%80%E6%9D%A1%20SKILL.md%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%28%22skill%20%E5%BA%93%22%29%5D%0A%20%20%20%20C%20--%20%22%E4%B8%8B%E6%AC%A1%E5%8A%A0%E8%BD%BD%E8%BF%9B%20context%22%20--%3E%20A%0A%20%20%20%20C%20--%3E%20D%5B%22curator%20%E6%8C%89%E6%96%B0%E8%BF%91%20%2F%20%E4%BD%BF%E7%94%A8%3Cbr%2F%3E%E5%86%B3%E5%AE%9A%E5%8E%BB%E7%95%99%22%5D%0A%20%20%20%20D%20--%3E%20C%0A%20%20%20%20D%20-.-%3E%7C%22%E4%BB%8E%E4%B8%8D%E6%A3%80%E6%9F%A5%20skill%20%E5%88%B0%E5%BA%95%E6%9C%89%E6%B2%A1%E6%9C%89%E7%94%A8%22%7C%20X%28%28%22%E6%B2%A1%E6%9C%89%E9%AA%8C%E6%94%B6%22%29%29" style="width:100%;height:300px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">This "learning loop": write a skill → store it → load it back next time. The curator only decides what stays based on recency and usage — it never validates whether a skill is actually useful.</figcaption>
</figure>

## 2. Pin the question to one real task

"Gets smarter with use" is too vague to mean anything. Let's reframe it as something scorable: **if the model's weights don't change, does giving it a skill actually raise its success rate?** A task everyone's dealt with makes this concrete.

CMU's **[SkillLearnBench](https://arxiv.org/abs/2604.20087)** includes one called `organize-messy-files`: the [original prompt](https://github.com/cxcscmu/SkillLearnBench/blob/main/tasks/organize-messy-files/organize-messy-files-1/instruction.md) hands the model 103 files all mixed together and asks it to sort them by **content** into five topic folders (large language models, quantum computing, black holes, DNA, and music history) — **every single file must end up in exactly one folder, no duplicates, no omissions**. The file tree looks like this:

```text
/root/papers/all/
├── 2402.11651v2.pdf
├── 2306.08568v2.pdf
├── 0704.0117v1.pdf
├── …(100 files total, all named with arxiv IDs)…
├── 2506.14877v1.pdf
├── DAMOP.pptx          # physics conference slides, no arxiv ID
├── paper_file_1.docx   # Word document, no arxiv ID
└── paper_file_2.docx
```

Not a sophisticated task — but exactly the kind that exposes a particular failure mode: you have to actually **open each file and read it**, and you have to keep track carefully enough that nothing gets lost.

First, let's see what happens **with no skill at all** — the baseline "zero-skill" condition. To be clear: in this task the model isn't just generating text. It's operating as a real agent, opening files one by one, judging their topic, and moving them into the right folder. But with 100-plus files in a row, it tends to unravel: some get miscategorized without being read carefully, some get dropped along the way with no one noticing. On its own, the model does poorly.

So what does the agent actually write when it distills this experience into a skill? I pulled up the [skill it genuinely generated](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/b1-one-shot-claude-sonnet-4-6/organize-messy-files/arxiv-paper-lookup/SKILL.md) in SkillLearnBench — and it came up with a **pretty clever shortcut**: instead of laboriously reading each file's full text, just extract the arxiv ID from the filename, look up the abstract online, and classify based on that. It even includes working code, and confidently states: "**The title alone is usually enough to classify a paper.**"

Looking at the file tree above, this seems genuinely smart — a hundred filenames that are all arxiv IDs, so why not just query by ID? Except it **doesn't work**, and it fails in exactly the ways its cleverness invited, in two fatal strokes:

1. This task runs **offline** (the papers were downloaded in advance specifically so classification could be done without internet access) — the arxiv API it wants to query **is unreachable**;
2. Even with internet access, `DAMOP.pptx` and the two `.docx` files have no arxiv IDs to extract.

It bet on a "looks clever" shortcut and lost, because the premise of that shortcut simply doesn't hold in the real environment — and in doing so, it bypassed the one approach that actually works: **open each file and read its content** (the environment has `pdftotext` and LibreOffice installed and ready).

The human-authored skill takes the opposite approach: no shortcuts, just methodical groundwork. It first surveys what's actually in the directory, classifies each file by **content** (not filename), and pairs that with a "[planning-with-files](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/human_authored/organize-messy-files/planning-with-files/SKILL.md)" approach — build a plan, track progress, log each file one by one, and confirm all 103 are accounted for with no duplicates. The full workflow looks like this:

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20TD%0A%20%20%20%20A%5B%22%E5%85%88%E6%91%B8%E6%B8%85%E7%9B%AE%E5%BD%95%E9%87%8C%E9%83%BD%E6%9C%89%E4%BB%80%E4%B9%88%22%5D%20--%3E%20B%5B%22%E9%80%90%E4%B8%AA%E6%96%87%E4%BB%B6%EF%BC%9A%E6%89%93%E5%BC%80%E3%80%81%E8%AF%BB%E5%86%85%E5%AE%B9%3Cbr%2F%3E%E8%80%8C%E4%B8%8D%E6%98%AF%E7%9C%8B%E6%96%87%E4%BB%B6%E5%90%8D%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%22%E6%8C%89%E5%86%85%E5%AE%B9%E5%BD%92%E8%BF%9B%205%20%E4%B8%AA%E4%B8%BB%E9%A2%98%E4%B9%8B%E4%B8%80%22%5D%0A%20%20%20%20C%20--%3E%20D%5B%22%E5%9C%A8%E8%BF%9B%E5%BA%A6%E8%A1%A8%E4%B8%8A%E7%99%BB%E8%AE%B0%E8%BF%99%E4%B8%80%E4%B8%AA%3Cbr%2F%3Eplanning-with-files%22%5D%0A%20%20%20%20D%20--%3E%20E%7B%22103%20%E4%B8%AA%E9%83%BD%E5%BD%92%E5%AE%8C%E4%BA%86%E5%90%97%EF%BC%9F%22%7D%0A%20%20%20%20E%20--%20%E8%BF%98%E6%B2%A1%20--%3E%20B%0A%20%20%20%20E%20--%20%E5%AE%8C%E6%88%90%20--%3E%20F%5B%22%E6%9C%80%E5%90%8E%E5%86%8D%E6%A0%B8%E4%B8%80%E9%81%8D%EF%BC%9A%3Cbr%2F%3E%E6%AF%8F%E4%B8%AA%E6%96%87%E4%BB%B6%E6%81%B0%E5%A5%BD%E5%BD%92%E4%B8%80%E6%AC%A1%EF%BC%8C%E4%B8%8D%E6%BC%8F%E4%B8%8D%E9%87%8D%22%5D" style="width:100%;height:430px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">The human skill's "slow and steady" method: read each file's content, log progress, do a final verification pass for completeness and no duplicates — slower, but every file is accounted for, with a built-in quality check at the end.</figcaption>
</figure>

One approach bets on a clever shortcut; the other relies on methodical, unglamorous procedure. The model following the latter gets the right answer far more often.

Don't rush to turn this single example into an iron law. It's one task, one failure mode — swap in a different task and an agent-generated skill will fail in entirely different ways: this time it gambled on a clever shortcut, next time it might mistake a worked example for a general rule, or skip a verification step to save effort.

But beneath all those variations is the same root cause: **it has no way to judge whether the skill it just wrote is any good**. It picked the "smarter-looking" option precisely because it can't tell the difference between "looks clever" and "actually gets the job done." Is this just a fluke with this one task? The next section scales the experiment up.

Zoom out to the full benchmark, and here's what it looks like — **same model, weights unchanged, only the skill swapped**:

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20M%5B%22%E5%90%8C%E4%B8%80%E4%B8%AA%E6%A8%A1%E5%9E%8B%3Cbr%2F%3E%28%E6%9D%83%E9%87%8D%E5%AE%8C%E5%85%A8%E6%B2%A1%E5%8A%A8%29%22%5D%20--%3E%7C%22%E4%B8%8D%E7%BB%99%20skill%22%7C%20A%5B%2210%25%20%E5%81%9A%E5%AF%B9%22%5D%0A%20%20%20%20M%20--%3E%7C%22agent%20%E8%87%AA%E5%B7%B1%E7%94%9F%E6%88%90%EF%BC%88%E6%9C%80%E5%A5%BD%E4%B8%80%E6%A1%A3%EF%BC%89%22%7C%20B%5B%22~39%25%20%E5%81%9A%E5%AF%B9%22%5D%0A%20%20%20%20M%20--%3E%7C%22%E4%BA%BA%E5%86%99%E7%9A%84%20skill%22%7C%20C%5B%2274%25%20%E5%81%9A%E5%AF%B9%22%5D" style="width:100%;height:340px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;"></iframe>

The one-sentence takeaway: a good human-written skill lifts the same model from **10%** to **74%** — so "a good skill can make it smarter" is genuinely true.

But when the agent generates its own skills, **the best it manages across all methods tested is ~39%** (the paper's exact words: it doesn't even close half the gap between "human-written" and "no skill at all"). There's another telling detail: letting the agent iteratively revise its own skills based on self-reflection tends to plateau or regress — the only path that actually moves the needle is **external** feedback, not introspection.

On a second benchmark, **[SkillsBench](https://arxiv.org/abs/2602.12670)** (86 tasks, 84 evaluated), agent-generated skills averaged 1.3 points *below* having no skill at all. The two benchmarks measure different things (one asks "given the right skill, can the task be completed?"; the other measures overall agent performance with skills), but both point to the same conclusion: **on its own, the agent can't close the gap left by human-authored skills.**

These numbers deserve a word on **how they were actually measured**, or they risk seeming like off-the-cuff figures. SkillLearnBench doesn't grab tasks arbitrarily: it specifically selects tasks where "a bare model basically can't succeed, but with the right skill it can" (organizing files is the perfect example — the model is capable in principle, but tends to drop things and make assumptions). Only on tasks like these does "did the skill actually help" become measurable.

Each task is also paired with a human-authored "ceiling skill" as an upper-bound reference, and scoring is done with deterministic scripts across hundreds of instances, then averaged. So 10% → 74% isn't a cherry-picked highlight — it's the real gap measured repeatedly with every variable locked down except which skill was provided.

## 3. Why can't the agent write a good one?

The truly counterintuitive part comes next. Step back and consider: even if an agent can't write good skills itself, surely an AI could at least look at two existing skills and pick the more useful one?

Microsoft's **[SkillLens](https://github.com/microsoft/SkillLens)** tested exactly that. **46.4%. Worse than a coin flip.** A model capable of writing code and running as an agent can't reliably judge which of two pieces of experience is more useful. The same study also found that making a skill's formatting cleaner and more polished has no statistically significant effect on performance — **how a skill looks and whether it actually works are two completely separate things.**

This explains why agents can't write good skills: they can't tell whether what they've written is useful — and usefulness is precisely what you can't judge from appearances. The arxiv shortcut from earlier is the perfect negative example: slick, comes with code, looks efficient — and completely falls apart in a real offline environment where none of the lookups go through. A judge who can't distinguish "looks clever" from "actually gets the job done" is equally unable to distinguish "a glib shortcut" from "a slow but reliable method."

SkillLearnBench drives the point further: when the agent is asked to iteratively revise its skills based on its own reflections, accuracy declines over successive rounds rather than improving — without an external signal, it's just polishing the wording around its own blind spots.

For contrast, **[Voyager](https://github.com/MineDojo/Voyager)** — a well-known 2023 agent that explored Minecraft autonomously and accumulated a growing skill library — handled this differently in one critical way: a skill only entered the library **after being verified as having actually completed a task**. That "verify first, then keep" gate is exactly what's missing from Hermes's loop.

Put the two side by side, with the direction the research points toward, and the difference is immediate:

| | What it is | How it decides whether to keep a skill | Validation gate |
|---|---|---|---|
| **Hermes** | General-purpose assistant agent that stores experience as `SKILL.md` files | Based on "recently used" | ✗ Never validates |
| **Voyager** | Self-exploring agent in Minecraft | Self-verifies that the task was actually completed before adding to library | ✓ Yes |
| **Ideal loop** (where the research points) | What the next generation should look like | Only kept after external signals, tests, or human review | ✓ Required |

Going one level deeper: this isn't an accidental flaw in the skill format — it's the inescapable deadlock of any system that revises itself without external grounding. **Without a signal from outside telling it what's right or wrong, self-revision just amplifies existing judgment — and the places where you're most confident are often exactly the places you're most blind.** Humans improve not by thinking harder in isolation, but because someone marks up their work and reality pushes back. Agents are no different.

## 4. So — does it actually grow with you?

Putting it all together, the answer is clear — and more interesting than a simple yes or no: **Yes, but only up to the point where it can write a good skill on its own and use it correctly — and right now, it can't do either.** "Adding a good skill makes the model smarter" is absolutely true (10% → 74% speaks for itself); the real bottleneck is that the agent can neither produce that good skill on its own nor tell which skills are actually good.

Does that mean it's hopeless? Quite the opposite — taken together, these papers actually sketch out a prescription.

## 5. So how *do* you teach it? The papers hand you a recipe

They all point to the same thing: **the problem was never about writing style — it's about correctness. Something needs to vet each skill before it enters the library.** The papers together offer a fairly complete picture of how to do that:

- **Don't let it debrief itself — give it external signals.** This is SkillLearnBench's hardest finding: sustained improvement "comes primarily from external feedback; iterating on self-feedback alone only causes drift, not progress." Give it a "teacher" — even one who just points a direction without handing over the answer — and scores actually climb.
- **Validate before storing.** Voyager keeps getting stronger because a skill "is only added to the library after self-verification confirms the task was genuinely completed." StreamBench adds another point: storing only examples the agent got *right* is most useful, while feeding back "here's where you went wrong" is often useless and can sometimes drag scores below zero-shot — **telling it what it did right works far better than dwelling on what it did wrong.**
- **Write specific pitfalls and specific fixes, not correct-sounding platitudes.** SkillLens is precise on this: what actually works is "specific failure mechanisms paired with actionable remedies, not generic advice." They wrote a dedicated "skill for writing skills" (a meta-skill) that encodes failure mechanisms, concrete step-by-step actions, and a blacklist of high-risk moves — that single addition lifted the judge that was worse than a coin flip (46.4%) all the way to 73.8% accuracy.
- **And the most readily available ingredient is people.** In SkillsBench, human-refined skills immediately raised scores by 16.2 points — that 74% ceiling is reachable today, with human-written skills; the only dead end is asking the agent to write them itself.

Connect these four points and that negative conclusion — "it can't write them itself" — turns out to be a **design blueprint for the next generation of agents**: a learning loop with a validation gate, storing only examples the agent got right, packed with specific failure mechanisms, and backed by a human (or a meta-skill) as a final check.

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22agent%20%E5%81%9A%E4%BB%BB%E5%8A%A1%22%5D%20--%3E%20B%5B%22%E5%86%99%E4%B8%80%E6%9D%A1%20skill%22%5D%0A%20%20%20%20B%20--%3E%20V%7B%22%E9%AA%8C%E6%94%B6%EF%BC%9A%E7%9C%9F%E7%9A%84%E6%9C%89%E7%94%A8%E5%90%97%EF%BC%9F%3Cbr%2F%3E%E6%B5%8B%E8%AF%95%20%2F%20%E6%9B%B4%E5%BC%BA%E7%9A%84%E6%A8%A1%E5%9E%8B%20%2F%20%E4%BA%BA%22%7D%0A%20%20%20%20V%20--%20%22%E9%AA%8C%E8%AF%81%E6%9C%89%E6%95%88%22%20--%3E%20C%5B%28%22skill%20%E5%BA%93%3Cbr%2F%3E%E5%8F%AA%E7%95%99%E9%AA%8C%E8%AF%81%E8%BF%87%E7%9A%84%22%29%5D%0A%20%20%20%20V%20--%20%22%E6%B2%A1%E7%94%A8%22%20--%3E%20R%5B%22%E4%B8%A2%E5%BC%83%EF%BC%8C%E6%88%96%E8%AE%A9%E8%80%81%E5%B8%88%E6%8C%87%E4%B8%AA%E6%96%B9%E5%90%91%22%5D%0A%20%20%20%20R%20--%3E%20B%0A%20%20%20%20C%20--%20%22%E4%B8%8B%E6%AC%A1%E5%8A%A0%E8%BD%BD%E8%BF%9B%20context%22%20--%3E%20A" style="width:100%;height:330px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">Restoring the missing "acceptance gate": only skills verified to be genuinely useful enter the library; useless ones are discarded, or the teacher points a new direction — that's the only loop that can truly get smarter with use.</figcaption>
</figure>

So, back to the original question — can an AI grow smarter on its own through use, like an intern? **Not yet.** It is learning, but it's revising its own work and grading itself, drifting further off with every iteration. There's a fact buried here that slogans tend to skip: **interns grow not because they're born knowing how to teach themselves, but because someone assigns them work, someone checks their output, and someone pulls them back when they go off track.** "The agent that grows with you" actually has it backwards — an agent that can grow needs someone to mentor it first. But this is far from the end of the story; if anything, it lays out exactly what it takes to build an agent that can genuinely develop real capabilities.

## 6. Don't wait for it to self-improve — raise one yourself

The good news is: you don't have to wait for the day an agent suddenly figures out how to teach itself. You can start building one that gets more useful with every use today — you just have to go about it the right way. The prescription from earlier, flipped to your perspective, boils down to a few practical steps:

- **Write a few good skills for it upfront — don't wait for it to figure things out on its own.** Human-written skills lift performance immediately. And don't overdo it — SkillsBench found that "2–3 focused modules beat a sprawling document that tries to cover everything." A smaller model with the right skills can even close the gap on a larger model without any.
- **Write each one as a specific pitfall and a specific fix**: spell out the mistakes you've run into and the workarounds you've found, rather than vague instructions like "please handle carefully."
- **Build in a validation gate.** Have it complete a task, then use a test, a stronger model, or yourself to judge whether it actually succeeded; only let skills that have been genuinely verified to work make it into the library.
- **When it gets stuck, be the mentor who points it in the right direction**, rather than just handing over the answer.

Looking a step further ahead, the potential is real: once every skill in the library has been validated, they can be **transferred** (Voyager took skills learned in one Minecraft world and applied them to solve problems in a completely new one) and **shared** (a team, or even an entire community, running on the same set of verified know-how) — that "living manual" can genuinely grow richer and more reliable with use.

At that point, "the agent that grows with you" would actually earn the name — not because it was born knowing how to self-improve, but because every piece of experience was signed off by a person, or a checkpoint, before it entered the library.

**At the end of the day, what you're building isn't a self-evolving genius — it's an apprentice that's willing to be taught, and actually has someone teaching it. The former doesn't exist yet; the latter is something you can start on today.**

## References & implementations

1. Zhong et al. **SkillLearnBench: Benchmarking Continual Learning Methods for Agent Skill Generation on Real-World Tasks.** 2026. [arXiv:2604.20087](https://arxiv.org/abs/2604.20087) · [Code](https://github.com/cxcscmu/SkillLearnBench)
2. **SkillsBench: The First Benchmark for Evaluating How Well AI Agents Use Skills.** 2026. [arXiv:2602.12670](https://arxiv.org/abs/2602.12670) · [Code](https://github.com/benchflow-ai/skillsbench)
3. **SkillLens.** Microsoft Research, 2026. [arXiv:2605.23899](https://arxiv.org/abs/2605.23899) · [Code](https://github.com/microsoft/SkillLens)
4. Wu et al. **StreamBench: Towards Benchmarking Continuous Improvement of Language Agents.** NeurIPS 2024. [arXiv:2406.08747](https://arxiv.org/abs/2406.08747) · [Code](https://github.com/stream-bench/stream-bench)
5. Wang et al. **Voyager: An Open-Ended Embodied Agent with Large Language Models.** 2023. [arXiv:2305.16291](https://arxiv.org/abs/2305.16291) · [Code](https://github.com/MineDojo/Voyager)
6. **Hermes Agent** — the subject of this article's investigation. [Code](https://github.com/NousResearch/hermes-agent)
