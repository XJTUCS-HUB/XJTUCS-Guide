---
title: "Chapter 2 Operating-System Structures"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 2
---
![Chapter 2 Operating-System Structures__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__1.png)
上图为操作系统涉及到的服务

### User Services

1. User Interface(命令行，GUI，Batch批处理)
2. Program execution
3. I/O operations
4. File-system manipulation
5. Communications
6. Error detection

![Chapter 2 Operating-System Structures__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__2.png)

共享内存的好处：传递信息更高效
>但是代价是临界资源的访问可能会发生冲突

Msg Passing可以减少冲突，但是可能会资源紧张

### User Interface
CLI的分支 multiple flavors implemented: **shells**
桌面系统的诞生 Xerox PARC 1973        User Friendly

### System Calls
一般通过API来进行系统调用，最常见的三种调用：
1. Win32
2. POSIX(类Unix，Linux，Mac OS X)
3. Java(JVM的API)

复制一个文件实际上进行了很多的系统调用，在操作系统的帮助下我们得以简化。

![Chapter 2 Operating-System Structures__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__3.png)

系统调用一般有一个维护的索引列表

![Chapter 2 Operating-System Structures__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__4.png)

### System Programs

系统工具，用于程序的开发等等

后面会涉及到详细的内容，这节课没有具体讲

### Design and implementation

系统调用是的参数传递是如何实现的？

1. **寄存器传递**：简单但当参数数量多于寄存器数量时无法使用。
2. **块/表传递**：参数存在内存的块/表中，将该块的**首地址**作为参数放入寄存器。
3. **栈传递**：参数被程序压入栈中，由操作系统弹出

C语言是针对操作系统实现的高效语言

## Operating System Structure

### Simple Structure

MS-DOS 轻量化的操作系统

![Chapter 2 Operating-System Structures__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__5.png)
自顶向下的层次设计，可以有效避免非法访问，同时也让操作简化

![Chapter 2 Operating-System Structures__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__6.png)

- 信息的封装和隐藏：封装之后只需要考虑前一层暴露出来的接口

接下来需要考虑的问题：
- How to layer?
- How many layers?

*Unix是聚内核的系统* ，随着发展越来越大，任何一个环节出现问题都可能导致系统崩溃
由此产生了：

### Microkernel System Structure

![Chapter 2 Operating-System Structures__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__7.png)

- Task scheduling
- Virtual memory management
- Interprocess communication

虽然微内核变得更加稳定，但是用户端的很多操作需要内核介入中转，导致**效率低下**
![Chapter 2 Operating-System Structures__8](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__8.png)
*运行非常的慢*

### Modules

Most modern operating systems implement kernel modules

Solaris模块化设计
![Chapter 2 Operating-System Structures__9](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__9.png)

### Hybrid Systems

MacOS X就属于混合系统，采用的是混合内核（Hybrid kernel）架构

### Virtual Machines

- 虚拟机将硬件和操作系统内核一并视作纯硬件。
- 虚拟机提供了一个与底层裸硬件完全一致的接口。
- 操作系统宿主机制造了一种假象，让进程以为自己拥有独立的处理器和（虚拟）内存。
![Chapter 2 Operating-System Structures__10](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%202%20Operating-System%20Structures__10.png)

## Operating System Generation

如何加载？   Bootstrap program

多系统如何选择需要的系统？ Boot Loader（比如GRUB）

代码存储在ROM里，需要加载到Memory中

这里一笔带过，后面会详细讲
