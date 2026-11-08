---
title: "Chapter 5 CPU Scheduling"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 5
---
>第五章每年必出一道大题

## Basic Concept

### I/O Cycle

CPU的执行周期和I/O的等待周期是交错的
- 大部分的CPU周期是短周期，少量CPU周期是长周期
- I/O密集型进程CPU区间短而频繁，CPU密集型进程CPU区间长而稀少，调度需兼顾两者
### Scheme
就绪的程序处于就绪队列里面，等待CPU的调度 见[Chapter 3 Processes](03-chapter-3-processes#process-state)

**抢占式**与**非抢占式**的逻辑贯穿整个系统设计
![Chapter 5 CPU Scheduling__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__1.jpg)

### Dispatcher

调度程序的工作包括：
- 切换上下文
- 切换到用户模式
- 跳转到程序中的正确位置

调度延迟 dispatch latency：停止当前进程并启动另一个进程所需的时间

## Scheduling Criteria

用来评判CPU调度效率的指标
- CPU利用率
- 吞吐率
- 周转时间，等于等待时间与执行时间之和
- 等待时间
- 响应时间，即从提交请求到生成第一个响应所需的时间


## Scheduling Algorithms

### FCFS 先来先服务

请求CPU的进程按到达顺序依次分配到CPU上，实现简单但平均等待时间很长

一个长进程先到达时，后面的短进程都要长时间等待，这种现象称为**护航效应 Convoy Effect**
### SJF 短作业优先
选取下一个CPU区间最短的进程进行调度，平均等待时间最优
- Nonpreemptive 当前进程执行完毕后才调度新到达的更短进程
- Preemptive 即最短剩余时间优先SRTF，新进程的CPU区间小于当前进程的剩余时间时立即抢占
实际上无法预知下一个进程的运行时间，只能用历史数据预测，采用**指数平均法**：
$$
\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n
$$
$t_n$为第$n$个CPU区间的实际长度，$\tau_n$为预测值，$\alpha$决定新旧信息的权重，$\alpha=1$时只看最近一次，$\alpha=0$时只看历史

### Priority Scheduling

每个进程关联一个优先级编号，CPU按照优先级进行分配，SJF可看作以CPU区间长度为优先级的特例
低优先级进程可能永远得不到执行，产生**饥饿 Starvation**，解决方案为**老化 Aging**，随等待时间增加逐步提高优先级

- 降低CPU密集型进程的优先级
- 提高被阻塞进程的优先级
- 提高线程在I/O完成时的优先级

### HRRN 高响应比优先

非抢占式，每次选取响应比最高的进程
$$响应比 = \frac{等待时间 + 执行时间}{执行时间}$$
等待越久响应比越高，兼顾短作业与长作业，避免饥饿

### Round Robin 轮转

每个进程获得一块时间片，时间片结束后进程被抢占并回到就绪队列尾部
![Chapter 5 CPU Scheduling__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__1.png)

通常周转时间高于SJF，但响应速度更快

时间片选取需要权衡：过长退化为FCFS，过短则浪费在上下文切换上。经验上取80%的CPU区间短于时间片为宜

### Multilevel Queue 多级队列

就绪队列分为多个队列，队列之间分配不同的优先级，将具有不同CPU占用特征的进程分离

![Chapter 5 CPU Scheduling__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__2.png)

- 队列间可采用固定优先级抢占调度，低优先级队列可能饥饿
- 也可在各队列间划分时间片比例，保证每个队列都有执行机会

一种例子：
![Chapter 5 CPU Scheduling__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__4.png)

### Multilevel Feedback Queue 多级反馈队列

多级队列中进程固定属于某个队列，多级反馈队列允许进程在队列之间移动
- 新进程进入最高优先级队列
- 时间片用完仍未完成则降入下一级队列，最低队列按FCFS执行
- 长时间等待的进程可被提升到更高优先级队列

兼顾响应时间与吞吐率，是最通用也最复杂的调度算法

### Compare

![Chapter 5 CPU Scheduling__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__3.png)

静态优先级的低优先级进程容易被饿死

### 调度分类

- 长程调度：决定哪些作业被装入内存，控制多道程序度，执行频率低
- 短程调度：即CPU调度，决定就绪队列中哪个进程获得CPU，执行频率高
- 中程调度：将进程暂时换出内存，需要时再换入

![Chapter 5 CPU Scheduling__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__5.png)

### 相关计算

>考试也是这种类型

![Chapter 5 CPU Scheduling__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__6.png)

周转时间 = 完成时间 - 提交时间
带权周转时间 = 周转时间 / 执行时间
等待时间 = 周转时间 - 执行时间

![Chapter 5 CPU Scheduling__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__7.png)

## Thread Scheduling

Distinction between user-level and kernel-level threads
- PCS 进程竞争范围
	由**线程库**调度，调度ULT用户级线程，在LWP上运行
- SCS 系统竞争范围
	由**操作系统内核**调度，调度KLT内核级线程，在整个系统范围内竞争

分为多对一模型，多对多模型和一对一模型

API 允许在创建线程时指定 PCS 或 SCS

==🔴本章最难的题目就在这一块==
![Chapter 5 CPU Scheduling__8](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__8.png)
具体分析过程可以跟着ppt走一遍，感觉很有必要

## Multiple-Processor Scheduling

情况很复杂

可分为非对称多处理AMP与对称多处理SMP
SMP中，所有进程在共有的就绪队列中

>这一块了解即可

## Real-time Scheduling

本章节奏较快，仅记录要点
在实时系统中，系统的正确性不仅取决于逻辑结果，还取决于产生结果的时间
- 硬实时系统：任务必须在截止期限前完成
- 软实时系统：尽量保证关键任务优先

事件延迟：从事件发生到事件得到服务的这段时间

>[!NOTE]
>大多数RTOS执行基于优先级的抢占式任务调度，高优先级等于高响应需求

嵌套抢占
![Chapter 5 CPU Scheduling__9](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__9.png)

- **RMS 速率单调调度**：静态优先级，周期越短优先级越高，优先级在任务创建时固定
- **EDF 最早截止时间优先**：动态优先级，截止时间越早优先级越高，理论上是可调度性最优的算法

## Operating Systems Examples

### Solaris scheduling
- Real time
- System
- Interactive
- Time sharing

为了用户体验，交互类为窗口程序提供更高优先级
Real time类的线程拥有最高优先级

### Windows XP

![Chapter 5 CPU Scheduling__10](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__10.png)

Windows内核共32个优先级，0～31，数字越大优先级越高，其中16-31为实时级别，内核不会动态降级

进程在创建时被赋予一个优先级
**线程**在类中具有相对优先级

调度的是线程而不是进程（尽管进程也授予了优先级），具有相同优先级的线程按照轮转策略进行调度

![Chapter 5 CPU Scheduling__11](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__11.png)


### Linux Scheduling

是一个典型的分时系统（为用户共用而设计的）
在设计时就分为time-sharing and real-time（分时和实时）

## Algorithm Evaluation

只能通过仿真的方法来比较

Deterministic modeling
Queueing models

## Conclusion

1. 在抢占调度中，有哪些抢占原则？
	(1)  **时间片原则**。在轮转算法中，CPU轮流为诸多进程服务，每个进程运行完自己的时间片后，系统就将它的CPU抢占过来，交给下一个进程使用。
	(2)  **优先级原则**。为紧迫的作业赋予较高的优先级，这种作业到达系统，或者由阻塞状态被唤醒后，若其优先级高于当前运行的进程的优先级，可以抢占其CPU。
	(3)  **短作业**（进程）优先原则。若一个作业（进程）到达系统，其运行长度比当前运行的进程长度明显的短，则抢占它的CPU
2. 调度算法
	(1)  批处理系统适合的调度算法有：先进先出（FIFO）、短进程优先（SPF）、优先级调度（PRI）和高响应比优先（RF）。==🟢除了轮转基本都可以==
	(2)  分时系统适合轮转法（RR）调度。
	(3)  实时系统中适合的算法：优先级调度。
![Chapter 5 CPU Scheduling__12](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__12.png)
