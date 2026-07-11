---
title: "第20节 Operating System：History and Three Easy Pieces"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-07-02
order: 16
---
# 计算机系统导论 
# History of Operating Systems

>从汇编底层到用户级的计算机交互

**早期**：One batch job at a time 批处理机制，人类在进行任务调度

**1960s**: Operating System for Multitasking 第一次对于操作系统的尝试（AT&T随后退出），MULTICS很快失败

![第20节 Operating SystemHistory and Three Easy Pieces__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC20%E8%8A%82%20Operating%20SystemHistory%20and%20Three%20Easy%20Pieces__1.png)
（K&R中的R）
**1971** :Re-Architect UNICS -> UNIX

**1973之后**: 图形化尝试

**1990**: Should OS and Hardware Decouple? 
在这个时间点，微软和APPLE选择了两条道路。彼时也是Windows 3.0的首次发布。

**1990s**: Minix , Linux & Open Source Project

![第20节 Operating SystemHistory and Three Easy Pieces__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/07/%E7%AC%AC20%E8%8A%82%20Operating%20SystemHistory%20and%20Three%20Easy%20Pieces__2.jpg)

# Three Easy Pieces

## A running program executes instructions.

1. Fetch an instruction
2. Decode
3. Execute
4. Next instruction

## Operating System

### 1st Piece:Virtualization

Virtualization不等同于虚拟机

为什么不直接使用物理资源而是虚拟化？
More general, powerful and easy-to-use！

如何实现这一过程的？
#### System call

隔离和解耦上层的借口和下层的硬件，方便软件开发者工作。

>The OS manage resources such as CPU, memory and disk.

#### Virtualizing the CPU

系统由很多（seemingly infinite）的虚拟CPU，让每个program认为自己独享一个CPU，从而让多个program同时运行。

#### Virtualizing Memory

A program keeps all of its data structures in memory.

![第20节 Operating SystemHistory and Three Easy Pieces__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC20%E8%8A%82%20Operating%20SystemHistory%20and%20Three%20Easy%20Pieces__3.png)

实际上，每个进程拥有着“own private virtual address space”，这也就是OS的Virtualizing Memory。物理空间的共享管理就是通过OS的调度完成的。

### 2nd Piece: Concurrency

并发 != 并行 （并发的时间更宽泛，是在同一时间段进行的就算。）

### 3rd Piece: Persistence

为了持久化存储文件，硬件上需要硬盘，而软件上需要文件管理系统。

保证对数据的读写是可靠的？

# Summary

OS的迭代是一个持续化的进程。

![第20节 Operating SystemHistory and Three Easy Pieces__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC20%E8%8A%82%20Operating%20SystemHistory%20and%20Three%20Easy%20Pieces__4.png)![第20节 Operating SystemHistory and Three Easy Pieces__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC20%E8%8A%82%20Operating%20SystemHistory%20and%20Three%20Easy%20Pieces__5.png)
