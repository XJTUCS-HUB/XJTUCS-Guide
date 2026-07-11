---
title: "第19节 Linking II： Static and Dynamic Linking"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 15
---
# 计算机系统导论 

# Libraries and Static Linking

**Library**：将常用函数打包，供程序员重复使用。
> package of commonly used functions.

## Old-fashioned Solution: Static Libraries

写程序中，经常会有许多被反复使用的基础函数，如果每次写程序都要把这些函数的源代码重新编译一遍，效率会非常低。
**Static library**（通常以 `.a` 为后缀，代表 archive）本质上是一个归档打包文件。其工作原理如下：

1. 链接器在遇到未定义的符号时，会按照指定的顺序在静态库（`.a` 文件）中搜索该符号。
2. 一旦在归档文件中找到定义该符号的成员（目标文件），链接器就会将该**目标文件**提取出来。
3. 链接器将提取出的代码和数据直接物理拷贝，合并到最终生成的可执行文件中。这一过程称为**链接时的重定位**。

由于每个程序都必须包含一份完整的库代码副本，这种老式方案会导致可执行文件体积急剧膨胀，空间浪费严重，且库的维护极其困难。

![第19节 Linking II Static and Dynamic Linking__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC19%E8%8A%82%20Linking%20II%20Static%20and%20Dynamic%20Linking__1.png)

**如何使用 Static Library？**
1. 链接器按**命令行中的顺序**扫描 `.o` 文件和 `.a` 文件（顺序至关重要）。
2. 维护一个“当前未解析引用”的列表。
3. 若扫描结束后仍有未解析的符号，则报错。

> ⚠ 如果先扫描库（解决方案）后扫描目标文件（问题），会导致符号遗漏。因此通常将库放在命令行的末尾，以避免依赖问题。

## Modern Solution: Shared Libraries

Static Library的问题：
1. Duplication in the stored executables
2. Duplication in the running executables
3. Relink！（维护困难，重构困难）
4. 几乎每个文件都会用到 libc，每个文件中都有 `printf or scanf`，那么对于静态链接，每个程序中都包含了一份库的代码

于是提出了Shared Libraries的概念：将linking的时间后移，Link的过程可以在load-time或者run-time的时候动态执行。

![第19节 Linking II Static and Dynamic Linking__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC19%E8%8A%82%20Linking%20II%20Static%20and%20Dynamic%20Linking__2.png)
![第19节 Linking II Static and Dynamic Linking__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC19%E8%8A%82%20Linking%20II%20Static%20and%20Dynamic%20Linking__3.png)

在链接阶段，编译器和链接器仅负责记录符号的引用位置和意图，真正的代码绑定被推迟到程序启动或运行时才完成。

![第19节 Linking II Static and Dynamic Linking__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC19%E8%8A%82%20Linking%20II%20Static%20and%20Dynamic%20Linking__4.png)

这种方式解决了“100个软件需要更新100次”的问题；采用共享库后，程序的文件体积可大幅缩减（例如 `prog2l` 仅约 8KB）。
符合系统工程中的“Lazy Loading”思路：**推迟一切不必要的工作，直到真正需要时才执行**。

还可以继续Lazy下去...

## Dynamic Linking at Runtime

Dynamic linking can also occur after program has begun

![第19节 Linking II Static and Dynamic Linking__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC19%E8%8A%82%20Linking%20II%20Static%20and%20Dynamic%20Linking__5.png)

**libvector.so** 的作用示例：运行时动态加载向量运算库。
那么，代价是什么呢？
RunTime！消耗运行时间。由于运行时需要额外链接，无疑降低了程序启动的速度。同时在一些对稳定性与安全性要求较高的场合，动态库往往也不是一个合适的选择。

---

# Share Libraries across Executables

假如要查找一个函数，例如printf，怎么到printf的地址呢？
**Naive Solution：Fixed Address（固定地址）**
不同的进程访问同一个代码，优点是“The addresses are fixed while loading”，缺点是浪费大量的虚拟空间，无法支撑之后的dynamic linking（不可拓展）

## Position-Independent Code（PIC）

实际采用的是**位置无关代码**，配合 GOT（Global Offset Table，全局偏移表） 和 PLT（Procedure Linkage Table，过程链接表） 实现地址无关的访问。当程序调用共享库函数时，通过 GOT 间接跳转，再经过 PLT 和动态链接器完成符号解析与重定位。现代系统还引入了**延迟绑定（Lazy Binding）** 优化，仅在函数第一次被调用时才执行符号解析，以减少启动开销。

![第19节 Linking II Static and Dynamic Linking__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC19%E8%8A%82%20Linking%20II%20Static%20and%20Dynamic%20Linking__6.png)

## Summary

Linking can happen at different times in a program’s lifetime:
1. Compile
2. load
3. run

# Example：Library Interpositioning

什么是Library Interpositioning？
>是一种运行时技术，通过**劫持（拦截）共享库函数调用**并替换为自定义实现，在不修改原程序或原库代码的情况下，实现对目标函数行为的监控、修改或增强。

这一段建议看[PPT](https://xjtu-ics.github.io/sp-2025/assets/slides/13-linking-library.pdf)
