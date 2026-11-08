import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSnapshot } from '../rules.mjs';

const course = `---
code: COMP400727
name: 计算机系统导论
category: 专业选修
requirement: elective
credits: 4
summary: 示例课程
updated: 2026-07-26
---
`;

const resource = `---
title: 示例笔记
course: COMP400727
type: notes
author: Tester
updated: 2026-07-26
order: 1
pdf: note.pdf
---
`;

const validSnapshot = () => ({
  paths: [
    'src/content/courses/comp400727.md',
    'src/content/resources/comp400727/tester/note.md',
    'src/content/resources/comp400727/tester/note.pdf',
    'src/content/courseContent/comp400727/assessment.md',
  ],
  changedPaths: [
    'src/content/courses/comp400727.md',
    'src/content/resources/comp400727/tester/note.md',
    'src/content/resources/comp400727/tester/note.pdf',
    'src/content/courseContent/comp400727/assessment.md',
  ],
  files: [
    { path: 'src/content/courses/comp400727.md', size: course.length, content: course },
    { path: 'src/content/resources/comp400727/tester/note.md', size: resource.length, content: resource },
    { path: 'src/content/resources/comp400727/tester/note.pdf', size: 1024 },
    {
      path: 'src/content/courseContent/comp400727/assessment.md',
      size: 100,
      content: `---\ncourse: COMP400727\ntype: assessment\nupdated: 2026-07-26\n---\n`,
    },
  ],
});

test('accepts a valid repository snapshot', () => {
  assert.deepEqual(validateSnapshot(validSnapshot()), []);
});

test('rejects an uppercase contributor directory', () => {
  const snapshot = validSnapshot();
  const oldPath = 'src/content/resources/comp400727/tester/note.md';
  const newPath = 'src/content/resources/comp400727/Tester/note.md';
  snapshot.paths = snapshot.paths.map((file) => file === oldPath ? newPath : file);
  snapshot.changedPaths = [newPath];
  snapshot.files = snapshot.files.map((entry) => entry.path === oldPath ? { ...entry, path: newPath } : entry);

  assert(validateSnapshot(snapshot).some((issue) => issue.code === 'resource.contributor-directory'));
});

test('rejects a missing referenced PDF', () => {
  const snapshot = validSnapshot();
  snapshot.paths = snapshot.paths.filter((file) => !file.endsWith('/note.pdf'));
  snapshot.files = snapshot.files.filter((entry) => !entry.path.endsWith('/note.pdf'));
  snapshot.changedPaths = ['src/content/resources/comp400727/tester/note.md'];

  assert(validateSnapshot(snapshot).some((issue) => issue.code === 'pdf.missing'));
});

test('rejects a resource that points at another course', () => {
  const snapshot = validSnapshot();
  snapshot.changedPaths = ['src/content/resources/comp400727/tester/note.md'];
  snapshot.files = snapshot.files.map((entry) => entry.path.endsWith('/note.md')
    ? { ...entry, content: entry.content.replace('course: COMP400727', 'course: COMP999999') }
    : entry);

  const codes = validateSnapshot(snapshot).map((issue) => issue.code);
  assert(codes.includes('resource.path-course'));
  assert(codes.includes('resource.unknown-course'));
});

test('rejects deleting a course that still owns content', () => {
  const snapshot = validSnapshot();
  snapshot.paths = snapshot.paths.filter((file) => file !== 'src/content/courses/comp400727.md');
  snapshot.files = snapshot.files.filter((entry) => entry.path !== 'src/content/courses/comp400727.md');
  snapshot.changedPaths = ['src/content/courses/comp400727.md'];

  assert(validateSnapshot(snapshot).some((issue) => issue.code === 'course.delete-referenced'));
});

test('rejects deleting a referenced PDF', () => {
  const snapshot = validSnapshot();
  snapshot.paths = snapshot.paths.filter((file) => !file.endsWith('/note.pdf'));
  snapshot.files = snapshot.files.filter((entry) => !entry.path.endsWith('/note.pdf'));
  snapshot.changedPaths = ['src/content/resources/comp400727/tester/note.pdf'];

  assert(validateSnapshot(snapshot).some((issue) => issue.code === 'pdf.deleted-referenced'));
});
