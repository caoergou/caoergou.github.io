---
title: "The Data Lake's \"Blockchain Moment\": A Deep Dive into the Hash
  Universe of lakeFS Graveler"
description: Starting from Bitcoin's Merkle Tree, this article traces how that
  foundational idea evolved into lakeFS Graveler's two-level content-addressable
  tree — enabling version control over billions of files that is both
  tamper-proof and remarkably space-efficient.
author: Eric Cao
date: 2025-10-18
---

In 2008, Satoshi Nakamoto devoted just two paragraphs of the Bitcoin whitepaper to explaining Merkle Trees — a passing mention that nevertheless cemented the idea of "content addressing" as a cornerstone of engineering practice. Over a decade later, a company called lakeFS applied the same logic to data lake version control, building a storage engine called Graveler.

On the surface, these two things have nothing to do with each other. One deals with money, the other with files. But look closer, and they're solving the same problem: **In an untrusted, distributed world, how do you guarantee that "this data is exactly the data you think it is"?**

---

## The Core Invention of Blockchain: Hash as Identity

Let's break blockchain down to its smallest unit.

A Bitcoin block is essentially a combination of three things: a batch of transaction records, the hash of the previous block, and a hash digest of the transaction batch itself (the Merkle Root).

The critical property of a hash is that **content determines identity**. Change "Alice sends Bob 1 BTC" to "Alice sends Bob 0.001 BTC", and the hash becomes completely unrecognizable. This means:

> As long as you have a block's hash, you can verify whether any transaction inside it has been tampered with — without examining all the data, just by verifying a single path up the Merkle Tree.

The structure of a Merkle Tree is straightforward: hash all transactions in pairs, then hash the results in pairs again, all the way up, until everything converges into a single Merkle Root. If a block contains ten thousand transactions and you want to verify whether one specific transaction exists, you only need log₂(10000) ≈ 14 hash operations.

This is the **core magic that reduces "data integrity verification" from O(N) to O(log N)**.

Blocks are chained together by hashes: every block contains the hash of the previous block. Tamper with a transaction from 1,000 blocks ago? That block's hash changes, invalidating the next block's `prevHash`, which invalidates the one after that… the entire chain breaks from that point forward. This is the source of "immutability" — not magic, but cascading failure.

---

## Why Git Isn't Enough

The motivation behind lakeFS was simple: **bring Git-style version control to data lakes**. Branches, commits, merges, rollbacks — these Git workflows work beautifully for code. So why not for data?

The problem lies in scale and storage medium.

Git was designed for local filesystems. Each commit snapshots a directory, storing the directory tree as "Tree Objects" — each directory maps to a Tree Object listing the hashes of its subdirectories and files. Change one file, and its containing directory's Tree Object must be rewritten, then the parent directory, all the way up to the root. On a local disk, this is fine — the cost difference between writing one file and writing a hundred is negligible.

But data lakes live on object storage (S3, GCS, Azure Blob), where **writing each new object carries network overhead equivalent to writing 4 MiB of data**. More critically, a data engineer's repository might contain a billion files. Even if only 5% of the data changes each day, that's still 50 million files. Git's directory tree model simply collapses at this scale.

Another problem is diff efficiency. Two adjacent commits might differ by only 1,000 files, but if you have to scan the entire directory tree to find the difference, the cost is O(total file count) rather than O(diff size). At a billion files, this is completely unacceptable.

---

## Graveler: Bringing Hash Logic to Object Storage

lakeFS's solution is called **Graveler** — a content-addressed key-value store purpose-built for object storage.

Start with the most basic data unit, the `ValueRecord`:

```
ValueRecord {
  key:      file path (e.g., "data/2025/01/part-000.parquet")
  identity: hash of the file's content (e.g., sha256)
  value:    actual address of the file in object storage + metadata
}
```

There's an elegant design choice here: `identity` and `value` are kept separate. `identity` is the content digest; `value` is the storage address. When Graveler determines whether two records are "the same," it looks at key + identity, not value — making comparisons extremely cheap, with no need to fetch actual data content.

The ID of a Graveler file (i.e., a Range file) is computed as follows:

```
valueRecordID = h( h(key) || h(identity) )
fileID        = h( valueRecordID_1 || valueRecordID_2 || ... || valueRecordID_N )
```

Notice the structure — **a Range file's ID is collectively determined by every record it contains**. Modify any single record, and the entire file's ID changes. This mirrors blockchain's Merkle Root exactly.

---

## A Two-Level Merkle Tree: Flat Is Efficient

A single Range file is typically 1–10 MB, containing all ValueRecords within a contiguous key space (sorted by file path).

But a repository with a billion files can't possibly fit into a single Range. lakeFS aggregates all Range files into one level above, called a **Meta Range**.

The structure looks like this:

```
Meta Range
├── Range_A (key space: aaa... ~ eee...)
├── Range_B (key space: eee... ~ kkk...)
├── Range_C (key space: kkk... ~ ppp...)
└── Range_D (key space: ppp... ~ zzz...)
```

The Meta Range stores each Range's "max key" and "Range file ID (hash)". A commit is simply a hash pointer to a Meta Range.

This is a **Merkle tree of height 2**, structurally equivalent to a B+ tree: the Meta Range is the root node, Range files are the leaf nodes, and every level is content-addressed.

Compared to blockchain:
- A blockchain's Merkle Root aggregates "all transactions in this block"
- lakeFS's Meta Range hash aggregates "all file metadata in this commit"

The verification logic is identical: give me a commit's Meta Range hash, and I can traverse the tree downward to verify the state of any individual file — at O(log N) cost.

---

## The Write Amplification Miracle: 99% Reuse Rate

This is where Graveler gets really interesting.

Suppose a commit only modifies 500 files under the `data/2025/10/` directory, and all of their paths fall within Range_C's key space. Graveler's write process looks like this:

1. Rewrite Range_C, generating a new Range_C' (with a new hash)
2. Range_A, Range_B, and Range_D **don't need to change a single byte** — they're reused directly via their existing files
3. Rewrite the Meta Range, replacing Range_C's entry with Range_C', generating a new Meta Range'

**The entire commit operation writes only 2 new files** (Range_C' and Meta Range'); all other data is reused through hash references.

According to lakeFS's measurements on real design-partner datasets, a repository's daily change rate falls between 5–20%. At 20 commits per day, the average single commit touches less than 1% of the entire repository, translating to a Range reuse rate **>= 99%**.

This is precisely why blockchain thinking can be applied to data lakes — but why you can't just use blockchain directly: each blockchain block is self-contained, with transactions never reused across blocks. Graveler's Range files are shared across commits, and that is the key difference in storage efficiency.

---

## Immutable is Immutable, Mutable is Mutable

Graveler is responsible for **committed metadata**, which is immutable — once a file is written, it never changes. It is referenced purely by hash, with no concept of in-place modification. This is rooted in exactly the same principle as blockchain's "tamper-proof" design.

But there is another class of data in the system: **branch pointers and staged changes**.

A branch is essentially a pointer to a specific commit. Every time a commit or merge occurs, the branch pointer must be updated — this is a high-frequency, random-write operation that sits in stark contrast to the "immutable" design philosophy.

lakeFS addresses this with a two-track approach:
- **Immutable data** (committed Meta Range / Range files) → stored directly in object storage (S3, etc.), with built-in high availability
- **Mutable data** (branch pointers, staged metadata) → maintained separately in a KV Store (PostgreSQL, DynamoDB), with CAS (Compare-and-Set) optimistic locking to ensure write consistency

This layered design echoes blockchain architecture as well: historical blocks (confirmed) are immutable, while pending transactions in the "mempool" are highly mutable — and the two are handled with entirely different storage and access strategies.

---

## A Lineage of Ideas

Looking back, the intellectual lineage of content-addressable storage is fascinating:

**Ralph Merkle (1979)** introduced the Merkle Tree, proving that any element's membership in a set can be verified at O(log N) cost.

**Satoshi Nakamoto (2008)** applied it to Bitcoin transaction verification, then chained blocks together with hashes to create the "distributed ledger."

**Git (2005 — predating Bitcoin)** applied content addressing to code version control: every commit, tree, and blob is a hash-addressed object — an independent implementation of the same core idea.

**lakeFS Graveler (2021)** took Git's approach and scaled it to object storage: preserving the core of content addressing and Merkle trees, but redesigning the tree structure (a two-level B+ Tree) and the splitting strategy (hash-based random splitting), enabling Range files to be efficiently reused across massive numbers of commits.

Each generation is not a simple copy — it is a new set of engineering trade-offs, made after deeply understanding the underlying mathematics and adapting to new constraints (scale, network latency, write cost).

Perhaps this is the fundamental pattern of technological evolution: good ideas never die — they simply take root and grow again in new soil.
