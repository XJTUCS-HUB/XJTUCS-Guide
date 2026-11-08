---
title: "Chapter 6 Process Synchronization"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 6
---
> 最难的一章

## Background

并发访问可能导致数据不一致

Race 执行结果和执行顺序有关，所以我们需要互斥访问
![Chapter 6 Process Synchronization__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__1.png)

三个解决问题相关概念
- 临界区 Critical-Section
- 软件和硬件解决方法
- 原子事务

## Critical-Section

不能有一个以上的进程在临界区执行，每个进程必须在 entry section 请求进入权限，并在 exit section 退出
![Chapter 6 Process Synchronization__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__2.png)
- Mutual Exclusion 互斥
- Progress liveness 有空让进
- Bounded Waiting 有限等待

实现方式
1. 可以定义一个 bool 值 inside，默认为 false，enter 时定为 true
	**存在问题**：inside 为 false 时，线程 0 可能会完成 while 条件检查，但随后线程 1 可能会在线程 0 将 inside 设置为 true 之前调用 CSEnter
2. 定义一个 bool 值 inside[i]，默认为 false
	**存在问题**：在运气不好的情况下，最坏调度下两个线程都可能会陷入死循环等待，其中线程 0 紧盯着线程 1，而线程 1 紧盯着线程 0
3. 设置一个轮换变量 _turn_，初始值为 **1**
	**存在问题**：除非线程 0 先进入，否则线程 1 无法进入，反之亦然。但实际情况可能是一个线程需要多次进入临界区，而另一个线程进入次数较少，违背空闲让进原则

临界资源**三个关键点**
1. 想不想访问
2. 能不能访问
3. 唯一性标识

## Peterson’s Solution

![Chapter 6 Process Synchronization__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__3.png)要求两个进程共享两个数据项 flag 和 turn，每次改动之后 turn 变更

### Dekker 算法

第一个针对双进程互斥的纯软件正确解决方案，通过标志变量 flag 和轮换变量 turn 协同控制。

**举手放手核心机制**
1. 将 flag[i]设为 true，表明想进入临界区
2. 若发现对方也在举手：
   - 检查 turn，若轮次属于对方，则主动放手把 flag[i]设为 false，解除死锁条件并循环等待
   - 轮到自己时重新举手并将 flag[i]设为 true
1. 退出临界区后将turn移交对方，并将flag[i]置为 false

```c
flag[i] = true;
while (flag[j]) {
    if (turn != i) {
        flag[i] = false;        // 主动放手谦让
        while (turn != i) {     // 等待轮到自己
            // 忙等待
        }
        flag[i] = true;         // 重新举手
    }
}

turn = j;                       // 交出优先权
flag[i] = false;                // 退出并放手
```

> **【提示】**
> Dekker 算法在冲突时通过撤销自身意图并主动退让来解开死循环；Peterson 算法则始终保持举手意愿，仅靠设置谦让标记 turn 决定先后

## Synchronization Hardware

许多系统为临界区代码提供硬件支持
引入一个 lock，可以通过**禁用中断**用于单处理器，以及**软件方法**与**硬件指令**

### TestAndSet Instruction
![Chapter 6 Process Synchronization__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__5.png)
### Swap Instruction
![Chapter 6 Process Synchronization__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__4.png)

问题是 while 循环在等待释放资源的时候，会一直消耗 CPU 资源，这种情况称为**忙等**

如何实现无忙等待？
```c
AcquireLock() {
    while (TestAndSet(&lock)) {
        add this TCB to wait queue q;
    }
}

// 临界区

Release() {
    *lock = false;
    remove one thread t from q;
    wakeup(t);
}
```

原子操作与禁用中断

## Semaphore

一个特殊的整数变量
==🔴考试的一个小题：==
![Chapter 6 Process Synchronization__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__6.png)
- 自旋锁：一直占用 CPU 的时间片去循环获取锁，直到获取到为止。
- 非自旋锁：当前线程进入阻塞，CPU 可以去执行其他进程，等待被唤醒后线程才重新获取锁。
死锁：多个线程操作同一个信号量可能导致死锁

### Mutual exclusion using semaphore
互斥信号量 mutex 初始值为 1

### Synchronization using semaphore
同步信号量初始值为 0
![Chapter 6 Process Synchronization__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__7.png)
如此可以实现 C1 在 C2 之前发生
![Chapter 6 Process Synchronization__8](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__8.png)

## Classic Problems of Synchronization

### Bounded-Buffer Problem

比较典型的比如 Producer-Consumer 问题
同步问题：有的时候要先放才能取，而有时候如果 buffer 满了要先取才能放
- mutex 初始化为 1，用于互斥访问缓冲区
- full 初始化为 0，记录已占用的缓冲区格数
- empty 初始化为 N，记录空闲的缓冲区格数

```c
// 生产者进程结构
do {
    // 生产一个数据项 item
    
    P(empty);    // 等待空位
    P(mutex);    // 进入临界区
    
    // 将 item 放入缓冲区 buffer
    
    V(mutex);  // 离开临界区
    V(full);   // 增加满位计数
} while (true);

// 消费者进程结构
do {
    P(full);     // 等待满位
    P(mutex);    // 进入临界区
    
    // 从缓冲区 buffer 取出数据项 item
    
    V(mutex);  // 离开临界区
    V(empty);  // 增加空位计数
    
    // 消费该数据项 item
} while (true);
```

> **【注意】注意事项**
> wait(empty/full)与 wait(mutex)的次序不可颠倒。若先申请 mutex 再申请资源信号量，当缓冲区满或空时，进程持有互斥锁进入阻塞，会导致死锁。

### Readers-Writers Problem

读者之间不需要互斥访问，写者之间需要互斥访问，且读者和写者之间需要互斥访问，没有同步的问题

- Rmutex初始化为1
- Wmutex初始化为1
- readcount初始化为0

是一个嵌套的问题

![Chapter 6 Process Synchronization__9](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__9.png)

### Dining-Philosophers Problems

哲学家吃饭问题

- chopstick [n] 初始化为 1

AND 思路：同时申请左手和右手的筷子

### Discussion about Semaphores

==🔴常考的题目：在某种状态下状态量的值是多少==
![Chapter 6 Process Synchronization__10](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__10.png)

> **【注】口诀**
> 互斥在一边，同步分两边

## Monitors 管程

#### 为什么需要管程

在管程出现前，并发控制主要依赖信号量等原语。使用信号量时，$P$和 $V$操作分散在各个进程的代码中：

- 如果遗漏 $P$ 操作，会导致互斥失效、数据被并发破坏
- 如果遗漏 $V$ 操作或顺序颠倒，会导致死锁

管程通过**面向对象的封装思想**解决这一问题：一个管程定义了一个数据结构和能为并发进程调用的在该数据结构上的一组操作过程，这组互斥操作的过程，能同步进程和改变管程中的数据。

> 使用锁实现互斥，使用条件变量实现顺序执行

生产者消费者的例子
![Chapter 6 Process Synchronization__11](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__11.png)![Chapter 6 Process Synchronization__12](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__12.png)

哲学家吃饭问题也在ppt上面有例子

#### 例题：
![Chapter 6 Process Synchronization__13](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__13.png)

某银行提供2个服务窗口和10个供顾客等待的座位。顾客到达银行时，若有空座位，则到取号机上领取一个号，等待叫号。取号机每次仅允许一位顾客使用。当营业员空闲时，通过叫号选取一位顾客，并为其服务。
请添加必要的信号量和PC操作，实现上述过程

分析：两级的生产者-消费者问题，request buffer = 2
![Chapter 6 Process Synchronization__14](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%206%20Process%20Synchronization__14.png)
请求座位->取号->请求服务->寻找营业员

## Synchronization Examples

依旧来不及记，看ppt
### Solaris

实现各种锁以支持多任务、多线程(包括实时线程)和多处理

**自旋锁**是有忙等待的一种，一般在**多处理器系统**上使用，多处理器不能使用禁用中断

### Linux Synchronization

现在的Linux内核是完全抢占式，提供信号量和自旋锁

### Pthreads Synchronization

Pthreads API is OS-independent

### Java Synchronization

为了解决锁所有权问题，除了拥有锁之外，每个对象还有一个等待集（需要检查条件）

notifyAll()把所有等待集中的线程放入进入集，看哪一个能够匹配对象的条件
