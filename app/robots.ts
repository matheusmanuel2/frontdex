import { SITE_URL } from '@/lib/seo/metadata';

import type { MetadataRoute } from 'next';

/**
 * robots.txt (spec 009 §6). O índice é aberto: queremos ser encontrados e citados.
 * User-agents conforme a documentação de cada empresa (links na spec 009).
 */

/** Motores de busca. */
const SEARCH = ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot'];

/** Busca e assistentes de IA que citam a fonte quando respondem. */
const AI_ASSISTANTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
];

/**
 * Treino de modelos. PERMITIDO por decisão do projeto (o índice é aberto e queremos ser conhecidos).
 * Para bloquear: mude `allow: '/'` para `disallow: '/'` no bloco TRAINING abaixo.
 */
const TRAINING = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: SEARCH, allow: '/' },
      { userAgent: AI_ASSISTANTS, allow: '/' },
      // TRAINING: permitido. Trocar para { userAgent: TRAINING, disallow: '/' } para bloquear.
      { userAgent: TRAINING, allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
