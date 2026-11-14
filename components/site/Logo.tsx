import { cn } from '@/lib/utils';

/** Símbolo + wordmark provisórios (do mockup) até haver o logo final em SVG (brand book v0.11, pendente). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M7 3h11M5 6.5h13" className="stroke-primary" strokeWidth="1.8" strokeLinecap="square" />
        <path d="M3 10h11l3 3v8H3z" className="fill-index-blue" />
        <path d="M6 14h4M6 17.5h4" className="stroke-ink" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
      <span className="text-body font-semibold tracking-(--tracking-title) text-primary">
        Front<span className="text-link">Dex</span>
      </span>
    </span>
  );
}
