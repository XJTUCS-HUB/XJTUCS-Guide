# XJTUCS Guide

由西安交通大学计算机专业学生维护的非官方课程资料站，整理课程信息、学习资料和真实的修课经验。本项目已部署到[Github Pages](https://xjtucs-hub.github.io/XJTUCS-Guide/)，可以在线浏览。

> 目前已更新 ICS，数据结构与算法，数字电路，算法分析与设计 相关课程资料，之后会持续更新，欢迎任何人的贡献！

课程 PPT 请前往附属仓库：[XJTUCS Course PPT](https://github.com/XJTUCS-HUB/Course_PPT)。

## 该项目的初衷

该项目的创建是参考XJTUSE学长学姐的优秀项目[XJTUSE-GUIDE](https://github.com/Xjtuse-Guide/Xjtuse-Guide)。笔者大一时就读于软件工程专业，在很多专业课学习上参照着Guide上传授的经验去做，可以说是受益匪浅,指向性、观点性的分享节省了很多本可能浪费在信息检索与路径探索上的时间成本，而且软院的睡裙作为信息获取渠道的同时也让SE的同学能凝聚在一块。

之后大二转专业到计算机专业，我同样在Github上寻找类似的XJTUCS项目想参与贡献，经过搜索后发现最近的聚合网页项目大多于3年前就停止更新，而大部分是个人分享的、分散的个人仓库。另一方面，很多CS的课程都找不到往年资料，大多为qq群中的口口相传，这一点在复习算法分析与设计等课程时体现犹盛。

所以，本项目的初衷是造轮子——在既有生态趋于沉寂的背景下，尝试构建一个可持续维护的、面向 XJTUCS 学生的知识聚合平台，以期降低后续学弟学妹的信息获取门槛。很高兴的是身边人和我有着同样的愿景，于是在26年的假期，我们搭建了XJTUCS-GUIDE。


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
src/content/resources/     笔记、考核与学习体验（按课程 / 贡献者组织）
docs/templates/            投稿示例与 Markdown 模板
```

课程和资料由 Astro Content Collections 校验，见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 参与贡献

不会 Git 的贡献者可以使用 [GitHub Issue Forms](https://github.com/XJTUCS-HUB/XJTUCS-Guide/issues/new/choose)。熟悉 Markdown 或 Git 的贡献者可以编辑源文件并提交 Pull Request（推荐）。

提交前请阅读：

- [贡献指南](CONTRIBUTING.md)
- [内容政策](CONTENT-POLICY.md)
- [隐私说明](PRIVACY.md)
- [投诉与下架](TAKEDOWN.md)
- [安全政策](SECURITY.md)

## 许可证

网站代码采用 [MIT License](LICENSE)。投稿人原创内容默认采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)。
