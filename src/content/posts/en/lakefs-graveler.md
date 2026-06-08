---
title: "Every Commit Writes Just 2 Files: How lakeFS Brings Git to the Data Lake"
description: "An ETL job corrupts tens of thousands of parquet files, and when
  you open the S3 bucket you realize — there are no commits, no rollbacks, and
  the overwritten objects are gone forever. This article tears apart the design
  of lakeFS Graveler: how a two-level Merkle tree combined with hash-based
  chunking allows every commit at billion-file scale to write just 2 new files
  and reuse 99% of content in place — and how it shares the same mathematics as
  blockchain while pursuing the exact opposite goal."
author: Eric Cao
date: 2026-06-08
---

At 3 a.m., a data processing pipeline (ETL) quietly broke because an upstream data format had changed without warning — corrupting tens of thousands of Parquet files in the production data lake. The next morning, a data scientist discovered that the training set was inconsistent and wanted to do something that feels completely natural when writing code:

**Roll back to yesterday's version.**

Then he realized what he was actually dealing with: an S3 bucket. No `git revert`, no commits, no branches. Just a pile of objects — anything overwritten in place was gone forever. His only "version control" was a full snapshot he'd manually copied out with `aws s3 cp` the previous month — several terabytes, already stale.

This is a long-overlooked gap in the data lake era: **we've had version control for code for thirty years, yet the data that feeds our models and drives our decisions has been running naked in storage with no timeline at all.**

lakeFS aims to fill that gap. Its goal sounds simple: give data lakes a Git-like system — branches, commits, merges, rollbacks. But the real challenge isn't the semantics. It's making all of that work at scale — billions of files, running on object storage — without falling apart. The engine that makes it possible is called **Graveler**. This article tears it open.

---

## Part 1: First, Let's Define What a Data Lake Actually Is

To understand why Graveler is designed the way it is, you first need to understand the ground it stands on — what a data lake actually is, and why it's so hard to manage.

Traditional data warehouses follow a "structure first, store later" philosophy — data must conform to a defined schema before it ever enters the system (which columns exist, what type each one is). Clean and orderly, yes, but also expensive and rigid. Data lakes flip this around: raw data comes in as-is, piled up first and interpreted later. Logs, images, Parquet files, model weights — any format goes. You decide how to make sense of it when you actually need it.

This casual approach is only possible because the underlying storage is **object storage** (S3, GCS, and similar services — think of it as a super-powered cloud drive for programs): near-infinite capacity at extremely low cost per unit. Dump dozens of petabytes of raw data in, storage is cheap, and you can figure out what to query or train on later.

But the flip side of "store everything now, figure it out later" is the **data swamp**:

- Which version of this dataset is this? When did the upstream source change it?
- Which version was used for last week's training run? Can we reproduce it?
- The ETL corrupted the data — can we roll back?
- I want to test a new data cleaning logic — can I run it on a "branch" first, verify it works, and then merge into production without affecting anyone else?

For software developers, Git answers all of these questions. In a data lake, **none of them have answers by default**. Data lakes give you the freedom to store massive amounts of data cheaply, but no tools to actually manage it. The entire purpose of lakeFS is to bring the version control mindset of Git to this landscape.

And the real difficulty is buried in the physical nature of the landscape itself.

---

## Part 2: The Physical Constraints of Large-Scale Data Storage: Why Porting Git Directly Doesn't Work

Object storage and the filesystem on your laptop are two fundamentally different physical worlds. The reason you can't just port Git directly comes down to a few hard constraints:

**1. It's a flat key-value store — there are no real "directories".** `s3://bucket/data/2025/01/part-000.parquet` looks hierarchical, but `data/2025/01/` is just a key prefix — a string illusion. Underneath, it's one giant flat mapping of `key → object`. There are no directory nodes.

**2. Objects are essentially immutable.** You can't "modify byte 100 of an object" — you have to PUT the entire object again to overwrite it. Change a single bit, and you're rewriting the whole file.

**3. Writes are expensive.** Every PUT is a network round trip with a minimum billing unit. The lakeFS team has given a concrete estimate: on remote object storage, **writing a new object costs the equivalent of writing 4 MiB of data** (from the lakeFS engineering blog [*Concrete Graveler: Splitting for Reuse*](https://lakefs.io/blog/concrete-graveler-splitting-for-reuse/); this is an empirical analogy they use to quantify the fixed overhead of a remote PUT, not an actual S3 billing rule). In other words, writing 100 small files is nowhere near 1/100th the cost of writing one large file — the fixed overhead dominates.

**4. Scale is in the billions.** A data engineering team's repository can easily reach a billion files. Even if only 5% changes per day, that's 50 million files in flux.

Now let's see what happens when you try to apply Git's model to this.

Git manages directories using **Tree Objects**: each directory maps to a tree object that lists the hashes of its children. Change one file, and its parent directory's tree must be rewritten, then its grandparent's tree, all the way up to the root. On a local disk, this is completely fine — writing one file or a hundred files has roughly the same overhead (constraint 3 doesn't apply). And local filesystems have real directory trees (constraint 1 doesn't apply), with in-place modification support (constraint 2 doesn't apply).

On object storage, every one of Git's assumptions breaks down. With a billion-file directory tree, a single change requires rewriting a long chain of tree objects on the way up — every one of which is an expensive PUT. Even worse is the diff problem: finding the difference between two adjacent versions the Git way requires scanning the entire directory tree, at a cost of O(total file count) rather than O(diff size). At a billion-file scale, that's a non-starter.

So lakeFS can't copy Git's data structures. It needs to design its own — preserving the soul of Git's content-addressing while surviving the physical constraints of object storage.

To explain that design clearly, it helps to borrow an example from a system you're probably more familiar with — one that looks completely unrelated to data lakes on the surface, but uses the exact same mathematics underneath.

---

## Part 3: The Core Idea: Hash as Identity

<iframe src="https://eric.run.place/MermZen/embed.html#eJyrVipTsjLSUUpWslJKL0osyFAIcYnJU1BQUAjKzy-JjlHyTS3KzkkF897v6XjaNvPF_tlPe3Y9nTv96ZIt7_d0xijFQtR7GBpFxyh5JBZnaIRUGGqHVBhpIuSMTRByxtohFSYIuRDD6BilkApDhIARWMAIIWAMFjBGCJiABUzgAiDXKejq2oEcgS5ibAJ3H1ggxBCNbwR3I4RvjMY3UdJRKlGyUkpJLMpWqgUARXFYyg" title="Blockchain Merkle Tree: O(log N) Verification" loading="lazy" style="width:100%;height:420px;border:1px solid rgba(148,163,184,0.2);border-radius:8px;" allow="fullscreen"></iframe>

That system is the blockchain. One manages money, the other manages files — so why do they share the same mathematics? Because the underlying problem they solve is identical: **in an environment where no one is fully trusted, how do you let anyone independently verify that a piece of data hasn't been tampered with?** The blockchain's answer is content-addressing.

Strip a Bitcoin block down to its essentials and you get three things: a batch of transactions, the hash of the previous block, and a hash digest of those transactions (the Merkle Root). The soul of this is a single property of hashing — **content determines identity**. Change "Alice sends Bob 1 BTC" to "0.001 BTC," and the hash is completely unrecognizable.

This gives rise to a critical capability:

> As long as you have a block's hash, you can verify whether any single transaction inside it has been tampered with — without reading all the data. You just need to verify one path up the Merkle Tree.

The construction of a Merkle Tree is straightforward: all transactions are hashed in pairs, the results are hashed in pairs again, and so on up to a single Merkle Root. A block with 10,000 transactions only requires log₂(10,000) ≈ 14 hashes to verify whether any given transaction exists. **This is the core magic that compresses "data integrity verification" from O(N) to O(log N).**

Blocks are then chained together with hashes: each block embeds the hash of the one before it. Want to quietly alter a transaction from a thousand blocks ago? That block's hash changes, invalidating the `prevHash` in the next block, then the one after that — a cascading failure all the way to the tip. The so-called "immutability" of blockchains isn't magic. It's just this cascade.

At this point, keep in mind the two gifts that content-addressing gives us:

1. **Verifiable integrity** — a hash is an unforgeable fingerprint of its data.
2. **Deduplication and reuse** — identical content produces identical hashes, so identical data naturally exists only once and can be shared freely.

But also keep in mind a sharp tension that will run through the rest of this article: **the entire power of content-addressing is built on immutability. Yet the very essence of version control is that things are constantly changing — branches move, HEAD advances, every commit rewrites "the current state."**

How do you use an idea baked in immutability to manage a system that's always in motion?

With that question in mind, let's return to the data lake.

---

## Part 4: Graveler's Data Unit: ValueRecord

Before diving into the individual components, let's get a clear picture of the whole system — otherwise it's easy to get lost. Graveler's core idea can be summed up in one sentence: **split the entire data lake's file inventory into small batches, compute a hash fingerprint for each batch based on its contents; at commit time, only rewrite the batches whose contents have changed — the rest are simply referenced by their old fingerprints and reused as-is.** This means that even if a repository contains a billion files and only 1% change in a given commit, only that 1% actually needs to be written to object storage. The ValueRecord, Range, and Meta Range concepts described below are all building blocks designed to deliver on that one sentence.

lakeFS encodes metadata in a format called **Graveler** — a content-addressable key-value store purpose-built for object storage. The most fundamental unit is the `ValueRecord`, which you can think of as a library catalog card with three distinct fields:

```
ValueRecord {
  key:      file path, e.g. "data/2025/01/part-000.parquet"  (the title)
  identity: fingerprint of the file's contents, e.g. sha256  (the content digest)
  value:    actual address in object storage + metadata        (the shelf location)
}
```

The elegance lies in the separation of the "content digest" (`identity`) from the "shelf location" (`value`). When Graveler determines whether two records are "the same", it only looks at the title and the digest — **not the shelf location**. It's like comparing two catalog cards purely by their digest codes to know whether they refer to the same book, without ever walking to the shelf and pulling it down. This makes comparison operations extremely cheap: no data bytes need to be fetched — just compare the fingerprints.

The ID of a Graveler file (a **Range** file) is computed as follows:

```
valueRecordID = h( h(key) || h(identity) )
fileID        = h( valueRecordID_1 || valueRecordID_2 || ... || valueRecordID_N )
```

(`||` denotes byte-sequence concatenation in order; the original lakeFS formula uses `+` for the outer layer, with the same meaning.) Notice the structure clearly — **a Range file's ID is jointly determined by every record it contains**. Change any single record and the entire file's ID changes. This follows the same "content determines identity" logic as a blockchain's Merkle Root — except that what is being aggregated here is not transactions, but file metadata.

---

## 5. The Two-Level Merkle Tree: Flat by Design, Efficient by Nature

<iframe src="https://eric.run.place/MermZen/embed.html#eJxVzz9Lw0AYBvCv8vLOLaXpFrSQP2uWQ7LkRM7kqCE2DSEWjBgCClZwcxMcXDI4uBpKJz9KSOzYryDeYeJt9_D8nuPuBteoayP0UcdFypILOLFpDADgEI-iwzMGhMULftht2rps63fwV8tlmMExdB93-5f77nnT1U-H3SPFU7kkhkdRjM6Mo_N0MmeMNWUFBXDOm7IaoNlDU0DZQwFRFCnQ6qEloOyhgCRJFGj30BZQ9lBAnuf_oTv1KLrs8ooT7q_SQN7Kr-HrE8KAx1mYifP6lwwrTV0Nxcyj2JTVfluBBm398P36NhHv6IlDYDyeAzHUaKrRUqP9938R3akaNTXOcIQZ6hiwNMLbH5gCoaM" title="Graveler Two-Level Merkle Tree" loading="lazy" style="width:100%;height:480px;border:1px solid rgba(148,163,184,0.2);border-radius:8px;" allow="fullscreen"></iframe>

A single Range file is typically kept between 1–10 MiB and stores all the ValueRecords within a **contiguous key space** — that is, a continuous segment carved out of all file paths sorted alphabetically (for example, paths starting with `a` through paths starting with `e`).

But a repository with a billion files can't possibly fit into a single Range. So lakeFS adds an aggregation layer on top of the Ranges called a **Meta Range**:

```
Meta Range
├── Range_A (key space  aaa... ~ eee...)
├── Range_B (key space  eee... ~ kkk...)
├── Range_C (key space  kkk... ~ ppp...)
└── Range_D (key space  ppp... ~ zzz...)
```

A Meta Range stores the "maximum key" and the "Range file ID (hash)" for each Range. **A commit, at its core, is simply a hash pointer pointing to a specific Meta Range.**

This is a **Merkle tree with a fixed height of 2**, structurally equivalent to a two-level B+ tree: the Meta Range is the root, Range files are the leaves, and every level is content-addressed. Given the Meta Range hash of a commit, I only need **exactly two hops** — first locate the corresponding Range within the Meta Range, then search inside that Range — to verify the state of any file. There is a subtle but critical difference from Bitcoin's Merkle tree: Bitcoin's tree grows deeper as the number of transactions increases (log₂N levels), whereas Graveler deliberately keeps the tree compressed to exactly two levels, never growing deeper as the file count increases. What justifies such a design choice? The next section has the answer.

**Why are two levels enough — isn't the tree too "wide" to worry about?** This is an elegant engineering judgment call. A 10 MiB Meta Range can reference enough Ranges to let the entire tree comfortably cover hundreds of millions of files. The lakeFS team ran the numbers: even if the Meta Range file gets quite large, it doesn't matter — because in any B+ tree, **nearly all nodes are concentrated at the leaf level**. Adding another intermediate level would yield only marginal gains in caching and deduplication efficiency, while turning every lookup from 2 hops into 3. So they simply fixed it at two levels — simple and sufficient.

### How Exactly Are Range Boundaries Determined?

This is the most easily overlooked yet most critical design decision in Graveler.

When splitting a billion files into individual Ranges, where do you draw the boundaries? The most intuitive approach is **fixed-size splitting**: cut once every 10 MiB. This sounds reasonable, but it triggers a disaster —

Suppose you insert a new record at the very **beginning** of the key space. With fixed-size splitting, once the first Range fills up it shifts its overflow to the next, causing **every single** Range boundary after it to shift by one position. The result: even though you only added one record, **nearly every Range's content has changed, every hash has changed, and everything must be rewritten**. The reuse rate instantly drops to zero. It's like inserting a single character at the start of a typeset book and having every page break in the entire book fall apart.

lakeFS's solution is **hash-based breaks**: whether to end a Range after a given record is determined not by "how many bytes have been written so far," but by **the hash value of that record's key** (with min/max size bounds applied as guardrails).

This change seems small, but the effect is transformative: **a breakpoint is determined solely by the content of the key, not by its position in the sequence.** As a result, the same key will trigger a breakpoint at the same location regardless of which branch or commit it appears in. Two different Merkle trees, as long as the content of a given key-space segment is identical, will have aligned breakpoints — and that Range file can be **shared** between both sides.

This is exactly the idea behind **content-defined chunking** used in deduplication systems like rsync and restic. It brings one particularly important benefit: when two branches each accumulate a large number of changes — same files, just different ordering — and are then merged, fixed-size splitting would misalign the breakpoints and force nearly every Range to be regenerated; hash-based breaks cause the Range endpoints of both branches to naturally land on the same keys, allowing a large number of Ranges to be reused directly. (lakeFS's actual parameters are `min_size=0` and `max_size=20MiB`, with breakpoint frequency controlled by a parameter called raggedness, targeting roughly one break per ~50,000 records on average; however, most Ranges will hit the 20 MiB upper limit before accumulating that many records, so individual Ranges in practice hold anywhere from a few thousand to tens of thousands of entries.)

Keep this mechanism in mind — it is the very foundation of the "miracle" described in the next section.

---

## 6. The Write Amplification Miracle: 99% Reuse, and the Moment Graveler Parts Ways with Blockchain

<iframe src="https://eric.run.place/MermZen/embed.html#eJyrVipTsjLSUUpWslJKL0osyFAIcYnJU1BQUPANcoqOUfowf8oWBd_UkkSFoMS89NRHDZve7-l4Nm3D09273u_pjFGKtbKyKiqH6AhyhusAK453xqvcN8gxOkYJYfb7PR3J-bm5mSUKjhC1UFNBqh7N3P1-Rz_UWEeEnBO6nBNCzjk6Rgnqjvd7Ol4sWv1s9v5nvYuez2p5Nn35884OFEtc0A1ygcv5Bjkq6OraKQQ5ovGd0PjOaHxEQKLpd0LTD-U7owtADUjOSSwudklNUygqV0jLzMmxUk42MLY0StIpLinKz061Uk41N0k2TtZJzs_JL7JSTktLs1bSUSpRslJKSSzKVqoFAI-hq1g" title="99% Reuse: A Single Commit Rewrites Only 2 Files" loading="lazy" style="width:100%;height:460px;border:1px solid rgba(148,163,184,0.2);border-radius:8px;" allow="fullscreen"></iframe>

Now let's put all the pieces together and walk through a real commit.

Suppose a commit only modifies 500 files under `data/2025/10/`, and all of those paths fall within the key space of `Range_C`. Graveler's write process works as follows:

1. Rewrite `Range_C`, producing a new `Range_C'` (with an updated hash);
2. `Range_A`, `Range_B`, and `Range_D` are **left completely untouched** and reused directly — because their contents haven't changed, their hashes remain the same, and hash-based breaks guarantee that their boundaries haven't drifted;
3. Rewrite the Meta Range, replacing the entry pointing to `Range_C` with `Range_C'`, producing a new Meta Range'.

**The entire commit writes only 2 new files** (`Range_C'` and `Meta Range'`); everything else is reused via hash references.

How high is this reuse rate? lakeFS measured it using S3 inventory data from two real design partners: the daily change rate in a repository is roughly **5–20%**. Assuming approximately 20 commits per day, the average commit touches less than 1% of the entire repository, corresponding to a Range **reuse rate of ≥ 99%** (both figures are quoted verbatim from the official lakeFS documentation, [Versioning Internals](https://docs.lakefs.io/understand/how/versioning-internals/)).

A more concrete example shows just how smooth this is in production: suppose data is organized under time-based prefixes like `input/YYYY/MM/DD/hh:mm/`, with one commit per hour. In the `03:00` commit, all Ranges whose maximum key predates `02:00` won't change at all and are fully reused; only the one or two Ranges covering the newly ingested `02:00–03:00` data need to be rewritten. A repository with a billion files produces, in practice, only one or two Range rewrites per hourly commit — and that is precisely why it holds up under real-world workloads.

**At this point, it's time to reveal a surprising inversion.**

Back in section three, you might have assumed: since blockchain already mastered content addressing, isn't Graveler just "blockchain ported to the data lake"?

Quite the opposite. The two are **completely at odds** in the most critical respect:

- **Blockchain deliberately avoids reuse.** Each block is self-contained; transactions are never shared across blocks — because the goal is to prevent double-spending and tampering, and independence and redundancy are the very source of its security.
- **Reuse is the lifeblood of Graveler.** That 99% efficiency depends entirely on Ranges being shared across commits and branches. Its goal is not to guard against malicious actors, but to minimize write amplification on expensive object storage.

The same mathematical foundation — content addressing plus Merkle trees — gives rise to diametrically opposite forms, because the constraints and objectives are different. This is precisely the point: **Graveler didn't copy blockchain; rather, both share a common, older ancestor — content addressing.** Viewing them side by side, what you see is not imitation, but the same good idea growing into different shapes in different soil.

---

## VII. Merkle Tree's Second Gift: Making "Find the Difference" O(diff) Too

Deduplication saves on **writes**. But the Merkle tree also quietly solves another chronic data lake headache — **diff**.

Recall the pain point from Section II: the Git-style approach to finding differences between two versions requires scanning the entire directory tree, at a cost of O(total file count). That's unacceptable at a billion files.

How does Graveler handle it? Because the hash of each Range is a fingerprint of its contents, diffing two commits works like this:

> You only need to read the two Meta Ranges and compare the Range hashes they reference one by one. **Ranges with identical hashes are skipped entirely — no reading required.** Only the Ranges with differing hashes need to be fetched and compared entry by entry.

This brings the cost of a diff down from O(total file count) to roughly O(diff size) — strictly speaking, "diff size plus one linear scan of the Range hash list in the Meta Range," but the latter is small enough compared to the total file count to be negligible.

A dramatic example: two versions each containing a billion files, separated by three hours, with 10,000 changed files. The Git-style approach has to scan all one billion records before it can tell you what changed; Graveler just opens the two "tables of contents" (Meta Ranges), checks which Ranges have a different "cover hash" — probably just two or three — and then opens only those two or three Ranges for entry-level comparison. **A billion-record scan shrinks to a few thousand entries.** Time drops from minutes to milliseconds.

Merge works the same way (lakeFS implements it internally as a three-way diff: it places two branches alongside their common ancestor, identifies what each changed, and merges intelligently): only the Ranges that actually changed need to be read or written; untouched ones are bypassed entirely. **Branch, commit, merge, revert — Git's full semantic repertoire runs at billion-file scale, with every operation's cost proportional only to "how much changed," not "how much there is."**

---

## VIII. Immutable vs. Mutable: How the Two-Track Design Resolves the Contradiction

Remember the contradiction planted in Section III? The power of content addressing rests on "immutability," yet the very nature of version control is "constant change." How does Graveler have both at once?

<iframe src="https://eric.run.place/MermZen/embed.html#eJxlj89LwmAYx_-Vh-dUoAh1kxRSQUKntZWXvR2mjhXhFnMFkR2SUA_mRKaIEhEEeTHJQ_5IEPpb9k491Z8QbqfZe_x8n-d5v59bvEb_jgcz6EdJFS7PIM4SGQAgf5V2AHNyzBP8fTYegOoDqrfNcWvRrML3COisuTB65rhmdYq03yZ46uyuX4jlCdJKyTIGVrW8alTAB3lNkMQsmPN3y5i4pmMpfotgLAWcpqjiXlr1BQ-VvCapIncUBx9EbmQhp0RCdhLe58Cc1JdvxZVxT3Db9St4vUGIpRwkytkNmwOGcWwaYI4f_wmNhpZeN6evrnLMWoURNQFYQZZEV8YmojxBm4PVKptfn644ya296GCy_Hih_TYt9mwDbhd8EA1z7vKMU55NRF33bZjkNoxCLAQCwQLBjJLLnWs_sw4tP9HudDnv0lqJ6kOCBWBY9KCGfswK6gXe_QHIxrqx" title="Immutable / Mutable Two-Track Architecture" loading="lazy" style="width:100%;height:420px;border:1px solid rgba(148,163,184,0.2);border-radius:8px;" allow="fullscreen"></iframe>

The answer is to split data **into two worlds based on mutability**, each using the storage best suited for it:

**The immutable world — committed metadata.** Meta Range and Range files, once written, are never modified. They are referenced purely by hash; there is no concept of in-place editing. This portion is stored directly in object storage (S3/GCS). Because it is immutable, it is trivially cacheable — once cached, entries never expire unless evicted, requiring no complex cache-invalidation logic. This is the same principle as blockchain's "confirmed historical blocks cannot be altered."

**The mutable world — refs and staged metadata.** A branch is fundamentally a pointer to a specific commit. Every commit and every merge updates that pointer — a high-frequency, random-write pattern that is fundamentally at odds with immutability. Similarly, changes that have been written but not yet committed sit in a staging area that is also highly volatile. lakeFS stores this portion separately in a **KV Store** (PostgreSQL, DynamoDB), using a "conditional write" mechanism — compare-and-set, which verifies that a value hasn't been modified by anyone else before writing, similar to optimistic locking — to ensure concurrent writes don't conflict. After all, if you can't even read which commit the `main` branch currently points to, half the system is down; this layer must be strongly consistent and highly available.

The contradiction is thus elegantly resolved: **a commit is simply the moment a batch of changes is solidified from the "mutable staging world" into the "immutable committed world."** The mutable pointer handles "which moment in history we're pointing to now"; the immutable Merkle tree handles "what each moment in history contains, permanently and tamper-proof." The two worlds each do their job without having to compromise for the other.

This layered design also quietly mirrors blockchain: confirmed historical blocks are immutable, while transactions awaiting confirmation in the mempool are highly mutable — the two use entirely different storage and consistency strategies. (This is a loose analogy: the mempool is a pool of unpackaged transactions, while lakeFS staging holds uncommitted changes at the branch level; their consistency models differ, but the layered intuition of "historical zone immutable, pending zone mutable" carries across.) Good system design almost always knows: **hold the line on what must never change, and isolate what needs to flex.**

---

## IX. Back to 3 a.m.

Now back to the data scientist at the start of the story — the one whose data lake was corrupted by an ETL job with no way to roll back. If that data lake had been running on lakeFS, the story would have unfolded entirely differently:

- He could `git revert` that commit — the branch pointer moves back to the previous commit in seconds, because no data needs to be moved; it's just updating a hash pointer to an immutable Merkle tree.
- The ETL pipeline could have run first on a `staging` branch, validated its output, and then been merged into `main` — and opening a branch is **zero-copy**: no need to duplicate those terabytes of data, just create a new pointer to the same Meta Range.
- Which version of the data did that training run use? Just record the commit hash. The entire Merkle tree it corresponds to never changes, and can be reproduced exactly at any time.

None of these capabilities materialized out of thin air. They are all built on top of Graveler's two-layer content-addressed tree — the product of two simple properties, "hash is identity" and "identical content can be reused," pushed to their logical extreme under the physical constraints of object storage.

Finally, it's worth tracing the intellectual lineage of these ideas. Ralph Merkle introduced the Merkle Tree in 1979, proving that membership in a set can be verified in O(log N); in 2005, Git applied content addressing to source code version control; in 2008, Satoshi Nakamoto embedded it in Bitcoin alongside inter-block hash chaining; lakeFS Graveler, taking shape around 2021, extended it to object storage scale — preserving the core of content addressing and Merkle trees while redesigning the tree's shape (a two-level B+ tree) and chunking strategy (hash-based breaks) so that Ranges can be efficiently reused across massive numbers of commits.

Each generation didn't simply copy what came before. Each thoroughly understood the underlying mathematics and then made new engineering trade-offs for new constraints — scale, network latency, write cost.

Satoshi Nakamoto never set out to save anyone's object storage bill; when Ralph Merkle proved his theorem in 1979, S3 didn't exist, and neither did parquet. But the mathematics they established is running inside your every `lakectl commit` today. That, perhaps, is the fate of a good idea: **it doesn't care what you originally used it to prove. It simply waits to be planted in the right soil, and grows into something you can recognize by its bloodline — yet have never seen before.**
