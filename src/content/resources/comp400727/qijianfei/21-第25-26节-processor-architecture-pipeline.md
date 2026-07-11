---
title: "第25&26节 Processor Architecture：Pipeline"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 21
---
# 计算机系统导论 
通过控制逻辑来优化调度，组合逻辑的延迟很高，还存在摸鱼情况

（这节课内容很多，很多例子来不及记录）
# General Principle of Pipeline

IPS：每秒能够执行的指令数，用来衡量吞吐量

3-way pipelined version  
添加寄存器，使得不同任务之间能够分开。

![第25节 Processor ArchitecturePipeline__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%E8%8A%82%20Processor%20ArchitecturePipeline__1.jpg)

**流水线阶段（Y86-64五级流水线）**  
- **F (Fetch)**：从指令存储器取指，预测下一个PC  
- **D (Decode)**：译码，读取寄存器文件  
- **E (Execute)**：ALU计算，条件码更新  
- **M (Memory)**：访存（读/写数据存储器）  
- **W (Write back)**：写回寄存器  

**流水线寄存器**：分隔各阶段（F/D, D/E, E/M, M/W），保存状态和控制信号。

## Limitations

**Nonuniform Delays**  

代价是硬件系统的延迟会增加（时钟周期会变化），最慢阶段决定时钟周期。

**Register Overhead**  

流水线寄存器带来的面积和延迟开销。

**Data Hazard**  

- **RAW (Read After Write)**：后一条指令读取前一条的写入值 → 最常发生  
- **WAR (Write After Read)**：后一条写入前一条读取（Y86-64按序写回，罕见）  
- **WAW (Write After Write)**：两条指令写同一寄存器（按序提交，不出现）

**Control Hazard**  

分支和跳转导致取指地址不确定，需等待结果。

## SEQ+ Hardware

PC Stage 不再存储在寄存器中，而是用**PC选择逻辑**直接从当前阶段（如M阶段）反馈预测失败地址，或从W阶段取正常顺序地址。

## Predict the PC

- return指令是无法预测的 → 通常将返回地址压入硬件栈，执行ret时弹出预测。
- Jump Taken or Not Taken → 采用**分支预测**（如总是预测Taken、BTA（分支目标地址）。

分支预测技术：
![第25节 Processor ArchitecturePipeline__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%E8%8A%82%20Processor%20ArchitecturePipeline__2.jpg)

**预测错误的惩罚**：需要刷新（flush）流水线中已取指的错误指令，并从正确地址重新取指。Y86-64中惩罚为两个周期（因为需要等到E阶段才知道分支结果）。

## Data Dependence

![第25&26节 Processor ArchitecturePipeline__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__1.png)

我们发现，结果读取寄存器中的值由于数据依赖发生了错误，所以我们需要摸鱼，等待前面的计算完成，这个过程可以通过插入气泡来实现

![第25&26节 Processor ArchitecturePipeline__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__2.png)

Stall：重复执行上一次的工作，停滞
Bubble：不执行任何工作，气泡

### 如何监测数据依赖？  

![第25&26节 Processor ArchitecturePipeline__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__3.png)
通过**转发**：将结果从产生阶段直接送到需要阶段（如E阶段的ALU输出转发给下一个D阶段寄存器读取）。  如果不转发，则需要插入气泡，让流水线暂停直到数据就绪。

F和D阶段不会对后面产生影响（因为它们是取指和译码，数据依赖主要发生在E、M、W阶段与后续D阶段之间）。

**完整的依赖检测逻辑**：在D阶段比较源寄存器（rA, rB）与E/M/W阶段的目标寄存器（dstE, dstM），若匹配则生成转发控制信号。

#### 当流水线停滞时会发生什么？

- **被暂停的指令会被阻挡在Decode阶段**
- 后续的指令会保持在Fetch阶段
- Bubbles会被注入到Execute阶段
类似于动态生成的空操作（nop），它们会随着流水线向后面的阶段移动。寄存器编号变为`0xF`
![第25&26节 Processor ArchitecturePipeline__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__4.png)

## Data Forwarding

![第25&26节 Processor ArchitecturePipeline__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__5.png)

优先选择最早阶段的寄存器值使用。

### Limitations of Forwarding

E阶段的dstM寄存器不能使用Forwarding策略，因为这个寄存器需要从内存中读取数据，这个时候还没有准备好。


# Control Combination

把上面的两个Hazzard结合起来（）

![第25&26节 Processor ArchitecturePipeline__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__6.png)

# Exception

异常处理也是流水线很难的一部分
![第25&26节 Processor ArchitecturePipeline__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__7.png)

如何处理异常？
1. Call Exception Handler
2. Implementation

## Performance Metrics

**CPI**：circle per instruction
bubble会使得CPU的CPI变大，性能下降
![第25&26节 Processor ArchitecturePipeline__8](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__8.png)
B/I = LP + MP +RP
其中分支预测的占比最大，所以分支预测在计算机的研究中备受关注。

## Fetch Logic Revisited

![第25&26节 Processor ArchitecturePipeline__9](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__9.png)

每一步都需要之前的数据，看起来似乎没有优化的空间了

![第25&26节 Processor ArchitecturePipeline__10](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC25%2626%E8%8A%82%20Processor%20ArchitecturePipeline__10.png)

但其实，在MUX部分，可以提前将两种可能都计算出来，之后只要根据结果进行选择就可以了。同时，我们可以通过cache来优化内存读，提前将指令准备在cache里，之后ppt中介绍了一些比较现代优化CPU的方法（Branch Prediction等等）。
