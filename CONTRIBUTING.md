# 参与贡献

XJTUCS Guide 接受课程资料、学习体验、推免经验和内容纠错。不会 Git 也可以通过 GitHub Issue 投稿。

## 选择贡献方式

| 方式 | 适用情况 |
| --- | --- |
| [新增课程资料](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new?template=course-resource.yml) | 投稿笔记、实验经验、考核信息或外部资源 |
| [投稿经验](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new?template=experience.yml) | 投稿课程学习体验或推免经验 |
| [报告错误](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new?template=correction.yml) | 修改事实、错字、失效链接或过时内容 |
| Pull Request | 批量新增内容或直接修改 Markdown |

隐私、版权、名誉、安全和当前考试泄题问题不要发公开 Issue。请按照 [TAKEDOWN.md](TAKEDOWN.md) 处理。

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

1. 在 `src/content/resources/{课程代码}/` 新建 Markdown 文件。
2. 复制 [课程资料模板](docs/templates/course-resource.md)。
3. 填写课程代码、类型、作者或来源和更新时间。
4. 正文只放自己原创或明确获得授权的内容。
5. 图片优先使用稳定的 HTTPS 地址，不提交大体积附件。

资料类型只能使用：`notes`、`lab`、`assessment`、`experience`、`past-paper`、`external`。

## 内容要求

- 区分可核实事实和个人体验。
- 不使用“必考”“原题”“押题”等无法保证的表述。
- 不提交盗版教材、整套未授权课件、当前作业成品或未公开试题。
- 不提交学号、成绩单、手机号、私人账号、Token、群聊截图等信息。
- 转载内容必须保留作者、原链接和许可证。
- 学习体验不评分、不排名、不聚合。

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

课程代码必须已经存在于 `src/content/courses/`。不确定代码、分类或学分时，请标记“待核对”，不要自行推断。
