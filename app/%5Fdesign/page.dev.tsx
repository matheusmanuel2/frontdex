/**
 * /_design — catálogo do design system (T-308). Só existe em `next dev`
 * (ver pageExtensions em next.config.ts). Mostra tokens, componentes e ícones
 * nos dois temas, lado a lado.
 */

import {
  Breadcrumb,
  CategoryCard,
  CollectionCard,
  EmptyState,
  Eyebrow,
  IndexId,
  ResourceList,
  ResourceRow,
  SectionTitle,
  TagChip,
} from '@/components/index';
import { Button } from '@/components/ui/button';

import { ButtonsDemo, IconsDemo, InputsDemo, OverlaysDemo, TabsDemo } from './DesignDemos';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Design system · FrontDex', robots: { index: false } };

const COLORS = [
  'ink',
  'ink-hero',
  'carbon',
  'graphite',
  'list',
  'row-hover',
  'paper',
  'text-primary',
  'text-secondary',
  'text-muted',
  'title-muted',
  'index-blue',
  'index-blue-light',
  'link',
  'focus',
  'signal-orange',
  'brand-tint',
  'button-primary-bg',
  'button-secondary-bg',
];
const RADII = ['pill', 'card', 'panel', 'sm'];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border pt-8">
      <h2 className="label-mono text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Showcase({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div data-theme={theme} className="grid min-w-0 gap-10 bg-ink p-6 text-primary sm:p-10">
      <SectionTitle as="h2" size="h1" title={`Tema ${theme}.`} muted="Tokens, componentes e ícones." />

      <Block title="Cor">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COLORS.map((name) => (
            <li key={name} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-sm border border-border-strong"
                style={{ backgroundColor: `var(--color-${name})` }}
              />
              <span className="min-w-0 truncate font-mono text-mono text-secondary">--color-{name}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Tipografia">
        <p className="title-display">Display 400</p>
        <p className="title-h1">Título H1</p>
        <p className="title-h2">Título H2</p>
        <p className="title-card">Título de card</p>
        <p className="title-h3">Título H3</p>
        <p className="text-body text-secondary">Corpo 16px em Geist 400, entrelinha 1,55.</p>
        <p className="text-small text-secondary">Pequeno 14px para navegação e botões.</p>
        <p className="label-mono text-muted">Label mono 12px</p>
      </Block>

      <Block title="Raio">
        <div className="flex flex-wrap gap-3">
          {RADII.map((name) => (
            <span
              key={name}
              className="flex h-16 w-28 items-center justify-center border border-border-strong bg-carbon font-mono text-mono text-secondary"
              style={{ borderRadius: `var(--radius-${name})` }}
            >
              {name}
            </span>
          ))}
        </div>
      </Block>

      <Block title="Button">
        <ButtonsDemo />
      </Block>

      <Block title="Input">
        <InputsDemo />
      </Block>

      <Block title="Dialog · DropdownMenu · Tooltip">
        <OverlaysDemo />
      </Block>

      <Block title="Tabs">
        <TabsDemo />
      </Block>

      <Block title="Ícones (hover ou foco para animar)">
        <IconsDemo />
      </Block>

      <Block title="Componentes do índice">
        <Breadcrumb
          label="Trilho"
          items={[
            { label: 'Índice', href: '/_design' },
            { label: 'Construir', href: '/_design' },
            { label: 'Animação' },
          ]}
        />
        <Eyebrow>03 / Construir</Eyebrow>
        <div className="flex flex-wrap items-center gap-2">
          <IndexId id={2} />
          <TagChip>react</TagChip>
          <TagChip href="/_design">link</TagChip>
          <TagChip tone="brand">OSS</TagChip>
        </div>
        <ResourceList label="Exemplo de lista">
          <ResourceRow
            href="/_design"
            id={1}
            name="Recurso de exemplo"
            description="Linha de exemplo para ver a lista densa: texto de demonstração, não é um recurso real."
            meta="tag · outra-tag"
            badges={<TagChip tone="brand">OSS</TagChip>}
            aside={<TagChip>Grátis</TagChip>}
          />
          <ResourceRow
            href="/_design"
            id={12}
            name="Outra linha"
            description="Versão compacta, com a descrição cortada numa linha só quando não cabe no espaço disponível."
            aside={<TagChip>Categoria</TagChip>}
            compact
          />
        </ResourceList>
        <div className="grid gap-4 sm:grid-cols-2">
          <CategoryCard
            href="/_design"
            name="Categoria"
            count="8"
            description="Descrição de exemplo."
            examples="Exemplo · Exemplo"
          />
          <CollectionCard
            href="/_design"
            eyebrow="Coleção"
            title="Título de coleção"
            count="6 recursos"
            description="Nota de exemplo do curador."
            items="Exemplo · Exemplo · Exemplo"
          />
        </div>
        <EmptyState
          title="Nenhum recurso com estes filtros."
          description="Estado vazio de exemplo."
          actions={
            <>
              <Button variant="secondary">Limpar filtros</Button>
              <Button variant="ghost">Sugerir recurso</Button>
            </>
          }
        />
      </Block>
    </div>
  );
}

export default function DesignPage() {
  return (
    <main className="grid xl:grid-cols-2">
      <h1 className="sr-only">Design system da FrontDex</h1>
      <Showcase theme="dark" />
      <Showcase theme="light" />
    </main>
  );
}
