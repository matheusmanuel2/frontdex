/**
 * Baseado em Watermelon UI — https://ui.watermelon.sh (tabs).
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

'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Tabs / segmented control com a pílula deslizante do recipe 16 (transitions.dev).
 * A pílula segue o separador ativo: mede-o e escreve posição e largura; na primeira
 * pintura e no resize salta sem transição, como manda o recipe.
 */
type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;
type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;
type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;
type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-4', className)} {...props} />;
}

function TabsList({ className, children, ...props }: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    const move = (animate: boolean) => {
      const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (!active) {
        pill.style.opacity = '0';
        return;
      }
      if (!animate) pill.style.transition = 'none';
      pill.style.opacity = '1';
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
      if (!animate) {
        void pill.offsetWidth;
        pill.style.transition = '';
      }
    };

    move(false);
    const observer = new MutationObserver(() => move(true));
    observer.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-state'] });
    const onResize = () => move(false);
    window.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        'relative inline-flex w-fit items-center gap-1 rounded-pill border border-border bg-carbon p-1',
        className,
      )}
      {...props}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="t-tabs-pill pointer-events-none absolute top-1 bottom-1 left-0 z-0 w-0 rounded-pill bg-graphite"
      />
      {children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        't-tab relative z-10 inline-flex h-8 items-center justify-center gap-1.5 rounded-pill px-3 text-small font-medium text-secondary',
        'hover:text-primary data-[state=active]:text-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsContentProps) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('outline-none', className)} {...props} />;
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
};
