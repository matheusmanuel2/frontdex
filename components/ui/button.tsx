/**
 * Baseado em Watermelon UI — https://ui.watermelon.sh (button).
 * Re-tematizado para a FrontDex: tokens de cor, raio e fonte, ícones próprios
 * (components/icons) e movimento dos recipes do transitions.dev (styles/motion.css).
 *
 * MIT License
 *
 * Copyright (c) 2025-present Watermelon Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

import type * as React from 'react';

/**
 * Botões da spec 004:
 * - `primary`: pílula branca (#FBFBFB, texto Ink, 600). No tema claro, pílula Ink.
 * - `secondary`: pílula escura (#202021) com borda a 10%; ícone opcional em círculo (ButtonIcon).
 * - `brand`: pílula Index Blue (CTA de marca).
 * - `ghost`: sem fundo, para ações discretas e botões de ícone.
 */
const buttonVariants = cva(
  [
    't-hover t-icon-host inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill',
    'font-sans text-small font-semibold select-none',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-button-primary text-button-primary-text hover:opacity-90',
        secondary:
          'border border-border-button bg-button-secondary text-button-secondary-text hover:border-border-strong hover:bg-graphite',
        brand: 'bg-index-blue text-button-brand-text hover:bg-index-blue-hover',
        ghost: 'text-secondary hover:bg-graphite hover:text-primary',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-body',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
    },
    compoundVariants: [
      { variant: 'secondary', size: 'md', className: 'has-[[data-slot=button-icon]]:pl-2' },
      { variant: 'secondary', size: 'lg', className: 'has-[[data-slot=button-icon]]:pl-2' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza o filho (por exemplo um <a>) com o estilo do botão. */
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'primary'}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
}

/** Ícone em círculo do botão secundário (spec 004). */
function ButtonIcon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="button-icon"
      aria-hidden="true"
      className={cn('inline-flex size-7 items-center justify-center rounded-pill bg-graphite text-primary', className)}
      {...props}
    />
  );
}

export { Button, ButtonIcon, buttonVariants, type ButtonProps };
