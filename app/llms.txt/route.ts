import { llmsTxt } from '@/lib/seo/llms';

/** /llms.txt (spec 009 §6): gerado no build a partir dos YAML. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
