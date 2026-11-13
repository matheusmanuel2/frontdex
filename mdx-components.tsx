import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * Estilos do texto longo em MDX (Contribuir, Sobre), só com tokens.
 * Links externos com rel="noopener"; links em texto sublinhados.
 */
const components: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="title-h3 mt-14 mb-4 text-primary first:mt-0" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="mt-8 mb-2 text-body font-medium text-primary" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="mt-4 max-w-2xl text-body text-secondary" {...props} />,
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul
      className="mt-4 flex max-w-2xl list-disc flex-col gap-2 pl-5 text-body text-secondary marker:text-muted"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol
      className="mt-4 flex max-w-2xl list-decimal flex-col gap-2 pl-5 text-body text-secondary marker:font-mono marker:text-muted"
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => <strong className="font-medium text-primary" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="mt-6 max-w-2xl rounded-card border border-border bg-list p-6 text-h3 text-primary [&>p]:mt-0 [&>p]:text-primary"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code className="rounded-sm bg-graphite px-1 font-mono text-mono text-primary" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<'pre'>) => (
    <pre
      tabIndex={0}
      className="mt-4 max-w-2xl overflow-x-auto rounded-panel border border-border bg-ink p-5 font-mono text-mono text-secondary [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  a: ({ href = '', ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} className="link-inline" {...(href.startsWith('http') ? { rel: 'noopener' } : {})} {...props} />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
