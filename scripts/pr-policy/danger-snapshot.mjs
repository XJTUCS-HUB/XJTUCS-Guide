const normalizePath = (value) => value.replaceAll('\\', '/');
const isMarkdown = (file) => /\.(?:md|mdx)$/i.test(file);
const isRelevant = (file) => file.startsWith('src/content/');

export async function collectDangerSnapshot(danger) {
  const head = danger.github.pr.head;
  if (!head?.repo?.full_name || !head.sha) {
    throw new Error('无法确定 Pull Request 的 head 仓库或 commit。');
  }

  const [owner, repo] = head.repo.full_name.split('/');
  const response = await danger.github.api.git.getTree({
    owner,
    repo,
    tree_sha: head.sha,
    recursive: 'true',
  });
  if (response.data.truncated) {
    throw new Error('Pull Request 文件树过大，GitHub API 返回了截断结果。');
  }

  const files = response.data.tree
    .filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
    .map((entry) => ({
      path: normalizePath(entry.path),
      size: entry.size ?? 0,
    }));
  const paths = files.map((entry) => entry.path);
  const pathSet = new Set(paths);
  const changedPaths = [...new Set([
    ...danger.git.created_files,
    ...danger.git.modified_files,
    ...danger.git.deleted_files,
  ].map(normalizePath))];

  const contentPaths = new Set(
    changedPaths.filter((file) => pathSet.has(file) && isRelevant(file) && isMarkdown(file)),
  );

  for (const deleted of changedPaths.filter((file) => !pathSet.has(file) && file.toLowerCase().endsWith('.pdf'))) {
    const directory = deleted.slice(0, deleted.lastIndexOf('/') + 1);
    for (const candidate of paths) {
      if (candidate.startsWith(directory) && !candidate.slice(directory.length).includes('/') && isMarkdown(candidate)) {
        contentPaths.add(candidate);
      }
    }
  }

  const contents = new Map(await Promise.all([...contentPaths].map(async (file) => [
    file,
    await danger.github.utils.fileContents(file, head.repo.full_name, head.sha),
  ])));

  return {
    paths,
    changedPaths,
    files: files.map((entry) => ({ ...entry, content: contents.get(entry.path) })),
  };
}
