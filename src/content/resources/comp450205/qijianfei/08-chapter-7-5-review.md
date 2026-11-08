---
title: "Chapter 7.5 Review"
course: COMP450205
type: notes
author: 戚剑飞
updated: 2026-11-06
order: 8
---
>复习课，PPT上有很多的选择题，这里列出一个大纲
## Chapter 1

批处理系统，分时系统，实时系统的主要特点
- 实时系统牺牲了CPU效率以保证实时性

多道程序运行：宏观上并行，微观上串行（多核系统有着真正的并行）

并行和并发：
- **并行**：多个任务在**同一时刻**同时执行
- **并发**：多个任务在**同一时间段**内交替执行

Computer System Structure的结构图

用户态和内核态：为什么需要区分，如何切换

**特权指令与访管指令**

## Chapter 2

用户接口
- 命令接口：CLI，GUI，Batch
- 程序接口：系统调用

进程通信和错误检测

系统服务

Protection & Security

## Chapter 3

进程的概念：程序和进程的关系，线程和进程的关系
最基本的特征：动态性和并发性

进程实体 = 程序段+数据段+PCB **理解**

PCB 结构定义 PCB时进程存在的唯一标识

进程状态转换（5种）

常考如下三种：
![Chapter 7.5 Review__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207.5%20Review__1.jpg)

进程通信

## Chapter 4

用户级和内核级线程的比较

**线程是调度的分配单位**

MultiThreading Model

Threading Issues

## Chapter 5

### 进程调度的时机
7种情况可以分为3大类：
1. 执行完毕
2. 阻塞
3. 优先级

或者2大类：主动让出CPU和被动让出CPU
### 进程调度的状态转变
抢占式与非抢占式

![Chapter 7.5 Review__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%207.5%20Review__2.jpg)
### 进程调度算法
==重点，一定会考==
6种，其中FCFS、SJF和优先级调度考的频率很高![Chapter 5 CPU Scheduling__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/11/Chapter%205%20CPU%20Scheduling__3.png)这张表会考选择题                                                                                                                                                   
高响应比优先：等待时间/执行时间 + 1

## Chapter 6

临界区问题

用不同的方法来解决：
PV，管程，自旋锁，Peterson

三个经典同步问题

无忙等待和有忙等待的实现

进程的同步与互斥

## Chapter 7

死锁产生有四个必要条件，死锁的预防就是破坏这四个条件

死锁避免和死锁检测在单实例的方法都是检测环，前者是检测资源分配图，而后者是检测等待图
