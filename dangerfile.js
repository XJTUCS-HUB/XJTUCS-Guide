import { danger, fail, markdown, message, schedule, warn } from 'danger';
import { collectDangerSnapshot } from './scripts/pr-policy/danger-snapshot.mjs';
import { validateSnapshot } from './scripts/pr-policy/rules.mjs';

schedule(async () => {
  const snapshot = await collectDangerSnapshot(danger);
  const issues = validateSnapshot(snapshot);
  const failures = issues.filter((issue) => issue.severity === 'fail');
  const warnings = issues.filter((issue) => issue.severity === 'warn');

  for (const issue of failures) {
    fail(`**${issue.code}** — ${issue.message}`, issue.file);
  }
  for (const issue of warnings) {
    warn(`**${issue.code}** — ${issue.message}`, issue.file);
  }

  if (issues.length === 0) {
    message('仓库内容规则检查通过。');
    return;
  }

  markdown([
    '### Repository Policy 汇总',
    '',
    `- 阻断问题：**${failures.length}**`,
    `- 警告：**${warnings.length}**`,
    '',
    '请修复阻断问题后继续提交；Danger 会在下一次 push 后更新本评论。',
  ].join('\n'));
});
