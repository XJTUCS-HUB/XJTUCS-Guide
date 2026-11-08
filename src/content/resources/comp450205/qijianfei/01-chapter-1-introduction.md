---
title: "Chapter 1 Introduction"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 1
---
# What Operating System do

"manager"：OS是计算机的资源分配者
计算机架构可以分成四类：
1. Hardware
2. Operating system
3. Application programs
4. Users

![Chapter 1 Introduction__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%201%20Introduction__1.jpg)![Chapter 1 Introduction__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%201%20Introduction__2.jpg)
- Bus：Allow devices both inside and attached to the system unit to communicate

## Computer-System Design & Architecture
### 中断处理

中断可以分为三种：
程序的中断，时钟的中断，I/O的中断
![Chapter 1 Introduction__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%201%20Introduction__1.png)

### I/O

I/O 可以分为：
- Synchronous
- Asynchronous

### Storage-Device Hierarchy

可以参考ICS讲的内容

### Multiprocessor System

存在对称与非对称结构，非对称结构将用户的输入隔离开，而对称结构相对来说更安全
![Chapter 1 Introduction__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%201%20Introduction__2.png)

### Multicore

CMP ----Chic Multi-Processing芯片多处理技术
- Shared Cache
- Shared I/O Interface
- Shared data packet

## Types of Operating System

- Simple Batch processing system
- Multiplied Batch processing system
- Time-sharing system
- Real time system 可分Hard/Soft
- Network operating system
- Parallel Systems
- Distributed system

在分时系统中，怎么设计时间片的划分？
![Chapter 1 Introduction__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%201%20Introduction__3.png)

