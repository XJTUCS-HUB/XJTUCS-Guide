import { collectLocalSnapshot } from './local-snapshot.mjs';
import { formatIssue, validateSnapshot } from './rules.mjs';

const snapshot = await collectLocalSnapshot();
const issues = validateSnapshot(snapshot);

for (const issue of issues) {
  const output = issue.severity === 'fail' ? console.error : console.warn;
  output(formatIssue(issue));
}

const failures = issues.filter((issue) => issue.severity === 'fail');
const warnings = issues.filter((issue) => issue.severity === 'warn');
console.log(`Repository policy: ${failures.length} failure(s), ${warnings.length} warning(s).`);

if (failures.length > 0) process.exitCode = 1;
