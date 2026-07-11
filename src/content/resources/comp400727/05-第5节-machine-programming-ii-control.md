---
title: "第5节 Machine Programming II：Control"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-03-22
order: 5
---
# 计算机系统导论 
# Condition Code

![第5节 Machine Programming IIControl__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC5%E8%8A%82%20Machine%20Programming%20IIControl__1.png)

这些是整数寄存器，与此同时我们还有Condition Code寄存器：

| 条件码 | 名称            | 描述                |
| :-- | :------------ | :---------------- |
| CF  | Carry Flag    | 进位标志，无符号整数运算溢出时置1 |
| ZF  | Zero Flag     | 零标志，运算结果为0时置1     |
| SF  | Sign Flag     | 符号标志，运算结果为负时置1    |
| OF  | Overflow Flag | 溢出标志，有符号整数运算溢出时置1 |
>[!TIP]
>CPU本身不区分数的符号，之所以CF和OF功能不一样是为编译器服务的

Compare Instruction和Test Instruction 不会将结果存储，而是暂存为寄存器的条件码

cmp a,b ：比较b和a的值（源在前目的在后）
test a,b ：计算b&a的值

# Reading Condition Codes

## SetX a
![第5节 Machine Programming IIControl__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC5%E8%8A%82%20Machine%20Programming%20IIControl__2.png)

注意区分less/below，greater/above

## Jump Instructions

汇编语言中不存在if else，所有的分支代码都是通过jump实现的。
![第5节 Machine Programming IIControl__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC5%E8%8A%82%20Machine%20Programming%20IIControl__3.png)


>[!TIP]
>val = test ? s1 : s2其实在运行时比if else 要快

# Conditional Operations

实现条件操作的传统方法是通过使用**控制**的条件转移。当条件满足时，程序沿着一条执行路径执行；而当条件不满足时，就走另一条路径。这种机制虽然简单，但在现代处理器上可能会非常低效。

一种替代的策略是使用**数据**的条件转移。这种方法计算一个条件操作的两种结果，然后再根据条件是否满足从中选取一个。(来自[Textbook](https://xjtu-ics.github.io/textbook/notes/chapter3/sec6.html))

# Loops

汇编语言没有直接的循环结构，所以我们结合条件判断和jump来实现循环效果。
```bash
do 
  Body-statement
  while (Test);
```

32位的值会自动转换到64位的寄存器中
这一部分内容比较琐碎连贯，来不及记录，建议参考[Textbook](https://xjtu-ics.github.io/textbook/notes/chapter3/sec6.html)

