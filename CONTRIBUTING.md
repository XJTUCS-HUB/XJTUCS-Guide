# 参与贡献

XJTUCS Guide 接受课程资料、学习体验、推免经验和内容纠错。不会 Git 也可以通过 GitHub Issue 投稿。

> 当然，对于XJTUCS的同学而言，学会使用Git参与贡献笔者认为是一个很重要的技能，所以还是建议大家学习一下相关的知识然后pr。

## 选择贡献方式

| 方式 | 适用情况 |
| --- | --- |
| [新增课程资料](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new?template=course-resource.yml) | 投稿笔记、考核信息或往年资料 |
| [投稿经验](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new?template=experience.yml) | 投稿课程学习体验或推免经验 |
| [报告错误](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new?template=correction.yml) | 修改事实、错字、失效链接或过时内容 |
| Pull Request | 批量新增内容或直接修改 Markdown |

隐私、版权、名誉、安全和当前考试泄题问题请按照 [TAKEDOWN.md](TAKEDOWN.md) 处理。

## 本地修改

```bash
pnpm install
pnpm run dev
```

提交前运行：

```bash
CI=true pnpm run build
```

## 新增课程资料

1. 在 `src/content/resources/{课程代码}/{贡献者目录}/` 新建 Markdown 文件。
2. 按资料类型复制对应模板（见下表）。
3. 填写课程代码、类型、作者或来源和更新时间。
4. 正文只放自己原创或明确获得授权的内容。
5. 图片优先使用稳定的 HTTPS 地址，不提交大体积附件。

贡献者目录建议使用稳定的拼音或英文标识，例如 `WangEr`。具体写法可参考 [笔记编写指南](docs/templates/note-writing-guide.md)。

资料类型只能使用：`notes`、`experience`、`past-paper`。

### 模板选择

可以参考已经有的课程资料，看看如何来排版，这里也提供了一些模版供大家参考，欢迎自由开拓！

| 类型 | 含义 | 模板 |
| --- | --- | --- |
| `notes` | 笔记与复习 | [课程资料模板](docs/templates/course-resource.md) |
| `past-paper` | 往年资料与试题回忆 | [往年资料模板](docs/templates/past-paper.md) |
| `experience` | 课程学习体验 | [课程学习体验模板](docs/templates/course-experience.md) |

推免经验请使用 [推免经验模板](docs/templates/recommendation-experience.md)。

## 内容贡献位置指北

项目目前主要有三类内容目录：

```text
src/content/courses/         课程基本信息
src/content/resources/       贡献者提交的课程资料
src/content/courseContent/   每门课的公共内容
```

另有模板目录：

```text
docs/templates/
```

### 每门课的公共内容

包括考核信息、外部资源等属于课程整体而非某个贡献者原创的内容，放在 `src/content/courseContent/{课程代码}/` 下，按类型命名文件：


例如：

```text
src/content/courseContent/eelc400105/assessment.md
src/content/courseContent/eelc400105/external.md
```

类型只能使用以下两种：

| 类型 | 含义 | 建议内容 |
| --- | --- | --- |
| `assessment` | 考核信息 | 考核形式、题型分布、分值构成 |
| `external` | 外部资源 | 教材、公开课、课程团队网站和相关仓库 |

每门课程通常已经建好两份占位文件。请贡献者优先直接编辑现有文件，不必新建。

如果确需新建，参照以下Frontmatter：

```yaml
---
course: EELC400105
type: assessment
updated: 2026-07-17
---
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `course` | 是 | 课程代码，必须已存在于 `src/content/courses/` |
| `type` | 是 | `assessment` 或 `external` |
| `updated` | 是 | 更新时间，格式 `YYYY-MM-DD` |

### 课程基本信息

课程基本信息放在：

```text
src/content/courses/{课程代码小写}.md
```

每门课程默认已建好这两份占位文件，**直接编辑现有文件填入正文即可**，无需新建。若课程尚未建目录，按上面的路径新建 `{类型}.md`。`course` 必须已经存在于 `src/content/courses/`。

Frontmatter 示例：

```yaml
---
code: COMP400727
name: 计算机系统导论
category: 计算机系统结构
requirement: elective
credits: 4
summary: 从程序表示、机器级代码、存储层次到操作系统机制理解计算机系统。
updated: 2026-07-11
---
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `code` | 是 | 课程代码，使用大写，例如 `COMP400727` |
| `name` | 是 | 课程名称 |
| `category` | 是 | 课程分类 |
| `requirement` | 是 | 只能是 `required` 或 `elective` |
| `credits` | 否 | 学分，数字 |
| `summary` | 是 | 课程页顶部简介 |
| `updated` | 是 | 更新时间，格式 `YYYY-MM-DD` |

`updated` 按实际更新日期填写。这类内容直接在课程页内联渲染，不生成独立资源页，也不按贡献者分组；因此正文不要署个人作者，涉及转载时在文末注明来源与许可证。

### 新增课程资料

课程资料放在：

```text
src/content/resources/{课程代码小写}/{贡献者目录}/{文件名}.md
```

例如：

```text
src/content/resources/eelc400105/yangannan/2026年数电期末试题回忆.md
src/content/resources/comp400505/wangweiyi/学习体验.md
```

贡献者目录建议使用稳定的拼音或英文标识，例如：

```text
PeterGriffin
StewieGriffin
```

课程资料会生成独立资源页，并在课程详情页中按类型聚合展示。同一贡献者目录下有多篇资料时，课程页会按贡献者折叠分组。贡献者不必担心。

Frontmatter示例：
```yaml
---
title: 示例标题
course: COMP400727
type: notes
author: 你的展示名
updated: 2026-07-11
order: 10
---
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 资源页标题 |
| `course` | 是 | 课程代码，必须已存在于 `src/content/courses/` |
| `type` | 是 | `notes`、`experience`、`past-paper` 三选一 |
| `author` | 是 | 展示名；转载时填写原作者或来源 |
| `updated` | 是 | 更新时间，格式 `YYYY-MM-DD` |
| `order` | 否 | 同区块排序，数字越小越靠前；不填默认为 `999` |

#### 可用类型

`src/content/resources/` 下的 `type` 只能使用：

| 类型 | 页面区块 | 适合内容 | 模板 |
| --- | --- | --- | --- |
| `notes` | 笔记与复习 | 课程笔记、复习提纲、知识整理 | `docs/templates/course-resource.md` |
| `experience` | 学习体验 | 工作量、难点、学习建议、修读体验 | `docs/templates/course-experience.md` |
| `past-paper` | 往年资料 | 往年题型、试题回忆、复习范围回忆 | `docs/templates/past-paper.md` |

不要在 `resources` 里使用 `assessment`、`external`、`lab` 等类型。当前 schema 不接受这些类型。

## 内容要求

- 区分可核实事实和个人体验，不提交个人隐私信息。
- 不提交盗版教材、整套未授权课件、当前作业成品或未公开试题。 
- 转载内容必须保留作者、原链接和许可证。

完整边界见 [CONTENT-POLICY.md](CONTENT-POLICY.md) 和 [PRIVACY.md](PRIVACY.md)。



## 笔记写法建议

- 公式优先使用标准 LaTeX：`$...$`、`$$...$$`
- 多行推导优先用 `aligned` 或相近环境
- `$display`、`$PATH` 这类代码或命令名请使用反引号，不要裸写
- 新增或整理笔记前，建议先看 [笔记编写指南](docs/templates/note-writing-guide.md)

## 位置存放速查表

| 想添加的内容 | 放置位置 | 使用类型 |
| --- | --- | --- |
| 你的的章节笔记 | `src/content/resources/{课程}/{贡献者}/` | `notes` |
| 你的复习速成或知识整理 | `src/content/resources/{课程}/{贡献者}/` | `notes` |
| 你的修读体验 | `src/content/resources/{课程}/{贡献者}/` | `experience` |
| 往年题回忆 | `src/content/resources/{课程}/{贡献者}/` | `past-paper` |
| 课程考核比例 | `src/content/courseContent/{课程}/assessment.md` | `assessment` |
| 课程教材、公开课、仓库链接 | `src/content/courseContent/{课程}/external.md` | `external` |
| 课程名称、学分、分类、简介 | `src/content/courses/{课程}.md` | 课程 frontmatter |
| 错字、失效链接、事实纠错 | 修改原文件或提交 Issue | 不新增类型 |

Issue 表单中可能出现“实验经验、课程介绍”等更宽泛的选项。直接修改仓库时，以 `src/content.config.ts` 的 schema 为准；不符合 schema 的内容需要整理到现有类型中，或先调整 schema 和页面渲染逻辑。

## 一个可供参考的例子

### 新增一篇课程学习体验

新建文件：

```text
src/content/resources/comp400505/Peter/学习体验.md
```

Frontmatter：

```yaml
---
title: "数据结构与算法I学习体验"
course: COMP400505
type: experience
author: Peter
updated: 2026-07-21
order: 20
---
```

正文：

```md
> 学年学期：2025-2026 学年第一学期

## 工作量与难点

...

## 学习建议

...
```

### 更新某门课的考核信息

编辑文件：

```text
src/content/courseContent/eelc400105/assessment.md
```

保留并更新 frontmatter：

```yaml
---
course: EELC400105
type: assessment
updated: 2026-07-21
---
```

正文写课程整体信息：

```md
## 考核构成

- 平时作业：...
- 期末考试：...

## 适用范围

以上信息来自 2025-2026 学年第二学期，后续学期可能变化。
```

### 新增一篇往年题回忆

新建文件：

```text
src/content/resources/eelc400105/Stewie/2026年期末试题回忆.md
```

Frontmatter：

```yaml
---
title: "2026年数字逻辑电路期末试题回忆"
course: EELC400105
type: past-paper
author: Stewie
updated: 2026-07-21
order: 10
---
```
