# Danger.js PR 审查使用与设置

本仓库使用 Danger.js 在 Pull Request 阶段检查确定性的仓库规范，例如内容目录、Frontmatter、课程引用和 PDF 配对。

该工具不会对文章内容进行审核与评价，只检查提交内容是否符合规范。

## 它是怎样工作的

PR 会触发两个互相独立的检查：

1. `Build / build` 在无写权限的普通 `pull_request` 环境中检出 PR，运行规则测试、完整仓库校验、`astro check` 和 `astro build`。
2. `PR Policy / danger` 使用默认分支中受信任的规则代码，通过 GitHub API 把 PR 文件作为数据读取，并更新一条 Danger 评论。

两处调用同一个规则引擎：`scripts/pr-policy/rules.mjs`。`dangerfile.js` 只负责将结果转换为 PR 评论。

## Contributor：提交前怎样检查

首次参与时安装依赖：

```bash
pnpm install
```

提交前依次运行：

```bash
pnpm run policy:test
pnpm run policy:check
pnpm run check
```

- `policy:test` 测试审查规则本身。
- `policy:check` 检查当前仓库全部内容。
- `check` 运行 `astro check` 和正式静态构建。

Danger 输出分为两种：

- `FAIL`：会阻止合并，必须修复。
- `WARN`：不会阻止合并；请尽量修复，无法或无需修复时可在 PR 中说明原因。

收到 `FAIL` 或 `WARN` 后，直接修改原分支并继续 push 到同一个 PR 即可。不要为修复检查结果关闭或重新创建 PR。

新提交会触发 `PR Policy / danger` 重新运行，并更新原有 Danger 评论。评论更新不是实时的：工作流仍在运行时，或 GitHub 页面没有自动刷新时，可能暂时看到旧结果。请先等待 PR 页面 Checks 区域中的 `PR Policy / danger` 运行完成，再刷新页面查看。合并是否被阻止以 Required Check `Build / build` 的最终状态为准。

### 常见阻断错误

- 课程文件不是 `src/content/courses/{课程代码小写}.md`。
- 课程代码、目录名和 Frontmatter 不一致。
- 资源没有放在 `src/content/resources/{课程代码}/{贡献者目录}/{文件}.md`。
- 贡献者目录包含大写字母、中文或约定外字符。
- 缺少 Frontmatter，YAML 无法解析，必填字段为空，枚举或数据类型错误。
- `course` 引用了不存在的课程。
- `assessment.md`、`external.md` 的文件名和 `type` 不一致。
- `pdf` 含路径、扩展名错误、同目录文件不存在或大小写不一致。
- 删除仍被引用的课程或 PDF。
- Content Collection 目录中出现不支持的文件类型。

超过 10 MB 的 PDF 当前只产生警告。`public` 目录的资源建议使用 `author: Public`。

### 常见修复

贡献者目录必须全小写：

```text
错误：src/content/resources/elec327204/Shirakawa05/学习体验.md
正确：src/content/resources/elec327204/shirakawa05/学习体验.md
```

资源目录和课程字段必须对应：

```yaml
# src/content/resources/comp400727/alice/note.md
course: COMP400727
```

PDF 必须与 Markdown 同目录，且名称完全一致：

```yaml
pdf: 离散数学笔记.pdf
```

不要填写 `./离散数学笔记.pdf`、子目录或大小写不同的名称。

## 仓库管理员

管理员审批、自有 PR 的处理方式、双 Ruleset 构造及日常运维见：

- [PR 审查与 Ruleset 管理指南](docs/maintainers/pr-rulesets.md)

当前合并门禁以 `Build / build` 为准，`PR Policy / danger` 负责生成易读的 PR 评论，不应将 Danger 评论本身当作 GitHub Approval。

## 安全边界

`.github/workflows/danger.yml` 使用 `pull_request_target`，因为公开仓库的 fork PR 无法在普通 `pull_request` 工作流中获得评论写权限。这也意味着该工作流必须遵守以下规则：

- 只能检出 `github.event.pull_request.base.sha`。
- 不能检出、执行或导入 PR head 中的任何代码。
- 不能运行 PR 修改后的 `package.json`、Dangerfile、脚本或依赖。
- PR 文件只能通过 GitHub API读取并作为普通文本或文件元数据解析。
- 不要把 PR 标题、正文或文件内容直接拼接进 shell 命令。

普通 `Build` 工作流可以检出并构建 PR，但它只有 `contents: read`，不得加入 secrets 或写仓库权限。

## 修改规则

规则实现位于：

```text
scripts/pr-policy/rules.mjs
```

每次增加或修正规则时：

1. 在 `scripts/pr-policy/__tests__/` 添加有效和无效样例。
2. 运行 `pnpm run policy:test`。
3. 运行 `pnpm run policy:check`，确认现有仓库不会被误伤。
4. 更新本文档和 `CONTRIBUTING.md` 中对应规范。
5. 由维护者重点审查 Danger 工作流的权限和 checkout ref。

调整 PDF 阈值时，修改 `validateSnapshot` 的 `pdfWarnBytes` 默认值并补充测试。将警告升级为阻断时，应先观察真实 PR，确保不会误伤已有内容。

## 故障排查

### Danger 没有评论

- 确认 PR 不是 Draft；Draft 转为 Ready 后会触发。
- 查看 `PR Policy / danger` 日志。
- 确认工作流已存在于默认分支。
- 确认组织策略允许 `pull-requests: write`。
- 确认 fork PR 的工作流已获维护者运行许可。

### 本地通过，但 CI 失败

重点检查路径大小写。本地 Windows 文件系统通常不区分大小写，而 GitHub Actions 和 GitHub Pages 使用 Linux。重命名仅改变大小写时，可使用两步 `git mv`：

```bash
git mv Shirakawa05 temporary-name
git mv temporary-name shirakawa05
```

### Danger 通过，但 Astro 构建失败

Danger 只覆盖已经编码的仓库规则，Astro 构建仍是最终事实来源。

如果出现此类情况，请及时告知repo维护人员。维护人员会尽快把新的失败原因整理为测试，并加入规则引擎，防止同类问题再次进入构建阶段。
