import type { ReactNode, SVGProps } from 'react';

/** Movimentos disponíveis em styles/motion.css (`.t-icon-host [data-motion=…]`). */
export type IconMotion =
  'nudge-right' | 'nudge-diagonal' | 'nudge-down' | 'nudge-up' | 'tilt' | 'turn' | 'spin' | 'pop' | 'shrink' | 'none';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Tamanho em px (grelha de 24). */
  size?: number;
  /**
   * Nome acessível. Sem `label`, o ícone é decorativo (`aria-hidden`).
   * Num botão só com ícone, o nome vai no botão (`aria-label`), não aqui.
   */
  label?: string;
  /** Movimento no hover/foco do elemento pai `.t-icon-host`. */
  motion?: IconMotion;
};

type IconBaseProps = IconProps & { children: ReactNode; defaultMotion: IconMotion };

/**
 * Base dos ícones da FrontDex (spec 004): grelha 24, traço 1,5, `currentColor`.
 * O movimento é só CSS (recipes em styles/motion.css) e fica estático com
 * `prefers-reduced-motion`.
 */
export function IconBase({ size = 20, label, motion, defaultMotion, children, className, ...props }: IconBaseProps) {
  const resolved = motion ?? defaultMotion;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={['shrink-0', className].filter(Boolean).join(' ')}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...props}
    >
      {label ? <title>{label}</title> : null}
      <g
        className={resolved === 'none' ? undefined : 't-icon-anim'}
        data-motion={resolved === 'none' ? undefined : resolved}
      >
        {children}
      </g>
    </svg>
  );
}
