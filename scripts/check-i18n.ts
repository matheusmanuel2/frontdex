/**
 * `pnpm check:i18n [pasta]` — falha se uma chave existir num messages/*.json e não
 * nos outros (spec 007, T-407). Também falha com valores vazios.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ''): Map<string, string> {
  const keys = new Map<string, string>();
  for (const [key, value] of Object.entries(messages)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') keys.set(full, value);
    else for (const [nested, text] of flatten(value, full)) keys.set(nested, text);
  }
  return keys;
}

export function checkMessages(dir: string): string[] {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  const byLocale = new Map(
    files.map((file) => [file, flatten(JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Messages)]),
  );
  const all = new Set([...byLocale.values()].flatMap((keys) => [...keys.keys()]));
  const errors: string[] = [];
  for (const [file, keys] of byLocale) {
    for (const key of [...all].sort()) {
      if (!keys.has(key)) errors.push(`messages/${file} › ${key} › chave em falta`);
      else if (!keys.get(key)?.trim()) errors.push(`messages/${file} › ${key} › valor vazio`);
    }
  }
  return errors;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (isMain) {
  const dir = path.resolve(process.argv[2] ?? 'messages');
  const errors = checkMessages(dir);
  for (const error of errors) console.error(`✗ ${error}`);
  if (errors.length === 0) console.log('✓ messages/: as mesmas chaves em todos os idiomas.');
  process.exitCode = errors.length === 0 ? 0 : 1;
}
