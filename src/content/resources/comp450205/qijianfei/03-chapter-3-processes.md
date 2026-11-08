---
title: "Chapter 3 Processes"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 3
---
>从第三章开始是课程的重点
## Process Concepts

- Batch system
- Time-shared systems

流水化作业等等都是为了提高并行化作业的效率。

并发执行的特点：
1. **间断性**：资源的竞争导致
2. **失去封闭性**：程序运行的相对速度、初始条件也会影响结果
3. **不可复现性**：同上

一个进程包括：
1. PC
2. stack
3. data section

![Chapter 3 Processes__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__1.png)

进程与程序的关系：
- **程序**是**被动** 的，是存放在磁盘上的可执行文件。
- **进程**是**主动** 的，是拥有程序计数器（PC）和系统资源的运行实体。
- 一个程序可以对应多个进程（例如多次打开同一个浏览器）。

```
进程实体 = 程序段 + 相关的数据段 + PCB
```

进程是资源分配的基本单位（线程是CPU调度的基本单位）

## Process State

![Chapter 3 Processes__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__2.png)

什么情况下会中断？
- 更高优先级的进程
- 分时系统带来的时间限制（时钟中断）
- 其他进程带来的状态切换

什么时候会等待？
>Waiting实际上是一种资源的主动让出（例如：等待 I/O 设备就绪、等待子进程结束）

![Chapter 3 Processes__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__6.png)
## PCB：Process Control Block

了解即可

包含以下核心信息：
1. **Process state**
2. **Program counter**
3. **CPU registers**
4. **CPU scheduling information**：进程优先级、调度队列指针等
5. **Memory-management information**：页表或段表信息
6. **Accounting information**：CPU使用时间、时间限制等
7. **I/O status information**

## Process Scheduling Queues

![Chapter 3 Processes__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__4.png)

- **Job queue**：系统中所有进程的集合。
- **Ready queue**：驻留在内存中、准备就绪并等待分派 CPU 的进程。
- **Device queues**：因等待特定 I/O 设备而阻塞的进程队列。

### Schedulers

分为短期（CPU）、中期、长期（job）调度

程序可以根据其涉及到的**操作频次**分为：
1. I/O-bound process  （比如编辑word文档）
2. CPU-bound process （比如matlab的编译）

### Context Switch

上下文中包含着大量的内容，包括寄存器的值，进程状态，内存管理的信息等，所以上下文的切换也尤为重要。
![Chapter 3 Processes__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__5.png)

思考：
- 时间片的大小会如何影响进程的运行？
- 上下文切换有开销，如何减小开销呢？

1. 时间片小的话，运行的响应会更快，但是上下文切换的开销会更大（Context-switch time is overhead）

2. 减少开销是一个工程，可以从体系架构和软件结构入手；比如改用多线程代替多进程等等，留给之后探索。

### Concept

摘自PPT上的QA

- 进程创建的过程包括：①申请空白PCB；②为新进程分配资源；③初始化进程控制块；④如果进程就绪队列能够接纳新进程，便将新进程插入就绪队列
- 一个进程被唤醒意味着进程由阻塞态转换为就绪态

## Process

父进程创建子进程，并等到子进程执行完之后再执行

Resource sharing：
1. 嵌入式系统 Parent and children share all resources
2. Unix系统     Children share subset of parent’s resources
3. Windows系统  Parent and child share no resources

![Chapter 3 Processes__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__7.png)
这一段内容在ICS中亦有讲解

- 创建子进程之后，子进程中修改变量后，只有文件指针（共享内存）会导致父进程中也会作出相应的改动
- 返回值会传递给父进程

### Process Creation & Execution

#### Unix
fork()将进程复制一份，子进程的fork()返回0，父进程的pid不变
exec()用新程序来重写当前进程，pid不变

### Process Termination

父进程需要对子进程的资源释放负责，否则会出现僵尸进程

Cascading termination：父进程结束后强制终止对应的子进程

### Process Blocking and Wakeup
![Chapter 3 Processes__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__1.jpg)

按照上面的定义进程可以分为五种/七种状态
- 进程从内存到硬盘是挂起，反之是激活状态

挂起状态实际上是过去硬件内存紧张时的必要的妥协，现在并不是必要的

### Interprocess Communication（IPC）

跨进程通讯：
- Information sharing
- Computation speedup
- Modularity
- Convenience
![Chapter 3 Processes__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%203%20Processes__2.jpg)
共享内存？临界资源的并发访问可能出现问题，读写冲突
交流传递？通过send/receive的系统调用建立通路

## Message Communication  

消息传递系统允许进程在不共享地址空间的情况下进行通信和同步

### 1. 通信链路的命名方式

Direct Communication   进程必须显式命名通信的接收者或发送者

  **对称寻址**：
    - send(P, message)
    - receive(Q, message)
  **非对称寻址**：
    - receive(id, message)：从任何进程接收消息，变量 id设为发送消息的进程名。
  
**缺点**是模块化程度较低
若更改进程名称，必须修改所有相关的通信代码

Indirect Communication：消息通过Mailbox或Port进行发送和接收

  每个邮箱都有唯一的 ID，只有共享同一个邮箱的进程才能通信。

### 2. 同步方式

消息传递可以是**阻塞Blocking**或**非阻塞Non-blocking**的：

- **Blocking send**：发送进程被阻塞直到消息被接收进程或邮箱接收
- **Blocking receive**：接收进程被阻塞直到有消息可用
- **Non-blocking send**：发送进程发送消息后，立即恢复操作
- **Non-blocking receive**：接收进程检索到一个有效消息，或检索到空消息

> 当 send 和 receive都是阻塞的时，发送方和接收方之间就发生了一个**会合**


