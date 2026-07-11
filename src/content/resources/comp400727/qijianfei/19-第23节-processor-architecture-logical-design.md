---
title: "第23节 Processor Architecture：Logical Design"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 19
---
# 计算机系统导论 

接第15节课内容

# CISC & RISC

可以参考之前的笔记[第3&4节 Machine Programming I： Basics](../04-第3-4节-machine-programming-i-basics/)

# Logic Design

如何把电子信号转换为逻辑

通过逻辑门实现，之后通过组合电路集成逻辑门

![第23节 Processor ArchitectureLogical Design__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC23%E8%8A%82%20Processor%20ArchitectureLogical%20Design__1.png)

Hardware Control Language (HCL)

[第4章 可编程逻辑器件](../../eelc400105/04-第4章-可编程逻辑器件/)

## Bit-Level & Word-Level Multiplexor

首先我们可以构建一位的多路选择器

![第23节 Processor ArchitectureLogical Design__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC23%E8%8A%82%20Processor%20ArchitectureLogical%20Design__2.png)

进而构建并行的多位多路选择器，得到Word-Level Multiplexor

![第23节 Processor ArchitectureLogical Design__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC23%E8%8A%82%20Processor%20ArchitectureLogical%20Design__3.png)

```
int Out =[
	s : A;
	1 : B;
];
```

接下来是一些常见的组合电路分析，但是具体如何使用呢？

学科交融这一块
## Store 1 Bit

通过双稳态元器件来实现存储0和1，详见[第3章 时序逻辑电路](../../eelc400105/03-第3章-时序逻辑电路/#3.2%20%E6%97%B6%E5%BA%8F%E7%94%B5%E8%B7%AF%E7%9A%84%E5%8F%8C%E7%A8%B3%E6%80%81%E5%85%83%E4%BB%B6)

![第23节 Processor ArchitectureLogical Design__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC23%E8%8A%82%20Processor%20ArchitectureLogical%20Design__4.png)

这里就不展开了，数电课上都讲过。
