import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ICONS } from './index';

const REQUIRED = [
  'search',
  'arrow-up-right',
  'chevron-down',
  'close',
  'link',
  'copy',
  'shuffle',
  'rss',
  'github',
  'star',
  'play',
  'check',
  'x',
  'sun',
  'moon',
  'globe',
  'filter',
];

describe('ícones', () => {
  it('existe o set mínimo da T-306', () => {
    expect(REQUIRED.filter((name) => !(name in ICONS))).toEqual([]);
  });

  it.each(Object.entries(ICONS))('%s usa a grelha 24, traço 1,5 e currentColor', (_, Icon) => {
    const html = renderToStaticMarkup(<Icon />);
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).not.toMatch(/(fill|stroke)="#/);
  });

  it.each(Object.entries(ICONS))('%s é decorativo por omissão e anima com um recipe', (_, Icon) => {
    const html = renderToStaticMarkup(<Icon />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toMatch(/class="t-icon-anim" data-motion="[a-z-]+"/);
  });

  it('com label tem nome acessível e não fica escondido', () => {
    const html = renderToStaticMarkup(<ICONS.github label="GitHub" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="GitHub"');
    expect(html).not.toContain('aria-hidden');
  });

  it('motion="none" desliga o movimento', () => {
    expect(renderToStaticMarkup(<ICONS.search motion="none" />)).not.toContain('t-icon-anim');
  });
});
