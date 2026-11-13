import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';
import { isMap, isScalar, isSeq, parseDocument } from 'yaml';

import { findMotionViolations } from '../lib/design/motion';

export type AntiAiViolation = { file: string; line: number; rule: string };
type TextFragment = { text: string; offset: number; path: string[] };

const CODE_ROOTS = ['app', 'components', 'lib', 'styles'];
const TEXT_ROOTS = ['messages', 'content', 'data'];
const SOURCE_EXTENSIONS = /\.(?:css|[cm]?js|[cm]?ts|jsx|tsx)$/i;
const TEXT_EXTENSIONS = /\.(?:json|md|mdx|yaml|yml)$/i;
const PROHIBITED_PHRASES = [
  'unlock',
  'seamless',
  'elevate',
  'empower',
  'supercharge',
  'dive into',
  'unleash',
  'game-changer',
  'cutting-edge',
  "whether you're a beginner or an expert",
  'desbloquear',
  'potencializar',
  'eleve',
  'mergulhe',
  'revolucionário',
  'de ponta',
  'seja você iniciante ou especialista',
];
const EMPTY_TRIADS = [/rápido,\s*simples\s+e\s+poderoso/iu, /fast,\s*simple,\s*(?:and\s+)?powerful/iu];
const EMOJI_PATTERN =
  /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3)/u;
const FORBIDDEN_ICON_IMPORT =
  /(?:from\s*|import\s*\(\s*|require\s*\(\s*)['"](?:lucide-react|@heroicons\/react|react-icons(?:\/[^'"]*)?|@tabler\/icons-react)(?:\/[^'"]*)?['"]/g;
const COLOR_CLASS =
  /\b(?:bg|text|border|from|via|to|ring|outline|fill|stroke|decoration|placeholder|divide|accent|caret)-(?:black|white|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)(?:-\d{2,3})?(?:\/\d{1,3})?\b/i;
const ARBITRARY_COLOR_CLASS =
  /\b(?:bg|text|border|from|via|to|ring|outline|fill|stroke|decoration|placeholder)-\[(?:#[\da-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(|(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)\])/i;
const COLORED_SHADOW_CLASS =
  /\bshadow-(?:black|white|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}(?:\/\d{1,3})?\b|\bshadow-\[[^\]]*(?:#[\da-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(|var\(--color-)/i;
const DROP_SHADOW_COLOR =
  /\bdrop-shadow-(?:black|white|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b|\bdrop-shadow-\[[^\]]*(?:#[\da-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(|var\(--color-)/i;
const CSS_COLOR =
  /(?:#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(|\b(?:black|white|red|orange|yellow|green|blue|purple|pink|cyan|magenta|teal|gray|grey|aqua|navy|olive|silver|maroon|coral|tomato|gold|crimson|salmon|turquoise|orchid|plum|beige|brown|khaki|hotpink|rebeccapurple|currentcolor)\b|var\(--color-)/i;
const ALLOWED_RADII = new Set(['sm', 'panel', 'card', 'pill']);
const ALLOWED_RADIUS_VARIABLE = /var\(--radius-(?:sm|panel|card|pill)\)/i;
const RADIUS_CLASS = /\brounded(?:(?:-(?:t|b|l|r|s|e|ss|se|ee|es))?-([\w.[\]%-]+))?\b/g;
const EMOJI_MESSAGE_KEYS =
  /^(?:title|titleMuted|heading|.*Title|.*Heading|.*Button|.*Cta|.*Link|mainNav|footerNav|homeLink|openMenu|closeMenu|searchShortcut|search|add|copy|propose|all|clear|submit|cancel|back|next|random|name)$/i;

function isTestFile(file: string): boolean {
  return /(?:^|\/)[^/]*\.test\.[^/]+$/.test(file) || /(?:^|\/)__tests__\//.test(file);
}

function walk(root: string, extensions: RegExp): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries
    .flatMap((entry) => {
      const file = path.join(root, entry.name);
      if (entry.isDirectory()) return walk(file, extensions);
      return entry.isFile() && extensions.test(entry.name) && !isTestFile(file) ? [file] : [];
    })
    .sort();
}

function lineAt(source: string, offset: number): number {
  return source.slice(0, Math.max(0, offset)).split('\n').length;
}

function addLineViolation(violations: AntiAiViolation[], file: string, line: number, rule: string): void {
  violations.push({ file, line, rule });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isMap(value) &&
    !isSeq(value) &&
    !isScalar(value)
  );
}

function scanCode(file: string, source: string): AntiAiViolation[] {
  const violations: AntiAiViolation[] = [];
  const lines = source.split('\n');
  const isHero = file.startsWith('components/hero/');

  lines.forEach((text, index) => {
    const line = index + 1;
    if (
      !isHero &&
      /\bbg-gradient-[\w-]+|\bbg-(?:linear|radial|conic)(?:-to-[\w-]+|-\[)|\bbg-\[(?:linear|radial|conic)-gradient\s*\(|\b(?:linear|radial|conic)-gradient\s*\(/i.test(
        text,
      )
    ) {
      addLineViolation(violations, file, line, 'gradiente fora de components/hero/');
    }
    if (/\bbackdrop-blur(?:-[\w.[\]%-]+)?\b|backdrop-filter\s*:\s*blur\s*\(/i.test(text)) {
      addLineViolation(violations, file, line, 'backdrop-blur');
    }
    if (/\bbox-shadow\s*:/i.test(text)) {
      const value = text.match(/\bbox-shadow\s*:\s*([^;]+)/i)?.[1];
      if (value && CSS_COLOR.test(value)) addLineViolation(violations, file, line, 'sombra colorida');
    }
    if (COLORED_SHADOW_CLASS.test(text)) {
      addLineViolation(violations, file, line, 'sombra colorida');
    }
    if (/\bdrop-shadow\s*\([^)]*\)/i.test(text)) {
      const value = text.match(/\bdrop-shadow\s*\(([^)]*)\)/i)?.[1];
      if (value && CSS_COLOR.test(value)) addLineViolation(violations, file, line, 'drop-shadow com cor');
    }
    if (DROP_SHADOW_COLOR.test(text)) {
      addLineViolation(violations, file, line, 'drop-shadow com cor');
    }
    const textShadow = /\btext-shadow\s*:\s*([^;]+)/i.exec(text)?.[1]?.trim();
    if (
      (textShadow && !/^none\b/i.test(textShadow)) ||
      /\btext-(?:glow(?:-[\w.[\]%-]+)?|shadow-[\w.[\]%-]+)\b/i.test(text)
    ) {
      addLineViolation(violations, file, line, 'glow em texto');
    }
    if (COLOR_CLASS.test(text) || ARBITRARY_COLOR_CLASS.test(text)) {
      addLineViolation(violations, file, line, 'classe de cor Tailwind fora dos tokens');
    }

    for (const match of text.matchAll(RADIUS_CLASS)) {
      const radius = match[1];
      if (!radius || (!ALLOWED_RADII.has(radius) && !ALLOWED_RADIUS_VARIABLE.test(radius))) {
        addLineViolation(violations, file, line, 'raio fora da escala de tokens');
      }
    }

    const radius = /\bborder-radius\s*:\s*([^;]+)/i.exec(text)?.[1]?.trim();
    if (
      radius &&
      !ALLOWED_RADIUS_VARIABLE.test(radius) &&
      !/^(?:inherit|initial|unset|revert)$/i.test(radius) &&
      file !== 'styles/tokens.css'
    ) {
      addLineViolation(violations, file, line, 'raio fora da escala de tokens');
    }
  });

  for (const match of source.matchAll(FORBIDDEN_ICON_IMPORT)) {
    addLineViolation(violations, file, lineAt(source, match.index), 'import de biblioteca de ícones proibida');
  }
  for (const violation of findMotionViolations(file, source)) {
    addLineViolation(violations, file, violation.line, violation.rule);
  }
  return violations;
}

function collectStrings(
  value: unknown,
  source: string,
  offset: { value: number },
  pathParts: string[],
): TextFragment[] {
  if (isScalar(value) && typeof value.value === 'string') {
    const text = value.value;
    const found = value.range?.[0] ?? source.indexOf(text, offset.value);
    const start = found >= 0 ? found : offset.value;
    offset.value = found >= 0 ? found + text.length : offset.value;
    return [{ text, offset: start, path: pathParts }];
  }
  if (typeof value === 'string') {
    const needle = JSON.stringify(value);
    const found = source.indexOf(needle, offset.value);
    const start = found >= 0 ? found : offset.value;
    offset.value = found >= 0 ? found + needle.length : offset.value;
    return [{ text: value, offset: start, path: pathParts }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, source, offset, [...pathParts, String(index)]));
  }
  if (isMap(value)) {
    return value.items.flatMap((pair) => {
      const key = isScalar(pair.key) ? String(pair.key.value) : String(pair.key);
      if (['notes', 'url', 'repo', 'license', 'added', 'last_checked', 'status'].includes(key)) return [];
      return collectStrings(pair.value, source, offset, [...pathParts, key]);
    });
  }
  if (isSeq(value)) {
    return value.items.flatMap((item, index) => collectStrings(item, source, offset, [...pathParts, String(index)]));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) => {
      if (['notes', 'url', 'repo', 'license', 'added', 'last_checked', 'status'].includes(key)) return [];
      return collectStrings(item, source, offset, [...pathParts, key]);
    });
  }
  return [];
}

function textFragments(file: string, source: string): TextFragment[] {
  if (file.endsWith('.json')) {
    const value: unknown = JSON.parse(source);
    return collectStrings(value, source, { value: 0 }, []);
  }
  if (file.endsWith('.yaml') || file.endsWith('.yml')) {
    const document = parseDocument(source, { prettyErrors: false });
    if (document.errors.length > 0) {
      throw new Error(`${file} › YAML inválido: ${document.errors.map((error) => error.message).join('; ')}`);
    }
    return collectStrings(document.contents, source, { value: 0 }, []);
  }
  if (file.endsWith('.md') || file.endsWith('.mdx')) {
    const fragments: TextFragment[] = [];
    const visibleSource = source.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, ' '));
    const paragraphs = visibleSource.split(/(\n\s*\n)/);
    let offset = 0;
    for (let index = 0; index < paragraphs.length; index += 2) {
      const paragraph = paragraphs[index] ?? '';
      const text = paragraph.trim();
      const leadingWhitespace = paragraph.search(/\S/);
      if (text && !text.startsWith('```')) {
        fragments.push({ text, offset: offset + Math.max(leadingWhitespace, 0), path: [] });
      }
      offset += paragraph.length + (paragraphs[index + 1]?.length ?? 0);
    }
    return fragments;
  }
  return [];
}

function jsxName(node: ts.JsxTagNameExpression): string {
  if (ts.isIdentifier(node)) return node.text;
  return node.getText();
}

function jsxText(node: ts.Node): string {
  if (ts.isJsxText(node)) return node.text;
  if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression)) {
    return node.expression.text;
  }
  let text = '';
  node.forEachChild((child) => {
    text += jsxText(child);
  });
  return text;
}

function jsxAttributeFragments(node: ts.Node, sourceFile: ts.SourceFile): TextFragment[] {
  const fragments: TextFragment[] = [];
  if (ts.isJsxAttribute(node)) {
    const name = node.name.getText();
    if (['aria-label', 'title', 'alt', 'placeholder'].includes(name)) {
      const initializer = node.initializer;
      if (initializer && ts.isStringLiteralLike(initializer)) {
        fragments.push({ text: initializer.text, offset: initializer.getStart(sourceFile) + 1, path: [] });
      }
      if (
        initializer &&
        ts.isJsxExpression(initializer) &&
        initializer.expression &&
        ts.isStringLiteralLike(initializer.expression)
      ) {
        fragments.push({
          text: initializer.expression.text,
          offset: initializer.expression.getStart(sourceFile) + 1,
          path: [],
        });
      }
    }
  }
  node.forEachChild((child) => fragments.push(...jsxAttributeFragments(child, sourceFile)));
  return fragments;
}

function isEmojiMessageKey(pathParts: string[]): boolean {
  return (
    pathParts.some((part) => ['nav', 'navigation', 'menu', 'footer'].includes(part.toLowerCase())) ||
    EMOJI_MESSAGE_KEYS.test(pathParts.at(-1) ?? '')
  );
}

function scanEmoji(file: string, source: string): AntiAiViolation[] {
  const violations: AntiAiViolation[] = [];
  if (file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')) {
    for (const fragment of textFragments(file, source)) {
      if (isEmojiMessageKey(fragment.path) && EMOJI_PATTERN.test(fragment.text)) {
        addLineViolation(violations, file, lineAt(source, fragment.offset), 'emoji em título, botão ou navegação');
      }
    }
    return violations;
  }
  if (file.endsWith('.md') || file.endsWith('.mdx')) {
    source.split('\n').forEach((line, index) => {
      if (/^#{1,6}\s/.test(line) && EMOJI_PATTERN.test(line)) {
        addLineViolation(violations, file, index + 1, 'emoji em título, botão ou navegação');
      }
    });
    return violations;
  }
  if (!/\.[jt]sx$/i.test(file)) return violations;

  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node: ts.Node, insideNavigation: boolean) => {
    if (ts.isJsxElement(node)) {
      const name = jsxName(node.openingElement.tagName);
      const inNavigation = insideNavigation || name.toLowerCase() === 'nav';
      const isHeading = /^h[1-6]$/i.test(name);
      const isControl = name.toLowerCase() === 'button' || name === 'Button';
      const isNavigation = name.toLowerCase() === 'nav';
      const isNavLink = insideNavigation && ['a', 'Link', 'LocaleLink'].includes(name);
      if (isHeading || isControl || isNavigation || isNavLink) {
        const visibleText = `${jsxText(node)} ${jsxAttributeFragments(node, sourceFile)
          .map(({ text }) => text)
          .join(' ')}`;
        if (EMOJI_PATTERN.test(visibleText)) {
          addLineViolation(
            violations,
            file,
            lineAt(source, node.getStart(sourceFile)),
            'emoji em título, botão ou navegação',
          );
        }
      }
      node.forEachChild((child) => visit(child, inNavigation));
      return;
    }
    if (ts.isJsxSelfClosingElement(node)) {
      const name = jsxName(node.tagName);
      const inNavigation = insideNavigation || name.toLowerCase() === 'nav';
      const isControl = name.toLowerCase() === 'button' || name === 'Button';
      const isNavigation = name.toLowerCase() === 'nav';
      const isNavLink = insideNavigation && ['a', 'Link', 'LocaleLink'].includes(name);
      if (isControl || isNavigation || isNavLink) {
        const visibleText = jsxAttributeFragments(node, sourceFile)
          .map(({ text }) => text)
          .join(' ');
        if (EMOJI_PATTERN.test(visibleText)) {
          addLineViolation(
            violations,
            file,
            lineAt(source, node.getStart(sourceFile)),
            'emoji em título, botão ou navegação',
          );
        }
      }
      node.forEachChild((child) => visit(child, inNavigation));
      return;
    }
    node.forEachChild((child) => visit(child, insideNavigation));
  };
  visit(sourceFile, false);
  return violations;
}

function findTextViolations(file: string, source: string): AntiAiViolation[] {
  const violations: AntiAiViolation[] = [];
  const fragments = textFragments(file, source);
  for (const fragment of fragments) {
    for (const phrase of PROHIBITED_PHRASES) {
      const pattern = new RegExp(
        `(?<![\\p{L}\\p{N}_])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`,
        'iu',
      );
      const match = pattern.exec(fragment.text);
      if (match) {
        addLineViolation(
          violations,
          file,
          lineAt(source, fragment.offset + match.index),
          `expressão proibida: ${phrase}`,
        );
      }
    }
    for (const pattern of EMPTY_TRIADS) {
      const match = pattern.exec(fragment.text);
      if (match) addLineViolation(violations, file, lineAt(source, fragment.offset + match.index), 'tríade vazia');
    }
    let paragraphOffset = 0;
    for (const paragraph of fragment.text.split(/\n\s*\n/)) {
      const emDashes = [...paragraph.matchAll(/—/g)];
      if (emDashes.length > 1) {
        addLineViolation(
          violations,
          file,
          lineAt(source, fragment.offset + paragraphOffset),
          'mais de um travessão por parágrafo',
        );
      }
      paragraphOffset += paragraph.length + 2;
    }
  }

  if (/\.[jt]sx$/i.test(file)) {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node) => {
      if (ts.isJsxText(node) && node.text.trim()) {
        const offset = node.getStart(sourceFile);
        violations.push(...findTextViolationsFromFragment(file, source, node.text, offset));
      } else if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteralLike(node.expression)) {
        const expression = node.expression;
        violations.push(
          ...findTextViolationsFromFragment(file, source, expression.text, expression.getStart(sourceFile) + 1),
        );
      } else if (ts.isJsxAttribute(node)) {
        for (const fragment of jsxAttributeFragments(node, sourceFile)) {
          violations.push(...findTextViolationsFromFragment(file, source, fragment.text, fragment.offset));
        }
      } else if (ts.isJsxElement(node) && /^p$/i.test(jsxName(node.openingElement.tagName))) {
        const text = jsxText(node);
        violations.push(...findParagraphDashViolations(file, source, text, node.getStart(sourceFile)));
      }
      node.forEachChild(visit);
    };
    visit(sourceFile);
  }
  return violations;
}

function findTextViolationsFromFragment(file: string, source: string, text: string, offset: number): AntiAiViolation[] {
  const violations: AntiAiViolation[] = [];
  for (const phrase of PROHIBITED_PHRASES) {
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}_])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`,
      'iu',
    );
    const match = pattern.exec(text);
    if (match)
      addLineViolation(violations, file, lineAt(source, offset + match.index), `expressão proibida: ${phrase}`);
  }
  for (const pattern of EMPTY_TRIADS) {
    const match = pattern.exec(text);
    if (match) addLineViolation(violations, file, lineAt(source, offset + match.index), 'tríade vazia');
  }
  return violations;
}

function findParagraphDashViolations(file: string, source: string, text: string, offset: number): AntiAiViolation[] {
  const violations: AntiAiViolation[] = [];
  for (const paragraph of text.split(/\n\s*\n/)) {
    const matches = [...paragraph.matchAll(/—/g)];
    if (matches.length > 1) {
      addLineViolation(violations, file, lineAt(source, offset), 'mais de um travessão por parágrafo');
    }
  }
  return violations;
}

export function findAntiAiViolations(file: string, source: string): AntiAiViolation[] {
  const normalizedFile = file.split(path.sep).join('/');
  const codeFile = SOURCE_EXTENSIONS.test(normalizedFile);
  const textFile = TEXT_EXTENSIONS.test(normalizedFile);
  const violations = [
    ...(codeFile ? scanCode(normalizedFile, source) : []),
    ...(textFile || /\.(?:tsx|jsx)$/i.test(normalizedFile) ? findTextViolations(normalizedFile, source) : []),
    ...(textFile || normalizedFile.endsWith('.tsx') || normalizedFile.endsWith('.jsx')
      ? scanEmoji(normalizedFile, source)
      : []),
  ];
  return [
    ...new Map(
      violations.map((violation) => [`${violation.file}:${violation.line}:${violation.rule}`, violation]),
    ).values(),
  ];
}

export function scanProject(root = process.cwd()): AntiAiViolation[] {
  const files = [
    ...CODE_ROOTS.flatMap((directory) => walk(path.join(root, directory), SOURCE_EXTENSIONS)),
    ...TEXT_ROOTS.flatMap((directory) => walk(path.join(root, directory), TEXT_EXTENSIONS)),
  ];
  return [...new Set(files)]
    .map((file) => ({
      file: path.relative(root, file).split(path.sep).join('/'),
      source: readFileSync(file, 'utf8'),
    }))
    .flatMap(({ file, source }) => findAntiAiViolations(file, source))
    .sort(
      (left, right) =>
        left.file.localeCompare(right.file) || left.line - right.line || left.rule.localeCompare(right.rule),
    );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  try {
    const violations = scanProject();
    for (const violation of violations) {
      console.error(`${violation.file}:${violation.line} › ${violation.rule}`);
    }
    if (violations.length > 0) process.exitCode = 1;
    else console.log('Sem violações anti-AI mecânicas.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
