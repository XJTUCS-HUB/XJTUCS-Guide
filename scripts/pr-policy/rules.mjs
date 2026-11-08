import path from 'node:path';
import YAML from 'yaml';

const COURSE_CODE = /^[A-Z]{4}\d{6}$/;
const COURSE_SLUG = /^[a-z]{4}\d{6}$/;
const CONTRIBUTOR_SLUG = /^[a-z0-9][a-z0-9._-]*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MARKDOWN_EXTENSION = /\.(?:md|mdx)$/i;
const CONTENT_ROOTS = [
  'src/content/courses/',
  'src/content/resources/',
  'src/content/courseContent/',
];

const normalizePath = (value) => value.replaceAll('\\', '/').replace(/^\.?\//, '');

const makeIssue = (severity, code, message, file) => ({
  severity,
  code,
  message,
  file,
});

const isContentPath = (file) => CONTENT_ROOTS.some((root) => file.startsWith(root));

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidDate = (value) => {
  if (!isNonEmptyString(value) || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};

const requireString = (data, field, issues, file) => {
  if (!isNonEmptyString(data[field])) {
    issues.push(makeIssue('fail', 'frontmatter.required', `\`${field}\` 必须是非空字符串。`, file));
  }
};

const requireDate = (data, field, issues, file) => {
  if (!isValidDate(data[field])) {
    issues.push(makeIssue('fail', 'frontmatter.date', `\`${field}\` 必须使用有效的 YYYY-MM-DD 日期。`, file));
  }
};

const requireEnum = (data, field, values, issues, file) => {
  if (!values.includes(data[field])) {
    issues.push(makeIssue(
      'fail',
      'frontmatter.enum',
      `\`${field}\` 只能是 ${values.map((value) => `\`${value}\``).join('、')}。`,
      file,
    ));
  }
};

export function parseFrontmatter(content, file) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return {
      data: null,
      issues: [makeIssue('fail', 'frontmatter.missing', '文件必须以完整的 YAML Frontmatter 开头。', file)],
    };
  }

  try {
    const data = YAML.parse(match[1]);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {
        data: null,
        issues: [makeIssue('fail', 'frontmatter.object', 'Frontmatter 必须是 YAML 对象。', file)],
      };
    }
    return { data, issues: [] };
  } catch (error) {
    return {
      data: null,
      issues: [makeIssue('fail', 'frontmatter.yaml', `Frontmatter YAML 无法解析：${error.message}`, file)],
    };
  }
}

function validateCourse(file, data, courseSlug, issues) {
  for (const field of ['code', 'name', 'category', 'summary']) {
    requireString(data, field, issues, file);
  }
  requireEnum(data, 'requirement', ['required', 'elective'], issues, file);
  requireDate(data, 'updated', issues, file);

  if (isNonEmptyString(data.code) && !COURSE_CODE.test(data.code)) {
    issues.push(makeIssue('fail', 'course.code-format', '`code` 必须由 4 位大写字母和 6 位数字组成。', file));
  }
  if (data.code !== courseSlug.toUpperCase()) {
    issues.push(makeIssue(
      'fail',
      'course.path-code',
      `文件名要求课程代码为 \`${courseSlug.toUpperCase()}\`，当前为 \`${data.code ?? ''}\`。`,
      file,
    ));
  }
  if (data.credits !== undefined && (typeof data.credits !== 'number' || !Number.isFinite(data.credits))) {
    issues.push(makeIssue('fail', 'course.credits', '`credits` 必须是数字。', file));
  }
  if (data.draft !== undefined && typeof data.draft !== 'boolean') {
    issues.push(makeIssue('fail', 'course.draft', '`draft` 必须是布尔值。', file));
  }
}

function validateResource(file, data, courseSlug, contributor, paths, entries, courseSlugs, options, issues) {
  for (const field of ['title', 'course', 'author']) {
    requireString(data, field, issues, file);
  }
  requireEnum(data, 'type', ['notes', 'experience', 'past-paper'], issues, file);
  requireDate(data, 'updated', issues, file);

  if (data.order !== undefined && (typeof data.order !== 'number' || !Number.isFinite(data.order))) {
    issues.push(makeIssue('fail', 'resource.order', '`order` 必须是数字。', file));
  }

  const expectedCourse = courseSlug.toUpperCase();
  if (data.course !== expectedCourse) {
    issues.push(makeIssue(
      'fail',
      'resource.path-course',
      `目录对应课程 \`${expectedCourse}\`，但 Frontmatter 中为 \`${data.course ?? ''}\`。`,
      file,
    ));
  }
  if (isNonEmptyString(data.course) && !courseSlugs.has(data.course.toLowerCase())) {
    issues.push(makeIssue('fail', 'resource.unknown-course', `课程 \`${data.course}\` 不存在。`, file));
  }
  if (contributor === 'public' && data.author !== 'Public') {
    issues.push(makeIssue('warn', 'resource.public-author', '`public` 目录中的资源建议使用 `author: Public`。', file));
  }

  if (data.pdf !== undefined) {
    if (!isNonEmptyString(data.pdf)) {
      issues.push(makeIssue('fail', 'pdf.name', '`pdf` 必须是非空文件名。', file));
      return;
    }
    if (data.pdf.includes('/') || data.pdf.includes('\\') || path.posix.basename(data.pdf) !== data.pdf) {
      issues.push(makeIssue('fail', 'pdf.basename', '`pdf` 只能填写同目录下的文件名，不能包含路径。', file));
      return;
    }
    if (!data.pdf.endsWith('.pdf')) {
      issues.push(makeIssue('fail', 'pdf.extension', '`pdf` 文件名必须以小写 `.pdf` 结尾。', file));
    }

    const pdfPath = path.posix.join(path.posix.dirname(file), data.pdf);
    if (!paths.has(pdfPath)) {
      issues.push(makeIssue('fail', 'pdf.missing', `找不到同目录文件 \`${data.pdf}\`，请检查名称和大小写。`, file));
      return;
    }

    const pdfEntry = entries.get(pdfPath);
    if (pdfEntry?.size > options.pdfWarnBytes) {
      issues.push(makeIssue(
        'warn',
        'pdf.large',
        `PDF 大小为 ${(pdfEntry.size / 1024 / 1024).toFixed(1)} MB，建议压缩后再提交。`,
        pdfPath,
      ));
    }
  }
}

function validateCourseContent(file, data, courseSlug, fileType, courseSlugs, issues) {
  requireString(data, 'course', issues, file);
  requireEnum(data, 'type', ['assessment', 'external'], issues, file);
  requireDate(data, 'updated', issues, file);

  const expectedCourse = courseSlug.toUpperCase();
  if (data.course !== expectedCourse) {
    issues.push(makeIssue(
      'fail',
      'course-content.path-course',
      `目录对应课程 \`${expectedCourse}\`，但 Frontmatter 中为 \`${data.course ?? ''}\`。`,
      file,
    ));
  }
  if (data.type !== fileType) {
    issues.push(makeIssue(
      'fail',
      'course-content.path-type',
      `文件名要求 \`type: ${fileType}\`，当前为 \`${data.type ?? ''}\`。`,
      file,
    ));
  }
  if (isNonEmptyString(data.course) && !courseSlugs.has(data.course.toLowerCase())) {
    issues.push(makeIssue('fail', 'course-content.unknown-course', `课程 \`${data.course}\` 不存在。`, file));
  }
}

function validateDeletedCourse(file, paths, issues) {
  const match = file.match(/^src\/content\/courses\/([a-z]{4}\d{6})\.(?:md|mdx)$/);
  if (!match) return;

  const slug = match[1];
  const dependants = [...paths].filter(
    (candidate) => candidate.startsWith(`src/content/resources/${slug}/`)
      || candidate.startsWith(`src/content/courseContent/${slug}/`),
  );
  if (dependants.length > 0) {
    issues.push(makeIssue(
      'fail',
      'course.delete-referenced',
      `删除课程后仍有 ${dependants.length} 个资源或课程公共内容引用该课程。`,
      file,
    ));
  }
}

function validateDeletedPdf(file, files, issues) {
  if (!file.toLowerCase().endsWith('.pdf')) return;
  const directory = path.posix.dirname(file);
  const basename = path.posix.basename(file);

  for (const entry of files) {
    if (!entry.content || path.posix.dirname(entry.path) !== directory || !MARKDOWN_EXTENSION.test(entry.path)) {
      continue;
    }
    const parsed = parseFrontmatter(entry.content, entry.path);
    if (parsed.data?.pdf === basename) {
      issues.push(makeIssue(
        'fail',
        'pdf.deleted-referenced',
        `已删除的 PDF 仍被 \`${entry.path}\` 的 Frontmatter 引用。`,
        file,
      ));
    }
  }
}

export function validateSnapshot(snapshot, overrides = {}) {
  const options = {
    pdfWarnBytes: 10 * 1024 * 1024,
    ...overrides,
  };
  const paths = new Set(snapshot.paths.map(normalizePath));
  const files = snapshot.files.map((entry) => ({ ...entry, path: normalizePath(entry.path) }));
  const entries = new Map(files.map((entry) => [entry.path, entry]));
  const changedPaths = new Set(snapshot.changedPaths.map(normalizePath));
  const issues = [];

  const coursePaths = new Map();
  for (const file of paths) {
    const match = file.match(/^src\/content\/courses\/([a-z]{4}\d{6})\.(?:md|mdx)$/);
    if (!match) continue;
    const candidates = coursePaths.get(match[1]) ?? [];
    candidates.push(file);
    coursePaths.set(match[1], candidates);
  }
  const courseSlugs = new Set(coursePaths.keys());

  for (const [slug, candidates] of coursePaths) {
    if (candidates.length > 1 && candidates.some((file) => changedPaths.has(file))) {
      issues.push(makeIssue(
        'fail',
        'course.duplicate',
        `课程 \`${slug.toUpperCase()}\` 同时存在多个 Markdown/MDX 文件。`,
        candidates.find((file) => changedPaths.has(file)),
      ));
    }
  }

  const caseFoldedPaths = new Map();
  for (const file of paths) {
    if (!isContentPath(file)) continue;
    const key = file.toLowerCase();
    const existing = caseFoldedPaths.get(key);
    if (existing && existing !== file && (changedPaths.has(existing) || changedPaths.has(file))) {
      issues.push(makeIssue(
        'fail',
        'path.case-collision',
        `路径与 \`${existing}\` 仅大小写不同，在部分文件系统上会冲突。`,
        file,
      ));
    } else {
      caseFoldedPaths.set(key, file);
    }
  }

  for (const file of changedPaths) {
    if (!isContentPath(file)) continue;

    if (!paths.has(file)) {
      validateDeletedCourse(file, paths, issues);
      validateDeletedPdf(file, files, issues);
      continue;
    }

    const entry = entries.get(file);
    if (file.toLowerCase().endsWith('.pdf')) {
      if (entry?.size > options.pdfWarnBytes) {
        issues.push(makeIssue(
          'warn',
          'pdf.large',
          `PDF 大小为 ${(entry.size / 1024 / 1024).toFixed(1)} MB，建议压缩后再提交。`,
          file,
        ));
      }
      continue;
    }

    if (!MARKDOWN_EXTENSION.test(file)) {
      issues.push(makeIssue(
        'fail',
        'content.unsupported-file',
        'Content Collection 目录中只允许 Markdown、MDX；资源目录额外允许 PDF。',
        file,
      ));
      continue;
    }

    if (typeof entry?.content !== 'string') {
      issues.push(makeIssue('fail', 'content.unreadable', '无法读取该文件内容。', file));
      continue;
    }

    const parsed = parseFrontmatter(entry.content, file);
    issues.push(...parsed.issues);
    if (!parsed.data) continue;

    const courseMatch = file.match(/^src\/content\/courses\/([^/]+)\.(?:md|mdx)$/);
    if (courseMatch) {
      if (!COURSE_SLUG.test(courseMatch[1])) {
        issues.push(makeIssue(
          'fail',
          'course.path',
          '课程文件名必须是 4 位小写字母和 6 位数字组成的课程代码。',
          file,
        ));
      } else {
        validateCourse(file, parsed.data, courseMatch[1], issues);
      }
      continue;
    }
    if (file.startsWith('src/content/courses/')) {
      issues.push(makeIssue(
        'fail',
        'course.path',
        '课程必须位于 `src/content/courses/{课程代码小写}.md`。',
        file,
      ));
      continue;
    }

    const resourceMatch = file.match(/^src\/content\/resources\/([^/]+)\/([^/]+)\/[^/]+\.(?:md|mdx)$/);
    if (resourceMatch) {
      const [, courseSlug, contributor] = resourceMatch;
      if (!COURSE_SLUG.test(courseSlug)) {
        issues.push(makeIssue('fail', 'resource.course-directory', '资源课程目录必须使用小写课程代码。', file));
      }
      if (!CONTRIBUTOR_SLUG.test(contributor)) {
        issues.push(makeIssue(
          'fail',
          'resource.contributor-directory',
          '贡献者目录必须全小写，并且只能包含英文字母、数字、点、下划线或连字符。',
          file,
        ));
      }
      validateResource(
        file,
        parsed.data,
        courseSlug,
        contributor,
        paths,
        entries,
        courseSlugs,
        options,
        issues,
      );
      continue;
    }
    if (file.startsWith('src/content/resources/')) {
      issues.push(makeIssue(
        'fail',
        'resource.path',
        '资源必须位于 `src/content/resources/{课程代码}/{贡献者目录}/{文件}.md`。',
        file,
      ));
      continue;
    }

    const courseContentMatch = file.match(
      /^src\/content\/courseContent\/([^/]+)\/(assessment|external)\.(?:md|mdx)$/,
    );
    if (courseContentMatch) {
      const [, courseSlug, fileType] = courseContentMatch;
      if (!COURSE_SLUG.test(courseSlug)) {
        issues.push(makeIssue(
          'fail',
          'course-content.course-directory',
          '课程公共内容目录必须使用小写课程代码。',
          file,
        ));
      }
      validateCourseContent(file, parsed.data, courseSlug, fileType, courseSlugs, issues);
      continue;
    }
    if (file.startsWith('src/content/courseContent/')) {
      issues.push(makeIssue(
        'fail',
        'course-content.path',
        '课程公共内容只能使用 `{课程代码}/assessment.md` 或 `{课程代码}/external.md`。',
        file,
      ));
    }
  }

  return issues.filter((issue, index) => issues.findIndex((candidate) => (
    candidate.severity === issue.severity
    && candidate.code === issue.code
    && candidate.file === issue.file
    && candidate.message === issue.message
  )) === index);
}

export function formatIssue(issue) {
  const location = issue.file ? `${issue.file}: ` : '';
  return `[${issue.severity.toUpperCase()}] ${issue.code} ${location}${issue.message}`;
}
