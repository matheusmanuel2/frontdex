import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { findAntiAiViolations } from './check-anti-ai';

const FIXTURES = path.join(process.cwd(), 'scripts/fixtures/anti-ai');

function fixture(name: string): string {
  return readFileSync(path.join(FIXTURES, name), 'utf8');
}

function rules(file: string, source: string): string[] {
  return findAntiAiViolations(file, source).map((violation) => violation.rule);
}

describe('pnpm check:anti-ai', () => {
  it('reporta ficheiro, linha e regra em cada violação', () => {
    expect(findAntiAiViolations('components/card.css', fixture('gradient-outside.css'))).toEqual([
      {
        file: 'components/card.css',
        line: 2,
        rule: 'gradiente fora de components/hero/',
      },
    ]);
  });

  it.each([
    ['gradient-outside.css', 'components/card.css', 'gradiente fora de components/hero/'],
    ['backdrop-blur.tsx', 'components/panel.tsx', 'backdrop-blur'],
    ['colored-shadow.css', 'components/card.css', 'sombra colorida'],
    ['drop-shadow-color.tsx', 'components/logo.tsx', 'drop-shadow com cor'],
    ['text-glow.css', 'components/title.css', 'glow em texto'],
    ['tailwind-color.tsx', 'components/label.tsx', 'classe de cor Tailwind fora dos tokens'],
    ['radius.css', 'components/card.css', 'raio fora da escala de tokens'],
    ['duration.css', 'components/panel.css', 'duração escrita à mão'],
    ['keyframes.css', 'components/fade.css', '@keyframes fora de styles/motion.css'],
  ])('detecta a regra de código %s', (fixtureName, file, rule) => {
    expect(rules(file, fixture(fixtureName))).toContain(rule);
  });

  it('permite gradientes no hero e recipes de movimento em styles/motion.css', () => {
    expect(rules('components/hero/hero.css', fixture('allowed-hero-gradient.css'))).toEqual([]);
    expect(rules('components/hero/Hero.tsx', '<div className="bg-linear-to-t" />')).toEqual([]);
    expect(rules('styles/motion.css', fixture('keyframes.css'))).toEqual([]);
  });

  it('detecta gradientes Tailwind v4 e classes de paleta fora dos tokens', () => {
    expect(rules('components/card.tsx', '<div className="bg-linear-to-t" />')).toContain(
      'gradiente fora de components/hero/',
    );
    expect(rules('components/card.tsx', '<div className="bg-[linear-gradient(90deg,red,blue)]" />')).toContain(
      'gradiente fora de components/hero/',
    );
    expect(rules('components/card.tsx', '<div className="from-violet-500" />')).toContain(
      'classe de cor Tailwind fora dos tokens',
    );
  });

  it('detecta cada import de biblioteca de ícones proibida', () => {
    expect(rules('components/icons.tsx', fixture('forbidden-icons.fixture'))).toHaveLength(4);
  });

  it('detecta emojis em títulos, botões e navegação JSX e em nomes YAML', () => {
    expect(rules('components/controls.tsx', fixture('emoji-controls.fixture'))).toHaveLength(3);
    expect(rules('data/resources/example.yaml', fixture('emoji-resource.yaml'))).toContain(
      'emoji em título, botão ou navegação',
    );
  });

  it('analisa strings YAML e JSON para expressões proibidas', () => {
    expect(rules('data/resources/example.yaml', fixture('yaml-text.yaml'))).toContain('expressão proibida: seamless');
    expect(
      rules('messages/pt.json', fixture('forbidden-phrases.json')).filter((rule) =>
        rule.startsWith('expressão proibida:'),
      ),
    ).toHaveLength(17);
  });

  it('analisa texto visível em atributos JSX', () => {
    expect(rules('components/search.tsx', '<input placeholder="seamless" />')).toContain(
      'expressão proibida: seamless',
    );
  });

  it('detecta tríades vazias e mais de um travessão no mesmo parágrafo', () => {
    expect(rules('content/pages/example.mdx', fixture('empty-triads.mdx'))).toHaveLength(2);
    expect(rules('content/pages/example.mdx', fixture('multiple-em-dashes.mdx'))).toContain(
      'mais de um travessão por parágrafo',
    );
  });

  it('aceita os raios definidos nos tokens e rejeita o raio padrão sem token', () => {
    expect(rules('components/card.tsx', '<div className="rounded-sm rounded-panel" />')).toEqual([]);
    expect(rules('components/card.tsx', '<div className="rounded-t-sm rounded-ss-card" />')).toEqual([]);
    expect(rules('components/card.tsx', '<div className="rounded-lg" />')).toContain('raio fora da escala de tokens');
    expect(rules('components/card.tsx', '<div className="rounded" />')).toContain('raio fora da escala de tokens');
  });

  it('permite cores transparentes e funcionais do Tailwind', () => {
    expect(rules('components/surface.tsx', '<div className="bg-transparent text-current border-inherit" />')).toEqual(
      [],
    );
  });

  it('ignora uma sombra de texto explicitamente removida', () => {
    expect(rules('components/reset.css', '.title { text-shadow: none; }')).toEqual([]);
  });
});
