import { resourcesJson } from '@/lib/seo/llms';

/** /api/resources.json (spec 009 §6): dados abertos do índice (CC BY 4.0), gerado no build. */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(resourcesJson(), { headers: { 'Access-Control-Allow-Origin': '*' } });
}
