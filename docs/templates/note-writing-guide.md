# 笔记编写指南

这份指南面向课程笔记、实验记录和复习整理。目标不是统一文风，而是保证资料能稳定渲染、容易维护、方便后来者继续补充。

## 1. 目录结构

课程资料按下面的层级组织：

```text
src/content/resources/{课程代码}/{贡献者目录}/{文件名}.md
```

示例：

```text
src/content/resources/comp400727/qijianfei/01-第0节-绪论.md
```

- 第一层：课程代码，小写目录名，例如 `comp400727`
- 第二层：贡献者目录，建议使用稳定的拼音或英文标识，例如 `qijianfei`
- 第三层：具体 Markdown 文件

如果同一位贡献者持续更新同一门课，尽量复用原有目录，不要每次新建一个名字相近的子目录。

## 2. 推荐 Frontmatter

```yaml
---
title: 第1章 绪论
course: COMP400727
type: notes
author: 王二
updated: 2026-07-11
order: 1
---
```

- `title`：页面标题
- `course`：课程代码
- `type`：通常为 `notes`
- `author`：展示名
- `updated`：最后更新时间
- `order`：在课程页中的排序号

## 3. 数学公式写法

站点支持常见的 LaTeX 数学语法，优先使用下面三种形式：

- 行内公式：`$O(\log n)$`
- 独立公式：

  ```md
  $$
  T(n) = 2T(n/2) + O(n)
  $$
  ```

- 对齐公式：

  ```md
  $$
  \begin{aligned}
  S &= A \oplus B \\
  CO &= A \cdot B
  \end{aligned}
  $$
  ```

### 建议

- 行内公式只放短表达式，不要塞整段推导
- 多行推导优先用 `aligned`、`align` 一类环境，并放在 `$$...$$` 中
- 公式里的中文说明尽量写在公式外面，减少渲染歧义

### 常见坑

- 不要把代码、命令名写成数学公式，例如 Verilog 的 `$display`、Shell 的 `$PATH`，请用反引号包起来：`` `$display` ``
- 不要把一条完整推导拆成很多段零散的 `$$`
- 如果只是普通美元符号，不要直接裸写 `$`

## 4. 图片与代码

- 图片优先使用稳定的 HTTPS 外链
- 每张图尽量配合上下文说明，不要只贴图不解释
- 代码块请注明语言：

```md
```c
int main(void) {
  return 0;
}
```
```

## 5. 交叉引用

- 链接到同课程其他笔记时，优先写清章节或主题
- 如果原始笔记里存在 Obsidian 双链，导入脚本会尽量转换，但提交前最好人工检查一次

## 6. 内容边界

- 不放隐私、盗版、未授权课件和当前考试泄题内容

如果不确定边界，请同时阅读：

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [CONTENT-POLICY.md](../../CONTENT-POLICY.md)
