import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const CONTENT_DIRECTORIES = [
  'src/content/courses',
  'src/content/resources',
  'src/content/courseContent',
];

const normalizePath = (value) => value.split(path.sep).join('/');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function collectLocalSnapshot(root = process.cwd()) {
  const absoluteFiles = [];
  for (const directory of CONTENT_DIRECTORIES) {
    absoluteFiles.push(...await walk(path.join(root, directory)));
  }

  const files = await Promise.all(absoluteFiles.map(async (absolutePath) => {
    const relativePath = normalizePath(path.relative(root, absolutePath));
    const info = await stat(absolutePath);
    const isMarkdown = /\.(?:md|mdx)$/i.test(relativePath);
    return {
      path: relativePath,
      size: info.size,
      content: isMarkdown ? await readFile(absolutePath, 'utf8') : undefined,
    };
  }));
  const paths = files.map((entry) => entry.path);
  return { paths, files, changedPaths: paths };
}
