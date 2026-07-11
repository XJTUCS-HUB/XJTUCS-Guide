---
title: "第7节 Machine programming III：Data"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-03-31
order: 7
---
# Arrays

数组和结构体的本质区别是：数组存储的是一系列本质相同的数据。

>[!TIP]
>Memory locations do not have data types.

## Array Allocation
C declaration `Type name[Length]`，为数组分配`Length * sizeof(Type)`bytes的内存空间。

![第7节 Machine programming IIIData__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC7%E8%8A%82%20Machine%20programming%20IIIData__1.png)

`char`对应1个字节，`char *` 对应八个字节，因为地址分配一直是8个字节。
数组名其实就是一个地址，对应数组的起始地址.

## Array Access

C语言不会检查数组是否越界：
![第7节 Machine programming IIIData__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC7%E8%8A%82%20Machine%20programming%20IIIData__2.png)
- Register %rdi contains starting address of array  
- Register %rsi contains array index
## Array Loop 

```asm
# %rdi = z
movl    $0, %eax
jmp     .L3
.L4:
addl    $1, (%rdi,%rax,4)
addq    $1, %rax
.L3:
cmpq    $5, %rax
jbe     .L4
rep; ret

```

## Understanding Pointers & Arrays

尽管数组名通常在使用时会被看作是指向首元素的地址，但在具体的内存分配和 `sizeof` 运算中，编译器将其视为完整的数组，这与单纯的指针在内存布局和大小上有本质区别。

![第7节 Machine programming IIIData__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC7%E8%8A%82%20Machine%20programming%20IIIData__3.png)
1. **数组与单一指针**
   - `int A1[3]`：直接在内存中分配了包含3个整型大小的连续空间（3 × 4 = 12 bytes）。解引用 `*A1` 获取首元素的值，大小为 4 bytes。
   - `int *A2`：仅分配了存储一个指针的内存空间（8 bytes）。在未给它显式分配具体的内存地址之前，对其进行解引用 `*A2` 可能会引发越界或段错误（Possible bad pointer reference 为 `Y`）。

![第7节 Machine programming IIIData__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC7%E8%8A%82%20Machine%20programming%20IIIData__4.png)
2. **指针数组与数组指针的对比**
   - `int *A2[3]` (**指针数组**)：本质是数组，分配了存放3个指针的连续空间（3 × 8 = 24 bytes）。解引用一次 `*A2` 得到首个指针（8 bytes），两次解引用 `**A2` 才能得到具体的整型数据（4 bytes），此时如果没有提前为指向的地址分配空间依然会有访问错误风险。
   - `int (*A3)[3]` (**数组指针**)：本质是指针，在内存中仅占用1个指针的空间（8 bytes），它指向一个容量为3个整形的数组。解引用一次 `*A3` 得到它指向的整个目标数组（占用 12 bytes），两次解引用 `**A3` 得到首个整型数据（4 bytes）。

## Multidimensional (Nested) Arrays

分为行优先和列优先；

## N X N Matrix Code

对于n维矩阵，在C语言中有三种类型：
1. Fixed dimensions
```cpp
# define N 16
 typedef int fix_matrix[N][N];
 /* Get element A[i][j] */
 int fix_ele(fix_matrix A, size_t i, size_t j)
 {
   return A[i][j];
 }

```
2. Variable dimensions, explicit indexing
```cpp
# define IDX(n, i, j) ((i)*(n)+(j))
 /* Get element A[i][j] */
 int vec_ele(size_t n, int *A, size_t i, size_t j)
 {
   return A[IDX(n,i,j)];
 }

```
3. Variable dimensions, implicit indexing
```cpp
 /* Get element A[i][j] */
 int var_ele(size_t n, int A[n][n], size_t i, size_t j) 
 {
   return A[i][j];
 }

```
