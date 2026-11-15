import { llmsFullTxt } from '@/lib/seo/llms';

/** /llms-full.txt (spec 009 §6): o índice completo em Markdown, gerado no build. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
