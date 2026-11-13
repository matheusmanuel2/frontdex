/**
 * Baseado em Watermelon UI — https://ui.watermelon.sh (dialog).
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

import { Dialog as DialogPrimitive } from 'radix-ui';

import { CloseIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import type * as React from 'react';

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;
type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;
type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn('t-modal-overlay fixed inset-0 z-50 bg-overlay', className)}
      {...props}
    />
  );
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Texto acessível do botão de fechar (vem de messages/). Sem ele, o botão não aparece. */
  closeLabel?: string;
};

function DialogContent({ className, children, closeLabel, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          't-modal fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
          'rounded-card border border-border-strong bg-carbon p-6 text-primary',
          className,
        )}
        {...props}
      >
        {children}
        {closeLabel ? (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className="t-hover t-icon-host absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-pill text-secondary hover:bg-graphite hover:text-primary"
          >
            <CloseIcon size={18} />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-2 pr-10', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title data-slot="dialog-title" className={cn('title-h3 text-primary', className)} {...props} />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-small text-secondary', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  type DialogProps,
  type DialogTriggerProps,
  type DialogCloseProps,
  type DialogContentProps,
};
