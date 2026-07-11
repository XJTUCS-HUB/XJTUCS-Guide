---
title: "第16节 Machine independent Optimization"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 12
---
# 计算机系统导论 
# Principle and Goals

- Minimize number of instructions
- Avoid waiting for memory
- Avoid branching(对上述两点都有影响)

## Constant folding

减少在运行时的计算而使用编译时的计算
$0xFF$ << 8         ->      $0xFF00$
- 把一些可以计算的编译成常量。
- 移除永远不会执行的代码
- 覆盖overwritten的代码

## Share Common Subexpressions

![第16节 Machine independent Optimization__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC16%E8%8A%82%20Machine%20independent%20Optimization__1.png)

四次乘法优化为一次乘法，大大节省时间

## Inlining

因为调用函数本身也会消耗计算资源，所以可以通过将原先的函数嵌入调用者，然后在这个基础上结合之前的principle进行优化。

![第16节 Machine independent Optimization__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC16%E8%8A%82%20Machine%20independent%20Optimization__2.png)

## Example

怎么对冒泡排序进行优化？[Example](https://xjtu-ics.github.io/sp-2025/assets/slides/10-optimization-machine-indep.pdf)

从小到大交换还是从大到小交换？

编译器比你想象的要聪明。
性能优化需要看**最内层循环**

- 汇编代码中，temp其实可以用寄存器来代替而不用单独赋值

# Limitations of Optimizing Compilers

- Operate under fundamental constraint
- Behavior obvious to the programmer is not obvious to compiler
- Most analysis is only within a procedure
- Most analysis is based only on static information
- 倾向于保守（conservative）

![第16节 Machine independent Optimization__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC16%E8%8A%82%20Machine%20independent%20Optimization__3.png)

为什么寄存器不敢修改？
传入的是两个指针，尽管a只在等号的右侧，但是b的改动也会同步改动a的值，b的改动不实在寄存器上而是在内存上
- Code updates b[i] on every iteration 
- Must consider possibility that these updates will affect program behavior
![第16节 Machine independent Optimization__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC16%E8%8A%82%20Machine%20independent%20Optimization__4.png)
## Memory Aliasing

在 sum_rows1 的内层循环中：
```c
for (j = 0; j < n; j++)
    b[i] += a[i*n + j];
```
生成的汇编代码每次迭代都执行：
- 从内存加载 `b[i]` 到寄存器（如 `%xmm0`）
- 加载 `a[i*n + j]` 并相加
- 将结果**写回内存**的 `b[i]`

为什么编译器无法优化（如在寄存器中累加）？

- **指针别名（aliasing）**：C 语言允许 `double *a` 和 `double *b` 指向**重叠内存区域**。
  - 编译器必须假设最坏情况：`b[i]` 更新可能改变后续读取的 `a[i*n + j]` 值。
  - Example：
    ```c
    double A[] = {0, 1, 2, 4, 8, 16, 32, 64, 128};
    double *B = A + 3;  // B[0] == A[3]
    sum_rows1(A, B, 3);
    ```
i=$0$ 时，`b[0] += a[3]` 更新 `B[0]`（即 `A[3]`），影响后续 `a[0*3 + 3]` 读取。

因此，编译器**保守**地每次从内存加载/存储，避免破坏程序行为
