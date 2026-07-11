import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const vault = '/Users/finlenco/Documents/Personal/Obisidian/MyVault';
const output = new URL('../src/content/resources/', import.meta.url);
const contributor = { name: '戚剑飞', slug: 'qijianfei' };
const groups = [
  { directory: '计算机系统导论', course: 'COMP400727', slug: 'comp400727' },
  { directory: '数据结构与算法', course: 'COMP400505', slug: 'comp400505' },
  { directory: '数字电路与数字逻辑', course: 'EELC400105', slug: 'eelc400105' },
];

const collator = new Intl.Collator('zh-CN', { numeric: true });
const records = [];

for (const group of groups) {
  const directory = path.join(vault, group.directory);
  const files = (await readdir(directory)).filter((name) => name.endsWith('.md')).sort(collator.compare);
  files.forEach((filename, index) => {
    const title = filename.replace(/\.md$/, '');
    records.push({ ...group, contributor, directory, filename, title, id: `${String(index + 1).padStart(2, '0')}-${toSlug(title)}`, order: index + 1 });
  });
}

const byTitle = new Map(records.map((record) => [record.title, record]));

for (const record of records) {
  const sourcePath = path.join(record.directory, record.filename);
  const info = await stat(sourcePath);
  let body = await readFile(sourcePath, 'utf8');
  body = stripFrontmatter(body);
  body = rewriteWikiSyntax(body, record);
  body = rewriteMarkdownLinks(body, record);
  body = body.replace(/^#([^#\s].*)$/gm, '# $1');
  body = body.replace(/^```Bash$/gm, '```bash');

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(record.title)}`,
    `course: ${record.course}`,
    'type: notes',
    `author: ${contributor.name}`,
    `updated: ${info.mtime.toISOString().slice(0, 10)}`,
    `order: ${record.order}`,
    '---',
    '',
  ].join('\n');

  const destination = new URL(`./${record.slug}/${record.contributor.slug}/${record.id}.md`, output);
  await mkdir(new URL(`./${record.slug}/${record.contributor.slug}/`, output), { recursive: true });
  await writeFile(destination, frontmatter + body.trimStart() + '\n');
}

console.log(`Imported ${records.length} Markdown notes.`);

function stripFrontmatter(value) {
  if (!value.startsWith('---\n')) return value;
  const end = value.indexOf('\n---\n', 4);
  return end === -1 ? value : value.slice(end + 5);
}

function rewriteWikiSyntax(value, current) {
  value = value.replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_, asset) => `> 图片引用待补充：${asset}`);
  return value.replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (_, title, anchor, label) => {
    const target = byTitle.get(title.trim());
    if (!target) return label || title;
    return `[${label || title}](${resourceUrl(current, target, anchor)})`;
  });
}

function rewriteMarkdownLinks(value, current) {
  value = value.replace(/!\[([^\]]*)\]\((?!https?:\/\/|data:|\/)([^)]+)\)/g, (_, alt, asset) => `> 图片引用待补充：${decodeURIComponent(asset)}`);
  return value.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]+)?\)/g, (_, label, rawPath, anchor = '') => {
    const decoded = decodeURIComponent(rawPath);
    const title = path.basename(decoded, '.md');
    const target = byTitle.get(title);
    if (!target) return `${label}（链接待补充）`;
    return `[${label}](${resourceUrl(current, target, anchor.replace(/^#/, ''))})`;
  });
}

function resourceUrl(current, record, anchor = '') {
  const hash = anchor ? `#${encodeURI(anchor)}` : '';
  const currentPath = `/resources/${current.slug}/${current.contributor.slug}/${current.id}/`;
  const targetPath = `/resources/${record.slug}/${record.contributor.slug}/${record.id}/`;
  const fromDir = path.posix.dirname(currentPath);
  const href = path.posix.relative(fromDir, targetPath) || './';
  return `${href}${hash}`;
}

function toSlug(value) {
  const ascii = value
    .normalize('NFKD')
    .replace(/[：:&—–]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return ascii || 'note';
}
