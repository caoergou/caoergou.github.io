---
title: "Mermaid 怎么画图？12 种图表类型的语法速查与实战指南"
description: "用纯文本画图，是工程师最该掌握的一项效率技能。这篇指南把 Mermaid 的 12 种常用图表——流程图、时序图、类图、甘特图、Git 图、思维导图等——按使用场景串成一张地图，每种都配上语法要点和一篇深入教程，帮你在 5 分钟内找到「这个图该用哪种语法、怎么写」。文末附在线编辑器，边看边画。"
author: "Eric Cao"
date: "2026-06-10"
---

写文档时想插一张流程图，打开画图软件、拖框、连线、调对齐……半小时过去了，图还没画完，需求又变了。

**Mermaid** 换了一种思路：你用类似 Markdown 的纯文本描述图的逻辑，渲染引擎自动帮你排版成图。改一个节点只要改一行字，版本可以进 Git，再也不用手动对齐箭头。它已经被 GitHub、GitLab、Notion、VS Code 原生支持——你在 README 里写一段 ` ```mermaid ` 代码块，GitHub 就直接渲染成图。

问题只剩一个：**每种图的语法不一样，记不住。** 这篇指南就是来解决这件事的——把最常用的 12 种图表按场景分好类，每种给你语法要点和一篇带完整实战示例的深入教程。想直接上手的话，可以打开 [MermZen 在线编辑器](https://eric.run.place/MermZen/)，左边写代码、右边实时出图，无需登录、可一键导出 PNG/SVG。

---

## 一、流程与交互：把「过程」画清楚

这两种是日常用得最多的图，描述「事情按什么顺序发生」。

- **流程图（Flowchart）**——最通用的图，用节点和箭头表达判断、分支、循环。掌握节点形状、连线类型、子图分组就够覆盖 90% 的场景。详见：[如何用 Mermaid 画流程图](https://eric.run.place/MermZen/blog/zh/flowchart.html)。
- **时序图（Sequence Diagram）**——专门画「谁在什么时候给谁发了什么消息」，画 API 调用链路、登录鉴权流程的首选。详见：[如何用 Mermaid 画时序图](https://eric.run.place/MermZen/blog/zh/sequence.html)。

## 二、结构与建模：把「系统长什么样」画出来

当你要描述代码结构、系统架构、模块关系时，用这几种。

- **类图（Class Diagram）**——面向对象建模的标准图，表达类、属性、方法以及继承/组合关系。详见：[如何用 Mermaid 画类图](https://eric.run.place/MermZen/blog/zh/class.html)。
- **架构图（Architecture Diagram）**——画微服务、组件、部署拓扑，表达服务之间怎么连。详见：[如何用 Mermaid 画架构图](https://eric.run.place/MermZen/blog/zh/architecture.html)。
- **块图（Block Diagram）**——用嵌套的块和连接表达系统的层次结构，比架构图更自由。详见：[如何用 Mermaid 画块图](https://eric.run.place/MermZen/blog/zh/block.html)。
- **需求图（Requirement Diagram）**——软件工程里描述需求、关系和验证方法，做需求管理时有用。详见：[如何用 Mermaid 画需求图](https://eric.run.place/MermZen/blog/zh/requirement.html)。

## 三、项目与时间：把「计划」可视化

排期、迭代、版本演进，这几种图最擅长。

- **甘特图（Gantt Chart）**——项目管理经典图，表达任务排期、依赖关系、关键路径和里程碑。详见：[如何用 Mermaid 画甘特图](https://eric.run.place/MermZen/blog/zh/gantt.html)。
- **时间线图（Timeline）**——按时间顺序铺开事件，适合产品演进、项目复盘。详见：[如何用 Mermaid 画时间线图](https://eric.run.place/MermZen/blog/zh/timeline.html)。
- **Git 图（Git Graph）**——可视化分支、提交、合并、打标签，讲清楚一套 Git 工作流再合适不过。详见：[如何用 Mermaid 画 Git 图](https://eric.run.place/MermZen/blog/zh/gitgraph.html)。

## 四、数据与思路：把「想法」摊开

- **饼图（Pie Chart）**——最简单的图，三行代码就能可视化数据占比。详见：[如何用 Mermaid 画饼图](https://eric.run.place/MermZen/blog/zh/pie.html)。
- **思维导图（Mindmap）**——发散思路、整理知识结构，节点层级清晰。详见：[如何用 Mermaid 画思维导图](https://eric.run.place/MermZen/blog/zh/mindmap.html)。
- **用户旅程图（User Journey）**——画用户在一个流程里的每个触点和情绪起伏，做体验设计、痛点分析时很直观。详见：[如何用 Mermaid 画用户旅程图](https://eric.run.place/MermZen/blog/zh/journey.html)。

---

## 怎么开始？

1. **先挑图**——对照上面四类，找到你要表达的东西属于哪种图。
2. **看一篇教程**——点进对应链接，每篇都有从零到一的语法讲解加一个完整的实战示例。
3. **边写边画**——打开 [MermZen 在线编辑器](https://eric.run.place/MermZen/)把示例粘进去，改两笔就成了你自己的图。常用语法记不住时，[Mermaid 语法速查表](https://eric.run.place/MermZen/blog/zh/cheat-sheet.html)放在手边随时查。

用文本画图的最大好处，是它和代码一样可以被版本管理、被 review、被 diff。一旦习惯了，你会发现自己再也不想打开那些拖拽式画图工具了。
