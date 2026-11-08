import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const vault = '/Users/finlenco/Documents/Personal/Obisidian/MyVault';
const output = new URL('../src/content/resources/', import.meta.url);
const contributor = { name: '戚剑飞', slug: 'qijianfei' };

// skip: true 的课程只参与双链解析，不重新导出，避免覆盖已投稿内容。
const groups = [
  { directory: '计算机系统导论', course: 'COMP400727', slug: 'comp400727', skip: true },
  { directory: '数据结构与算法', course: 'COMP400505', slug: 'comp400505', skip: true },
  { directory: '数字电路与数字逻辑', course: 'EELC400105', slug: 'eelc400105', skip: true },
  { directory: '人工智能', course: 'COMP551605', slug: 'comp551605' },
  { directory: '计算机网络原理', course: 'COMP450505', slug: 'comp450505' },
  { directory: '操作系统原理', course: 'COMP450205', slug: 'comp450205' },
  { directory: '计算机组成原理', course: 'COMP450105', slug: 'comp450105' },
];

// 笔记首行的课程标签（Obsidian tag），导出时整行删除。
const courseTagPattern = /^#(人工智能|计算机网络原理|操作系统原理|计算机组成)[ \t]*\r?\n/gm;

// Obsidian callout 标记 → 带加粗标签的普通引用块。
const calloutLabels = { note: '注', tip: '提示', warning: '注意', info: '说明', important: '重点', caution: '警告' };

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

// 标题 → 记录列表：不同课程存在同名章节（如「第1章 绪论」），解析双链时优先同课程目标。
const byTitle = new Map();
for (const record of records) {
  const list = byTitle.get(record.title) ?? [];
  list.push(record);
  byTitle.set(record.title, list);
}

let imported = 0;

for (const record of records) {
  if (record.skip) continue;
  const sourcePath = path.join(record.directory, record.filename);
  const info = await stat(sourcePath);
  let body = await readFile(sourcePath, 'utf8');
  body = stripFrontmatter(body);
  body = body.replace(courseTagPattern, '');
  body = rewriteCallouts(body);
  body = body.replace(/!\[([^\]\n]*?)\|(\d+)\]/g, '![$1]');
  body = rewriteWikiSyntax(body, record);
  body = rewriteMarkdownLinks(body, record);
  body = fixHeadingsOutsideFences(body);
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
  imported += 1;
}

console.log(`Imported ${imported} Markdown notes (skipped ${records.length - imported} existing).`);

function stripFrontmatter(value) {
  if (!value.startsWith('---\n')) return value;
  const end = value.indexOf('\n---\n', 4);
  return end === -1 ? value : value.slice(end + 5);
}

function rewriteCallouts(value) {
  return value.replace(/^> \[!(NOTE|TIP|WARNING|INFO|IMPORTANT|CAUTION)\][ \t]*(.*)$/gim, (_, type, rest) => {
    const label = calloutLabels[type.toLowerCase()];
    const title = rest.trim();
    return title ? `> **【${label}】${title}**` : `> **【${label}】**`;
  });
}

function rewriteWikiSyntax(value, current) {
  value = value.replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_, asset) => `> 图片引用待补充：${asset}`);
  return value.replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (_, title, anchor, label) => {
    const candidates = byTitle.get(title.trim()) ?? [];
    const target = candidates.find((record) => record.course === current.course) ?? (candidates.length === 1 ? candidates[0] : undefined);
    if (!target) return label || title;
    return `[${label || title}](${resourceUrl(current, target, anchor)})`;
  });
}

function rewriteMarkdownLinks(value, current) {
  value = value.replace(/!\[([^\]]*)\]\((?!https?:\/\/|data:|\/)([^)]+)\)/g, (_, alt, asset) => `> 图片引用待补充：${decodeURIComponent(asset)}`);
  return value.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]+)?\)/g, (_, label, rawPath, anchor = '') => {
    const decoded = decodeURIComponent(rawPath);
    const title = path.basename(decoded, '.md');
    const target = byTitle.get(title)?.[0];
    if (!target) return `${label}（链接待补充）`;
    return `[${label}](${resourceUrl(current, target, anchor.replace(/^#/, ''))})`;
  });
}

// 站点标题 slug 规则（与 Astro 构建产物一致）：小写，去掉字母数字空白连字符以外的字符，空白折叠为单个连字符。
function astroSlug(text) {
  return text
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function resourceUrl(current, record, anchor = '') {
  const hash = anchor ? `#${astroSlug(anchor)}` : '';
  const currentPath = `/resources/${current.slug}/${current.contributor.slug}/${current.id}/`;
  const targetPath = `/resources/${record.slug}/${record.contributor.slug}/${record.id}/`;
  const fromDir = path.posix.dirname(currentPath);
  const href = path.posix.relative(fromDir, targetPath) || './';
  return `${href}${hash}`;
}

// 把「#标题」补成「# 标题」，但跳过 ``` 代码块内的行（例如 #pragma）。
function fixHeadingsOutsideFences(value) {
  const lines = value.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) lines[i] = lines[i].replace(/^#([^#\s].*)$/, '# $1');
  }
  return lines.join('\n');
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
