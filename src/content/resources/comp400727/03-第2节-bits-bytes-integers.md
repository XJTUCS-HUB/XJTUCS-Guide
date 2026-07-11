---
title: "第2节 Bits, Bytes, & Integers"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-07-02
order: 3
---
# 计算机系统导论
# Everything is bits

- Each bit is 0 / 1
- Why bits?  双稳态器件的高低电平转换为数字对应0和1

## Binary base

Byte = 8 bits，二进制、八进制、十六进制……

![Screenshot_20260310_101520_Obsidian](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Screenshot_20260310_101520_Obsidian.jpg)

具体的字节数和使用的**编译器**规则决定，“ILP64”和“ILP32”。小技巧：查阅 `sizeof(long)`(返回值为unsigned)；另一个小技巧：在 C99 之后，使用 `int16_t` 等定义变量。

# Boolean Algebra

- Developed by **George Boole**
## 1）位运算符 
	And                 &
	Or                    |
	Not                  ~
	Exclusive-Or  ^
## 2）移位运算符

### Left Shift: x << y
舍弃掉左溢出的位，在空出的右侧填0。
### Right Shift: x >> y
舍弃掉右溢出的位，那么在空出的左侧填什么呢？和左移一样填0吗？
分为逻辑右移(在左侧填0)和算术右移(在左侧填**原本的最高位**)

>[!TIP] 
>C 语言大部分实现中：所有**有符号**整数右移均采用算数右移而**无符号**整数采用逻辑右移
### Undefined Behaviours
 移动量小于0或者超出最长的长度。
# Logic operations in C

>[!NOTE] 
>将0视为“FALSE”，非0视为“TRUE”，同时只返回0和1。
>位运算符的孪生兄弟：&& ;  || ; !

以及Early termination：及时中断。

# Encoding "Integers"
![Screenshot_20260310_104959_Chrome](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Screenshot_20260310_104959_Chrome.jpg)

补码取负公式：$$ \sim x + 1 = -x $$

**问题解答**：`abs(-32768) = 32768?`  
在 16 位有符号整数（范围：-32768 ~ 32767）下，-32768 的二进制为 `1000 0000 0000 0000`
取绝对值时，~x+1 = `1000 0000 0000 0000`仍然为-32768. 

## Mapping between Signed & Unsigned

计算机不认识正号与负号，所以很自然的想法是，只需要改变最高位的含义，即可完成有符号数和无符号数之间的转换。
### Question
```cpp
int foo = -1; 
unsigned bar = 1; 
foo < bar == true ?
```

FALSE!!

>[!TIP] 
>C语言中若表达式既包含有符号数又包含无符号数，**C编译器会隐式的全部转换为无符号数再执行运算**

## Sign Extension and Truncation

 在位数发生变化时，比如，C 语言中的 `short、int、long`等类型之间相互转化，需要使用拓展和截断，这里也有一些注意点：
 
![Screenshot_20260310_113240_Samsung DeX Home](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Screenshot_20260310_113240_Samsung%20DeX%20Home.jpg)

## Addition & Mutiplication 
### Addition
进位时最高位溢出（补码的性质），会和真实值不一样
### Mutiplication 
在做乘法运算时无需区分有符号数和无符号数

# Representatins in memory, points,strings

程序通过地址来查找数据，系统为每个进程提供一份私有的地址空间
## Machine Words

> Any given computer has a "Word size"

> [!TIP]  
> **机器字长 (word size)**：CPU 处理数据的基本单位，即处理器一次能处理、存储、传输的二进制位数。  
> 
> 我们所谓的 32 位、64 位机器中的 32、64 指的就是机器的**机器字长**。而机器字长也是 CPU 支持的**最大寻址空间**。（32位最多支持4GB的内存）
## Byte Ordering
“大小端之争”：
Big Endian:Sun,PPc Mac(早期),network pocket headers
Little Endian: x86,ARM,Android,iOS,Windows
![Pasted image 20260312141233](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/03/Pasted%20image%2020260312141233.png)

## Representing Points

由于指针只存储地址，所以指针的大小只和计算机的位数有关.
