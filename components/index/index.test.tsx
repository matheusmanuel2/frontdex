import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  Breadcrumb,
  CategoryCard,
  CollectionCard,
  EmptyState,
  Eyebrow,
  formatIndexId,
  IndexId,
  ResourceList,
  ResourceRow,
  SectionTitle,
  TagChip,
} from './index';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('IndexId', () => {
  it('formata com 4 dígitos em mono', () => {
    expect(formatIndexId(2)).toBe('#0002');
    expect(formatIndexId(10422)).toBe('#10422');
    expect(html(<IndexId id={422} />)).toMatch(/font-mono[^>]*>#0422</);
  });

  it('sem id não mostra nada', () => {
    expect(html(<IndexId />)).toBe('');
  });
});

describe('TagChip', () => {
  it('é texto por omissão e link com href', () => {
    expect(html(<TagChip>react</TagChip>)).toMatch(/^<span/);
    expect(html(<TagChip href="/pt/t/react">react</TagChip>)).toMatch(/^<a[^>]*href="\/pt\/t\/react"/);
  });

  it('tom de marca usa o tint do Index Blue', () => {
    expect(html(<TagChip tone="brand">OSS</TagChip>)).toContain('bg-brand-tint');
  });
});

describe('ResourceRow', () => {
  const row = html(
    <ResourceList label="Recursos">
      <ResourceRow
        href="/pt/r/kugiri"
        id={3}
        name="kugiri"
        description="Divide texto"
        meta="gsap · text"
        aside={<TagChip>Grátis</TagChip>}
      />
    </ResourceList>,
  );

  it('é um item de lista com link para o recurso', () => {
    expect(row).toMatch(/<ul aria-label="Recursos"/);
    expect(row).toMatch(/<li[^>]*><a[^>]*href="\/pt\/r\/kugiri"/);
  });

  it('mostra ID, nome, descrição, metadados e seta animada', () => {
    expect(row).toContain('#0003');
    expect(row).toContain('kugiri');
    expect(row).toContain('gsap · text');
    expect(row).toContain('t-icon-host');
    expect(row).toContain('data-motion="nudge-diagonal"');
  });
});

describe('cards', () => {
  it('CategoryCard tem nome, contagem e exemplos', () => {
    const card = html(<CategoryCard href="/pt/c/icons" name="Ícones" count="12" examples="A · B" />);
    expect(card).toMatch(/href="\/pt\/c\/icons"/);
    expect(card).toContain('>12<');
    expect(card).toContain('A · B');
  });

  it('CollectionCard tem título, contagem e descrição', () => {
    const card = html(<CollectionCard href="/pt/collections/x" title="Mobile" count="6 recursos" description="Nota" />);
    expect(card).toContain('title-card');
    expect(card).toContain('6 recursos');
  });
});

describe('títulos e navegação', () => {
  it('SectionTitle tem duas cores', () => {
    const title = html(<SectionTitle as="h1" size="h1" title="Ícones." muted="12 conjuntos." />);
    expect(title).toMatch(
      /^<h1 class="title-h1[^"]*">Ícones\.<br\/><span class="text-title-muted">12 conjuntos\.<\/span><\/h1>$/,
    );
  });

  it('Breadcrumb marca a página atual', () => {
    const crumbs = html(
      <Breadcrumb
        label="Trilho"
        items={[{ label: 'ÍNDICE', href: '/pt' }, { label: 'CONSTRUIR', href: '/pt/build' }, { label: 'ÍCONES' }]}
      />,
    );
    expect(crumbs).toMatch(/<nav aria-label="Trilho"/);
    expect(crumbs).toMatch(/aria-current="page"[^>]*>ÍCONES/);
    expect(crumbs.match(/<a /g)).toHaveLength(2);
  });

  it('Eyebrow e EmptyState', () => {
    expect(html(<Eyebrow>03 / CONSTRUIR</Eyebrow>)).toContain('label-mono');
    expect(html(<EmptyState title="Nada aqui" />)).toContain('Nada aqui');
    expect(html(<EmptyState title="Nada aqui" />)).not.toContain('role=');
  });
});
