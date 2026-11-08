---
title: "Chapter 7 Deadlocks"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-08
order: 7
---
## The Deadlock Problem

产生的原因：资源竞争且并发进程的提前顺序不正确导致互相竞争

当以下四个条件**同时满足**时，系统中才会产生死锁（必要条件）：
1. 互斥
2. 占有并等待
3. 非抢占
4. 循环等待
## System Model

Each resource type $R_i$ has $W_i$ instances.

实例化资源的流程：申请->使用->释放

资源分配图：
![Chapter 7 Deadlocks__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207%20Deadlocks__1.png)
并不是资源分配图中含有循环圈就会产生死锁（多实例情况）
## Methods For Handling Deadlocks

确保系统永远不会死锁：Deadlock prevention & Deadlock avoidance
回退：Deadlock detection and recovery
忽略问题并假装没有死锁：鸵鸟策略Ostrich  policy（大部分系统使用）

### Deadlock Prevention
限制可以发出请求的方式，使至少一个死锁的必要条件不会发生

上课时介绍了针对四个必要条件分别的打破方法。比如哲学家吃饭问题就是对“占有并等待”的打破。

### Deadlock Avoidance
**动态地**检查资源分配状态，以便确保循环等待条件不能成立（不限制申请资源）

系统在进行资源分配之前，先计算资源分配的安全性，只有安全状态会分配资源
安全状态：至少存在一种安全序列避免死锁

#### 安全状态与安全序列

若系统存在进程序列 $\langle P_1, P_2, \dots, P_n \rangle$，使得对任一进程 $P_i$，其后续最大需求均能由**当前空闲资源加上所有前驱进程 $P_j$ 持有的资源**满足，其中 $j < i$，则系统处于**安全状态**，该序列称为**安全序列**。

$$ \text{Need}_i \le \text{Available} + \sum_{j=1}^{i-1} \text{Allocation}_j$$


- **等待前驱**：若当前空闲资源不够，$P_i$ 挂起等待前面的进程执行完毕
- **推进执行**：前驱进程运行完毕并归还资源后，$P_i$ 拿齐资源运行至终止，并释放其占有的全部资源
- **后继接力**：释放的资源供给 $P_{i+1}$ 使用，以此类推，保证全部进程均可跑完


- 安全状态一定不会死锁
- 不安全状态不等于已经死锁，只是存在死锁风险。银行家算法的核心就是拒绝任何导致系统脱离安全状态的资源分配
![Chapter 7 Deadlocks__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207%20Deadlocks__2.png)

Avoid策略的资源分配图：
	**需求边**使用虚线，其他和之前定义的一样

#### Banker’s Algorithm
针对多实例情况

![Chapter 7 Deadlocks__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207%20Deadlocks__5.png)

感觉和单实例情况也差不多，大题和下面这道题目差不多：
![Chapter 7 Deadlocks__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207%20Deadlocks__4.png)
### Deadlock Detection

在图中寻找循环，这个过程可以通过简化图来实现：
![Chapter 7 Deadlocks__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207%20Deadlocks__5.png)
死锁检测和银行家算法复杂度很高，不适合频繁使用

可以在每次不能立即授予资源请求时调用死锁检测算法，更简单的方法是每小时调用or在CPU使用率低于40%时检测

修复死锁的方式：
1. 选择一个victim；
2. 回滚返回到某个安全状态
3. 每次中止一个进程，直到死锁周期消除

![Chapter 7 Deadlocks__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207%20Deadlocks__6.png)
