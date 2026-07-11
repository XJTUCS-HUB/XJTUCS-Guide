---
title: "第28&29节 Virtual Memory： Concepts"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-07-02
order: 23
---
# 计算机系统导论 

如果没有virtual memory，这个世界会是怎么样的？

![第28节 Virtual Memory Concepts__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%E8%8A%82%20Virtual%20Memory%20Concepts__1.png)

# Address Spaces

地址空间是什么？？
每个内存的位置应当有个索引，每个字节编一个编号，这个就是地址

Linear address space:
{0, 1, 2, 3 … }

Virtual address space:
线性的，连续的，独有的地址空间{0, 1, 2, 3, …, N-1}，N = $2^n$

Physical address space:
{0, 1, 2, 3, …, M-1},M = $2^m$

有了虚拟内存之后，n和m的大小关系变得无足轻重了

# VM as a tool for caching

vm不是CPU的SRAM Cache ，而是磁盘上的DRAM Cache
![第28节 Virtual Memory Concepts__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%E8%8A%82%20Virtual%20Memory%20Concepts__2.png)

为什么要这么做呢？
- DRAM is about 10x slower than SRAM
- Disk is about 10,000x slower than DRAM

> 断电会导致文件的丢失

## Page Table

**页(Page)**，作为管理磁盘的单位,把虚拟地址映射为物理地址

- **Fully associative**： 任何一个虚拟页面（VP）都可以放置在任何一个物理页面（PP）中。这就需要一个非常大且复杂的映射函数（Page Table）来记录位置。
![第28节 Virtual Memory Concepts__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%E8%8A%82%20Virtual%20Memory%20Concepts__3.png)

和cache访问一样，page访问也有两种可能，分别是hit和fault

如果遭遇page fault，由于等待的时间过于长，所以我们要改变思路，把这个进程交给page fault handler，而CPU此时去进行别的进程。
![第28节 Virtual Memory Concepts__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%E8%8A%82%20Virtual%20Memory%20Concepts__4.png)

Demand Paging：Waiting until the miss to copy the page to DRAM
Thrashing是什么？ 不停的在硬盘和内存之间拷贝，当working set超过内存的大小时出现。

# VM as a Tool for Memory Management

进程之间共享数据很麻烦！

- 使用VM分配内存空间时，总能分配连续的空间；
- 不同进程可以共享同一段代码（比如printf）
- 可以解决Linking和Loading的问题

![第28节 Virtual Memory Concepts__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%E8%8A%82%20Virtual%20Memory%20Concepts__5.png)

# VM as a Tool for Memory Protection

回顾AttackLab，栈中不能执行代码

为了应对代码注入攻击，我们只需要在每一页的页尾加入“EXEC”字段，可以有效的防范。
![第28节 Virtual Memory Concepts__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%E8%8A%82%20Virtual%20Memory%20Concepts__6.png)

# Address translation

跳过单老师讨厌的数学部分

![第28&29节 Virtual Memory Concepts__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__1.png)

### 核心术语解析
**VA (Virtual Address)**: 虚拟地址，分为 **VPN** 和 **VPO**。
  - **VPN (Virtual Page Number)**: 虚拟页号。用于在页表中索引对应的 PTE。
  - **VPO (Virtual Page Offset)**: 虚拟页偏移量。
**PA (Physical Address)**: 物理地址，分为 **PPN** 和 **PPO**。
  - **PPN (Physical Page Number)**: 物理页号。
  - **PPO (Physical Page Offset)**: 物理页偏移量（由于页大小相同，$PPO = VPO$）。

- 每个physical page存放的是page的地址（VPN映射到PPN），省略后面低12位（4KB）的部分
- 页表的物理地址存在专门的寄存器CR3中
- Valid bit用来指示是否已经分配内存
## Page Hit

![第28&29节 Virtual Memory Concepts__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__2.png)
理想情况硬件交互过程：

首先 CPU 向 MMU 发出虚拟地址（VA ①），MMU 计算出对应的页表条目地址（PTEA ②）并向缓存/内存请求，获取返回的页表条目（PTE ③）后，MMU 将其转换成真实的物理地址（PA ④）再次传给缓存/内存，最终将所需的Data ⑤返回给 CPU 核心。
## Page Fault

![第28&29节 Virtual Memory Concepts__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__3.png)
异常处理情况：

检测到该页面的Valid bit为 0，随即触发缺页异常（Exception ④）；操作系统内核的Page fault handler随即激活，将内存中的Victim page ⑤置换到磁盘，并将所需的New page ⑥从磁盘加载至内存并更新页表；
## Integrating VM and Cache

如果PageTable不在Cache里面怎么办呢？

增加异常处理环节：
![第28&29节 Virtual Memory Concepts__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__4.png)

那么，代价是什么呢？
==两访问L1 Cache，太慢了！==

## TLB

**快表**：Translation Lookaside Buffer，本质就是**Cache**
- Small set-associative hardware cache in MMU
- Maps virtual page numbers to physical page numbers
- Contains complete page table entries for small number of pages

可以说和cacheline的结构一模一样了
![第28&29节 Virtual Memory Concepts__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__5.png)

优化之后的示意图：

![第28&29节 Virtual Memory Concepts__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__6.png)
![第28&29节 Virtual Memory Concepts__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__7.png)

>[!NOTE]
>同样大小的TLB与L1 Cache，谁的命中率高？==TLB!==

关键在于考虑空间局部性和时间局部性的时候，TLB只需要存放的是page的地址，可以容纳更多的地址！（优美的设计）

## Multi-Level Page Tables

但是仍然有一个很大的问题：
>PageTable占用的空间太大，而且大部分的内存是暂时没有分配的，大量的空间是浪费的。

比如4KB (2^12) page size, 48-bit address space, 8-byte PTE，那么我们需要$2^{48} * 2^{-12 }* 2^3 = 2^{39} bytes$，即512GB的内存.

解决方式很简单；Multi-Level Page Tables，将PageTable分块，使用一个新表存放地址的地址，而且中间部分的PageTable表象都不需要分配空间，只需要在这个新表上标记NULL就行了，节省大量的空间。

![第28&29节 Virtual Memory Concepts__8](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__8.png)

K级PageTable的结构如图：
![第28&29节 Virtual Memory Concepts__9](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC28%2629%E8%8A%82%20Virtual%20Memory%20Concepts__9.png)

64位的Linux系统的k一般为4，那么是否意味着这种访问方式会非常的慢呢？

TLB可以帮助我们加速流程：
>TLBs cache the complete virtual to physical mapping
