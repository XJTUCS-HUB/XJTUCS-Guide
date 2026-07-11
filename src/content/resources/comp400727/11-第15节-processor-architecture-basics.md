---
title: "第15节 Processor Architecture：Basics"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 11
---
# 计算机系统导论 

造一个CPU？

# Y86-64指令集

Y86 指令集体系集架构是一个‘山寨’版的 X86 指令集体系集架构，为了方便学习与简单的处理器设计，对 X86 指令集做了一些简化。

通过指令集架构，软件和硬件解耦，可以分别去做自己的事。
![第15节 Processor ArchitectureBasics__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC15%E8%8A%82%20Processor%20ArchitectureBasics__1.png)

虽然$2^4$可以表示16个寄存器，但实际上是由15个寄存器（每个64bits），最后一个F就表示没有寄存器，没有任何功能，在硬件设计中有用处。

## Instruction Set

简化后需要有什么指令？

![Y86 Instruction Set](https://xjtu-ics.github.io/textbook/notes/chapter4/image/chapter4-sec1-1.png)

对于变长指令集，我们通过读取第 1 字节的高 4 位得到指令代码（`icode`），低 4 位得到指令功能（`ifun`）。

* **i (Immediate)**: 立即数（8 字节）
* **r (Register)**: 寄存器（4 位 ID）
* **m (Memory)**: 内存操作数（基址寄存器 + 8 字节偏移量）

## Encoding Registers

寄存器编码使用 4 位（0~F）表示：

![第15节 Processor ArchitectureBasics__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC15%E8%8A%82%20Processor%20ArchitectureBasics__2.png)

### Addition Instruction

addq %rax,%rsi           Encoding: 60 06

### Move Instruction

![第15节 Processor ArchitectureBasics__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC15%E8%8A%82%20Processor%20ArchitectureBasics__3.png)

* 指令中的立即数和偏移量均采用小端序编码。
* 寄存器指示符 `rA` 和 `rB`：若不需要使用其中一个寄存器，对应字段填 `F`。

```asm
irmovq $0xabcd, %rdx         =   30 f2 cd ab 00 00 00 00 00 00 (30 为 icode+ifun; f 为无源寄存器; 2 为 %rdx; 后面为小端序的 0xabcd)

rrmovq %rsp, %rbx            =   20 43 (20 为 rrmovq; 4 为 %rsp; 3 为 %rbx)

mrmovq -12(%rbp),%rcx        =   50 15 f4 ff ff ff ff ff ff ff (50 为 mrmovq; 1 为 %rcx; 5 为 %rbp; 后面为 -12 的 8 字节补码小端序)

rmmovq %rsi,0x41c(%rsp)      =   40 64 1c 04 00 00 00 00 00 00 (40 为 rmmovq; 6 为 %rsi; 4 为 %rsp; 后面为 0x41c 的 8 字节小端序)
```

### Jump Instruction

![第15节 Processor ArchitectureBasics__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC15%E8%8A%82%20Processor%20ArchitectureBasics__4.png)

示例：[PPT](https://xjtu-ics.github.io/sp-2025/assets/slides/21-processor-basics.pdf)

## Status Conditions

处理器状态码（`Stat`）用于指示当前的执行状态：

* **`AOK` (1)**: Normal operation (正常运行)
* **`HLT` (2)**: Halt instruction executed (遇到 halt 指令，程序正常暂停)
* **`ADR` (3)**: Invalid address (遇到非法地址，如访问越界内存或非法指令地址)
* **`INS` (4)**: Invalid instruction (遇到未定义/非法的指令编码)

## Writing Y86-64 Code


```bash
git clone https://github.com/cmu-sei/y86-simulators.git
```
