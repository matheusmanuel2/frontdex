import { serializeJsonLd, type JsonLdGraph } from '@/lib/seo/jsonld';

/** Dados estruturados no HTML estático (spec 009 §5). Renderizado no servidor, sem JS no cliente. */
export function JsonLd({ data }: { data: JsonLdGraph }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
