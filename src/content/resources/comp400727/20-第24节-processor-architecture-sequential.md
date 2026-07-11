---
title: "第24节 Processor Architecture：Sequential"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 20
---
# 计算机系统导论 

这一节我们将根据第15节中介绍的 Y86 以及第二节中的硬件实现一个简单的顺序执行的 CPU。
（大概长这样）
# SEQ Hardware Structure

![第24节 Processor ArchitectureSequential__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC24%E8%8A%82%20Processor%20ArchitectureSequential__1.png)

这么多的指令，为了方便，把指令按照state分成不同的类型：
1. Fetch
	从内存读指令
2. Decode
	读取程序寄存器
3. Execute
	计算值或者地址
4. Memory
	Read or Write
5. Write back
	写回操作
6. PC寄存器
	 Update program counter

### 指令的解码过程

![第24节 Processor ArchitectureSequential__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC24%E8%8A%82%20Processor%20ArchitectureSequential__2.png)
- **icode:ifun**：指令和功能码（各占 4 位，共 1 字节）
- **rA:rB**：寄存器指示符（可选）
- **valC**：8 字节常数字，作为立即数或偏移量（可选）
- **valP**：计算出的下一条顺序执行指令的 PC 地址（即 $PC + 1 + \text{need\_regids} + 8 \times \text{need\_valC}$）

# SEQ Hardware

[PPT](https://xjtu-ics.github.io/sp-2026/assets/slides/12-processor-sequential.pdf)上介绍了`Arith/Log. Ops` ,`rmmovq` , `popq` ,`move`等等例子

其中 `popq rA` 看起来很简单，但实际上每个部分都参与了工作。

![第24节 Processor ArchitectureSequential__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC24%E8%8A%82%20Processor%20ArchitectureSequential__3.png)

#### `popq rA` 阶段细化：

**Fetch**: 
  - $icode:ifun \leftarrow M_1[PC]$
  - $rA:rB \leftarrow M_1[PC+1]$
  - $valP \leftarrow PC + 2$
**Decode**: 
  - $valA \leftarrow R[\%rsp]$ （读取栈指针用于读取数据）
  - $valB \leftarrow R[\%rsp]$ （读取栈指针用于更新栈顶）
**Execute**: 
  - $valE \leftarrow valB + 8$ （栈指针加 8 释放空间）
**Memory**: 
  - $valM \leftarrow M_8[valA]$ （从旧栈顶读取数据）
**Write back**: 
  - $R[\%rsp] \leftarrow valE$ （写回新栈指针）
  - $R[rA] \leftarrow valM$ （写回弹出的数据到寄存器）
**PC Update**: 
  - $PC \leftarrow valP$

ValP 的设计是为 Jumps 所预留的设计

![image](https://xjtu-ics.github.io/textbook/notes/chapter4/image/chapter4-sec3-3.png)

- `call`指令会降下一行指令的地址压入栈中

接下来回到CPU，只要将控制逻辑实现，之后的指令都能实现。

以Fetch逻辑为例：

![第24节 Processor ArchitectureSequential__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC24%E8%8A%82%20Processor%20ArchitectureSequential__4.png)

```hcl
# Determine instruction code 
int icode = [ 
	imem_error: INOP; 
	1: imem_icode; 
]; 
	
# Determine instruction function 
int ifun = [ 
	imem_error: FNONE; 
	1: imem_ifun; 
];

# 控制信号：是否需要寄存器字节
bool need_regids = icode in { IRRMOVQ, IOPQ, IPUSHQ, IPOPQ, IIRMOVQ, IRMMOVQ, IMRMOVQ };

# 控制信号：是否需要常数常数 valC
bool need_valC = icode in { IIRMOVQ, IRMMOVQ, IMRMOVQ, IJXX, ICALL };
```

根据不同的指令确定操作数，实际上用的是switch逻辑

如何用少数的硬件，完成大部分的功能？

![第24节 Processor ArchitectureSequential__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC24%E8%8A%82%20Processor%20ArchitectureSequential__6.png)

### Control Logic 
- **ALU A 输入**: 选择 `valA`（如 OPq）、`valC`（如偏移量、立即数），或者 `+8`/`-8`（如栈操作）。
- **ALU B 输入**: 选择 `valB`（如基址、旧栈指针等）或 `0`。
- **ALU Fun**: 根据 `icode`（如为 `IOPQ` 则为 `ifun`，否则为加法 `ADD`）。
- **Set CC**: 仅在执行 `OPq` 指令时才置位条件码寄存器。

### Memory Address (访存逻辑)
- **Addr 选择**: 读写内存的地址要么是 `valE`（计算得到的地址/栈指针），要么是 `valA`（如 `popq` 时的旧栈指针）。
- **读/写控制**: 根据 `icode` 决定是进行内存读（`read`）还是内存写（`write`）。

### PC Update Logic

使用`New PC`组件：
- 选择下一阶段的 PC：
  - 如果是 `call`，选择 `valC`（跳转目标）。
  - 如果是 `ret`，选择 `valM`（从栈中弹出的返回地址）。
  - 如果是 `jXX`，根据 `Cnd` 决定选择 `valC`（跳转）或 `valP`（不跳转）。
  - 其他情况默认选择 `valP`。

# SEQ Operation

![第24节 Processor ArchitectureSequential__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC24%E8%8A%82%20Processor%20ArchitectureSequential__5.png)

时钟的上升沿才能更新。
- **状态寄存器**（程序计数器 PC、条件码 CC、寄存器文件、数据内存）在**时钟上升沿**时刻才会被更新。
- 在时钟周期的其余时间，信号在**组合逻辑**（如 ALU、译码/写回控制、地址计算等）中传播。
- **单周期设计限制**：由于所有物理状态的更新都发生在一个时钟周期结束时，因此时钟周期必须足够长，以使得在一个周期内信号能通过最慢（路径最长）的指令流程。

# SEQ Summary

Implementation
- Express every instruction as series of simple steps
- Follow same general flow for each instruction type
- Assemble registers, memories, predesigned combinational blocks
- Connect with control logic

缺点是太慢了，只有上升沿工作，其他时候都在摸鱼，下一节课将会介绍Pipline，更加高效的处理方式
