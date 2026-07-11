---
title: "第6节 Machine programming III：Procedures"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-03-24
order: 6
---
# 计算机系统导论 
# Mechanisms in Procedures

在CPU的世界里，根据RAP里存储的下一条指令的地址，去找下一条执行的指令，所以Passing Control没有我们想的那样顺理成章。

同样，传参的过程和Memory Management也是没那么简单，这也是这节课涉及的主要内容。

统一的寄存器规范：**ABI**（Application Binary Interface）

>[!TIP]
>不同的操作系统有不同的ABI.

# Stack Structure
![第6节 Machine programming IIIProcedures__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__1.png)

## Push

`pushq Src`
- 将Src的数据读取到寄存器
- 将栈指针寄存器 `%rsp` 的值 **减 8**（因为 x86-64 是 64 位架构，一个机器字长（word）= 8 字节）
- 将第 1 步取到的 **val** 写入到 `%rsp` **新指向的内存地址**

## Pop

`popq Dest`
- 将栈顶的数据读取到寄存器
- 将栈指针寄存器 `%rsp` 的值 **加 8**
- 将数据存储到Dest

>[!WARNING]
>Value is copied;it remains in memory at old %rsp.


# Passing Control

## Call
`call label`
- 将返回地址（call 指令的下一条指令地址）压入栈
- Jump 到 `label` 处开始执行
- 函数执行完后通过 `ret` 指令弹出栈顶地址并跳转回去

例子：
![第6节 Machine programming IIIProcedures__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__2.png)
![第6节 Machine programming IIIProcedures__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__3.png)
![第6节 Machine programming IIIProcedures__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__4.png)
![第6节 Machine programming IIIProcedures__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__5.png)

## Ret
`ret`
- 弹出栈顶的返回地址
- Jump 到该地址继续执行

# Passing Data

API约定函数调用**前六个参数保存在指定寄存器中**，多于六个的参数保存在栈中
(定义函数时不指定参数的个数，只有在调用函数的时候才会指定个数)
![](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec7-0.png)

# Managing local data

![第6节 Machine programming IIIProcedures__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__6.png)

机器级代码通过**栈帧(Stack Frames)** 这个概念来实现数据的管理。对于每个函数调用，会在栈中开辟一段属于该函数的独立空间，称为栈帧。栈帧中保存：
- 返回地址
- 调用者保存的寄存器（如需要）
- 局部变量
- 被调用者保存的寄存器（如需要）

**重要原则**：一个函数不应当修改其他函数栈帧中的内容，那里面存放着其他函数需要的重要数据。
函数执行结束时，栈帧中的数据已失效。返回后，该栈帧被**释放**，栈空间可供其他函数使用。
>[!NOTE]
>寄存器没有地址，只有内存有地址。因此需要保存的数据必须存储在栈中。
接下来的详细内容建议参考[ppt](https://xjtu-ics.github.io/sp-2026/assets/slides/05-machine-procedures.pdf)

# Register Saving Conventions

寄存器数量有限，需要统一的规范来协调 caller 和 callee 对寄存器的使用，避免冲突。

## Conventions

**1. Caller Saved**
- Caller 在调用函数**之前**负责保存可能被破坏的临时值到栈中
- Callee 可以自由使用这些寄存器，无需恢复
- 返回后，Caller 从栈中恢复这些值

**2. Callee Saved**
- Callee 在**使用某些寄存器之前**负责将其旧值保存到栈中
- Callee 使用完后，必须将这些寄存器恢复到原值
- 这样 Caller 可以假设这些寄存器的值不变

![](https://xjtu-ics.github.io/textbook/notes/chapter3/image/chapter3-sec7-5.png)

>[!TIP]
>不同的 ABI 规定了不同寄存器的保存约定。x86-64 中通常 %rax、%rcx、%rdx 等为 Caller Saved，%rbx、%r12-r15 等为 Callee Saved。

# Recursion 递归

对于CPU来说，执行递归函数和执行一个新的函数其实是一样的，开辟空间的方式也是一样。

![第6节 Machine programming IIIProcedures__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/%E7%AC%AC6%E8%8A%82%20Machine%20programming%20IIIProcedures__7.png)

GNU： GNU is Not Unix
BING： BING Is Not Google

GPL许可证
