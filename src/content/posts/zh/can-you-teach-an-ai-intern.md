---
title: "AI 能像实习生一样，自己越用越聪明吗？"
description: "Hermes Agent 主打「the agent that grows with you」——像个会自己成长的实习生。我把这句话当真了：模型一个权重都不动，全靠它自己攒 skill，真能越用越聪明吗？答案有点反直觉——一条人写的好 skill 能让同一个模型从 10% 的做对率涨到 74%，但让它自己写一条，连一半差距都补不上。"
author: "Eric Cao"
date: "2026-06-12"
---

Hermes Agent 有一句很打动人的 slogan：**the agent that grows with you**——一个越用越聪明的 agent，像招了个好实习生，教一遍就上道，不用你说第二遍。

可我有点不信：**模型本身一个权重都不改，光靠往里加 skill，agent 真能像实习生那样被「带」出来、越用越聪明吗？** 这是个能验证的问题，我就去翻了翻——结果发现，答案比 slogan 有意思得多。

## 一、先搞清楚：这个「成长」到底是什么

Hermes 说的「成长」不是重新训练，走的是 in-context 那条路：每做完一个任务，agent 把这次学到的东西写成一条 **skill**（一个 `SKILL.md` 文件），下次任务再把它加载回上下文里。

后台还有个「管理员」程序，按 skill 的新旧和使用频率，决定哪些留、哪些扔。模型本身一直没动，变的只是它给自己攒下的那一堆 skill。

这套机制里，有一个地方值得停一下：**它从头到尾，没有任何一步去确认「这条 skill 到底有没有让结果变好」**。一条 skill 能留在库里，凭的是「最近被用到过」，而不是「它真的有用」——它只管攒，不管验。

这乍看未必是问题：攒得多，能用的不就多了吗？但它其实把一切都押在了一个没人验证过的假设上——**只要不停地攒 skill，agent 就会越来越强**。这个假设到底成不成立，正是这篇文章要回答的问题。

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22agent%20%E5%81%9A%E4%BB%BB%E5%8A%A1%22%5D%20--%3E%20B%5B%22%E5%86%99%E4%B8%80%E6%9D%A1%20SKILL.md%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%28%22skill%20%E5%BA%93%22%29%5D%0A%20%20%20%20C%20--%20%22%E4%B8%8B%E6%AC%A1%E5%8A%A0%E8%BD%BD%E8%BF%9B%20context%22%20--%3E%20A%0A%20%20%20%20C%20--%3E%20D%5B%22curator%20%E6%8C%89%E6%96%B0%E8%BF%91%20%2F%20%E4%BD%BF%E7%94%A8%3Cbr%2F%3E%E5%86%B3%E5%AE%9A%E5%8E%BB%E7%95%99%22%5D%0A%20%20%20%20D%20--%3E%20C%0A%20%20%20%20D%20-.-%3E%7C%22%E4%BB%8E%E4%B8%8D%E6%A3%80%E6%9F%A5%20skill%20%E5%88%B0%E5%BA%95%E6%9C%89%E6%B2%A1%E6%9C%89%E7%94%A8%22%7C%20X%28%28%22%E6%B2%A1%E6%9C%89%E9%AA%8C%E6%94%B6%22%29%29" style="width:100%;height:300px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">这套「学习闭环」：写 skill → 存库 → 下次读回来；而那个 curator 只按「新近 / 使用」决定去留，从不验收 skill 到底有没有用。</figcaption>
</figure>

## 二、把问题摆到一个具体任务上

光说「越用越聪明」太虚。换个能打分的问法：**模型不变，给它一条 skill，做对率会涨吗？** 拿一件谁都干过的杂活来看就清楚了。

CMU 的 **[SkillLearnBench](https://arxiv.org/abs/2604.20087)** 里有这么一道题，叫 `organize-messy-files`：[题面原文](https://github.com/cxcscmu/SkillLearnBench/blob/main/tasks/organize-messy-files/organize-messy-files-1/instruction.md)把 103 个混在一起的文件丢给模型，要它按**内容**归进五个主题文件夹（大语言模型、量子计算、黑洞、DNA、音乐史），**不重不漏、一个不许落**。这堆文件长这样：

```text
/root/papers/all/
├── 2402.11651v2.pdf
├── 2306.08568v2.pdf
├── 0704.0117v1.pdf
├── …（共 100 个，清一色 arxiv 编号命名的 PDF）…
├── 2506.14877v1.pdf
├── DAMOP.pptx          # 物理会议幻灯，没有 arxiv 编号
├── paper_file_1.docx   # Word 文档，没有 arxiv 编号
└── paper_file_2.docx
```

活儿不高深，却最能照出那种「死脑筋的笨功夫」：你得把每个文件**真打开、读内容**，还得记账记到一个不丢。

先看它**光杆上阵、不配任何 skill** 时是什么样——这就是基准里的「不给 skill」一档。要说清楚一点：模型在这道题里不是只吐一段文字，而是真当一回 agent，自己一个个打开文件、判断主题、再搬进对应的文件夹。可 100 多个一长串干下来，它很容易半道就乱：有的没细看就归错了类，有的搬着搬着漏了几个、自己也没数。光靠它自己，这题做得很差。

那么，让 agent 把这次的经验写成一条 skill，它会写出什么？我把 SkillLearnBench 里 [agent 真实生成的那条](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/b1-one-shot-claude-sonnet-4-6/organize-messy-files/arxiv-paper-lookup/SKILL.md) 拉了出来——它给自己想了个**挺聪明的捷径**：别费劲读正文了，从文件名里的 arxiv 编号去查在线摘要、照摘要分类就行，还附了一段能跑的代码。它甚至自信地写下：「**光看标题，通常就够拿来分类了。**」

盯着上面那棵文件树，你会觉得这主意真聪明——一百个文件名清一色 arxiv 编号，可不就该顺着编号去查？可它**没用**，而且恰恰栽在这份「聪明」上，两刀致命：

1. 这道题是**断网**跑的（题目特意提前把论文下好，就为了让它能离线分类）——它要查的那个 arxiv 在线接口，**根本连不上**；
2. 就算能联网，`DAMOP.pptx` 和两个 `.docx` 压根没有 arxiv 编号可抠。

它赌「看着聪明的捷径」，却赌输在「这捷径的前提，在真实环境里根本不成立」——绕开了唯一真正稳的那件事：把每个文件**打开、读内容**（环境里 `pdftotext`、LibreOffice 都给装好了，就等它去读）。

而人写的那条好 skill，走的是另一条路：不投机，把笨功夫摊开。它先摸清目录里有什么，**按内容**（而不是文件名）一件件归类，再配一套「[planning-with-files](https://github.com/cxcscmu/SkillLearnBench/blob/main/skills/human_authored/organize-messy-files/planning-with-files/SKILL.md)」的方法——建计划、记进度、逐个文件登记，确保 103 个一个不落、也不重。整套流程是这样的：

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20TD%0A%20%20%20%20A%5B%22%E5%85%88%E6%91%B8%E6%B8%85%E7%9B%AE%E5%BD%95%E9%87%8C%E9%83%BD%E6%9C%89%E4%BB%80%E4%B9%88%22%5D%20--%3E%20B%5B%22%E9%80%90%E4%B8%AA%E6%96%87%E4%BB%B6%EF%BC%9A%E6%89%93%E5%BC%80%E3%80%81%E8%AF%BB%E5%86%85%E5%AE%B9%3Cbr%2F%3E%E8%80%8C%E4%B8%8D%E6%98%AF%E7%9C%8B%E6%96%87%E4%BB%B6%E5%90%8D%22%5D%0A%20%20%20%20B%20--%3E%20C%5B%22%E6%8C%89%E5%86%85%E5%AE%B9%E5%BD%92%E8%BF%9B%205%20%E4%B8%AA%E4%B8%BB%E9%A2%98%E4%B9%8B%E4%B8%80%22%5D%0A%20%20%20%20C%20--%3E%20D%5B%22%E5%9C%A8%E8%BF%9B%E5%BA%A6%E8%A1%A8%E4%B8%8A%E7%99%BB%E8%AE%B0%E8%BF%99%E4%B8%80%E4%B8%AA%3Cbr%2F%3Eplanning-with-files%22%5D%0A%20%20%20%20D%20--%3E%20E%7B%22103%20%E4%B8%AA%E9%83%BD%E5%BD%92%E5%AE%8C%E4%BA%86%E5%90%97%EF%BC%9F%22%7D%0A%20%20%20%20E%20--%20%E8%BF%98%E6%B2%A1%20--%3E%20B%0A%20%20%20%20E%20--%20%E5%AE%8C%E6%88%90%20--%3E%20F%5B%22%E6%9C%80%E5%90%8E%E5%86%8D%E6%A0%B8%E4%B8%80%E9%81%8D%EF%BC%9A%3Cbr%2F%3E%E6%AF%8F%E4%B8%AA%E6%96%87%E4%BB%B6%E6%81%B0%E5%A5%BD%E5%BD%92%E4%B8%80%E6%AC%A1%EF%BC%8C%E4%B8%8D%E6%BC%8F%E4%B8%8D%E9%87%8D%22%5D" style="width:100%;height:430px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">人写 skill 的「笨办法」：逐个读内容、登记进度，最后再核一遍没漏没重——慢，但每个文件都落到实处，也自带一道验收关。</figcaption>
</figure>

一边是抖机灵的捷径，一边是笨而稳的章法。模型照着后者做，做对率就上去了。

先别急着把这一例上升成铁律。这不过是一道题、一种摔法——换个任务，agent 自写的 skill 会换着花样出毛病：这回是抖了个聪明捷径，下次没准是把某道题的现成答案当成通用方法，或在该核对的地方图省事跳过去。

可这些花样底下是同一个根子：**它压根没法判断自己写出来的这条 skill 到底好不好、顶不顶用。** 这一次它挑了那条更「聪明」的，恰恰因为它分不清「显得聪明」和「真能把活干成」。那这会不会只是这一道题的偶然？下一节，换个更普遍的实验来看。

把这个差距放大到整个基准，就是下面这张图——**同一个模型，权重一个没动，只换 skill**：

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20M%5B%22%E5%90%8C%E4%B8%80%E4%B8%AA%E6%A8%A1%E5%9E%8B%3Cbr%2F%3E%28%E6%9D%83%E9%87%8D%E5%AE%8C%E5%85%A8%E6%B2%A1%E5%8A%A8%29%22%5D%20--%3E%7C%22%E4%B8%8D%E7%BB%99%20skill%22%7C%20A%5B%2210%25%20%E5%81%9A%E5%AF%B9%22%5D%0A%20%20%20%20M%20--%3E%7C%22agent%20%E8%87%AA%E5%B7%B1%E7%94%9F%E6%88%90%EF%BC%88%E6%9C%80%E5%A5%BD%E4%B8%80%E6%A1%A3%EF%BC%89%22%7C%20B%5B%22~39%25%20%E5%81%9A%E5%AF%B9%22%5D%0A%20%20%20%20M%20--%3E%7C%22%E4%BA%BA%E5%86%99%E7%9A%84%20skill%22%7C%20C%5B%2274%25%20%E5%81%9A%E5%AF%B9%22%5D" style="width:100%;height:340px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;"></iframe>

一句话读懂它：人写的好 skill，把同一个模型从 **10%** 抬到 **74%**——所以「加一条好 skill 能让它更聪明」，这件事本身是真的。

可换成让 agent 自己生成 skill，**试遍各种方法，最好的一档也才到 ~39%**（论文原话：连「人写」与「不给」之间那道鸿沟的一半都没填上）。还有个耐人寻味的细节：让它拿自己的复盘去反复改 skill，往往不升反降、原地打转——真正能往上走的，靠的是**外部**反馈，不是自我反省。

换到另一个基准 **[SkillsBench](https://arxiv.org/abs/2602.12670)**（86 个任务、实测 84 个），自己生成的 skill 平均还比「干脆不给」低了 1.3 个点。两个基准的尺子并不一样（一个量「有对的 skill 能不能把任务做成」，一个量「agent 用 skill 的整体水平」），但都指向同一句话：**靠它自己，补不上人写的那段差距。**

这几个数字值得多说一句**它们是怎么测出来的**，否则容易被当成随口一报。SkillLearnBench 不是随便抓任务来跑：它专挑那种「裸模型基本做不动、但只要有一份对的 skill 就能做成」的任务（整理文件正是典型：模型干得动，却容易丢三落四、想当然）——只有在这种任务上，「skill 到底帮没帮上忙」才量得出来。

再给每道题配一份人写的「天花板 skill」当上限参照，最后用确定性的脚本逐条判分、在上百个实例上取平均。所以 10% → 74% 不是挑出来的漂亮个例，而是把变量死死摁住、只留「换哪份 skill」这一个差别之后，反复测出来的真实落差。

## 三、为什么 agent 自己写不好？

真正反直觉的地方还在后头。退一步想：换一个 AI 来当裁判，光是从两条现成的 skill 里挑出更有用的那条，总该会了吧？

微软的 **[SkillLens](https://github.com/microsoft/SkillLens)** 测了。**46.4%。比抛硬币还低。** 一个能写代码、能跑 agent 的模型，连「这两条经验哪条更管用」都判断不了。它还顺手发现：把一条 skill 的排版改得再漂亮、再规整，效果在统计上没有任何区别——**好不好看，和有没有用，根本是两码事。**

这就解释了 agent 为什么写不出好 skill：它分不清自己写的东西到底有没有用——而「有没有用」恰恰最不能看表面。前面那条 arxiv 捷径就是现成的反面教材：机灵、有代码、看着高效，一到断网的真实环境却一个都查不成。一个连「显得聪明」和「真把活干成」都分不开的裁判，自然也分不清「一条抖机灵的捷径」和「一条笨而可靠的章法」。

SkillLearnBench 还补了一刀：让它拿自己的复盘反复去改 skill，几轮下来准确率不升反降——没有外部信号，它只是在自己的盲区上反复打磨措辞。

作个对照：**[Voyager](https://github.com/MineDojo/Voyager)** 是 2023 年一个很有名的 agent，它在 Minecraft 里自己探索、把学会的本事一点点攒成一个技能库。关键的差别在于：它的每条技能，**只有被验证过「确实把任务做成了」才会入库**。这道「先验证、再保留」的关卡，恰恰是 Hermes 那套闭环没有的。

把这两套放进一张表，再补上论文指向的方向，差别就一目了然：

| | 这是什么 | 怎么决定一条 skill 留不留 | 验收关 |
|---|---|---|---|
| **Hermes** | 通用助理 agent，把经验写成 `SKILL.md` 攒起来 | 看「最近用没用过」 | ✗ 从不验收 |
| **Voyager** | 在 Minecraft 里自己探索的 agent | 自验证「任务确实做成」才入库 | ✓ 有 |
| **理想的闭环**（论文指向的） | 下一代该长的样子 | 经外部信号 / 测试 / 人 把关后才留 | ✓ 必须有 |

往深里说一层，这不是 skill 这个形式的偶然毛病，而是所有「自己改自己」的系统都逃不掉的死结：**少了一个来自外部的对错信号，自我修订就只是在原地放大自己的判断——你越自信的地方，往往正是你越看不见的盲区。** 人能进步，靠的从不只是「多想几遍」，而是有人改你的卷子、有现实给你反馈；agent 也一样。

## 四、那么——它真能「grows with you」吗？

把上面拼起来，答案清楚了，而且比一句「行」或「不行」更有意思：**能，但只到「它能自己写出、并且用对一条好 skill」的那个程度——而眼下，它两样都做不到。** 「加一条好 skill 让模型更聪明」千真万确（10% → 74% 摆在那儿）；真正的卡点，是 agent 自己产不出那条好的，也分不清哪条好。

那是不是就没救了？恰恰相反——把这几篇论文摆到一起，它们其实凑出了一张药方。

## 五、那要怎么才教得会？——论文其实给了配方

它们指向同一件事：**问题从来不在文笔，在「正确性」——得有个东西，在一条 skill 进库之前替它把关。** 具体怎么做，几篇论文凑得相当齐：

- **别让它自己跟自己复盘，要给外部信号。** 这是 SkillLearnBench 最硬的一条发现：真正持续的进步「主要来自外部反馈，而光靠自我反馈再迭代，只会漂移、不会进步」。给它配个「老师」——哪怕只指方向、不递答案——成绩才真往上走。
- **进库前先验证。** Voyager 能越攒越强，是因为一条技能「只有自验证确认任务真做成了，才会被收进库」。StreamBench 还补了一刀：只存「做对过」的例子最有用；而把「你哪儿错了」喂回去，常常没用、有时反而把成绩拖到比零样本还低——**告诉它哪里做对了，比揪着哪里做错了管用得多。**
- **写「具体的坑 + 具体的解」，别写正确的废话。** SkillLens 说得很准：真正起作用的，是「具体的失效机制配上能照做的补救，而不是泛泛的建议」。他们专门写了一条「教 agent 怎么写 skill 的 skill」（meta-skill），把「失效机制 / 能照做的具体步骤 / 高危动作黑名单」塞进去——就靠这一条，把第三节那个连抛硬币都不如（46.4%）的裁判，准确率拉到了 73.8%。
- **而最现成的那味药，其实是人。** SkillsBench 里，人工精修的 skill 当场就把成绩抬高 16.2 个点——前面那个 74% 的上限，今天用人写的 skill 就够得着；够不着的，只是「让 agent 自己写」这一条死路。

把这四条连起来，那个「自己写不行」的否定结论，其实是一张**写给下一代 agent 的设计图**：一个带验证关卡、只装「做对过」的例子、写满具体失效机制、再有人（或一条 meta-skill）兜底把关的学习闭环。

<figure style="margin:1.6rem 0;">
  <iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5B%22agent%20%E5%81%9A%E4%BB%BB%E5%8A%A1%22%5D%20--%3E%20B%5B%22%E5%86%99%E4%B8%80%E6%9D%A1%20skill%22%5D%0A%20%20%20%20B%20--%3E%20V%7B%22%E9%AA%8C%E6%94%B6%EF%BC%9A%E7%9C%9F%E7%9A%84%E6%9C%89%E7%94%A8%E5%90%97%EF%BC%9F%3Cbr%2F%3E%E6%B5%8B%E8%AF%95%20%2F%20%E6%9B%B4%E5%BC%BA%E7%9A%84%E6%A8%A1%E5%9E%8B%20%2F%20%E4%BA%BA%22%7D%0A%20%20%20%20V%20--%20%22%E9%AA%8C%E8%AF%81%E6%9C%89%E6%95%88%22%20--%3E%20C%5B%28%22skill%20%E5%BA%93%3Cbr%2F%3E%E5%8F%AA%E7%95%99%E9%AA%8C%E8%AF%81%E8%BF%87%E7%9A%84%22%29%5D%0A%20%20%20%20V%20--%20%22%E6%B2%A1%E7%94%A8%22%20--%3E%20R%5B%22%E4%B8%A2%E5%BC%83%EF%BC%8C%E6%88%96%E8%AE%A9%E8%80%81%E5%B8%88%E6%8C%87%E4%B8%AA%E6%96%B9%E5%90%91%22%5D%0A%20%20%20%20R%20--%3E%20B%0A%20%20%20%20C%20--%20%22%E4%B8%8B%E6%AC%A1%E5%8A%A0%E8%BD%BD%E8%BF%9B%20context%22%20--%3E%20A" style="width:100%;height:330px;border:none;border-radius:10px;background:#ffffff;padding:10px 6px;" loading="lazy"></iframe>
  <figcaption style="font-size:.85em;color:#888;text-align:center;margin-top:.4rem;">补回那道缺失的「验收关」：只让验证过确实有用的 skill 进库，没用的丢弃、或让老师指个方向——这才是能真正「越用越聪明」的闭环。</figcaption>
</figure>

所以回到最初那个问题——AI 能像实习生一样，自己越用越聪明吗？**目前不能。** 它确实在「学」，可它在改自己的作业、又自己给自己打分，越改越偏。这里藏着一个常被 slogan 跳过的事实：**实习生会成长，从来不是因为他天生会自学，而是因为有人派活、有人把关、有人在他跑偏时拉一把。** 「the agent that grows with you」其实说反了——能成长的 agent，得先有个「带它的人」。但这远不是终点，恰恰相反：它把「该怎么养出一个真会长本事的 agent」讲得明明白白。

## 六、与其等它自我进化，不如自己养一个

好消息是：你不用干等哪天 agent 突然开窍、学会自学，今天就能动手养一个越用越顺手的——只是方法得对。前面那张药方，换到「你」的视角倒过来用，其实就是几条很实在的做法：

- **先替它写几条好 skill，别干等它自己悟。** 人写的当场就把成绩抬上去；而且别贪多——SkillsBench 发现「2～3 个聚焦的模块，胜过一大本面面俱到的文档」，小模型配上对的 skill，甚至能追平不带 skill 的大模型。
- **每条都写「具体的坑 + 具体的解」**：把你自己踩过的雷、绕过的弯，一条条写明白，而不是「请仔细处理」这种正确的废话。
- **给它装一道验收关。** 让它把活干完，用一个测试、一个更强的模型、或者你自己，判一下到底成没成；只把真验证过有效的，沉进它的 skill 库。
- **它卡壳的时候，当那个递方向的师傅**，而不是直接把答案塞过去。

再往前看一步，想象空间其实不小：等 skill 库里每一条都被验过，还能**迁移**（Voyager 就把在一个 Minecraft 世界里学到的技能，搬进全新的世界从零解题）、能**共享**（一个团队、乃至一整个社区，共用同一套验证过的 know-how），那本「活手册」才会真的越用越厚实、越用越靠谱。

到那一步，「the agent that grows with you」才算名副其实——不是因为它天生会自学，而是因为每一条经验进库之前，都真有人、或一道检验，替它点过头。

**说到底，你要养的不是一个会自我进化的天才，而是一个肯被带、也有人带的学徒。前者还不存在；后者，今天就能上手。**

## 参考文献与实现

1. Zhong et al. **SkillLearnBench: Benchmarking Continual Learning Methods for Agent Skill Generation on Real-World Tasks.** 2026. [arXiv:2604.20087](https://arxiv.org/abs/2604.20087) · [代码](https://github.com/cxcscmu/SkillLearnBench)
2. **SkillsBench: The First Benchmark for Evaluating How Well AI Agents Use Skills.** 2026. [arXiv:2602.12670](https://arxiv.org/abs/2602.12670) · [代码](https://github.com/benchflow-ai/skillsbench)
3. **SkillLens.** Microsoft Research, 2026. [arXiv:2605.23899](https://arxiv.org/abs/2605.23899) · [代码](https://github.com/microsoft/SkillLens)
4. Wu et al. **StreamBench: Towards Benchmarking Continuous Improvement of Language Agents.** NeurIPS 2024. [arXiv:2406.08747](https://arxiv.org/abs/2406.08747) · [代码](https://github.com/stream-bench/stream-bench)
5. Wang et al. **Voyager: An Open-Ended Embodied Agent with Large Language Models.** 2023. [arXiv:2305.16291](https://arxiv.org/abs/2305.16291) · [代码](https://github.com/MineDojo/Voyager)
6. **Hermes Agent** —— 本文要验证的就是它。[代码](https://github.com/NousResearch/hermes-agent)
