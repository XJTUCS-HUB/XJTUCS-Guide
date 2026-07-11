---
title: "第18节 Linking I： Basic Concepts and Procedures"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 14
---
# 计算机系统导论 
# Why Linking

- 减少编译时间
- Cooperation
- Separate Compilation + Linking
![第18节 Linking I Basic Concepts and Procedures__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC18%E8%8A%82%20Linking%20I%20Basic%20Concepts%20and%20Procedures__1.png)

Efficiency:
1. Time
2. Space

# Basic Concepts and Procedures

## Step 1: Symbol Resolution

全局变量和Function是跨模块可见的。

所有的符号定义存储在Symbol table的独立空间，包含name，size和location

>[!WARNING]
>During symbol resolution step, the linker associates each symbol reference with exactly one symbol definition.

## Step 2: Relocation

把分别的代码，数据部分合并为一个整体

Three Kinds of Object Files：

Relocatable object file (.o file)
Executable object file (a.out file)
Shared object file (.so file)

ELF：Executable and Linkable Format 可执行与可链接格式


## Linker Symbols

分为三类：
- Global symbols
	可以被全局引用，典型的就是全局变量（non-static）
- External symbols
	由其他模块定义而在此处被引用的全局Symbol
- Local symbol
	并非程序的局部变量，而是“Symbols that are defined and referenced exclusively by module M”


Program symbols are either strong or weak

![第18节 Linking I Basic Concepts and Procedures__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC18%E8%8A%82%20Linking%20I%20Basic%20Concepts%20and%20Procedures__2.png)

### Linker’s Symbol Rules

1. 强符号只能被定义一次
2. 同时有多个弱符号和一个强符号，选择对强符号操作
	References to the weak symbol resolve to the strong symbol
3. 如果有多个弱符号没有强符号，选择随机一个

所以尽量别用global variables，如果要用的话：
1. Use static
2. Initialize
3. 使用extern在引用外部全局变量的时候


