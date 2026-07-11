---
title: "第17节 Machine dependent Optimization"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 13
---
# 计算机系统导论 

# Instruction-Level Parallelism

Cycles Per Element (CPE)

$$Cycles = CPE*n + Overhead$$

CPE的值越小，说明越快。CPE就是斜率。

![第17节 Machine dependent Optimization__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__1.png)

基础的优化方向：
1. Move vec_length out of loop
2. Avoid bounds check on each cycle
3. Accumulate in temporary

![第17节 Machine dependent Optimization__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__2.png)

如何继续优化呢？

Machine Dependent Optimization！

## Latency Bounds

![第17节 Machine dependent Optimization__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__3.png)

## Loop unrolling

增加每次loop里进行的操作,减少循环开销（和人类的思路相反）

```cpp
/* Combine 2 elements at a time */ 
for (i = 0; i < limit; i+=2) {
	 x = (x OP d[i]) OP d[i+1]; 
 } 
 /* Finish any remaining elements */
  for (; i < length; i++) { 
	  x = x OP d[i]; 
  }
```

Helps integer add，同时其他的不受影响。

**Can we break the latency bound?**

![第17节 Machine dependent Optimization__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__4.png)
在之前的操作数中，每一次乘法都要等上一级完成再进行，于是收到latency bound的约束。

如何在同一时刻创造多个乘法计算呢？
## Superscalar Processor 超标量流水线

Type 1: Some instructions take > 1 cycle, but can be pipelined
Type 2: Multiple instructions can execute in parallel

![第17节 Machine dependent Optimization__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__5.png)

- Divide computation into stages

我们称这个新的Bound为Throughput Bound（吞吐）

![第17节 Machine dependent Optimization__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__6.png)

仍然存在问题：加法和乘法无法同时进行

![第17节 Machine dependent Optimization__8](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__8.png)

发现`d[i] OP d[i+1]`和`d[i+1] OP d[i+2]`是两个独立的计算，所以可以构造流水线

![第17节 Machine dependent Optimization__9](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__9.png)

这样的话，同步的代价很高，更激进的做法是，分成两个部分去做，在最后进行同步。

![第17节 Machine dependent Optimization__10](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__10.png)

如果使用更高的并发，效率还可以更高。

**Can we do even better?**

## Vector Instructions

一行指令可以处理更多的数据吗？

现代寄存器有更高级的寄存器，一个寄存器中可以放入很多的操作数。

![第17节 Machine dependent Optimization__11](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__11.png)

指令集并行运算

![第17节 Machine dependent Optimization__13](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__13.png)
- 因为一个单精度浮点数占 32 位，所以 256 位的寄存器可以被划分为 $256 / 32 = 8$ 个独立的数据通道。
    如图所示，CPU 会在一条指令的执行周期内，同时将源寄存器 `%ymm0` 和 `%ymm1` 中这 8 个对应位置的单精度浮点数相加，然后将这 8 个结果分别写回到目标寄存器 `%ymm1` 的对应位置。

- 由于双精度浮点数体积更大（64 位），256 位的寄存器只能被划分为 $256 / 64 = 4$ 个独立的数据通道。
    如图所示，硬件会同时执行 4 次加法运算，将源寄存器对应位置的 4 个双精度浮点数相加，并将结果写回 `%ymm1`

# Branch Predictions

Instruction Control Unit must work well ahead of Execution Unit to generate enough operations to keep EU busy

Branch：
1. if-else
2. 循环branch

怎么提高Branch猜测的准确率？

- 编译器认为程序员会把更有可能的branch放在else部分（正常部分）
- 对于每个if认为默认不会发生，异常数据

前向跳转我们默认成功，而后向跳转（if-else）认为默认失败。

### Loop Unrolling

分支数变少，猜错的次数也变少了。（编译器出于谨慎考虑不会轻易unroll，我们可以手动unroll）

### Transform Branches

```cpp
for (int c=0; c < size; ++c) { 
	if (data[c] >= 128) 
		sum += data[c]; 
}
```

运用DataLab里的位运算：

```cpp
int t = (data[c] - 128) >> 31; 
sum += ~t & data[c];
```

### Make Branch More Predictable

![第17节 Machine dependent Optimization__14](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC17%E8%8A%82%20Machine%20dependent%20Optimization__14.png)

