---
title: "第29&30节 Virtual Memory： Details"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 24
---
# 计算机系统导论 
# Simple memory system example

结合上节课介绍的Page结构：
![第29&30节 Virtual Memory Details__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC29%2630%E8%8A%82%20Virtual%20Memory%20Details__1.png)

相关的一些计算可以看[ppt](https://xjtu-ics.github.io/sp-2025/assets/slides/18-vm-details.pdf)上面的例子,很详细，这里不做过多介绍（But这节课是考试重点）
- VPO和PPO的地址是一样的，无需翻译（==Note！==），之后优化Cache可能用到

现在的流程是CPU->MMU->Cache
中间的过程还可以优化：

![第29&30节 Virtual Memory Details__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC29%2630%E8%8A%82%20Virtual%20Memory%20Details__1.jpg)
# Intel Core i7 Memory System

注意TLB是四路组相连，结构需要简单以满足“快”的需求
![第29&30节 Virtual Memory Details__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC29%2630%E8%8A%82%20Virtual%20Memory%20Details__2.png)

在实际使用时，虚拟地址使用48位，物理地址使用52位

![第29&30节 Virtual Memory Details__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC29%2630%E8%8A%82%20Virtual%20Memory%20Details__3.png)


