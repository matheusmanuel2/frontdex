/**
 * Baseado em Watermelon UI — https://ui.watermelon.sh (blocks/hero-13).
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

import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

import { GithubIcon, PlayIcon, SearchIcon } from '@/components/icons';
import { Link } from '@/components/site/LocaleLink';
import { LocaleSwitch } from '@/components/site/LocaleSwitch';
import { Logo } from '@/components/site/Logo';
import { MobileNav } from '@/components/site/MobileNav';
import { GITHUB_URL, NAV_SECTIONS, sectionHref } from '@/components/site/nav';
import { HTML_LANG, routing } from '@/lib/i18n/routing';
import heroBg from '@/public/hero/hero-bg.webp';

type HeroProps = {
  /** Número de recursos publicados (vem do loader). */
  resourceCount: number;
};

/**
 * Hero da home (spec 003, decisions/0009): bloco hero-13 da Watermelon adaptado.
 * - Fundo próprio (public/hero/hero-bg.webp) com `priority` (LCP).
 * - Sem `motion` nem `lucide-react`: ícones próprios; o único gradiente do site vive aqui (spec 006).
 * - O hero é escuro nos dois temas (--color-ink-hero / --color-paper).
 * - Botão branco = busca (até ao M6 leva a /search; depois abre o ⌘K).
 * - Avatares de contribuidores ficam de fora até haver dados reais (não se inventam).
 */
export async function Hero({ resourceCount }: HeroProps) {
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
      className="relative isolate flex min-h-(--hero-min-height) flex-col overflow-hidden bg-ink-hero text-paper lg:h-(--hero-height) lg:min-h-0"
    >
      <Image
        src={heroBg}
        alt=""
        priority
        fetchPriority="high"
        sizes="100vw"
        placeholder="empty"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      {/* Leitura do texto sobre o fundo: o único sítio onde gradientes são permitidos (spec 006). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink-hero/80 via-transparent to-ink-hero/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-ink-hero/60 via-transparent to-transparent"
      />

      <header className="flex items-center gap-6 px-(--gutter) py-6">
        <Link href="/" aria-label={a11y('homeLink')} className="shrink-0 rounded-sm">
          <Logo />
        </Link>
        <nav aria-label={a11y('mainNav')} className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-8">
            {links.map(({ section, label }) => (
              <li key={section}>
                <Link
                  href={sectionHref(section)}
                  className="t-hover rounded-pill px-1 py-1 text-small font-medium text-paper/85 hover:text-paper"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <a
            href={GITHUB_URL}
            rel="noopener"
            className="t-hover t-icon-host hidden items-center gap-3 rounded-pill px-2 py-1 text-small font-medium text-paper/85 hover:text-paper sm:inline-flex"
          >
            <span aria-hidden="true" className="size-2 rounded-pill bg-signal-orange" />
            <GithubIcon size={16} />
            {t('github')}
          </a>
          <LocaleSwitch to={other} hrefLang={HTML_LANG[other]} label={localeT('label')} short={localeT('short')} />
          <MobileNav label={a11y('mainNav')} openLabel={a11y('openMenu')} links={links} addLabel={nav('addResource')} />
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-end px-(--gutter) pb-16 lg:justify-start lg:pt-4 lg:pb-0">
        <div id="conteudo" tabIndex={-1} className="max-w-2xl outline-none">
          <span className="inline-flex h-7 items-center rounded-pill border border-paper/12 bg-paper/8 px-4 text-mono font-medium text-paper/85">
            {t('badge')}
          </span>
          <h1 id="hero-title" className="title-display mt-8 text-paper">
            {t('title')}
            <br />
            {t('titleMuted')}
          </h1>
          <div
            aria-hidden="true"
            className="mt-10 h-px max-w-xs bg-linear-to-r from-paper/40 via-paper/15 to-transparent"
          />
          <p className="mt-6 max-w-md text-small text-paper/60">{t('description')}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4 lg:gap-6">
            <Link
              href="/search"
              className="t-hover t-icon-host inline-flex h-10 items-center gap-3 rounded-pill bg-button-primary pr-2 pl-5 text-small font-semibold text-button-primary-text hover:opacity-90"
            >
              <SearchIcon size={16} />
              {t('search')}
              <kbd className="rounded-pill bg-graphite px-2 py-1 font-mono text-mono text-paper/70">
                {nav('searchShortcut')}
              </kbd>
            </Link>
            <Link
              href="/add"
              className="t-hover t-icon-host inline-flex h-10 items-center gap-2 rounded-pill border border-border-button bg-button-secondary pr-2 pl-5 text-small font-semibold text-paper hover:bg-graphite"
            >
              {t('howItWorks')}
              <span
                aria-hidden="true"
                className="inline-flex size-6 items-center justify-center rounded-pill bg-paper/16"
              >
                <PlayIcon size={12} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between px-(--gutter) pt-8 pb-8">
        <span aria-hidden="true" className="hidden h-10 w-12 border-b border-l border-paper/16 md:block" />
        <p className="ml-auto text-small font-medium text-paper/60">{t('count', { count: resourceCount })}</p>
      </div>
    </section>
  );
}
