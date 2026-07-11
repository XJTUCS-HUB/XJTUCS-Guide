---
title: "第21&22节 Processes and Multitasking"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-07-02
order: 17
---
# 计算机系统导论 
# Processes

Computer runs many processes simultaneously
每一个进程都有：1.私有的地址空间 2.逻辑控制流.

## Control Flow

### Context Switching

共享CPU时，CPU只从寄存器中拿数据。所以，只要寄存器中的数据不变，就可以认为Context不变。

![第21&22节 Processes and Multitasking__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__1.png)

kernel code（a shared chunk of memory-resident OS code）实现Context Switch的过程。
会不会卡？
详细演示可参考 [PPT](https://xjtu-ics.github.io/sp-2025/assets/slides/15-os-process.pdf)。
### 并发和并行
- **并发（Concurrent）**：两个进程的执行时间有重叠。并发是一种**伪并行**，由单核 CPU 通过快速切换实现。
- **串行（Sequential）**：执行时间无重叠。
- **并行（Parallel）**：多核 CPU 上真正同时执行多个进程。
### How does the kernel take control?

在我们的原始程序中是没有关于内核的相关代码的，"syscall"会通过系统调用来帮我们完成这个过程。

# System Calls

**系统调用（System Call）**：进程与操作系统内核交互的唯一合法途径。如果进程只操作自己的寄存器和用户空间内存，则无需系统调用。
系统调用可能失败，这个时候我们就需要System Call Error Handling。

# Process Control

## Process States

- Running
	要么正在被执行，要么已经准备好被执行了
- Blocked / Sleeping
	无法执行，可能在等待一些event完成
- Stopped
	Process has been prevented from executing by user action
- Terminated / Zombie
	进程已经终止，但是上层进程还没有被通知。
main函数也是有返回值的，是因为它也是有parent process的——void exit(int status)

>[!TIP]
>exit is called once but never returns

## Creating Processes

如何创建进程呢？
父进程通过`fork`函数创建一个新的子进程。
`int fork(void) `
fork进行两次返回，向子进程返回0，向父进程返回child's PID
>[!TIP]
>fork is interesting (and often confusing) because it is called once but returns twice

![第21&22节 Processes and Multitasking__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__2.png)

由于子进程和父进程并发执行，调度顺序不确定，因此每次运行输出结果可能不同。

## Modeling fork with Process Graphs

进程图，用来分清谁先谁后。
**示例**：

![第21&22节 Processes and Multitasking__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__3.png)
![第21&22节 Processes and Multitasking__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__4.png)
![第21&22节 Processes and Multitasking__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__5.png)

## Reaping Child Processes

### 基本概念 
僵尸进程：当一个进程终止时，它仍然会消耗系统资源（例如：退出状态码、操作系统内部的各种表格）。这种状态的进程被称为Zombie Process——一个半死不活的特殊状态。

### Reaping

**收割（Reaping）**：父进程对已终止的子进程执行 `wait` 或 `waitpid` 系统调用，获取退出状态，然后内核完全清理子进程的记录。
### What if a parent doesn't reap?
如果父进程在没有为子进程收尸的情况下就终止了，那么这个孤儿进程（Orphaned child）将会被 `init` 进程（`pid == 1`）接管并收割。

* *特例：* 除非连 `init` 进程也终止了！那系统就只能重启了...

因此，只有在那些长期运行的程序（例如：Shell 和服务器）中，才必须进行显式的收割操作。
> **`defunct`**：`ps` 命令中显示为 `<defunct>` 的进程，即僵尸进程。

### `wait` & `waitpid`

**`waitpid`** 更灵活，可指定等待哪个子进程以及阻塞/非阻塞模式。
```c
pid_t wait(int *status)
pid_t waitpid(pid_t pid, int *status, int options)
```

waitpid也分为阻塞型和非阻塞型
wait是阻塞性调用

![第21&22节 Processes and Multitasking__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__6.png)

```c
void fork10() {
    pid_t pid[N];
    int i, child_status;

    for (i = 0; i < N; i++)
        if ((pid[i] = fork()) == 0) {
            exit(100+i); /* Child */
        }
    for (i = 0; i < N; i++) { /* Parent */
        pid_t wpid = wait(&child_status);
        if (WIFEXITED(child_status))
            printf("Child %d terminated with exit status %d\n",
                   wpid, WEXITSTATUS(child_status));
        else
            printf("Child %d terminate abnormally\n", wpid);
    }
}
```

`exit()`并不是立刻执行的，而是在另一个进程中，所以在for循环结束时我们无法预测还有多少个进程在运行。

```c
void fork11() {
    pid_t pid[N];
    int i, child_status;

    for (i = 0; i < N; i++)
        if ((pid[i] = fork()) == 0) {
            exit(100+i); /* Child */
        }
    for (i = N-1; i >= 0; i--) { /* Parent */
        pid_t wpid = waitpid(pid[i], &child_status, 0);
        if (WIFEXITED(child_status))
            printf("Child %d terminated with exit status %d\n",
                   wpid, WEXITSTATUS(child_status));
        else
            printf("Child %d terminate abnormally\n", wpid);
    }
}
```

| **特性**   | **fork10 **                                       | **fork11 **                                                                 |
| -------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| **核心函数** | 使用 `wait(&child_status)`                          | 使用 `waitpid(pid[i], &child_status, 0)`                                      |
| **回收顺序** | **按子进程结束的先后顺序**。哪个子进程先执行完，就先回收哪个，属于“异步”或“谁先好谁先来”。 | **按固定的逆序**。父进程必须按照特定的 PID 顺序去等待和回收。                                         |
| **是否阻塞** | 如果有任意子进程结束，`wait` 就会立即返回，不会无谓阻塞。                  | 如果 `pid[i]` 还没结束，即使其他子进程（比如 `pid[0]`）已经结束了，父进程也会阻塞在 `waitpid` 处死等 `pid[i]`。 |
- `fork10` 是一种非确定性的回收，打印出来的子进程 PID 顺序取决于操作系统的调度。
- `fork11` 实现一种确定性的逆序回收。
### execve: Loading and Running Programs

**`execve`**：替换当前进程的地址空间，加载并运行新程序。

```c
int execve(char *filename, char *argv[], char *envp[])
```
>[!TIP]
>execve called once and never returns

![第21&22节 Processes and Multitasking__7](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC21%2622%E8%8A%82%20Processes%20and%20Multitasking__7.png)

fork搭配execve是Linux系统中唯一创建进程的方式。
### Why separate fork() and execve()?
Linux 将创建进程（`fork`）和加载新程序（`exec`）分离，体现了 **模块化设计哲学**：一个系统调用只做一件事，组合使用更灵活（例如，`fork` 后可在子进程中修改文件描述符、设置信号处理，再 `exec`）。
在Windows中合并为了一个System call：CreateProcess()

而在Linux中   =>不同的设计哲学
