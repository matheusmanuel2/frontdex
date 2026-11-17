/**
 * Baseado em Watermelon UI — https://ui.watermelon.sh (blocks/hero-37).
 * Re-tematizado para a FrontDex: tokens de cor, raio e fonte, ícones próprios
 * (components/icons), fundo em vídeo próprio e movimento dos recipes do
 * transitions.dev (styles/motion.css).
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

import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

import { ArrowRightIcon, GithubIcon } from '@/components/icons';
import { Link } from '@/components/site/LocaleLink';
import { LocaleSwitch } from '@/components/site/LocaleSwitch';
import { Logo } from '@/components/site/Logo';
import { MobileNav } from '@/components/site/MobileNav';
import { GITHUB_URL, NAV_SECTIONS, sectionHref } from '@/components/site/nav';
import { HTML_LANG, routing } from '@/lib/i18n/routing';
import heroPoster from '@/public/hero/hero-poster.webp';

import { HeroVideo } from './HeroVideo';

/** Abaixo disto, os números ainda não impressionam: o bloco fica escondido. */
export const HERO_STATS_MIN = 25;

type HeroProps = {
  /** Números reais do índice (vêm do loader). */
  resourceCount: number;
  categoryCount: number;
  areaCount: number;
};

/**
 * Hero da home (spec 003, decisions/0009): layout do hero-37 da Watermelon,
 * mockup docs/design/mockups/HeroV3Video.dc.html.
 * - Poster (public/hero/hero-poster.webp) com `priority` = LCP; o loop de vídeo
 *   entra por cima depois do carregamento (HeroVideo, a única parte client-side).
 * - Sem `motion` nem `lucide-react`; a entrada usa os recipes t-hero-* de styles/motion.css.
 * - O hero é escuro nos dois temas (--color-ink-hero / --color-paper).
 * - Botão branco = busca (sem JS leva a /search; com JS abre o ⌘K).
 */
export async function Hero({ resourceCount, categoryCount, areaCount }: HeroProps) {
  const t = await getTranslations('hero');
  const nav = await getTranslations('nav');
  const a11y = await getTranslations('a11y');
  const localeT = await getTranslations('locale');
  const locale = await getLocale();
  const other = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;
  const links = NAV_SECTIONS.map((section) => ({ section, label: nav(section) }));

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-(--hero-min-height) flex-col overflow-hidden bg-ink-hero text-paper"
    >
      <div aria-hidden="true" className="t-hero-bg absolute inset-0 -z-10">
        <Image
          src={heroPoster}
          alt=""
          priority
          fetchPriority="high"
          sizes="100vw"
          placeholder="empty"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
        />
        <HeroVideo />
      </div>
      {/* Transição para a página: o fundo do hero funde-se no --color-ink (único gradiente do site, spec 006). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/5"
        style={{
          // Curva suave (ease-out) para não se ver onde o fade começa.
          background: `linear-gradient(to bottom,
            transparent 0%,
            color-mix(in srgb, var(--color-ink) 8%, transparent) 20%,
            color-mix(in srgb, var(--color-ink) 25%, transparent) 40%,
            color-mix(in srgb, var(--color-ink) 50%, transparent) 60%,
            color-mix(in srgb, var(--color-ink) 78%, transparent) 78%,
            color-mix(in srgb, var(--color-ink) 94%, transparent) 90%,
            var(--color-ink) 100%)`,
        }}
      />

      <header className="t-hero-nav mx-auto flex w-full max-w-(--container-max) items-center justify-between gap-6 px-(--gutter) py-5">
        <Link href="/" aria-label={a11y('homeLink')} className="shrink-0 rounded-sm">
          <Logo />
        </Link>
        <nav aria-label={a11y('mainNav')} className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {links.map(({ section, label }) => (
              <li key={section}>
                <Link
                  href={sectionHref(section)}
                  className="t-hover inline-flex min-h-10 items-center rounded-pill px-1 text-small text-paper/75 hover:text-paper"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitch to={other} hrefLang={HTML_LANG[other]} label={localeT('label')} short={localeT('short')} />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="t-hover t-icon-host hidden min-h-10 items-center gap-3 rounded-pill px-2 text-small text-paper/85 hover:text-paper sm:inline-flex"
          >
            <span aria-hidden="true" className="size-2 bg-signal-orange" />
            <GithubIcon size={16} />
            {t('github')}
          </a>
          <MobileNav label={a11y('mainNav')} openLabel={a11y('openMenu')} links={links} addLabel={nav('addResource')} />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-(--container-max) flex-1 flex-col px-(--gutter) pb-10">
        <div
          id="conteudo"
          tabIndex={-1}
          className="flex max-w-3xl flex-1 flex-col items-start justify-center pt-6 pb-6 outline-none"
        >
          <h1
            id="hero-title"
            className="text-hero font-normal leading-(--leading-title) tracking-(--tracking-title) text-paper"
          >
            <span className="t-hero-line block" data-hero-step="1">
              {t('title')}
            </span>
            <span className="t-hero-line block" data-hero-step="2">
              {t('titleMuted')}
            </span>
          </h1>
          <p className="t-hero-up mt-5 max-w-105 text-small text-paper/70" data-hero-step="3">
            {t('lede')}
          </p>
          <div className="t-hero-cta mt-8 flex flex-wrap items-center gap-5" data-hero-step="4">
            <Link
              href="/search"
              data-search-trigger
              className="t-hover t-icon-host inline-flex min-h-11 items-center gap-3 rounded-pill bg-paper pr-2 pl-5 text-small font-medium text-ink-hero hover:opacity-90"
            >
              {t('search')}
              <ArrowRightIcon size={16} className="text-hero-kbd-text" />
              <kbd className="rounded-pill bg-hero-kbd px-2 py-1 font-mono text-mono text-hero-kbd-text">
                {nav('searchShortcut')}
              </kbd>
            </Link>
            <Link
              href="/add"
              data-umami-event="add_click"
              className="t-hover t-icon-host inline-flex min-h-11 items-center gap-2 rounded-pill text-small text-paper/75 hover:text-paper"
            >
              {t('add')}
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>

        {resourceCount >= HERO_STATS_MIN ? (
          <dl aria-label={t('stats')} className="flex gap-12">
            <div className="t-hero-up flex flex-col-reverse gap-1" data-hero-step="5">
              <dt className="ml-6 text-small text-paper/60">{t('curated')}</dt>
              <dd className="flex items-center gap-2 text-body font-semibold tabular-nums">
                <DotsMark />
                {t('resources', { count: resourceCount })}
              </dd>
            </div>
            <div className="t-hero-up flex flex-col-reverse gap-1" data-hero-step="6">
              <dt className="ml-6 text-small text-paper/60">{t('inAreas', { count: areaCount })}</dt>
              <dd className="flex items-center gap-2 text-body font-semibold tabular-nums">
                <PlusMark />
                {t('categories', { count: categoryCount })}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  );
}

/* Marcas dos números (decorativas, do mockup). */
function DotsMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
      className="fill-current opacity-60"
    >
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="3" cy="11" r="1.5" />
      <circle cx="11" cy="11" r="1.5" />
    </svg>
  );
}

function PlusMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
      className="fill-current opacity-60"
    >
      <rect x="2" y="5.5" width="10" height="3" rx="1" />
      <rect x="5.5" y="2" width="3" height="10" rx="1" />
    </svg>
  );
}
