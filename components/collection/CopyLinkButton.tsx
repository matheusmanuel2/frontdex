'use client';

import { useState, useSyncExternalStore } from 'react';

import { CheckIcon, CopyIcon } from '@/components/icons';
import { MOTION_MS } from '@/lib/design/motion-tokens';

type CopyLinkButtonProps = { label: string; copiedLabel: string };

function subscribe() {
  return () => {};
}

/**
 * "Copiar link" (T-506, decisão D-11): ilha mínima. Sem JS não aparece,
 * porque não teria como copiar. Troca de ícone com o recipe 09 (icon swap).
 */
export function CopyLinkButton({ label, copiedLabel }: CopyLinkButtonProps) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [copied, setCopied] = useState(false);
  if (!hydrated) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), MOTION_MS.fast * 8);
      }}
      className="t-hover inline-flex h-10 items-center gap-2 rounded-pill border border-border-strong px-4 text-small text-primary hover:bg-graphite"
    >
      <span className="t-icon-swap" data-state={copied ? 'b' : 'a'}>
        <span className="t-icon" data-icon="a">
          <CopyIcon size={16} motion="none" />
        </span>
        <span className="t-icon" data-icon="b">
          <CheckIcon size={16} motion="none" />
        </span>
      </span>
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
