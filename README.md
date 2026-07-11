# XJTUCS Guide

由西安交通大学计算机专业学生维护的非官方课程资料站，整理课程信息、学习资料和真实的修课经验。

项目不代表学校、学院或课程团队。

## 本地运行

需要 Node.js 和 pnpm。

```bash
pnpm install
pnpm run dev
```

构建静态站：

```bash
CI=true pnpm run build
```

## 内容结构

```text
src/content/courses/       课程基本信息
src/content/resources/     笔记、实验、考核与学习体验（按课程 / 贡献者组织）
docs/templates/            投稿示例与 Markdown 模板
docs/plan/                 已审批的产品与治理计划
```

课程和资料由 Astro Content Collections 校验。内容的必要字段见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 参与贡献

不会 Git 的贡献者可以使用 [GitHub Issue Forms](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new/choose)。熟悉 Markdown 或 Git 的贡献者可以编辑源文件并提交 Pull Request。

提交前请阅读：

- [贡献指南](CONTRIBUTING.md)
- [内容政策](CONTENT-POLICY.md)
- [隐私说明](PRIVACY.md)
- [投诉与下架](TAKEDOWN.md)
- [安全政策](SECURITY.md)

## 许可证

网站代码采用 [MIT License](LICENSE)。投稿人原创内容默认采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)，页面另有说明时除外。
