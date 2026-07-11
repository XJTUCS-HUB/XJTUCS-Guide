---
title: "GDB"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-03-15
order: 26
---
整合自文章[Simple Use of GDB](https://xjtu-ics.github.io/sp-2026/assets/files/gdb.pdf)和[GDB Documention](https://sourceware.org/gdb/current/onlinedocs/gdb.html/)

调试器是一种运行其他程序的程序，允许用户对这些程序进行一定程度的控制，并在出现问题时进行检查

# Starting GDB

单个Cpp语句往往被转换成多个机器语句，大多数的本地变量名称被直接删除。因此，为了让源码级调试器正常工作，编译器必须返回这些**多余信息**。

为了向我们的编译器（gcc）表明你打算调试程序，因此需要这些额外信息，在编译和链接过程中添加 **-g** 开关：

```bash
gcc -c -g -Wall main.cc
gcc -c -g -Wall utils.cc
gcc -g -o myprog main.o utils.o
```

这个示例命令会生成一个可执行程序myprog，要在gdb控制下运行，可以输入

```bash
gdb myprog
```

这为调试器提供了一个笨拙但有效的文本界面。

### 进程

你可以选择将进程 ID 作为第二个参数，或者使用选项 `-p`，如果你想调试正在运行的进程：

```bash
gdb program 1234
gdb -p 1234
```

将 GDB 与进程 `1234` 相关联。在选项 -p 中，你可以省略程序文件名。

### Log Output

你可能想把 GDB 命令的输出保存到文件里，`set logging enabled [on|off]`可以启用或关闭日志记录，

# GDB Command

GDB启动时，程序并没有真正启动；当程序在执行时停止时，GDB会查看源程序的特定行（要么是程序中实际停止的点，要么是包含调用该函数的行，或者包含调用该函数的行）。

## Breakpoints, Watchpoints, and Catchpoints

**断点**会让你的程序在达到某个节点时停止。

**观察点**是一个特殊的断点，当表达式的值发生变化时，它会停止程序。表达式可以是变量的值，也可以包含一个或多个变量的值，通过运算符组合，例如 ' a + b '。 这有时被称为 *数据断点* 。

**捕获*点***是另一种特殊的断点，它会在特定事件发生时停止程序，例如抛出 C `++` 异常或加载库。

## 常用的命令（斜杠之后的是命令缩写）：

> [!TIP]
>
> - `help` / `h`  [*command*]
>
>   查看命令帮助。例：`h break`
>
> - `run` / `r` [*args*]
>
>   启动程序，可带命令行参数。例：`r arg1 arg2`
>
> - `where` / `bt`
>
>   显示函数调用栈（当前执行到哪个函数）
>
> - `up` / `down`
>
>   在调用栈中向上/向下移动，查看不同层级的变量
>
> - `print` / `p` *E*
>
>   打印变量或表达式。例：`p i`, `p/x addr`（十六进制）
>
> - `quit` / `q`
>
>   退出 GDB
>
> - `break` / `b` *place*
>
>   **设置断点**。程序到达断点时会停止，最容易设置的断点位于函数的开头。例：
>
>   ```bash
>   (gdb) break MungeData
>   Breakpoint 1 at 0x22a4: file main.cc, line 16.
>   ```
>
>   你也可以在源文件的特定行设置断点：
>
>   ```bash
>   (gdb) break 19
>   Breakpoint 2 at 0x2290: file main.cc, line 19.
>   (gdb) break utils.cc:55
>   Breakpoint 3 at 0x3778: file utils.cc, line 55.
>   ```
>
>   
>
> - `C-c` (Ctrl+C)
>
>   中断正在运行的程序
>
> - `delete` / `d` [*N*]
>
>   删除断点。`d` 删除全部，`d 1` 删除编号为 1 的断点
>
> - `continue` / `c`
>
>   继续运行到下一个断点
>
> - `step` / `s`
>
>   单步进入（跟进函数内部）
>
> - `next` / `n`
>
>   单步跳过（把函数调用当一步执行）
>
> - `finish` / `fin`
>
>   执行到当前函数返回

# GDB 在 Emacs 中的应用

Emacs 提供了更好的界面，节省了大量打字、鼠标移动和各种混乱。（个人感觉ui也没有很现代，同时相关的教程都10年前了）

执行 Emacs 命令 `M-x gdb` 后，会打开一个 GDB 新窗口。

## 启动调试

1. 打开你的 C/C++ 源文件
2. `M-x gdb` 回车
3. 提示 `Run gdb (like this):` 时直接回车（或补充程序名）
4. 屏幕分成两部分：上面是代码，下面是 GDB 命令行

## 最常用的操作

### 设置断点
- 在代码行按 `C-x SPC`（或点击左边空白处）→ 出现红点表示断点已设
- 再按一次取消

### 运行程序
在 GDB 窗口输入：`run`

### 单步执行（代码窗口快捷键）
- `C-c C-n` → 执行下一行（不进入函数内部）
- `C-c C-s` → 进入函数内部
- `C-c C-f` → 直接运行到函数返回
- `C-c C-r` → 继续运行到下一个断点

### 查看变量
- 把鼠标停在变量上 → 自动显示当前值
- 或按 `C-c C-p`，输入变量名回车

## 窗口操作
- `C-x 1` → 只保留当前窗口
- `C-x 2` 或 `C-x 3` → 分割窗口
- `C-x o` → 切换到另一个窗口




