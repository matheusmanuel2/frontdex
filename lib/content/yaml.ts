import { stringify } from 'yaml';

import type { Resource } from './schema';

/**
 * YAML de um recurso real, para mostrar como exemplo (home, "Contribua").
 * Só campos públicos; nunca `notes`.
 */
export function resourceToYaml(resource: Resource): string {
  const { slug: _slug, notes: _notes, last_checked: _checked, ...rest } = resource;
  void _slug;
  void _notes;
  void _checked;
  return stringify(rest, { lineWidth: 0 }).trimEnd();
}
