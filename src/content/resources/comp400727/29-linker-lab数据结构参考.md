---
title: "Linker Lab数据结构参考"
course: COMP400727
type: notes
author: 戚剑飞
updated: 2026-06-08
order: 29
---
#### ObjectFile[¶](https://xjtu-ics.github.io/sp-2026/labs/lab6/#objectfile "Permanent link")

用来存储目标文件中所需的信息，其包含的成员变量及其含义如下：

- symbolTable ：目标文件的符号表，保存其每一个符号（见下文Symbol）
- relocTable ：目标文件的重定位表，保存其每一个重定位条目（见下文RelocEntry）
- sections ：目标文件的节表，保存节名string到节的映射（见下文Section）
- sectionsByIdx ：目标文件的节表，保存节索引index到节指针Section*的映射
- baseAddr ：目标文件在内存中的起始地址，详见test0
- size ：目标文件的大小

#### Section[¶](https://xjtu-ics.github.io/sp-2026/labs/lab6/#section "Permanent link")

用来存储目标文件中的一个节，其包含的成员变量及含义如下：

- name ：节名称
- type ：节类型，在本实验中略
- flags ：节标志，在本实验中略
- info ：节附加信息，在本实验中略
- index ：节下标
- addr ：节的起始地址
- off ：节在目标文件中的偏移量
- size ：节大小
- align ：节在目标文件中的对齐限制

关于type和flags的详细信息可参考[ELF文件的man手册中有关Shdr的部分](https://www.man7.org/linux/man-pages/man5/elf.5.html#:~:text=Section%20header%20\(Shdr\))。

#### Symbol[¶](https://xjtu-ics.github.io/sp-2026/labs/lab6/#symbol "Permanent link")

用来存储目标文件中的一个符号，其包含的成员变量及含义如下：

- name ：符号名称，为string类型。
- value ：符号值，表示符号在其所属节中的偏移量。
- size ：符号大小，当符号未定义时则为0
- type ：符号类型，例如符号是变量还是函数
- bind ：符号绑定，例如符号为全局或局部的
- visibility ：符号可见性，本实验中略
- offset ：符号在目标文件中的偏移量
- index ：符号相关节的节头表索引

#### RelocEntry[¶](https://xjtu-ics.github.io/sp-2026/labs/lab6/#relocentry "Permanent link")

用来存储目标文件中的一个引用产生的重定位条目，其包含的成员变量及含义如下：

- sym ：指向与该重定位条目关联的符号Symbol的指针
- name ：重定位条目关联的符号名称，类型为string
- offset ：重定位条目在节中的偏移量
- type ：重定位条目类型
- addend ：常量加数，用于计算要存储到可重定位字段中的值

#### allObject[¶](https://xjtu-ics.github.io/sp-2026/labs/lab6/#allobject "Permanent link")

用来存储所有目标文件对应的`ObjectFile`数据结构。

#### mergedObject[¶](https://xjtu-ics.github.io/sp-2026/labs/lab6/#mergedobject "Permanent link")

所有目标文件合并为一个后对应的`ObjectFile`。
