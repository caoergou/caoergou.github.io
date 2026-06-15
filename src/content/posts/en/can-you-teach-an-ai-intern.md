---
title: Can an AI Get Smarter on Its Own, the Way an Intern Does?
description: "Hermes Agent's pitch is 'the agent that grows with you' — an AI
  that gets smarter on its own, like an intern who learns. I took it literally:
  with the model frozen, can the agent make itself smarter just by writing its
  own skills? The answer is counter-intuitive — a human-written skill takes the
  same model from 10% to 74%, but the skill the agent writes itself closes less
  than half that gap."
author: Eric Cao
date: 2026-06-12
---

Hermes Agent ships under a line that's genuinely appealing: **the agent that grows with you** — an AI that gets better the more you use it, like a good intern who learns the ropes and stops needing to be told twice.

I kept staring at it, unconvinced. **With the model's weights frozen, can adding skills alone really bring an agent up like an intern, so it gets smarter over time?** That's a question you can actually check, so I went and checked. The answer turned out to be far more interesting than the slogan.

## 1. What is this "growing," exactly?

The "growing" Hermes means isn't retraining — it's in-context: after each task the agent writes what it learned into a **skill** (a `SKILL.md` file) and reloads it next time.

A background **curator** keeps skills by recency and usage. The model never changes; the only thing that grows is the pile of skills it leaves for its future self.

One thing here is worth pausing on: **nothing in this loop ever checks whether a skill actually made the results better.** A skill stays in the library because it was *used recently*, not because it *worked* — the agent only ever hoards; it never verifies.

That may not sound like a problem: pile up enough skills and surely the useful ones add up? But it quietly bets everything on one untested assumption — **that an agent gets smarter just by accumulating more skills.** Whether that assumption holds is exactly the question this piece sets out to answer.

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22agent%20does%20a%20task%22%5D%20--%3E%20B%5B%22writes%20a%20SKILL.md%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%28%22skill%20library%22%29%5D%0A%20%20%20%20C%20--%20%22loaded%20into%20context%20next%20time%22%20--%3E%20A%0A%20%20%20%20C%20--%3E%20D%5B%22curator%20keeps%20%2F%20drops%3Cbr%2F%3Eby%20recency%20%26%20usage%22%5D%0A%20%20%20%20D%20--%3E%20C%0A%20%20%20%20D%20-.-%3E%7C%22never%20checks%20if%20a%20skill%20helped%22%7C%20X%28%28%22no%20check%22%29%29" style="width:100%;height:300px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">The "learning loop": write a skill → store it → reload it next time. The curator keeps or drops skills by recency and usage — it never checks whether one actually helped.</figcaption>
</figure>

## 2. Pin the question to one real task

"Grows with you" is too vague. Make it scorable: with the model fixed, does a skill raise the success rate? One real task makes it concrete.

CMU's **[SkillLearnBench](https://arxiv.org/abs/2604.20087)** has a task called `organize-messy-files`. [The instruction](https://github.com/cxcscmu/SkillLearnBench/blob/main/tasks/organize-messy-files/organize-messy-files-1/instruction.md) drops 103 jumbled files on the model and asks it to sort them **by content** into five subject folders (LLMs, quantum computing, black holes, DNA, music history), **each file in exactly one folder, none left behind**. The pile looks like this:

```text
/root/papers/all/
├── 2402.11651v2.pdf
├── 2306.08568v2.pdf
├── 0704.0117v1.pdf
├── … (100 of them, every one named with an arxiv ID) …
├── 2506.14877v1.pdf
├── DAMOP.pptx          # a physics-conference deck, no arxiv ID
├── paper_file_1.docx   # a Word doc, no arxiv ID
└── paper_file_2.docx
```

Nothing fancy, but it's a perfect test of the grind *behind* the rules: you have to actually **open each file and read it**, and keep count so not one slips through.

First, picture the model **on its own, with no skill at all** — the benchmark's "no-skill" baseline. And to be clear about the setup: it isn't just emitting text here, it runs as a real agent — opening files one by one, judging the topic, moving each into a folder. But over 100-plus files it tends to come apart partway: some get filed without really being read, others get dropped mid-sort and it never notices. Left to itself, it does this task badly.

So what does the agent write when it turns this into a skill of its own? I pulled [the one it actually generated](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/b1-one-shot-claude-sonnet-4-6/organize-messy-files/arxiv-paper-lookup/SKILL.md) out of SkillLearnBench — and it had cooked up a **clever shortcut**: don't bother reading the contents, just pull the arxiv ID out of the filename, look the abstract up online, and classify from that — working code and all. It even states, with confidence: "**Titles are usually sufficient for classification.**"

Look at that file tree and the idea seems brilliant — a hundred filenames, every one an arxiv ID, so why not just look them up? But it **doesn't work**, and it fails precisely *because* of that cleverness — two fatal cuts:

1. The task is graded **offline** (the papers are pre-downloaded at build time, precisely so it can be sorted without a network) — so the arxiv endpoint it wants to call simply isn't reachable.
2. Even with a network, `DAMOP.pptx` and the two `.docx` files have no arxiv ID to pull.

It bet on a shortcut that *looked* smart and lost on the plain fact that the shortcut's whole premise doesn't survive the real environment — skipping the one thing that actually works: **open each file and read it** (the image even ships `pdftotext` and LibreOffice, waiting to be used).

The human-written skill takes the other road: no trick, just the grind laid out. Survey what's actually in the directory, classify by **content** (not filename), and bolt on a "[planning-with-files](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/human_authored/organize-messy-files/planning-with-files/SKILL.md)" method — keep a plan and a progress file, **log every single file**, so all 103 are accounted for, none doubled, none lost. Here's the whole flow:

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20TD%0A%20%20%20%20A%5B%22survey%20what%20is%20actually%20in%20the%20folder%22%5D%20--%3E%20B%5B%22for%20each%20file%3A%20open%20it%20and%20read%20the%20content%3Cbr%2F%3Enot%20the%20filename%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%22file%20it%20under%20one%20of%20the%205%20subjects%2C%20by%20content%22%5D%0A%20%20%20%20C%20--%3E%20D%5B%22log%20this%20file%20in%20a%20progress%20sheet%3Cbr%2F%3Eplanning-with-files%22%5D%0A%20%20%20%20D%20--%3E%20E%7B%22all%20103%20files%20done%3F%22%7D%0A%20%20%20%20E%20--%20%22not%20yet%22%20--%3E%20B%0A%20%20%20%20E%20--%20%22yes%22%20--%3E%20F%5B%22final%20check%3A%20every%20file%20filed%20exactly%20once%3Cbr%2F%3Enone%20lost%2C%20none%20doubled%22%5D" style="width:100%;height:430px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">The human skill's "slow way": read each file's content, log your progress, and check at the end that nothing was lost or doubled — slower, but every file lands somewhere, and it has a verification step built right in.</figcaption>
</figure>

One is a clever shortcut; the other is a plodding, reliable procedure. Follow the latter and the success rate climbs.

Don't read one example as the whole law, though. This is a single task and a single way to fall — on a different task, the skill the agent writes itself goes wrong in different clothes: here it was a slick shortcut; elsewhere it might mistake one task's answer for a general method, or quietly skip the step where it should have checked its work.

But under the variety sits one root: **it has no real way to judge whether the skill it just wrote is any good.** This time it grabbed the "smart"-looking option precisely because it can't tell "looks smart" from "actually gets the job done." A fluke of this one task? The next section looks at a far more general experiment.

Zoom that gap out to the whole benchmark and you get this — **the same model, weights untouched, only the skill changes**:

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20M%5B%22the%20same%20model%3Cbr%2F%3E%28weights%20untouched%29%22%5D%20--%3E%7C%22no%20skill%22%7C%20A%5B%2210%25%20solved%22%5D%0A%20%20%20%20M%20--%3E%7C%22skill%20the%20agent%20generates%20%28best%20method%29%22%7C%20B%5B%22~39%25%20solved%22%5D%0A%20%20%20%20M%20--%3E%7C%22skill%20a%20human%20wrote%22%7C%20C%5B%2274%25%20solved%22%5D" style="width:100%;height:340px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;"></iframe>

The story in one read: a good human-written skill takes the same model from **10%** to **74%**, so "a good skill makes it smarter" is plainly **true**.

But let the agent generate its own skill and, **across every method tried, the best any of them reaches is ~39%** — in the paper's own words, not even half the gap between "human-written" and "no skill" gets closed. And a telling detail: when the agent revises its skills on its *own* feedback, the score tends to drift *down*, not up — genuine improvement comes from an **external** signal, not from introspection.

On a second benchmark, **[SkillsBench](https://arxiv.org/abs/2602.12670)** (86 tasks, 84 evaluated), self-generated skills averaged 1.3 points *below* using no skill at all. The two benchmarks use different rulers (one asks "can the right skill make a hopeless task doable," the other "how well does the agent wield skills overall"), but they point the same way: **left to itself, the agent can't close the gap a human can.**

These numbers are worth a word on **how they're measured**, or they read like a number pulled from thin air. SkillLearnBench doesn't grab tasks at random: it deliberately picks ones where the bare model basically can't cope but a correct skill makes it doable (file-sorting is the prototype: the model can do it, but cuts corners and loses track) — only on tasks like that can you even measure whether a skill helped.

Each task also gets a human-written "ceiling skill" as the upper-bound reference, and grading runs on deterministic scripts, averaged over hundreds of instances. So 10% → 74% isn't a flattering cherry-pick — it's the real gap that shows up once you nail every variable down and leave only one thing free: which skill you hand it.

## 3. Why can't the agent write a good one?

Here's the most counter-intuitive part. Step back: surely we can let another AI act as judge, and pick the more useful of two skills?

Microsoft's **[SkillLens](https://github.com/microsoft/SkillLens)** measured it. **46.4%. Worse than a coin flip.** A model that can write code and run agents can't tell which of two lessons is the more useful one. It also found that reformatting a skill to look cleaner changes its effect by a statistically indistinguishable amount — **how good a skill looks and whether it works are two different things.**

That's why the agent can't write good skills: it can't tell whether its own output is any good — and "is it any good" is exactly the thing you can't read off the surface. That arxiv shortcut is the case in point: clever, code and all, looks efficient, and comes up empty the moment there's no network to phone. A judge that can't separate "looks smart" from "actually gets the job done" can't separate "a slick shortcut" from "a plodding-but-reliable procedure" either.

SkillLearnBench piles on: when it let the agent revise its own skills over several rounds, accuracy *fell* — with no outside signal, it just rephrases its own blind spots.

For contrast: **[Voyager](https://github.com/MineDojo/Voyager)** is a well-known 2023 agent that explores Minecraft on its own, banking what it learns into a growing skill library. The crucial difference: it commits a skill **only after a check confirms it actually completed the task.** That "verify before you keep" gate is exactly what the Hermes loop is missing.

Line the two up — and add where the papers point — and the difference is stark:

| | What it is | How it decides what to keep | Verification gate |
|---|---|---|---|
| **Hermes** | a general assistant agent that banks experience as `SKILL.md` files | by how recently a skill was used | ✗ never checks |
| **Voyager** | an agent exploring Minecraft on its own | keeps a skill only after self-verifying the task was done | ✓ yes |
| **The target** (where the papers point) | what the next loop should look like | keep only after an external signal / test / human signs off | ✓ required |

A level deeper: this isn't a quirk of the skill format, it's the bind every "edit-yourself" system is stuck in. **Without an error signal from outside, self-revision just amplifies your own judgment in place — and the spots you're most confident about are exactly the ones you can't see.** People don't improve by thinking it over a few more times; they improve because someone grades the paper and reality pushes back. Same for the agent.

## 4. So — does it actually grow with you?

Put it together and the answer is clear, and more interesting than a flat yes or no: **yes — but only as far as it can write, and correctly apply, a good skill, and right now it can do neither.** "A good skill makes the model smarter" is beyond doubt — the 10% → 74% jump is right there; the real bottleneck is that the agent can't produce a good one, and can't tell a good one from a bad one.

A dead end? Far from it — put these papers side by side and they sketch a recipe.

## 5. So how *do* you teach it? The papers hand you a recipe

They all point the same way: **the bottleneck was never the prose, it's correctness — you need something that vets a skill before it's kept.** The ingredients are concrete:

- **An external signal beats introspection.** SkillLearnBench is blunt: continual gains come "primarily through external feedback," while self-feedback "leads to drift rather than progress." Give it a teacher — even one that only points a direction without handing over the answer — and the score actually moves.
- **Verify before you keep.** Voyager grows precisely because a skill is committed to the library "only after self-verification confirms the task completion." StreamBench goes further: store only the examples the agent got *right*. Feeding back "here's what you got wrong" doesn't help, and sometimes drags the score *below* zero-shot. Telling it what worked beats telling it what didn't.
- **Write concrete failure→fix, not correct-sounding advice.** SkillLens puts it precisely: what works is "concrete failure mechanisms with executable remedies — not generic advice." They wrote a *meta*-skill — a skill that teaches the agent how to write skills — packing in "failure mechanisms / concrete do-this steps / a high-risk-action blacklist." That one addition took the §3 judge that scored worse than a coin flip (46.4%) up to 73.8%.
- **And the readiest fix is a human.** In SkillsBench, human-curated skills add 16.2 points on the spot — the 74% ceiling is reachable *today* with a human-written skill. The only part that fails is asking the agent to write it itself.

Put those four together and the negative result ("it can't write its own skills") turns into a blueprint for the next agent: a learning loop that's gated by verification, stocked with examples that actually worked, written in concrete failure→fix terms, and backstopped by a human (or a meta-skill) that supplies the judgment the model can't.

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22agent%20does%20a%20task%22%5D%20--%3E%20B%5B%22writes%20a%20skill%22%5D%0A%20%20%20%20B%20--%3E%20V%7B%22verify%3A%20did%20it%20actually%20help%3F%3Cbr%2F%3Etest%20%2F%20stronger%20model%20%2F%20human%22%7D%0A%20%20%20%20V%20--%20%22verified%22%20--%3E%20C%5B%28%22skill%20library%3Cbr%2F%3Eonly%20what%20is%20proven%22%29%5D%0A%20%20%20%20V%20--%20%22no%22%20--%3E%20R%5B%22drop%2C%20or%20let%20a%20teacher%20hint%22%5D%0A%20%20%20%20R%20--%3E%20B%0A%20%20%20%20C%20--%20%22loaded%20into%20context%20next%20time%22%20--%3E%20A" style="width:100%;height:330px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">Add the missing check: only skills verified to actually help get into the library; the rest are dropped, or a teacher points a direction. That's a loop that can genuinely improve.</figcaption>
</figure>

So, back to the question — can an AI get smarter on its own, like an intern? **Not yet.** It really is "learning," but it's grading its own homework and scoring itself, drifting further off with each pass. And here's the fact the slogan glides past: **an intern grows not because they're a born self-teacher, but because someone hands them work, someone vets it, and someone pulls them back when they drift.** "The agent that grows with you" has it backwards — an agent that *can* grow needs someone to grow with first. But that's far from the end of the story — just the opposite: it spells out, in detail, how to raise an agent that genuinely does grow.

## 6. Don't wait for it to self-improve — raise one yourself

That's the good news hiding in all of this: you don't have to wait for the day an agent learns to teach itself. **You can raise a steadily-better one today** — you just have to do it right. Flip that recipe from the builder's side to *yours*, and it's a handful of concrete moves:

- **Write it a few good skills yourself; don't wait for it to figure them out.** A human-written skill lifts the score right away — and don't overstuff it: SkillsBench found "2–3 focused modules beat comprehensive documentation," and a small model with the right skill can match a bigger one without.
- **Make every skill a concrete failure→fix.** Write down the exact traps you've hit and the exact way around them — not "please handle carefully," which is just correct-sounding noise.
- **Put a check in the loop.** Let it finish, then have a test, a stronger model, or you decide whether it actually worked; only let the verified-good ones settle into its skill library. Tell it what it got *right* more than you flag what it got wrong.
- **When it's stuck, be the mentor who points a direction** — not the one who hands over the answer.

Look one step further and the imaginative space opens up: once every skill in the library has been vetted, and can **transfer** (Voyager carried skills learned in one Minecraft world straight into a brand-new one and solved from scratch) and be **shared** (a whole team, even a community, drawing on one verified body of know-how), that "living handbook" really does get thicker and sharper with use.

*That's* when "the agent that grows with you" earns its name — not because the agent is a born autodidact, but because every lesson got a nod from someone, or some check, before it was kept.

**In the end, you're not raising a genius that improves itself. You're raising an apprentice that's willing to be taught — and that has someone to teach it. The first doesn't exist yet. The second, you can start today.**

## References & implementations

1. Zhong et al. **SkillLearnBench: Benchmarking Continual Learning Methods for Agent Skill Generation on Real-World Tasks.** 2026. [arXiv:2604.20087](https://arxiv.org/abs/2604.20087) · [code](https://github.com/cxcscmu/SkillLearnBench)
2. **SkillsBench: The First Benchmark for Evaluating How Well AI Agents Use Skills.** 2026. [arXiv:2602.12670](https://arxiv.org/abs/2602.12670) · [code](https://github.com/benchflow-ai/skillsbench)
3. **SkillLens.** Microsoft Research, 2026. [arXiv:2605.23899](https://arxiv.org/abs/2605.23899) · [code](https://github.com/microsoft/SkillLens)
4. Wu et al. **StreamBench: Towards Benchmarking Continuous Improvement of Language Agents.** NeurIPS 2024. [arXiv:2406.08747](https://arxiv.org/abs/2406.08747) · [code](https://github.com/stream-bench/stream-bench)
5. Wang et al. **Voyager: An Open-Ended Embodied Agent with Large Language Models.** 2023. [arXiv:2305.16291](https://arxiv.org/abs/2305.16291) · [code](https://github.com/MineDojo/Voyager)
6. **Hermes Agent** — the thing this post took literally. [code](https://github.com/NousResearch/hermes-agent)
