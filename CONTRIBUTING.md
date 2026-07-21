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

## 课程级公共内容

考核信息、外部资源等属于课程整体而非某个贡献者的内容，放在 `src/content/courseContent/{课程代码}/` 下，按类型命名文件：

```text
src/content/courseContent/{课程代码}/{类型}.md
```

类型只能使用以下两种：

| 类型 | 含义 | 建议内容 |
| --- | --- | --- |
| `assessment` | 考核信息 | 考核形式、题型分布、分值构成 |
| `external` | 外部资源 | 教材、公开课、课程团队网站和相关仓库 |

每门课程默认已建好这两份占位文件，**直接编辑现有文件填入正文即可**，无需新建。若课程尚未建目录，按上面的路径新建 `{类型}.md`。`course` 必须已经存在于 `src/content/courses/`。

Frontmatter 示例：

```yaml
---
course: EELC400105
type: external
updated: 2026-07-17
---
```

`updated` 按实际更新日期填写。这类内容直接在课程页内联渲染，不生成独立资源页，也不按贡献者分组；因此正文不要署个人作者，涉及转载时在文末注明来源与许可证。

## 内容要求

- 区分可核实事实和个人体验，不提交个人隐私信息。
- 不提交盗版教材、整套未授权课件、当前作业成品或未公开试题。 
- 转载内容必须保留作者、原链接和许可证。

完整边界见 [CONTENT-POLICY.md](CONTENT-POLICY.md) 和 [PRIVACY.md](PRIVACY.md)。

## Frontmatter 示例

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

课程代码必须已经存在于 `src/content/courses/`。不确定代码、分类或学分时，请标记“待核对”。

## 笔记写法建议

- 公式优先使用标准 LaTeX：`$...$`、`$$...$$`
- 多行推导优先用 `aligned` 或相近环境
- `$display`、`$PATH` 这类代码或命令名请使用反引号，不要裸写
- 新增或整理笔记前，建议先看 [笔记编写指南](docs/templates/note-writing-guide.md)
