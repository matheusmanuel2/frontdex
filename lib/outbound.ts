/**
 * Links de saída para os sites dos recursos. Acrescenta `ref` e os UTM da FrontDex
 * para que o site de destino veja de onde vem o tráfego. Parâmetros que o URL já
 * tem nunca são substituídos; URLs inválidos voltam iguais.
 */
const OUTBOUND_PARAMS: Record<string, string> = {
  ref: 'frontdex',
  utm_source: 'frontdex',
  utm_medium: 'referral',
};

export function outboundUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return url;

  for (const [key, value] of Object.entries(OUTBOUND_PARAMS)) {
    if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}
