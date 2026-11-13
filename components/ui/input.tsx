/**
 * Baseado em Watermelon UI — https://ui.watermelon.sh (input).
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

import { cn } from '@/lib/utils';

import type * as React from 'react';

/** Input da spec 004: raio 12px; `shape="pill"` para a busca e os filtros. */
const inputVariants = cva(
  [
    't-hover h-10 w-full min-w-0 border border-border-strong bg-carbon px-4 text-body text-primary',
    'placeholder:text-muted',
    'hover:border-border-button focus-visible:border-focus',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-signal-orange',
  ],
  {
    variants: {
      shape: {
        default: 'rounded-sm',
        pill: 'rounded-pill',
      },
    },
    defaultVariants: { shape: 'default' },
  },
);

type InputProps = React.ComponentProps<'input'> & VariantProps<typeof inputVariants>;

function Input({ className, shape, type = 'text', ...props }: InputProps) {
  return <input type={type} data-slot="input" className={cn(inputVariants({ shape }), className)} {...props} />;
}

export { Input, inputVariants, type InputProps };
