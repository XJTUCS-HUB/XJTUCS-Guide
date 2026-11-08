import test from 'node:test';
import assert from 'node:assert/strict';
import { collectDangerSnapshot } from '../danger-snapshot.mjs';

test('collects changed PR content from the head repository without checking it out', async () => {
  const requested = [];
  const danger = {
    git: {
      created_files: ['src/content/resources/comp400727/tester/note.md'],
      modified_files: [],
      deleted_files: ['src/content/resources/comp400727/tester/old.pdf'],
    },
    github: {
      pr: {
        head: {
          sha: 'abc123',
          repo: { full_name: 'contributor/fork' },
        },
      },
      api: {
        git: {
          getTree: async (options) => {
            assert.deepEqual(options, {
              owner: 'contributor',
              repo: 'fork',
              tree_sha: 'abc123',
              recursive: 'true',
            });
            return {
              data: {
                truncated: false,
                tree: [
                  { type: 'blob', path: 'src/content/courses/comp400727.md', size: 100 },
                  { type: 'blob', path: 'src/content/resources/comp400727/tester/note.md', size: 200 },
                  { type: 'blob', path: 'src/content/resources/comp400727/tester/other.md', size: 300 },
                ],
              },
            };
          },
        },
      },
      utils: {
        fileContents: async (file, repo, ref) => {
          requested.push({ file, repo, ref });
          return `---\ntitle: ${file}\n---\n`;
        },
      },
    },
  };

  const snapshot = await collectDangerSnapshot(danger);

  assert.deepEqual(snapshot.changedPaths, [
    'src/content/resources/comp400727/tester/note.md',
    'src/content/resources/comp400727/tester/old.pdf',
  ]);
  assert.deepEqual(requested, [
    {
      file: 'src/content/resources/comp400727/tester/note.md',
      repo: 'contributor/fork',
      ref: 'abc123',
    },
    {
      file: 'src/content/resources/comp400727/tester/other.md',
      repo: 'contributor/fork',
      ref: 'abc123',
    },
  ]);
  assert.equal(
    snapshot.files.find((entry) => entry.path.endsWith('/other.md')).content,
    '---\ntitle: src/content/resources/comp400727/tester/other.md\n---\n',
  );
});

test('fails closed when GitHub truncates the PR tree', async () => {
  const danger = {
    git: { created_files: [], modified_files: [], deleted_files: [] },
    github: {
      pr: { head: { sha: 'abc123', repo: { full_name: 'contributor/fork' } } },
      api: { git: { getTree: async () => ({ data: { truncated: true, tree: [] } }) } },
      utils: { fileContents: async () => '' },
    },
  };

  await assert.rejects(
    collectDangerSnapshot(danger),
    /文件树过大/,
  );
});
