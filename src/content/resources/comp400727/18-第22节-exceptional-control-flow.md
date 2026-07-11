---
title: "第22节 Exceptional Control Flow"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-07-02
order: 18
---
# 计算机系统导论 

Exceptional Control Flow exists at all levels of a computer system.

1. Exceptions
2. Process context switch
3. Signals
4. Nonlocal jumps: `setjmp()`and `longjmp()`

# Exceptions

An exception is a transfer of control to the OS kernel in response to some event.
异常是一种响应某些事件而将控制权转移给操作系统内核的行为

![第22节 Exceptional Control Flow__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC22%E8%8A%82%20Exceptional%20Control%20Flow__1.png)
Kernel is the memory-resident part of the OS

![第22节 Exceptional Control Flow__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC22%E8%8A%82%20Exceptional%20Control%20Flow__2.png)

## 异常控制流（ECF）分类架构

```
ECF (Exceptional Control Flow)
├── Asynchronous (异步)
│   └── Interrupts (中断)
└── Synchronous (同步)
    ├── Traps (陷阱)
    ├── Faults (故障)
    └── Aborts (终止)
```

相关的例子参考[PPT](https://xjtu-ics.github.io/sp-2025/assets/slides/16-os-ecf.pdf)

系统调用存放在内核中


# Simple Shell Example

```c
void eval(char *cmdline) 
{
    char *argv[MAXARGS]; /* Argument list execve() */
    char buf[MAXLINE];   /* Holds modified command line */
    int bg;              /* Should the job run in bg or fg? */
    pid_t pid;           /* Process id */

    strcpy(buf, cmdline);
    bg = parseline(buf, argv);
    if (argv[0] == NULL)
        return;          /* Ignore empty lines */

    if (!builtin_command(argv)) {
        if ((pid = fork()) == 0) {   /* Child runs user job */
            execve(argv[0], argv, environ);
            // If we get here, execve failed.
            printf("%s: %s\n", argv[0], strerror(errno));
            exit(127);
        }

        /* Parent waits for foreground job to terminate */
        if (!bg) {
            int status;
            if (waitpid(pid, &status, 0) < 0)
                unix_error("waitfg: waitpid error");
        }
        else
            printf("%s %s", pid, cmdline);
    }
    return;
}
```

### 存在什么问题？

1. 僵尸进程：我们的 Shell 成功等待并回收了前台作业。但是，对于**后台进程**，它们在停止时会变成僵尸进程。
2. **内存泄漏**：因为 Shell（通常）永远不会终止，这些后台僵尸进程将永远不会被回收，会逐渐吃掉系统的 PID 和内存资源。

 **如何解决？**

# Signal

A signal is a small message that notifies a process that an event of some type has occurred in the system.

通知内容：某一种事件发生了（its ID and the fact that it arrived）

## Sending a Signal

## Receiving a Signal

可能的反馈：
1. Ignore
2. Terminate
3. Catch

![第22节 Exceptional Control Flow__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC22%E8%8A%82%20Exceptional%20Control%20Flow__3.png)

## Pending and Blocked Signals

延缓信号处理的时机

```c
void fork12() { 
    pid_t pid[N]; 
    int i; 
    int child_status; 

    for (i = 0; i < N; i++) {
        if ((pid[i] = fork()) == 0) { 
            /* Child: Infinite Loop */ 
            while(1) 
                ; 
        } 
    }

    for (i = 0; i < N; i++) { 
        printf("Killing process %d\n", pid[i]); 
        kill(pid[i], SIGINT); 
    } 

    for (i = 0; i < N; i++) { 
        pid_t wpid = wait(&child_status); 
        if (WIFEXITED(child_status)) 
            printf("Child %d terminated with exit status %d\n", wpid, WEXITSTATUS(child_status)); 
        else 
            printf("Child %d terminated abnormally\n", wpid); 
    } 
}
```

**执行完循环之后还有几个进程？**
* 只有 **1 个进程**（即父进程本身）。
* **原因**：N 个子进程都被发送了 `SIGINT` 信号而异常终止，且父进程在随后的 `wait` 循环中成功把它们全部回收（Reap）了。

**什么时候看Signal？**
* **检测时机**：当操作系统内核从内核模式返回到用户模式时（例如：系统调用返回、或中断处理程序结束），它会检查当前进程的未屏蔽待处理信号集合（即 `pending & ~blocked`）。若非空，则强制进程先处理信号，然后再继续执行主程序。

## Default Actions

### Signal Handlers

Signal Handlers和主线也是并发关系。

![第22节 Exceptional Control Flow__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC22%E8%8A%82%20Exceptional%20Control%20Flow__4.png)

Handler 有可能出现嵌套情况

![第22节 Exceptional Control Flow__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC22%E8%8A%82%20Exceptional%20Control%20Flow__5.png)

如果不希望这样的情况出现，应当block某些信号/缩短Handler的流程

### Temporarily Blocking Signals

```c
sigset_t mask, prev_mask; 

sigemptyset(&mask); 
sigaddset(&mask, SIGINT); 

/* Block SIGINT and save previous blocked set */ 
sigprocmask(SIG_BLOCK, &mask, &prev_mask); 

/* Code region that will not be interrupted by SIGINT */ 

/* Restore previous blocked set, unblocking SIGINT */ 
sigprocmask(SIG_SETMASK, &prev_mask, NULL);
```

### 如何写出安全的Handler？

编写 Signal Handler 的黄金法则：

* **G0：Keep it simple**：Handler 应该尽可能简单（例如：仅设置一个全局 Flag 然后立刻 return）。
* **G1：只调用异步信号安全（Async-signal-safe）的函数**：
  * *警告：`printf`, `sprintf`, `malloc`, `exit` 均不是安全的！*
  * 可以安全调用 `write` 等系统调用。
* **G2：保存和恢复 `errno`**：在进入 Handler 时保存 `errno`，退出前恢复它，避免 Handler 中的错误覆盖了主程序的 `errno`。
* **G3：保护共享数据结构**：在读写全局或共享数据结构时，临时屏蔽所有信号（防止并发冲突破坏数据）。
* **G4：全局变量声明为 `volatile`**：强制编译器每次都从主内存读取，而不是缓存在寄存器中。
* **G5：全局 Flag 声明为 `volatile sig_atomic_t`**：保证对该 flag 的读写操作是单条指令完成的原子操作（不需要屏蔽信号机制来额外保护）。

> **为什么printf也是不安全的？**
> printf内部会获取一把标准输出（stdout）的全局锁，并可能调用 `malloc` 分配缓冲区。如果主程序正在调用 printf（已持有锁）时被信号中断，而 Handler 中又调用了 printf，就会因重复请求该锁导致**死锁**。
