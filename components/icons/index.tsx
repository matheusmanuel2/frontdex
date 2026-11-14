/**
 * Set de ícones da FrontDex (T-306). Desenhados à mão sobre IconBase.
 * Cada ícone tem um movimento por omissão, ativado pelo hover/foco de um pai `.t-icon-host`.
 */
import { IconBase, type IconProps } from './IconBase';

export type { IconMotion, IconProps } from './IconBase';
export { IconBase } from './IconBase';

export function SearchIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="tilt" {...props}>
      <circle cx="11" cy="11" r="6.25" />
      <path d="M15.5 15.5 20 20" />
    </IconBase>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="nudge-diagonal" {...props}>
      <path d="M7.5 16.5 16.5 7.5" />
      <path d="M9 7.5h7.5V15" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="nudge-right" {...props}>
      <path d="M5 12h14" />
      <path d="m13.5 6.5 5.5 5.5-5.5 5.5" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="nudge-down" {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="turn" {...props}>
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="M17.5 6.5 6.5 17.5" />
    </IconBase>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="tilt" {...props}>
      <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </IconBase>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="pop" {...props}>
      <rect x="8.75" y="8.75" width="10.5" height="10.5" rx="2.25" />
      <path d="M15.25 8.75V6.5a1.75 1.75 0 0 0-1.75-1.75h-7A1.75 1.75 0 0 0 4.75 6.5v7a1.75 1.75 0 0 0 1.75 1.75h2.25" />
    </IconBase>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="nudge-right" {...props}>
      <path d="M4 7.5h3.2c1.4 0 2.3.6 3 1.7l3.6 5.6c.7 1.1 1.6 1.7 3 1.7H20" />
      <path d="M4 16.5h3.2c1.4 0 2.3-.6 3-1.7l.4-.6" />
      <path d="M13.4 9.8l.4-.6c.7-1.1 1.6-1.7 3-1.7H20" />
      <path d="m17.5 5 2.5 2.5-2.5 2.5" />
      <path d="m17.5 14 2.5 2.5-2.5 2.5" />
    </IconBase>
  );
}

export function RssIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="pop" {...props}>
      <path d="M5.5 11a7.5 7.5 0 0 1 7.5 7.5" />
      <path d="M5.5 5.5a13 13 0 0 1 13 13" />
      <circle cx="6.25" cy="17.75" r="0.75" fill="currentColor" />
    </IconBase>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="pop" {...props}>
      <path d="M9 19c-4 1.3-4-2-5.5-2.5" />
      <path d="M14.5 21v-3.2c0-1 .1-1.5-.5-2.1 2.6-.3 5.3-1.3 5.3-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.2 1.2a11 11 0 0 0-5.6 0C7 3.4 6 3.7 6 3.7a4.2 4.2 0 0 0-.1 3.1 4.5 4.5 0 0 0-1.2 3.1c0 4.5 2.7 5.5 5.3 5.8-.6.6-.6 1.2-.5 2.1V21" />
    </IconBase>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="spin" {...props}>
      <path d="m12 4.5 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L4.5 10l5.2-.8L12 4.5Z" />
    </IconBase>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="nudge-right" {...props}>
      <path d="M8 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.2 5.1a.8.8 0 0 0-1.2.7Z" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="pop" {...props}>
      <path d="m5.5 12.5 4 4 9-9" />
    </IconBase>
  );
}

/** Logo do X (antigo Twitter). Para fechar, usa CloseIcon. */
export function XIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="pop" {...props}>
      <path d="M5 5l14 14" />
      <path d="M19 5l-5.6 6.1" />
      <path d="M10.6 12.9 5 19" />
      <path d="M5 5h3.5L19 19h-3.5" />
    </IconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="spin" {...props}>
      <circle cx="12" cy="12" r="3.75" />
      <path d="M12 3.5v1.75M12 18.75v1.75M3.5 12h1.75M18.75 12h1.75M6 6l1.24 1.24M16.76 16.76 18 18M6 18l1.24-1.24M16.76 7.24 18 6" />
    </IconBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="tilt" {...props}>
      <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z" />
    </IconBase>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="spin" {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75c2.2 2.3 3.3 5 3.3 8.25s-1.1 5.95-3.3 8.25c-2.2-2.3-3.3-5-3.3-8.25S9.8 6.05 12 3.75Z" />
    </IconBase>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="nudge-down" {...props}>
      <path d="M4.5 7h15" />
      <path d="M7.5 12h9" />
      <path d="M10.5 17h3" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase defaultMotion="shrink" {...props}>
      <path d="M4.5 8h15" />
      <path d="M4.5 16h15" />
    </IconBase>
  );
}

/** Lista para a página /_design e para os testes. */
export const ICONS = {
  search: SearchIcon,
  'arrow-up-right': ArrowUpRightIcon,
  'arrow-right': ArrowRightIcon,
  'chevron-down': ChevronDownIcon,
  close: CloseIcon,
  link: LinkIcon,
  copy: CopyIcon,
  shuffle: ShuffleIcon,
  rss: RssIcon,
  github: GithubIcon,
  star: StarIcon,
  play: PlayIcon,
  check: CheckIcon,
  x: XIcon,
  sun: SunIcon,
  moon: MoonIcon,
  globe: GlobeIcon,
  filter: FilterIcon,
  menu: MenuIcon,
} as const;
