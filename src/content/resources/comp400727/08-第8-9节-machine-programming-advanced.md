---
title: "第8&9节 Machine programming：Advanced"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 8
---
# 计算机系统导论 

- 全局变量不是存储在栈中的，而是在内存的data部分。
  - 已初始化的全局变量存储在`.data`段
  - 未初始化的全局变量存储在`.bss`段（Block Started by Symbol）

# Structures

## Structure Representation

Structure分配了一个足够大的内存块，编译器可以自动算出每一种数据对于结构体内存起点的偏移量。（每一个字段按照声明的顺序排序）


## Alignment Principles

>[!TIP]
>**任何K字节的基本对象的地址必须是K的倍数。**

对齐数据 (Aligned Data)
  - 基本数据类型需要B字节
  - 地址必须是B的倍数
  - 在 x86-64 架构上是建议的

对齐数据的动机 (Motivation for Aligning Data)
  - 内存通过 4 字节或 8 字节的块进行访问（具体取决于系统）
    - 加载或存储跨越四字边界（8 字节）的数据项效率低下
    - 加载或存储跨越缓存行（64 字节）的数据项效率低下。Intel 指出应避免跨越 16 字节边界。
    - 当数据项跨越 2 个pages（4 KB ）时，虚拟内存处理起来更加棘手

编译器 (Compiler)
  - 在结构体中插入间隙（填充）以确保字段的正确对齐
![Alignment within Structures](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec9-1.png)

![Alignment between Structures](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec9-2.png)

# Union

![Union Allocation](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec9-3.png)

可以观察到，一个联合的总大小等于它最大子段的大小，这是因为它内部的不同字段引用的是相同的内存。这就是联合与结构的最大区别。

应用场景：
- 节省内存空间（同一时刻只使用一种数据类型）
- 类型转换（如将浮点数的位表示解释为整数）

# x86-64 Linux Memory Layout

虽然是64位机器，但实际上只用到了47位内存。
![Assembly Code](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec10-0.png)

内存段分布（从高地址到低地址）：
- **内核内存**：保留给操作系统内核
- **栈**：局部变量、函数参数、返回地址，向下增长
- **共享库**：动态链接库
- **堆**：动态分配的内存（`malloc`等），向上增长
- **数据段**：`.data`（已初始化全局变量）和`.bss`（未初始化全局变量）
- **代码段**：可执行机器指令，只读

局部变量存储在栈中，而栈的内存分布在高位，所以如果看到内存地址是"0x00007ff"开头则可以初步判断是在栈中存储。

# Buffer Overflow

数组越界的结果是随机吗？

C语言不做数组越界处理，所以在数组越界是会出现很多意想不到的情况。包括访问到一些重要数据导致访问错误，以及访问到返回地址等等。
![Assembly Code](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec10-1.png)
*Result is System Specific*

栈帧结构（从高地址到低地址）：
1. 函数参数（由调用者压入）
2. 返回地址（`call`指令压入）
3. 保存的寄存器（如`rbx`）
4. 局部变量

>[!WARNING]
>`gets()`和`scanf()`函数由于Buffer Overflow的风险而不建议使用.

- call函数将返回地址存在栈顶
- rbx寄存器占8个字节
## Code Injection Attacks

![Assembly Code](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec10-4.png)

我们通过预先分析栈帧，就可以清晰的得知返回地址存在栈中的位置，通过溢出篡改那个地址的值，让他返回到我们设计好的注入代码的位置，就可以执行我们注入的代码了.

全世界第一个病毒“Internet Worm”，在attack lab中使用这个技巧！

*那么该如何避免Overflow呢？*

1. Avoid Overflow Vulnerabilities in Code
2. System-Level Protections Can Help
3. Stack Canaries Can Help

检测出数据是否被覆写，在创建栈帧的时候带上一只“金丝雀”

![第8&9节 Machine programmingAdvanced__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC8%269%E8%8A%82%20Machine%20programmingAdvanced__1.png)
