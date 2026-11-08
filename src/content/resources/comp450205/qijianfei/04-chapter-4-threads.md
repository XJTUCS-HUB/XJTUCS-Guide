---
title: "Chapter 4 Threads"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 4
---
> 线程和进程需要联系和对比着学

进程和线程的区别：进程是系统资源分配的独立单位，而线程是可调度运行的独立单位。
## Overview

Web服务器很早就实现了多线程

![Chapter 4 Threads__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%204%20Threads__1.jpg)
> Code，Data，File和权限共享，而PC，寄存器和栈需要独立

**优点**：多线程是一个**轻量化**的实现，切换很方便；节约资源
A thread is called a light-weighed process

那么**代价**是什么呢？ 
	一个线程切换掉之后，并行的线程也会被终结（比如多个word文档，一个崩溃之后其他的也都需要关闭）

- CPU调度的是线程，资源调度的是进程
- 进程是线程执行的容器

多线程的架构示例
![Chapter 4 Threads__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%204%20Threads__2.jpg)

### 线程和进程对比

![Chapter 4 Threads__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%204%20Threads__3.jpg)

注意区别并发和并行

![Chapter 4 Threads__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%204%20Threads__1.png)

## Implementation of Thread

分为**内核线程**和**用户线程** Kernel-supported & User-level

### User-Level

线程管理通过用户级线程库实现，即API调用

线程上下文切换与调度也由库来完成

>[!NOTE]
>内核不知道用户级线程的存在

又可以分为：
1. 协作式线程 Cooperative
2. 抢占式线程 Preemptive

实际上很少使用协作式线程，因为存在恶意占用资源的风险，一般在资源限制的嵌入式系统中使用 or 所有代码都可信的情况。对于第三方代码和通用计算环境，一般用抢占式（目前大部分的操作系统使用）。

### Kernel-supported

使用内核资源，因此上下文切换昂贵，同时受到资源的限制
- 内核线程为用户线程提供了一个虚拟处理器，起到一个桥梁的作用

## Multithreading Models
### Model

按照User和Kernel之间的调用关系，可以分为多对一，一对一，多对多和Two-level Model

多级模型可支持多种绑定关系，更加灵活

具体见ppt
### Thread Library

线程库提供创建了管理线程的API

常见的：
- POSIX Pthreads(类Unix系统)
- Win32 Threads(Windows)
- Java Threads(JVM)

## Threading Issues

### Fork() & Exec()

在多线程程序中，fork() 和 exec() 系统调用的语义会发生变化，比如fork()可能仅复制调用的进程 0r 所有进程
### Thread Cancellation

- **异步撤销 Asynchronous cancellation**：一个线程立即终止目标线程。
- **延迟撤销 Deferred cancellation**：目标线程定期检查是否应该终止，并在运行到安全撤销点之后自行终止。

### Signal Handling

单线程和多线程的信号发送对象不同

### Threads Pool

创建线程需要时间和资源，所以把线程放入线程池等待任务

### Scheduler Activation

许多实现 M:M 模型或两级模型的操作系统，在用户线程与内核线程之间设置了一种中间数据结构——即轻量级进程LWP

upcall 回调在内核阻塞时触发，同时在LWP上执行

一个例子：
![Chapter 4 Threads__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%204%20Threads__2.png)

## Operating System Example

这一块笔记难以呈现，见ppt
