---
title: "第12&13&14节 Cache Memories"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-30
order: 10
---
# 计算机系统导论 

>_"Raise your quality standards as high as you can live with, avoid wasting your time on routine problems, and always try to work as closely as possible at the boundary of your abilities. Do this, because it is the only way of discovering how that boundary should be moved forward."_
>
>— Edsger W. Dijkstra
# Cache Read

Cache以高速缓存组的形式组织在一起。
![Cache Memory Organization](https://xjtu-ics.github.io/textbook/notes/chapter6/image/chapter6-sec4-0.png)
其中 set index 指明地址对应的组编号，而 block offset 指明数据位于块中的偏移量。而剩下的位数作为 tag 标识与组中每个行比较来指明一个组中是否有目标内存块。（参考[Textbook](https://xjtu-ics.github.io/textbook/notes/chapter6/sec4.html)）
![Address](https://xjtu-ics.github.io/textbook/notes/chapter6/image/chapter6-sec4-1.png)
这也是为什么我们需要数据对齐的操作。

同一个set中的tag得是一样的。
映射的策略：
### 直接相邻映射

### E-WaySet 相连映射

对于写入呢？

What to do on a write-hit?
- Write-through 立即写入内存，缓存和内存始终保持一致
- Write-back 先只写缓存，**替换时才写回内存**，需要**dirty bit（脏位）** 标记是否被修改

What to do on a write-miss?
- Write-allocate 先加载到缓存，再更新
- No-write-allocate 直接写内存，不加载到缓存

![第12&13章 Cache Memories__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC12%2613%E7%AB%A0%20Cache%20Memories__1.png)

**v** = valid bit（有效位）：该缓存行数据是否有效
**d** = dirty bit（脏位）：该缓存行是否被修改过（需写回内存）
**tag** = 标记位：用于匹配内存地址

### 为什么Index使用的是中间部分的Bits

两种分配方式的图例对比：

![第12&13章 Cache Memories__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC12%2613%E7%AB%A0%20Cache%20Memories__2.png)
好处：可以很好的利用空间局部性，不同的set间插分布

![第12&13章 Cache Memories__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC12%2613%E7%AB%A0%20Cache%20Memories__3.png)
这样做，如果我们需要频繁的访问16个字节的数组，很容易产生conflict

## Cache Performance Metrics

### Miss rate
= 1 - hit rate

一级的miss rate 3-10%
二级的miss rate 一般小于1%

### Hit time

将缓存中的一行数据送达处理器所需的时间，包括判断该行是否在缓存中的时间

### Miss Penalty

因缓存缺失而额外需要的时间

>[!WARNING]
>99%的hit rate的效率是97% hit rate的两倍，所以我们使用miss rate来表示性能而不是hit rate

## 如何优化出“缓存友好代码”

- Make the common case go fast
- 减少inner loops的miss
- 一步一步去访问（spatial locality）

![第12&13章 Cache Memories__4](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC12%2613%E7%AB%A0%20Cache%20Memories__4.png)
可以看到数据和指令在第一级缓存中是分别存储的，而第二级缓存为每个核独有并且不再区分数据与指令。第三级缓存则是所有核共有了。
## Inclusion Policy

![第12&13章 Cache Memories__5](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC12%2613%E7%AB%A0%20Cache%20Memories__5.png)

## Cache Invalidation really is one of the hardest problems in computer science

## Cache Coherency

多核cpu需要考虑的问题

*Cache Controller*

![第12&13章 Cache Memories__6](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/04/%E7%AC%AC12%2613%E7%AB%A0%20Cache%20Memories__6.png)

## The Memory Mountain

参考[Textbook](https://xjtu-ics.github.io/textbook/notes/chapter6/sec5.html)

![The Memory Mountain](https://xjtu-ics.github.io/textbook/notes/chapter6/image/chapter6-sec5-1.png)

Miss Rate = Stride/8

## Using blocking to improve temporal locality

![第12&13节 Cache Memories__1](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC12%2613%E8%8A%82%20Cache%20Memories__1.png)

显然根据理论计算 kij 是最优的访问次序,这是因为kij形式的缓存命中率最高

![第12&13节 Cache Memories__2](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC12%2613%E8%8A%82%20Cache%20Memories__2.png)

还有比kij效率更高的方式，我们称为Block，这是根据缓存的空间调用来进行计算的。

![第12&13节 Cache Memories__3](https://pub-e7c93c0b727d457c895b016a26707158.r2.dev/2026/06/%E7%AC%AC12%2613%E8%8A%82%20Cache%20Memories__3.png)

优化方向：B的取值越大越好

Fit three blocks in cache! Two input, one output.
