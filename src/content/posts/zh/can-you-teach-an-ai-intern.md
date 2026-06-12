---
title: "AI 能像实习生一样，自己越用越聪明吗？"
description: "Hermes Agent 主打「the agent that grows with you」——像个会自己成长的实习生。我较了真：模型一个权重都不动，全靠它自己攒 skill，真能越用越聪明吗？答案有点反直觉——一条人写的好 skill 能让同一个模型从 10% 做对率飙到 74%，但让它自己写一条，连一半差距都补不上。"
author: "Eric Cao"
date: "2026-06-12"
---

Hermes Agent 有一句很打动人的 slogan：**the agent that grows with you**——一个越用越聪明的 agent，像招了个好实习生，教一遍就上道，不用你说第二遍。

我盯着这句话犯嘀咕：这事是真的吗？**模型本身一个权重都不改，光靠往里加 skill，agent 真能像实习生那样被「带」出来、越用越聪明吗？** 这是个能验证的问题，于是我去翻了翻——结果发现，答案比 slogan 有意思得多。

## 一、先搞清楚：这个「成长」到底是什么

Hermes 说的「成长」不是重新训练。它走的是 in-context 那条路：每做完一个任务，agent 把这次学到的东西写成一条 **skill**（一个 `SKILL.md` 文件），下次任务再把它加载回上下文里；后台还有个「管理员」程序，按 skill 的新旧和使用频率，决定哪些留、哪些扔。模型本身没动，变的只是它给自己攒下的那一堆 skill。

这里我一眼就觉得不对劲：整条流程里，**没有任何一步，去检查「这条 skill 到底有没有让它做得更好」**。一条 skill 能活下来，靠的是「最近被翻出来用过」，而不是「它真的管用」。换句话说——**它在拼命攒经验，却从不参加考试。**

## 二、把问题摆到一个具体任务上

光说「越用越聪明」太虚。换个能打分的问法：**模型不变，给它一条 skill，做对率会涨吗？** 拿一个真实任务来看就清楚了。

CMU 的 **[SkillLearnBench](https://arxiv.org/abs/2604.20087)** 里有这么一道题，叫 `court-form-filling`。[题面原文](https://github.com/cxcscmu/SkillLearnBench/blob/main/tasks/court-form-filling/court-form-filling-1/instruction.md)给你一段大白话的案情，让你把一张空白的加州小额法庭表格（真实的 SC-100 PDF）填好、存到指定路径——节选：

> Fill the California Small Claims Court form at `/root/sc100-blank.pdf` based on the case description below … *Case Description: I am Joyce He … I want to sue Zhi Chen … He failed to return my security deposit of amount $1500 …*

<figure style="margin:1.6rem 0;text-align:center;">
  <img src="/sc100-blank.png" alt="加州小额法庭 SC-100 表格首页（空白）" style="max-width:min(100%,460px);height:auto;border:1px solid #ddd;border-radius:6px;box-shadow:0 1px 8px rgba(0,0,0,.1);" loading="lazy" />
  <figcaption style="font-size:.85em;color:#888;margin-top:.5rem;">就是这张——真实的加州 SC-100「小额法庭起诉状」（共 6 页，这是首页）。模型要做的，是把案情准确地填进这一个个框里。</figcaption>
</figure>

模型其实知道每个字该填什么。它栽在最不起眼的地方：一份 PDF 表单，可能是「带可填字段的标准表单」，也可能是「一张平铺的扫描件」，这两种得用**完全不同的**代码去填。模型一上来就闷头写代码往上糊，结果文字压在标签上、错位、或者干脆没填进去——它自己还以为填好了。

而那条人写的好 skill（[forms.md 原文](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/human_authored/court-form-filling/pdf/forms.md)），第一句就摁住了它（原文是英文）：

> **CRITICAL: You MUST complete these steps in order. Do not skip ahead to writing code.** … first check to see if the PDF has fillable form fields … The label and entry bounding boxes **MUST NOT INTERSECT** …

意思是：别急着写代码——先跑个脚本判断这张表是哪一类，再分头处理；往上放字时，「标签的框」和「填写的框」绝对不能重叠。它没替模型答题，而是把含糊的「把表填了」，拆成一条**「先检测、再定位、写之前先核对」**的纪律。模型照着做，做对率就上去了；让它自己总结一条，写出来的多半是「仔细阅读文档、提取关键字段」这种正确的废话。

把这个差距放大到整个基准，就是下面这张图——**同一个模型，权重一个没动，只换 skill**：

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20M%5B%22%E5%90%8C%E4%B8%80%E4%B8%AA%E6%A8%A1%E5%9E%8B%3Cbr%2F%3E%28%E6%9D%83%E9%87%8D%E5%AE%8C%E5%85%A8%E6%B2%A1%E5%8A%A8%29%22%5D%20--%3E%7C%22%E4%B8%8D%E7%BB%99%20skill%22%7C%20A%5B%2210%25%20%E5%81%9A%E5%AF%B9%22%5D%0A%20%20%20%20M%20--%3E%7C%22agent%20%E8%87%AA%E5%B7%B1%E5%86%99%E7%9A%84%20skill%22%7C%20B%5B%22~39%25%20%E5%81%9A%E5%AF%B9%22%5D%0A%20%20%20%20M%20--%3E%7C%22%E4%BA%BA%E5%86%99%E7%9A%84%20skill%22%7C%20C%5B%2274%25%20%E5%81%9A%E5%AF%B9%22%5D&look=classic" style="width:100%;height:340px;border:none;border-radius:8px;"></iframe>

一句话读懂它：人写的好 skill，把同一个模型从 **10%** 直接抬到 **74%**——所以「加一条好 skill 能让它更聪明」，**这件事本身是真的**。可让 agent 自己写一条，最好的方法也才到 **~39%**，连一半差距都没补上。换到另一个基准 **[SkillsBench](https://arxiv.org/abs/2602.12670)**（86 个任务、实测 84 个、7308 条运行轨迹），更扎心：模型自己生成的 skill，平均比「干脆不给」还低了 1.3 个点。

## 三、为什么 agent 自己写不好？

最反直觉的一点在这儿。退一步想：让另一个 AI 来当裁判，从两条 skill 里挑出更有用的那条，总该行吧？

微软的 **[SkillLens](https://github.com/microsoft/SkillLens)** 测了。**46.4%。比抛硬币还低。** 一个能写代码、能跑 agent 的模型，连「这两条经验哪条更管用」都判断不了。它还顺手发现：把一条 skill 的排版改得再漂亮、再规整，效果在统计上没有任何区别——**好不好看，和有没有用，根本是两码事。**

这就解释了 agent 为什么写不出好 skill：它分不清自己写的东西到底有没有用，于是只能产出一堆「看着挺对」的通用建议，抓不住任务真正的关键步骤。SkillLearnBench 还发现，让它自己反复复盘去改 skill，几轮下来准确率不升反降——没有外部信号，它只是在自己的盲区上反复打磨措辞。

作个对照：**[Voyager](https://github.com/MineDojo/Voyager)** 那套会自己攒技能库的 agent，它的每条技能，**只有被验证过「确实把任务做成了」才会入库**。这道「先验证、再保留」的关卡，恰恰是 Hermes 那套闭环没有的。

## 四、那么——它真能「grows with you」吗？

把上面拼起来，答案清楚了，而且比一句「行」或「不行」更有意思：

**能，但仅限于它能写出、并且用对一条好 skill 的那个程度——而眼下，它写不出，也分不清。** 「加一条好 skill 让模型更聪明」是真的（10% → 74% 就是铁证）；卡点不在 skill 有没有用，而在 agent 能不能自己产出一条好的、再正确地照着做。

而 Hermes 那套闭环，恰恰漏掉了最关键的一环：**它从不验收一条 skill 到底有没有用。** 好 skill 和滥竽充数的，统统留着，攒得越多，噪声越大。

那是不是就没救了？恰恰相反——这串论文摆在一起，其实凑出了一张药方。

## 五、那要怎么才教得会？——论文其实给了配方

它们指向同一件事：**问题从来不在文笔，在「正确性」——得有个东西，在一条 skill 进库之前替它把关。** 几味药都挺具体：

- **要外部信号，不能自己跟自己复盘。** SkillLearnBench 说得直白：持续的进步「主要来自外部反馈，自我反馈再迭代也只会漂移、不会进步」。给它配个「老师」——哪怕只指方向、不给答案——成绩才真往上走。
- **进库前先验证。** Voyager 之所以能越攒越强，是因为一条技能「只有自验证确认任务完成，才会被提交进库」。StreamBench 更进一步：只存「答对过」的例子；而把「你哪里错了」喂回去，不但没用，有时还**把成绩拖到比零样本还低**——告诉它做对了什么，远比告诉它做错了什么有用。
- **写「具体的坑 + 具体的解」，别写正确的废话。** SkillLens 一句戳破：真正起作用的，是「具体的失效机制配上可执行的补救，而不是泛泛的建议」。他们把「失效机制 / 可操作的具体性 / 高危动作黑名单」做成一条「元 skill」塞进生成提示，就把那个连抛硬币都不如的裁判，准确率从 46.4% 拉到了 73.8%。
- **而最现成的解，是人。** SkillsBench 里人工精修的 skill 当场把成绩抬高 16.2 个点——74% 那个上限，**今天用人写的 skill 就够得着**；够不着的，只是「让 agent 自己写」这一条路。

把这四味药连起来，那个「自己写不行」的否定结论，其实是一张**写给下一代 agent 的设计图**：一个带验证关卡、装着「答对过」的例子、写满具体失效机制、再有人（或一条元 skill）兜底把关的学习闭环。

所以回到最初那个问题——AI 能像实习生一样，自己越用越聪明吗？**目前不能：它在改自己的作业，还改得比抛硬币更差。** 但这绝不是终点——恰恰相反，它把「该怎么养出一个真会成长的 agent」这件事，讲得清清楚楚。

## 六、与其等它自我进化，不如自己养一个

这其实是个好消息：你不用等哪天 agent 突然开窍、学会自学，**今天就能动手养一个越用越顺的**——只是方法得对。把上面那张药方倒过来用，就是一套很实在的「带 agent」手册：

- **先替它写几条好 skill，别干等它自己悟。** 人写的 skill 当场 +16.2 个点；而且别贪多——SkillsBench 发现「2～3 个聚焦的模块，胜过一大本面面俱到的文档」，甚至小模型配上对的 skill，就能追平不带 skill 的大模型。
- **每条 skill 都写「具体的坑 + 具体的解」**：把你自己踩过的雷、绕过的弯，一条条写清楚，而不是「请仔细处理」这种正确的废话。
- **给它装一道验收关。** 让它把活干完，用一个测试、一个更强的模型、或者你自己，判一下到底成没成；只把**验证过确实有效**的，沉进它的 skill 库。多告诉它「这次做对了什么」，少揪着「做错了什么」。
- **在它卡壳时，当那个递方向的师傅**，而不是直接把答案塞给它。

再往前想一步，这里的想象空间其实很大：当 skill 库里的每一条都被验过、还能**迁移**（Voyager 能把在一个世界里学到的技能，搬到一个全新的世界里从零解题）、能**共享**（一整个团队、乃至一个社区，共用同一套被验证过的 know-how），那本「活手册」才会真的越用越厚、越用越准。到那一步，「the agent that grows with you」才算名副其实——不是因为它天生会自学，而是因为每一条经验在进库之前，都真有人（或一道检验）替它点过头。

**说到底，你要养的不是一个会自我进化的天才，而是一个肯被带、且有人带的学徒。前者还不存在；后者，今天就能上手。**

## 参考文献与实现

1. Zhong et al. **SkillLearnBench: Benchmarking Continual Learning Methods for Agent Skill Generation on Real-World Tasks.** 2026. [arXiv:2604.20087](https://arxiv.org/abs/2604.20087) · [代码](https://github.com/cxcscmu/SkillLearnBench)
2. **SkillsBench: The First Benchmark for Evaluating How Well AI Agents Use Skills.** 2026. [arXiv:2602.12670](https://arxiv.org/abs/2602.12670) · [代码](https://github.com/benchflow-ai/skillsbench)
3. **SkillLens.** Microsoft Research, 2026. [arXiv:2605.23899](https://arxiv.org/abs/2605.23899) · [代码](https://github.com/microsoft/SkillLens)
4. Wu et al. **StreamBench: Towards Benchmarking Continuous Improvement of Language Agents.** NeurIPS 2024. [arXiv:2406.08747](https://arxiv.org/abs/2406.08747) · [代码](https://github.com/stream-bench/stream-bench)
5. Wang et al. **Voyager: An Open-Ended Embodied Agent with Large Language Models.** 2023. [arXiv:2305.16291](https://arxiv.org/abs/2305.16291) · [代码](https://github.com/MineDojo/Voyager)
6. Yao et al. **τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains.** ICLR 2025. [arXiv:2406.12045](https://arxiv.org/abs/2406.12045) · [代码](https://github.com/sierra-research/tau-bench)
7. **Hermes Agent** —— 本文较真的那个对象。[代码](https://github.com/NousResearch/hermes-agent)
