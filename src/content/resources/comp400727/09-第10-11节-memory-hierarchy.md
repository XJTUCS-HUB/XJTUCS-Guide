---
title: "第10&11节 Memory Hierarchy"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-04-14
order: 9
---
# 计算机系统导论


内存是计算机系统中的关键组件，用于存储数据和程序。数据存储在内存中的过程并非简单地将数据存放到特定地址，而是涉及复杂的存储机制和访问策略。

# Memory Abstraction

### 基本操作
 **Write（写操作）**：Store
 **Read（读操作）**：Load
### Memory Gap
CPU、GPU 和网络设备与内存之间存在显著的性能差异，这一问题被称为**冯诺伊曼瓶颈**（von Neumann Bottleneck）或**存储器墙**（Memory Wall）。

### 解决方案

针对存储器差距问题，主要有三种解决思路：
1.  **构建层次结构**（Build a Hierarchy）：利用速度、容量和成本的权衡，建立多级存储器层次。
2.  **寻找替代方案**（Find other stuff）：研发更快的非易失性存储器（如 MRAM）或存内计算架构。
3.  **移动计算**（Move the Computing）：利用 GPU 加速或将计算任务下沉至数据侧（边缘计算）。

## 总线结构
数据流通过**总线**（Bus）在处理器和 DRAM 主存之间传输。总线是一组并行的导线，用于承载地址、数据和控制信号。

> *注：内存芯片、控制器的时钟与系统总线的时钟通常通过时钟域进行同步。*

![第10节 Memory Hierarchy__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC10%E8%8A%82%20Memory%20Hierarchy__1.png)
详细说明请参考 [Textbook](https://xjtu-ics.github.io/textbook/notes/chapter6/sec1.html)
# RAM : Random Access Memory
RAM的基础存储单元称为cell，Multiple RAM chips form Memory.
RAM 主要分为两类：
- **SRAM**（Static RAM，静态随机存取存储器）：用于构建Cache
- **DRAM**（Dynamic RAM，动态随机存取存储器）
### DRAM 与 SRAM 对比

| 特性       | DRAM             | SRAM          |
| -------- | ---------------- | ------------- |
| **电路结构** | 1个晶体管 + 1个电容 / 位 | 6个晶体管 / 位     |
| **数据保持** | 需要定期刷新状态         | 只要供电就能无限期保持状态 |
| **速度**   | 1x               | 10x           |
| **成本**   | 1x               | 100x          |
| **典型应用** | 计算机内存条           | CPU Cache     |

### DRAM 发展历程

自 1970 年 DRAM 问世以来，其物理结构并未发生根本性改变，性能提升主要依赖于**系统结构层面的改进**，包括：
- 更高密度的芯片集成
- 更快的访问协议，提升了一次读取数据的位宽
- 多通道并行访问技术

内存，芯片的时钟和总线的时钟是同步的。
# Locality of reference

分为时间局部性和空间局部性
![第10节 Memory Hierarchy__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC10%E8%8A%82%20Memory%20Hierarchy__2.png)

- 时间局部性：被引用过一次的内存位置很可能在不久的将来再被多次访问。
- 空间局部性：如果一个内存位置被引用了一次，那么程序很可能在不久的将来引用附近的一个内存位置。

# Storage technologies and trends 

## Nonvolatile Memory
非易失性存储器——断电后数据不丢失的存储技术

- Magnetic Disks 磁盘
- Flash Memory
![第10&11节 Memory Hierarchy__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC10%2611%E8%8A%82%20Memory%20Hierarchy__1.png)

## SSD(Solid State Disks)

Pages: 512kb ~4kb
Blocks:32 ~128 pages
快擦液写

写入多个小文件相比于写入一个大文件对SSD的伤害更大

# The memory hierarchy
![The Memory Hierarchy](https://xjtu-ics.github.io/textbook/notes/chapter6/image/chapter6-sec3-0.png)

## Cache

高速缓存是一个小而快速的存储设备，在搬运数据时以block为单位。

Data is copied in block-sized transfer units.

Cache的命中率一般在95%以上

### Cache Misses

如果发生了miss，需要从下一个存储器中将对应block取出来。

Placement Policy & Replacement policy

### 缓存缺失 (Cache Misses)

当数据不在缓存中时发生缺失，需从下一级存储器加载。缺失分为三种类型：

#### 1. 强制缺失 / 冷缺失
- **定义**：第一次访问该块时发生的缺失。
- **特点**：只要缓存大小有限，这种情况就无法完全避免。

#### 2. 容量缺失
- **定义**：缓存中虽有该块，但缓存已满，被替换后无法容纳刚访问的块。
- **特点**：随着缓存容量增加，此类缺失减少。

#### 3. 冲突缺失
- **定义**：多个不同的块映射到了缓存的同一个组中（组相联映射特有），导致相互替换。
- **特点**：通过增加关联度可以减少此类缺失。

### 缓存替换与放置策略
- **Placement Policy (放置策略)**：决定新块装入缓存哪个位置。
- **Replacement Policy (替换策略)**：缓存满时选择哪个旧块被替换。

![第10&11节 Memory Hierarchy__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC10%2611%E8%8A%82%20Memory%20Hierarchy__2.png)
  

