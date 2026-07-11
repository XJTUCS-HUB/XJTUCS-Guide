---
title: "Lab中的参考点"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-07-11
order: 28
---
# 计算机系统导论
# Data Lab
## FitsBits

```c
/*
 * fitsBits - return 1 if x can be represented as an n-bit, two's complement integer.
 *   1 <= n <= 32
 *   Examples: fitsBits(5,3) = 0, fitsBits(-4,3) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 2
 */
```


在补码中，如果一个数字其实只需要 `n` 位就能存下，那么它在 32 位里的表现形式是：**从第 $n-1$ 位（它的专属符号位）开始，左边所有多出来的位，全都是这个符号位的无脑复制。**
所以，我们的测试方法非常简单粗暴：

```cpp
int fitsBits(int x, int n) {
  int shift = 32 + ~n + 1;
  int test = x << shift >> shift;
  return !(x ^ test);
}
```

## 常用位运算组合

> [!NOTE] 判断两个数是否异号
> `~(x ^ y)` 同号为 `-1`，异号为 `~1`（最后一位分别为 `0` 和 `1`，方便 `&1` 得到最终结果）

> [!NOTE] 手动构造长二进制数的方法
> `(m1 << 8) | m2`

> [!NOTE] 判断两个数是否互为相反数
> `!((x + y) ^ 0)`

---
# Bomb Lab

通过反汇编工具将可执行文件生成汇编代码：


```bash
gcc -c bomb.s
objdump -d bomb.o > bomb.d
```


**`objdump` 生成的汇编地址并非最后的内存虚拟地址，而是一个相对地址。** `objdump` 生成的绝对地址有问题，但是各个指令之间的相对位置不会出现改变，**可以认为在可执行程序加载到内存的时候，操作系统帮我们完成一次地址移动，绝对地址改变，但是指令之间的相对地址关系不变。**

注意，如果需要在 `GDB` 运行时输入文件，请以如下形式来使用 `GDB`：


```bash
gdb bomb
.....
(gdb) run < solution.txt
.....
```


- `xor %eax, %eax` 是把 `%eax` 寄存器清零。
- `movslq` 是 x86-64 汇编指令，用于**符号扩展**一个 32 位有符号整数到 64 位。

| 指令 | 位数 | 说明 |
| :--- | :--- | :--- |
| `mov` | 16 位 | |
| `movl` | 32 位 | 当时没有预料到 64 位计算机的出现 |
| `movq` | 64 位 | |

## 平均数向 0 取整的汇编代码

![作业中的参考点__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E4%BD%9C%E4%B8%9A%E4%B8%AD%E7%9A%84%E5%8F%82%E8%80%83%E7%82%B9__1.png)

| 步骤 | 操作 | 正数情况 (EAX ≥ 0) | 负数情况 (EAX < 0) |
| :--- | :--- | :--- | :--- |
| 1 | `sub` | EAX = high - low | EAX = high - low (负数) |
| 2 | `shr $0x1f` | EBX = 0 | EBX = 1（符号位） |
| 3 | `add %eax, %ebx` | EBX = 0 + EAX = EAX | EBX = 1 + EAX（EAX + 1） |
| 4 | `sar $1` | EBX = EAX / 2 | EBX = (EAX + 1) / 2 |
| 5 | `add %esi` | EBX = low + (high - low) / 2 | EBX = low + (high - low + 1) / 2 |

## Phase 5
查看寄存器值：

```bash
info registers rdx
```

汇编解析：

```asm
movzbl (%rax),%edx        # edx = 当前字符（零扩展字节 → 双字）
```

使用 `x/nfu <内存地址>` 查看内存：

| 参数 | 代表含义 | 说明 |
| :--- | :--- | :--- |
| **`n`** | **Count (数量)** | 想查看的内存单元个数。比如 `2` 表示查看 2 个，`10` 表示查看 10 个。 |
| **`f`** | **Format (格式)** | **`x`**：十六进制 (Hex)<br>**`d`**：十进制 (Decimal)<br>**`s`**：字符串 (String)<br>**`i`**：汇编指令 (Instruction) |
| **`u`** | **Unit (单位大小)** | **`b`**：Byte (1 字节)<br>**`h`**：Halfword (2 字节)<br>**`w`**：Word (4 字节，通常对应 32 位整数)<br>**`g`**：Giant word (8 字节，对应 64 位指针或长整数) |

![作业中的参考点__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E4%BD%9C%E4%B8%9A%E4%B8%AD%E7%9A%84%E5%8F%82%E8%80%83%E7%82%B9__2.png)
**字符串向后一位：**
- `%rax` 是 64 位指针，`(%rax)` 取该地址的值。
- 每次迭代通过 `add $1, %rax` 实现字符串指针递进。
- 直到遇到 `\0` 终止符。
**32 位和 64 位转换注意点：**
- `movzbl`：零扩展字节到双字（32 位）。
- `movslq`：符号扩展 32 位有符号整数到 64 位。
- 操作数大小不同时，需要确认是**零扩展**还是**符号扩展**：
  - 无符号数 → 零扩展（高位补 0）
  - 有符号数 → 符号扩展（高位补符号位）

---

# Attack Lab

> [!TIP]
> 你可以使用一个或多个**用空格分隔的两位十六进制值**作为 `hex2raw` 的输入。因此，如果要创建一个十六进制值为 `0` 的字节，则需要将其写成 `00`。例如要构造 `0xdeadbeef` 这个值，你应该向 `hex2raw` 输入 "`ef be ad de`"（注意小端模式下的字节顺序需要反过来）。

## Phase 2

如何方便地得到我们需要的注入代码：

```bash
gcc -c example.s 
objdump -d example.o > example.d
```

**解释**：使用 `gcc` 作为汇编器，`objdump` 作为反汇编器，可以方便地得到汇编指令的机器码（使用 16 进制表示）。

## Phase 3

1. **`touch3` 的参数是指针**：`touch3` 接收的是一个 `char` 类型的字符串指针，而不是直接的整数值。
2. **需要可打印的字符串形式**：Cookie 值 `0x28df55fe` 作为字符串应该是 `"28df55fe"`（8 个十六进制字符）。

![code](https://xjtu-ics.github.io/sp-2026/assets/images/attacklab/attacklab_bytecoding_instructions.png)
从硬件和微指令的角度来看，`pop` 指令的实现非常直观。在 x86-64 架构中，`pop %rax` 这种指令实际上执行了**两步操作**。

### 1. pop 的执行过程

当你执行 `pop %rax` 时，CPU 内部会发生以下两个动作：

1. **读取数据（Read）**：CPU 根据 `%rsp` 寄存器里的内存地址，去内存里把那 8 个字节的数据取出来，放进目标寄存器 `%rax` 中。
2. **移动指针（Increment）**：CPU 将 `%rsp` 的值**加上 8**（在 64 位系统中，每个压栈单位是 8 字节）。
> **重点**：在 x86 架构中，栈是向**低地址方向**增长的。所以“出栈”意味着栈指针向**高地址方向**移动（即加法）。
### 2. 为什么在你的 ROP 中能精准找出 Cookie？

这正是 ROP 链设计的精妙之处。让我们看看执行瞬间的内存状态：

#### 第一步：`getbuf` 的 `ret` 之后
- 当 `getbuf` 函数执行完 `ret` 指令时：
- CPU 从栈顶拿到了你的第一个 Gadget 地址（`pop %rax` 的地址）。
- **关键点**：`ret` 指令本身也会移动栈指针。执行完 `ret` 后，`%rsp` 已经自动指向了栈上紧挨着的下一个位置。
- **而那个位置，正好是你填入 Cookie 的地方！**

#### 第二步：执行 `pop %rax` Gadget
- 此时程序跳转到了 `farm` 里的那个 `pop %rax` 指令。

- CPU 执行这条指令：它看向此时的 `%rsp`，发现里面正好是 `0x5c1d764b...`。于是它把这个值搬进 `%rax`。

- 然后 `%rsp` 再次加 8，指向了下一个 Gadget 地址（`mov %rax, %rdi`）。

### 3. 硬件级的搬运流程图

如果拆开 CPU 的内部结构，它的逻辑电路是这样走的：

1. **MAR (Memory Address Register) ← %rsp**：把当前栈指针交给地址寄存器。
2. **MDR (Memory Data Register) ← Memory[MAR]**：从内存读取 Cookie。
3. **%rax ← MDR**：把读取到的值给寄存器。
4. **%rsp ← %rsp + 8**：栈指针上移，为下一个指令做准备。

---

# Cache Lab

存储器层次结构的中心思想是：对于每个 $k$，位于第 $k$ 层的更快更小的存储设备，作为位于第 $k+1$ 层的更大更慢的存储设备的 Cache。即每一层 Cache 的内容均来自于较低一层的数据对象。
我们可以通过**平均内存访问时间（AMAT）** 来衡量多级 Cache 的效果。L1 Cache 通常被分为两个独立的部分：
- **L1I（Instruction Cache）**：专门缓存**指令**，只读
- **L1D（Data Cache）**：专门缓存**数据**，可读可写

## 缓存访问与替换流程

假设当前需要在 Cache 中查询某一内存地址中的数据，完整的访问流程如下：

1. **地址解析与逐层查找**。根据目标内存地址，按照每一层 Cache 的结构参数（line size、set 数量），将地址拆分为 **tag**、**set index**、**block offset** 三个字段，然后从最高层（L1）开始逐层向下查找。
2. **判断是否命中**。在当前层 Cache 中，用 set index 定位到对应的 Set，遍历该 Set 内所有 way：若存在某条 cache line 的 valid 位为 1 且 tag 字段与地址的 tag 匹配，则**命中（Hit）**，跳转到**第 7 步**；否则，继续访问下一级 Cache 或内存。
3. **向上逐层加载数据**。当在某级 Cache 或内存中找到目标数据后，需要将其**递归地加载**到该层以上的所有 Cache 中（由低层向高层依次填入）。
4. **在目标 Set 中寻找空位**。将数据加载到某一层时，先根据该层的 Cache 参数计算数据所属的 Set。检查该 Set 中是否存在 invalid 的 cache line：若存在**一个或多个** invalid line，**选择下标最小的一个**作为写入位置，跳转到**第 7 步**；若该 Set 已满（所有 line 均为 valid），进入第 5 步。
5. **驱逐（Eviction）**。Set 已满时，使用 **LRU 算法**选出最近最少使用的一条 cache line 作为 **victim**。在覆写 victim 之前，需要先完成以下操作：首先执行**第 6 步（Back Invalidation）**，确保所有更高层级的 Cache 中不再持有 victim 的数据；然后检查 victim 自身的 dirty 位，若为 1，则将其数据**写回（Write-back）**到下一级 Cache（或内存），并将下一级对应位置的 dirty 位置 1。
6. **Back Invalidation（反向无效化）**。由于 **inclusive policy** 要求低层 Cache 的内容必须是高层 Cache 内容的超集，驱逐 victim 前必须保证所有更高层级的 Cache 中不再持有 victim 对应的数据。
   - **具体过程**：从当前层向上逐层查找 victim 对应的 cache line；若在某一高层 Cache 中找到了匹配的 valid line，则从**该数据所在的最高层 Cache** 开始，向下依次执行 evict 操作——将该 cache line 的 valid 位**置为 invalid**，若该 line 的 dirty 位为 1，先将其数据**写回到下一级 Cache** 并将下一级对应位置的 dirty 位置 1——逐层向下重复，直到回到触发 back invalidation 的那一层为止。
7. **更新元数据**。将目标数据写入选定的 cache line 后，设置该 line 的 **tag** 字段为目标地址的 tag，更新 **LRU** 字段以标记为最近使用，并将 **valid** 位置为 1。
8. **处理写操作**。若本次访问是**写操作**（Store 或 Modify），还需将该 cache line 的 **dirty** 位置为 1，表示数据已被修改，与下级存储内容不一致。
**需要在每次 evict 一条 cache line 时判断是否需要触发写回下一级的过程。**


> [!WARNING]
> 不同级别的缓存 cache line 的大小可能不一样。具体而言，当较低级 Cache 的 block 大小大于较高级 Cache 时，在对较低级 Cache 中某一 cache line 执行 back invalidation 时，需要对该 cache line 所覆盖地址范围内的所有较高级 Cache 的 cache line 一并进行失效处理。

## 反推地址

### 为什么不需要 block offset？
Cache 访问的最小单位是 **Cache Line**。当我们驱逐一个 cache line 时，整个 line 都会被写回，而不是某个特定字节。

所以：
- **tag + set** 已经确定了唯一的 **Cache Line**。
- **block offset** 只是这个 line 内的字节偏移。
- 写回/加载时，操作的是整个 line，offset 始终为 0。

## 正确的地址重构

```cpp
原始地址 = [tag] [set index] [block offset]
           ↑      ↑            ↑
         59位    2位          3位

重构时，block offset 设为 0（对齐到 cache line 边界）：
evicted_addr = (tag << (s + b)) | (set_index << b)
              = (tag << 5) | (set_index << 3)
              = (tag << 5) | (set_index << 3) | 0  ← block offset = 0

static uint64_t rebuild_addr(uint64_t tag, uint64_t set, int line_size, int set_num) {
    int b = 0, s = 0;
    while ((1 << b) < line_size) b++;
    while ((1 << s) < set_num) s++;
    return (tag << (b + s)) | (set << b);  // | 0 省略，因为 block offset = 0
}
```

---
# Optimization Lab

$$\text{Throughput bound} = \frac{\text{Cycles/Issue}}{\text{Num of Functional Units}}$$

![作业中的参考点__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/07/%E4%BD%9C%E4%B8%9A%E4%B8%AD%E7%9A%84%E5%8F%82%E8%80%83%E7%82%B9__3.png)

- **浮点除法和开方运算**采用迭代算法执行，在完成之前会阻塞后续同类操作进入同一条流水线。
- **浮点乘加（FMA）流水线**支持将浮点乘法微操作（µop）的结果**延迟转发**给浮点乘加微操作的累加操作数。这意味着后者可以在前者发射后的**下一个周期**就发射。
- **浮点乘加流水线**还支持从同类微操作**延迟转发累加操作数**，使得典型的乘加微操作序列可以**每 N 个周期发射一次**（其中累加延迟 N 在括号中标注）。
---

# Linker Lab

`callResolveSymbols` 需要维护两个逻辑：

1. **检查重复定义**：如果一个全局符号在文件 A 里定义了（有具体的 section 索引），在文件 B 里也定义了，这就冲突了。将冲突的符号名赋给 `errSymName`，并返回 `MULTI_DEF`。
2. **检查未定义引用**：如果找遍了所有文件，发现某个符号大家都在引用它，却没有任何一个文件定义它。将这个找不到定义的符号名赋给 `errSymName`，并返回 `NO_DEF`。

如果都正常，就返回 `FOUND_ALL_DEF`。
在 C++ 中，向一个地址填入内容需要进行显式类型转换，方法如下：

```cpp
uint64_t addr = 0x555555555000;
int valueToFill = 42;
*reinterpret_cast<int *>(addr) = valueToFill;
```

## 重定向类型

在 **x86-64 Linux（ELF 格式）** 系统中，虽然定义了二十多种重定向类型，但最核心、最常用的主要有以下 **3 种**：

1. **`R_X86_64_PC32`**：32 位 PC 相对寻址 `目标地址 - 当前 PC 地址 + addend`
2. **`R_X86_64_32`**：32 位绝对寻址 `目标地址 + addend`
3. **`R_X86_64_PLT32`**：程序链接表相对寻址 `目标 PLT 地址 - 当前 PC 地址 + addend`

查看方法：
![作业中的参考点__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/07/%E4%BD%9C%E4%B8%9A%E4%B8%AD%E7%9A%84%E5%8F%82%E8%80%83%E7%82%B9__4.png)

- **强符号 vs 强符号**：不允许有多个强符号同名，否则报错。
- **强符号 vs 弱符号**：如果有一个强符号和多个弱符号同名，选择强符号。
- **弱符号 vs 弱符号**：如果有多个弱符号同名，任选一个。
