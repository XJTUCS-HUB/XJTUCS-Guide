# PR 审查与 Ruleset 管理指南

本文供仓库 Owner 和管理员使用，记录当前 Pull Request 门禁、管理员审批方式和 Ruleset 运维流程。

## 管理目标

当前规则需要同时保证：

1. `Build / build` 失败时，不论 PR 作者或合并者是否为 Owner，都不能正常合并。
2. 普通贡献者提交的合规 PR 需要等待具有管理权限的维护者审批。
3. Owner 自己提交的合规 PR 可以在人工确认后合并。

GitHub 不允许 PR 作者正式 Approve 自己的 PR。因此，Owner 自己提交 PR 时使用的是对“审批规则”的手动 bypass，而不是自我 Approval。

## 当前检查链路

每个 Ready for review 的 PR 会涉及两条工作流：

- `Build / build`：检出 PR 内容，运行规则测试、`policy:check`、Astro 检查和构建；这是 Required Check，也是实际合并门禁。
- `PR Policy / danger`：使用默认分支中的受信任规则读取 PR 文件并更新 Danger 评论；它负责反馈，不作为 Required Check。

当 Danger 报告 `FAIL` 时，同一规则也应使 `Build / build` 失败。Danger 评论显示“通过”不能替代 Required Check，也不能替代管理员 Approval。

## 两个 Ruleset 的构造

多个 Ruleset 会同时作用于默认分支。为避免 Owner 绕过审批时一并绕过构建门禁，CI 和审批必须分开。

### CI Gate

建议名称：

```text
CI Gate
```

设置：

```text
Enforcement status: Active
Target branches: Default
Bypass list: 空
```

开启：

```text
Restrict deletions
Require a pull request before merging
  Required approvals: 0
Require status checks to pass
  Build / build
Block force pushes
```

可选但推荐：

```text
Require branches to be up to date before merging
```

`CI Gate` 不得添加 Repository administrators、Owner、GitHub App 或其他 bypass actor。否则管理员可能绕过 `Build / build`，破坏“出现 FAIL 时任何人都不能合并”的目标。

### Review Gate

建议名称：

```text
Review Gate
```

设置：

```text
Enforcement status: Active
Target branches: Default
Bypass list:
  Repository administrators
  For pull requests only
```

开启：

```text
Require a pull request before merging
  Required approvals: 1
```

建议开启：

```text
Dismiss stale pull request approvals when new commits are pushed
Require conversation resolution before merging
```

`Review Gate` 不需要重复添加 `Build / build`。管理员 bypass 只应存在于这个负责审批的 Ruleset 中。

## 管理员怎样处理 PR

### 普通贡献者的 PR

1. 等待 `Build / build` 完成。
2. 阅读 Danger 评论，确认没有 `FAIL`，并判断 `WARN` 是否需要修复或说明。
3. 检查内容真实性、版权、隐私和泄题风险。
4. 在 `Files changed → Review changes` 中选择 `Approve`。
5. 确认 Required Checks 仍然通过，再合并。

如果贡献者在 Approval 后继续 push，而仓库启用了 stale approval 清理，管理员需要重新审查并再次 Approve。

### Owner 自己提交的 PR

Owner 不能 Approve 自己的 PR。正确流程是：

1. 等待 `Build / build` 通过。
2. 阅读 Danger 评论并完成人工复核。
3. 在合并区域选择 bypass review requirement。
4. 阅读 GitHub 显示的绕过规则和目标分支。
5. 手动确认后合并；若 GitHub 要求填写理由，应简要记录“Owner self-authored PR; required checks passed”等可审计原因。

这个确认步骤是预期行为，不应通过扩大 `CI Gate` bypass 权限来消除。

如果 `Build / build` 失败，即使只剩审批提示也不得合并。若页面允许管理员绕过失败的 Build，立即检查 `CI Gate` 的 bypass list 是否误加了管理员。

## 修改 Ruleset

进入：

```text
Repository → Settings → Rules → Rulesets
```

选择相应 Ruleset 后编辑并保存。

修改时遵循以下边界：

- 构建检查、删除保护和 Force Push 保护只修改 `CI Gate`。
- 审批数量、过期审批和对话解决要求只修改 `Review Gate`。
- Owner 的 PR-only bypass 只保留在 `Review Gate`。
- 不把 `PR Policy / danger` 设为 Required Check。
- 不随意修改 `.github/workflows/build.yml` 中的 workflow 名称 `Build` 或 job 名称 `build`。

如果确需重命名 workflow 或 job：

1. 先在测试 PR 中让新名称对应的检查成功运行一次。
2. 在 `CI Gate` 中加入新的 Required Check。
3. 验证正确和错误 PR。
4. 再移除旧的 Required Check。

否则 GitHub 可能一直等待一个不再产生的检查结果。

每次修改门禁后，至少执行：

1. Owner 的正确 PR；
2. Owner 的错误 PR；
3. 普通贡献者的正确 PR；
4. 普通贡献者的错误 PR；
5. 错误修复后继续 push 到原 PR。

## 暂时关闭或恢复

Ruleset、Build 工作流和 Danger 评论是三个不同层次，关闭其中一个不会自动关闭另外两个。

### 只暂停审批要求

将 `Review Gate` 的 Enforcement status 改为 `Disabled`。

结果：

- 不再要求一个 Approval；
- `CI Gate` 继续阻止失败 PR；
- Danger 和 Build 继续运行。

这是人员暂时不足时风险最小的降级方式。

### 暂停所有合并门禁

将 `CI Gate` 和 `Review Gate` 都改为 `Disabled`。

这样会取消默认分支的对应合并保护，应仅用于明确的仓库维护场景。优先使用 `Disabled`，不要直接删除 Ruleset，以便恢复和审计。

恢复时先启用 `CI Gate`，确认 `Build / build` 能在测试 PR 中产生并通过，再启用 `Review Gate`。

### 只停止 Danger 评论

在 GitHub Actions 中禁用 `PR Policy` 工作流，或通过 PR 修改 `.github/workflows/danger.yml`。

这不会关闭 `Build / build`，规则检查仍可阻止合并，只是不会生成友好的 Danger 评论。

不要在 `CI Gate` 仍要求 `Build / build` 时直接禁用或删除 `Build` 工作流。否则新 PR 无法产生必需检查，可能全部卡在等待状态。需要停止 Build 时，应先通过受审查的设置变更移除或禁用对应 Required Check。

## 故障排查

### Danger 评论没有及时更新

先检查 `PR Policy / danger` 是否仍在排队或运行。完成后刷新 PR 页面；不要要求贡献者重新开 PR。

### Danger 显示 FAIL，但 Build 通过

这说明评论规则和合并门禁发生了不一致。暂缓合并，并检查：

- 默认分支中的 Danger 规则是否与 PR 构建使用的规则一致；
- `Build / build` 是否仍执行 `pnpm run policy:check`；
- PR 是否修改了规则代码或工作流；
- `CI Gate` 是否仍要求正确的 `Build / build`。

### 正确 PR 一直等待 Build

检查 Actions 是否允许工作流运行，以及 `CI Gate` 中保存的 Required Check 名称是否仍与 workflow/job 名称一致。

## 相关文件

```text
.github/workflows/build.yml
.github/workflows/danger.yml
dangerfile.js
scripts/pr-policy/
danger-review.md
```

GitHub 官方参考：

- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews)
