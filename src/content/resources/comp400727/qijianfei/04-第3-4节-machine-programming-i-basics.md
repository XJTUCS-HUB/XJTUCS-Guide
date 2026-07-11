---
title: "第3&4节 Machine Programming I： Basics"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-03-18
order: 4
---
# 计算机系统导论 
# Intel processors and architectures

## Intel x86 Processors

### Evolutionary design

- Backwards compatible up until 8086(introduced in 1978)
- 随着时间发展添加了不同的特性，所以Intel使用的x86架构指令集中有多种格式的许多不同指令，为了满足兼容性显得有些臃肿。

### x86 is a Complex Instruction Set Computer(CISC)

- Complex其实最早是一部分intel黑为了攻击Intel x86的复杂性的贬义词（笑）
- 与之相反的是 Reduced Instruction Set Computer(RISC)，主张"_very few_ instructions, with _very few_ modes for each"

发展的历程建议看ppt，这里不详细列出了.
![IMG_20260312_151842](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/IMG_20260312_151842.jpg)

## x86 Clones:Advanced Micro Devices(AMD)

AMD YES？

刚开始是Intel技术的追随者，主打性价比。

1996年，AMD收购了芯片设计公司NexGen，打破了Intel在处理器市场的垄断局面.

2003年，开发出**x86-64**（即**AMD64**） 历史的一步，64位同时兼容32位程序。

不过故事并没有结束，在AMD收购了合作伙伴NVIDIA在 GPU 领域的死对头 ATI之后，NVIDIA一怒之下转向Intel，而Intel也在2006年推出新一代处理器Core 2以及4核CPU，重新占据主导地位。

近年来，TSMC成为世界领先的半导体晶圆厂，Intel再次落后。

2017年3月，AMD以Zen架构为核心的锐龙（Ryzen）系列处理器正式发行，迅速抢占CPU市场份额。此后，AMD在CPU和GPU市场双线作战，Zen架构的持续迭代和性能进步显著，在纸面参数上超越英特尔十代酷睿处理器，动摇了英特尔在CPU市场的长期霸权。（来自[Textbook](https://xjtu-ics.github.io/textbook/notes/chapter3/sec1.html)）
# Assembly Basics: Registers,operands,move

## Levels of Abstraction
C programmer       -        Assembly programmer       -      computer designer
计算机使用了很多形式的抽象
## Definitions

**Architecture**/**ISA** 也就是指令集架构，用来定义机器级程序的格式和行为。 它定义了处理器状态、指令的格式，以及每条指令对状态的影响。
Machine code 机器语言
Assembly code 汇编语言

![Pasted image 20260317102931](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Pasted%20image%2020260317102931.png)
- if/while等语句中的条件判断是通过状态码(condition codes)实现的；
- **Program Counter**（即PC），程序计数器

## Assembly Data Types

- Integer : 1,2,4,8 bytes
- Floating point data :4,8,10 bytes
- 没有数列之类的数据结构，使用栈来实现

## Machine Instruction procession

上课来不及记录，而且[Textbook](https://xjtu-ics.github.io/textbook/notes/chapter3/sec2.html)里写的很好，这里就不细说了。

## x86-64 Integer Registers
详细表见[Reference Sheet](https://xjtu-ics.github.io/sp-2026/assets/files/x86-64-reference.pdf)
![Pasted image 20260317104952](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Pasted%20image%2020260317104952.png)

灰色框里是对应的32位寄存器编号。
## Moving Data

格式`movq Source,Dest`（q代表2的4倍，8个字节）
可以移动的数据：
1. Immediate(立即数)：$开头，1/2/4字节编码
2. Register：上图所示的16个寄存器中数据
3. Memory：从寄存器给出的地址开始，连续 **8** 个字节的内存（如`（%rax）`，要加括号）
![Pasted image 20260317111728](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Pasted%20image%2020260317111728.png)

> [!TIP]
> 本课程使用 **AT&T** 风格语法，这是 GCC、OBJDUMP 等工具的默认格式；不同于 Microsoft 或 Intel 官方文档使用的 **Intel** 格式。

### 寻址模式 (Addressing Modes)

立即数寻址：如 `$val`
寄存器寻址：如 `%rax`
简单寻址：`(Rb)` $\rightarrow \text{Mem}[\text{Reg}(Rb)]$
位移寻址 (Displacement)：`D(Rb)` $\rightarrow \text{Mem}[\text{Reg}(Rb) + D]$
完整寻址模式：`D(Rb, Ri, S)` $\rightarrow \text{Mem}[\text{Reg}(Rb) + S \cdot \text{Reg}(Ri) + D]$
    **D**: 位移量 (Constant displacement)
    **Rb**: 基址寄存器 (Base register)
    **Ri**: 变址寄存器 (Index register)
    **S**: 比例因子 (Scale factor: 1, 2, 4, 或 8)

## Assembly Operations

主要包括数据传送、算术运算和逻辑运算。

详细操作见下节。

# Arithmetic & logical operations 

## 常用指令

（不需要背）[Reference Sheet](https://xjtu-ics.github.io/sp-2026/assets/files/x86-64-reference.pdf)会提供

| 指令 | 效果 | 描述 |
|------|------|------|
| `leaq S, D` | D ← &S | 加载有效地址 |
| `incq D` | D ← D + 1 | 加1 |
| `decq D` | D ← D - 1 | 减1 |
| `negq D` | D ← -D | 取负 |
| `notq D` | D ← ~D | 按位取反 |
| `addq S, D` | D ← D + S | 加法 |
| `subq S, D` | D ← D - S | 减法 |
| `imulq S, D` | D ← D * S | 乘法 |
| `xorq S, D` | D ← D ^ S | 异或 |
| `orq S, D` | D ← D \| S | 或 |
| `andq S, D` | D ← D & S | 与 |
| `salq k, D` | D ← D << k | 左移 |
| `shlq k, D` | D ← D << k | 左移(同sal) |
| `sarq k, D` | D ← D >>ₐ k | 算术右移 |
| `shrq k, D` | D ← D >>ₗ k | 逻辑右移 |

> [!NOTE]
> leaq（Load Effective Address）指令实际上不访问内存，只是计算地址。常用于算术运算，如 `leaq 7(%rdi,%rdi,4), %rax` 可实现 `rax = 5*rdi + 7`。
  
![Pasted image 20260317115054](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Pasted%20image%2020260317115054.png)

