---
title: "OpenClaw 不是答案"
description: "一个 AI 个人助手项目的技术复杂度分析：当安全模型依赖白名单而非隔离，当 52 个模块替代了你本该理解的代码，你真正信任的是什么？"
author: "Eric Cao"
date: "2026-03-01"
---

在决定用一个工具之前，我有个习惯：看它的源码。

[OpenClaw](https://github.com/openclaw/openclaw) 是这个领域里做得最完整的项目之一——WhatsApp 集成、多频道支持、任务调度、Agent 执行。功能列表很长，Star 数很高。但当我花了几个小时试图理解它的架构时，我意识到：**我没办法安心把自己的消息历史和文件系统访问权限，交给一个我看不懂的系统。**

这篇文章不是在批评 OpenClaw。它解决了真实的问题，它的维护者做了大量工作。问题是：它的设计哲学和我判断一个工具是否「值得信任」的标准，在根本上是不同的。

## 复杂度的代价

OpenClaw 有 52+ 个模块、8 个配置管理文件、45+ 个依赖、以及为 15 个渠道提供商设计的抽象层。这不是批评，这是任何试图做「通用 AI 助手平台」的代码库必然走向的地方。

问题在于，复杂度和可审查性是此消彼长的。

<iframe src="https://eric.run.place/MermZen/embed.html?text=quadrantChart%0A%20%20%20%20title%20AI%20%E5%8A%A9%E6%89%8B%E5%B7%A5%E5%85%B7%EF%BC%9A%E5%A4%8D%E6%9D%82%E5%BA%A6%20vs%20%E5%8F%AF%E7%90%86%E8%A7%A3%E6%80%A7%0A%20%20%20%20x-axis%20%E4%BD%8E%E5%A4%8D%E6%9D%82%E5%BA%A6%20--%3E%20%E9%AB%98%E5%A4%8D%E6%9D%82%E5%BA%A6%0A%20%20%20%20y-axis%20%E9%9A%BE%E4%BB%A5%E7%90%86%E8%A7%A3%20--%3E%20%E5%AE%B9%E6%98%93%E7%90%86%E8%A7%A3%0A%20%20%20%20OpenClaw%3A%20%5B0.85%2C%200.15%5D%0A%20%20%20%20NanoClaw%3A%20%5B0.15%2C%200.85%5D%0A%20%20%20%20%E5%85%B8%E5%9E%8B%E8%84%9A%E6%9C%AC%E5%B7%A5%E5%85%B7%3A%20%5B0.1%2C%200.9%5D%0A%20%20%20%20%E8%87%AA%E5%BB%BA%20RAG%20%E7%B3%BB%E7%BB%9F%3A%20%5B0.6%2C%200.4%5D&look=classic" style="width:100%;height:400px;border:none;border-radius:8px;"></iframe>

一个你没法在合理时间内审查的系统，等于一个你只能选择「盲目信任」的黑盒。对于一个能访问你消息记录、能在你的机器上执行代码的工具来说，这个代价不小。

## 安全模型的根本差异

OpenClaw 的安全模型是**应用层的**：白名单 + 配对码。这意味着它的信任边界由代码逻辑维护，而不是操作系统内核。所有东西——消息解析、Agent 执行、文件操作——都跑在同一个 Node.js 进程里，共享同一个内存空间和文件系统访问权限。

这不是说它不安全。但它的安全性有一个前提：你相信它的访问控制代码是正确的。

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20TD%0A%20%20%20%20subgraph%20OpenClaw%5B%22OpenClaw%EF%BC%9A%E5%BA%94%E7%94%A8%E5%B1%82%E5%AE%89%E5%85%A8%22%5D%0A%20%20%20%20%20%20A%5B%E7%94%A8%E6%88%B7%E6%B6%88%E6%81%AF%5D%20--%3E%20B%5B%E7%99%BD%E5%90%8D%E5%8D%95%E6%A3%80%E6%9F%A5%5D%0A%20%20%20%20%20%20B%20--%3E%20C%5B%E9%85%8D%E5%AF%B9%E7%A0%81%E9%AA%8C%E8%AF%81%5D%0A%20%20%20%20%20%20C%20--%3E%20D%5BNode.js%20%E8%BF%9B%E7%A8%8B%E6%89%A7%E8%A1%8C%5D%0A%20%20%20%20%20%20D%20--%3E%20E%5B%E5%AE%BF%E4%B8%BB%E6%9C%BA%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F%5D%0A%20%20%20%20end%0A%20%20%20%20subgraph%20NanoClaw%5B%22NanoClaw%EF%BC%9AOS%20%E5%B1%82%E9%9A%94%E7%A6%BB%22%5D%0A%20%20%20%20%20%20F%5B%E7%94%A8%E6%88%B7%E6%B6%88%E6%81%AF%5D%20--%3E%20G%5B%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97%5D%0A%20%20%20%20%20%20G%20--%3E%20H%5B%E5%AE%B9%E5%99%A8%E5%AE%9E%E4%BE%8B%5D%0A%20%20%20%20%20%20H%20--%3E%20I%5B%E6%8C%82%E8%BD%BD%E7%9A%84%E7%9B%AE%E5%BD%95%5D%0A%20%20%20%20%20%20H%20-.%20%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AE%20.-%3E%20J%5B%E5%AE%BF%E4%B8%BB%E6%9C%BA%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F%5D%0A%20%20%20%20end%0A%20%20%20%20style%20OpenClaw%20fill%3A%23112240%2Cstroke%3A%2364ffda%2Ccolor%3A%23ccd6f6%0A%20%20%20%20style%20NanoClaw%20fill%3A%23112240%2Cstroke%3A%2364ffda%2Ccolor%3A%23ccd6f6&look=classic" style="width:100%;height:440px;border:none;border-radius:8px;"></iframe>

容器隔离和白名单的根本区别在于：前者是**结构性约束**，后者是**逻辑性约束**。结构性约束由内核强制执行；逻辑性约束可能有漏洞。

换句话说，不是 OpenClaw 的代码有漏洞，而是这类逻辑边界本来就比进程边界脆弱。

## NanoClaw 的选择

我自己后来用了 [NanoClaw](https://nanoclaw.dev)——一个设计目标正好相反的项目：你能在 8 分钟内读完它的全部源码。

核心架构是这样的：

<iframe src="https://eric.run.place/MermZen/embed.html?text=flowchart%20LR%0A%20%20%20%20A%5BWhatsApp%5D%20--%3E%20B%5B(SQLite)%5D%0A%20%20%20%20B%20--%3E%20C%5B%E8%BD%AE%E8%AF%A2%E5%BE%AA%E7%8E%AF%5D%0A%20%20%20%20C%20--%3E%20D%7B%E7%BE%A4%E7%BB%84%E8%B7%AF%E7%94%B1%7D%0A%20%20%20%20D%20--%3E%20E%5B%E5%AE%B9%E5%99%A8%20A%0A%E6%8C%82%E8%BD%BD%3A%20%2Fgroups%2FA%5D%0A%20%20%20%20D%20--%3E%20F%5B%E5%AE%B9%E5%99%A8%20B%0A%E6%8C%82%E8%BD%BD%3A%20%2Fgroups%2FB%5D%0A%20%20%20%20E%20--%3E%20G%5BClaude%20Agent%20SDK%5D%0A%20%20%20%20F%20--%3E%20G%0A%20%20%20%20G%20--%3E%20H%5B%E5%9B%9E%E5%A4%8D%E6%B6%88%E6%81%AF%5D&look=classic" style="width:100%;height:360px;border:none;border-radius:8px;"></iframe>

单一 Node.js 进程。消息队列走 SQLite。每个群组的 Agent 在独立容器里跑，只能看到 `/groups/{group_id}` 这个被明确挂载的目录——而不是整个文件系统。

关键代码在 `src/container-runner.ts`，大概长这个样子（简化版）：

```typescript
async function runAgentInContainer(groupId: string, message: string) {
  const mountPath = path.join(GROUPS_DIR, groupId);
  
  await exec(`docker run --rm \
    -v ${mountPath}:/workspace \
    -e CLAUDE_API_KEY=${process.env.CLAUDE_API_KEY} \
    nanoclaw-agent \
    --message "${message}"`);
}
```

这里没有任何「我们信任这段检查逻辑」的成分。容器就是边界，内核负责执行。即便 Agent 被诱导执行了 `rm -rf /`，它也只能删除 `/workspace` 里的内容，不会碰宿主机的任何东西。

## 两者的本质差异

| 维度 | OpenClaw | NanoClaw |
|------|----------|----------|
| 安全模型 | 应用层（白名单、配对码） | OS 层（容器隔离） |
| 代码量 | 52+ 模块，45+ 依赖 | 8 个关键文件，单进程 |
| 可审查性 | 需要大量时间 | 可在 8 分钟内通读 |
| 定制方式 | 配置文件 + 插件系统 | Fork + 直接改代码 |
| 多渠道支持 | 内置（15 个渠道抽象） | 通过 Skill 按需添加 |
| 适合人群 | 需要开箱即用完整功能 | 需要完全理解和控制 |

这不是说 NanoClaw 就一定「更好」。如果你需要多渠道、需要团队多人用、需要复杂的权限管理，OpenClaw 的抽象层是有意义的。

但如果你是一个人用，需要的核心功能就那几个，那么 OpenClaw 的复杂度是你永远不会用到的负担。更重要的是，你运行了一个你没法在合理时间内审查的系统，而它有访问你私人数据的权限。

## 真正的问题：你在信任什么？

我对个人工具有一个自用的判断标准：**这个工具，在什么程度上是你真正理解并控制的？**

理解，不是指「大概知道它做什么」，而是「当它出了问题，你能定位到哪里」。控制，不是指「我可以在配置文件里改一个值」，而是「当它的行为不对时，我知道从哪里改代码」。

OpenClaw 在这个标准下是不够的——不是因为它做错了什么，而是因为它的目标（通用平台）和这个标准（完全可审查）本来就是矛盾的。

NanoClaw 也不是完美的。它的生态更小、初始化要手动跑几个命令、遇到问题得自己调 Claude 来修。但它给了我一件 OpenClaw 给不了的东西：**我知道它在做什么，因为我读过全部的代码。**

这种确定性，比功能列表更值钱。
