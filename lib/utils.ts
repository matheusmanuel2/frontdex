import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * O tailwind-merge precisa de conhecer a escala da FrontDex. Sem isto, `text-h1`
 * (tamanho) e `text-primary` (cor) seriam tratados como conflito e um deles cairia.
 */
const twMerge = extendTailwindMerge<'typography'>({
  override: {
    theme: {
      color: [
        'ink',
        'ink-hero',
        'carbon',
        'graphite',
        'paper',
        'index-blue',
        'index-blue-light',
        'signal-orange',
        'overlay',
        'primary',
        'secondary',
        'muted',
        'title-muted',
        'link',
        'focus',
        'border',
        'border-strong',
        'border-button',
        'button-primary',
        'button-primary-text',
        'button-secondary',
        'button-secondary-text',
        'button-brand-text',
        'transparent',
        'current',
      ],
      radius: ['pill', 'card', 'panel', 'sm', 'none'],
      text: ['display', 'h1', 'h2', 'h3', 'body', 'small', 'mono'],
      font: ['sans', 'mono'],
    },
  },
  extend: {
    classGroups: {
      typography: ['title-display', 'title-h1', 'title-h2', 'title-h3', 'label-mono'],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
