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

The "growing" Hermes means isn't retraining. It's in-context: after each task the agent writes what it learned into a **skill** (a `SKILL.md` file), reloads it next time, and a background "janitor" keeps skills by recency and usage. The model never changes. The only thing that grows is the pile of skills it leaves for its future self.

And here's what bothered me right away: nowhere does anything check whether a skill actually made it *better*. A skill survives because it was recently used, not because it worked. Put another way — **it keeps piling up experience, but it never sits an exam.**

## 2. Pin the question to one real task

"Grows with you" is too vague. Make it scorable: with the model fixed, does a skill raise the success rate? One real task makes it concrete.

CMU's **[SkillLearnBench](https://arxiv.org/abs/2604.20087)** has a task called `court-form-filling`. [The instruction](https://github.com/cxcscmu/SkillLearnBench/blob/main/tasks/court-form-filling/court-form-filling-1/instruction.md) hands you a plain-English case and asks you to fill a blank California small-claims form (the real SC-100 PDF) and save it. Verbatim:

> Fill the California Small Claims Court form at `/root/sc100-blank.pdf` based on the case description below … *Case Description: I am Joyce He … I want to sue Zhi Chen … He failed to return my security deposit of amount $1500 …*

<figure style="margin:1.6rem 0;text-align:center;">
  <img src="/sc100-blank.png" alt="California Small Claims form SC-100, blank first page" style="max-width:min(100%,460px);height:auto;border:1px solid #ddd;border-radius:6px;box-shadow:0 1px 8px rgba(0,0,0,.1);" loading="lazy" />
  <figcaption style="font-size:.85em;color:#888;margin-top:.5rem;">This is it — the real California SC-100 "Plaintiff's Claim" form (6 pages; this is page 1). The model has to place the case details accurately into these boxes.</figcaption>
</figure>

The model knows what goes in each field. It trips on the dullest part: a PDF form can be a proper fillable form *or* a flat scan, and the two need completely different code to fill. The model dives straight into writing code to stamp text on, and it lands on top of labels, in the wrong place, or nowhere — while the model thinks it's done.

The human-written skill ([forms.md](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/human_authored/court-form-filling/pdf/forms.md)) pins it down in its first line:

> **CRITICAL: You MUST complete these steps in order. Do not skip ahead to writing code.** … first check to see if the PDF has fillable form fields … The label and entry bounding boxes **MUST NOT INTERSECT** …

It doesn't answer the question for the model. It turns a vague "fill the form" into a discipline: **detect first, locate, verify before you write.** Read that skill and the success rate climbs. Ask the model to write its own, and you tend to get correct-sounding filler like "carefully read the document and extract the key fields."

Zoom that gap out to the whole benchmark and you get this — **the same model, weights untouched, only the skill changes**:

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20M%5B%22the%20same%20model%3Cbr%2F%3E%28weights%20untouched%29%22%5D%20--%3E%7C%22no%20skill%22%7C%20A%5B%2210%25%20solved%22%5D%0A%20%20%20%20M%20--%3E%7C%22skill%20the%20agent%20wrote%20itself%22%7C%20B%5B%22~39%25%20solved%22%5D%0A%20%20%20%20M%20--%3E%7C%22skill%20a%20human%20wrote%22%7C%20C%5B%2274%25%20solved%22%5D&look=classic" style="width:100%;height:340px;border:none;border-radius:8px;"></iframe>

The story in one read: a good human-written skill takes the same model from **10%** to **74%**, so "a good skill makes it smarter" is plainly **true**. But the skill the agent writes itself tops out around **~39%** — less than half the gap closed. On a second benchmark, **[SkillsBench](https://arxiv.org/abs/2602.12670)** (86 tasks, 84 evaluated, 7,308 trajectories), it's worse: self-generated skills averaged 1.3 points *below* using no skill at all.

## 3. Why can't the agent write a good one?

Here's the most counter-intuitive part. Step back: surely we can let another AI act as judge, and pick the more useful of two skills?

Microsoft's **[SkillLens](https://github.com/microsoft/SkillLens)** measured it. **46.4%. Worse than a coin flip.** A model that can write code and run agents can't tell which of two lessons is the more useful one. It also found that reformatting a skill to look cleaner changes its effect by a statistically indistinguishable amount — **how good a skill looks and whether it works are two different things.**

That's why the agent can't write good skills: it can't tell whether its own output is any good, so it produces plausible, generic advice that misses the task's real key steps. SkillLearnBench saw the same thing when it let the agent revise its own skills over several rounds — accuracy *fell*, because with no outside signal it just rephrases its own blind spots.

For contrast: **[Voyager](https://github.com/MineDojo/Voyager)**, the agent that builds its own skill library, commits a skill **only after a check confirms it actually completed the task.** That "verify before you keep" gate is exactly what the Hermes loop is missing.

## 4. So — does it actually grow with you?

Put it together and the answer is clear, and more interesting than a flat yes or no:

**Yes — but only as far as it can write, and correctly apply, a good skill. And right now it can't do either.** "A good skill makes the model smarter" is real; the 10% → 74% jump proves it. The bottleneck isn't whether skills help. It's whether the agent can produce a good one and then follow it.

The Hermes loop drops the one step that matters most: it never checks whether a skill actually worked. Good skills and plausible-but-useless ones are kept side by side, and the more pile up, the noisier the set gets.

Is that a dead end? Far from it. Put these papers side by side and they sketch a recipe.

## 5. So how *do* you teach it? The papers hand you a recipe

They all point the same way: **the bottleneck was never the prose, it's correctness — you need something that vets a skill before it's kept.** The ingredients are concrete:

- **An external signal beats introspection.** SkillLearnBench is blunt: continual gains come "primarily through external feedback," while self-feedback "leads to drift rather than progress." Give it a teacher — even one that only points a direction without handing over the answer — and the score actually moves.
- **Verify before you keep.** Voyager grows precisely because a skill is committed to the library "only after self-verification confirms the task completion." StreamBench goes further: store only the examples the agent got *right*. Feeding back "here's what you got wrong" doesn't help, and sometimes drags the score *below* zero-shot. Telling it what worked beats telling it what didn't.
- **Write concrete failure→fix, not correct-sounding advice.** SkillLens nails it: what matters is "concrete failure mechanisms with executable remedies — not generic advice." Turning "failure-mechanism / actionable specificity / a high-risk-action blacklist" into a meta-skill took that worse-than-a-coin-flip judge from 46.4% to 73.8%.
- **And the readiest fix is a human.** In SkillsBench, human-curated skills add 16.2 points on the spot — the 74% ceiling is reachable *today* with a human-written skill. The only part that fails is asking the agent to write it itself.

Put those four together and the negative result ("it can't write its own skills") turns into a blueprint for the next agent: a learning loop that's gated by verification, stocked with examples that actually worked, written in concrete failure→fix terms, and backstopped by a human (or a meta-skill) that supplies the judgment the model can't.

So, back to the question — can an AI get smarter on its own, like an intern? **Not yet: it's grading its own homework, and grading it worse than a coin flip.** But that's not the end of the story — just the opposite. It spells out, in detail, how to raise an agent that actually does grow.

## 6. Don't wait for it to self-improve — raise one yourself

That's the good news hiding in all of this: you don't have to wait for the day an agent learns to teach itself. **You can raise a steadily-better one today** — you just have to do it right. Flip that recipe around and it becomes a practical guide to bringing one up:

- **Write it a few good skills yourself; don't wait for it to figure them out.** Human-written skills add 16.2 points on the spot — and don't overstuff them: SkillsBench found "2–3 focused modules beat comprehensive documentation," and a small model with the right skill can match a bigger one without it.
- **Make every skill a concrete failure→fix.** Write down the exact traps you've hit and the exact way around them — not "please handle carefully," which is just correct-sounding noise.
- **Put a check in the loop.** Let it finish, then have a test, a stronger model, or you decide whether it actually worked; only let the verified-good ones settle into its skill library. Tell it what it got *right* more than you flag what it got wrong.
- **When it's stuck, be the mentor who points a direction** — not the one who hands over the answer.

Look one step further and the imaginative space opens up: once every skill in the library has been vetted, and can **transfer** (Voyager carried skills learned in one Minecraft world straight into a brand-new one and solved from scratch) and be **shared** (a whole team, even a community, drawing on one verified body of know-how), that "living handbook" really does get thicker and sharper with use. *That's* when "the agent that grows with you" earns its name — not because the agent is a born autodidact, but because every lesson got a nod from someone, or some check, before it was kept.

**In the end, you're not raising a genius that improves itself. You're raising an apprentice that's willing to be taught — and that has someone to teach it. The first doesn't exist yet. The second, you can start today.**

## References & implementations

1. Zhong et al. **SkillLearnBench: Benchmarking Continual Learning Methods for Agent Skill Generation on Real-World Tasks.** 2026. [arXiv:2604.20087](https://arxiv.org/abs/2604.20087) · [code](https://github.com/cxcscmu/SkillLearnBench)
2. **SkillsBench: The First Benchmark for Evaluating How Well AI Agents Use Skills.** 2026. [arXiv:2602.12670](https://arxiv.org/abs/2602.12670) · [code](https://github.com/benchflow-ai/skillsbench)
3. **SkillLens.** Microsoft Research, 2026. [arXiv:2605.23899](https://arxiv.org/abs/2605.23899) · [code](https://github.com/microsoft/SkillLens)
4. Wu et al. **StreamBench: Towards Benchmarking Continuous Improvement of Language Agents.** NeurIPS 2024. [arXiv:2406.08747](https://arxiv.org/abs/2406.08747) · [code](https://github.com/stream-bench/stream-bench)
5. Wang et al. **Voyager: An Open-Ended Embodied Agent with Large Language Models.** 2023. [arXiv:2305.16291](https://arxiv.org/abs/2305.16291) · [code](https://github.com/MineDojo/Voyager)
6. Yao et al. **τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains.** ICLR 2025. [arXiv:2406.12045](https://arxiv.org/abs/2406.12045) · [code](https://github.com/sierra-research/tau-bench)
7. **Hermes Agent** — the thing this post took literally. [code](https://github.com/NousResearch/hermes-agent)
