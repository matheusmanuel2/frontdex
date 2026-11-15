/**
 * Chave do IndexNow (spec 009 §7), servida em /indexnow.txt e indicada como `keyLocation`.
 * Vem de INDEXNOW_KEY no build; sem chave, a rota responde 404.
 */
export const dynamic = 'force-static';

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response('Not found', { status: 404 });
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
