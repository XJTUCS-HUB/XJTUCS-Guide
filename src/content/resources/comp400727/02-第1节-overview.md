---
title: "第1节 Overview"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-03-17
order: 2
---
# 计算机系统导论
# Representing Program

在计算机中，二进制存储的信息映射到字符，系统中的所有信息都由一系列的bits代表。

How to distinguish?              Context!

# Translating Program

Mashing only execute instructions(low-level machine language)

- A binary disk file(called an executable object files)
![IMG_20260305_150640](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/IMG_20260305_150640.jpg)

## Preprocessing Phase

寻找预处理的头文件内容并插入到开头
## Compilation Phase

Translates the C to an assembly-language program.
## Assembly Phase

- Translates hello.s to machine-language instructions
- Package into relocatable object prgram
## Linker Phase

把编译过的代码整合到一起，节约空间和时间
## Executing Program

- Shell从键盘接收执行的指令
- 存储入内存
![IMG_20260305_152449](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/IMG_20260305_152449.jpg)
顺带一提：Buses(走线) 所有的数据都是以块的形式传输的 ，就像大巴一样.

## Memory Architecture
### Cache
和程序处理的速度紧密相关，是内存架构的很重要的一部分。
数据和指令放置在不同的Cache中（现代计算机**不是**冯诺伊曼结构）

## Operating System

Operating System is a layer between application and hardware
- **Protect** the hardware
- **Provide** applications with simple and uniform mechanisms

# Summary

- information = bits + context
- Memory is important.

