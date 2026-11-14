type AnalyticsEnvironment = {
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  UMAMI_WEBSITE_ID?: string;
};

export function getUmamiWebsiteId({ NODE_ENV, VERCEL_ENV, UMAMI_WEBSITE_ID }: AnalyticsEnvironment) {
  if (NODE_ENV !== 'production' || VERCEL_ENV !== 'production') return undefined;
  const websiteId = UMAMI_WEBSITE_ID?.trim();
  if (!websiteId) throw new Error('UMAMI_WEBSITE_ID é obrigatória no ambiente de produção da Vercel.');
  return websiteId;
}

export function trackUmamiEvent(eventName: string) {
  if (typeof window !== 'undefined') window.umami?.track(eventName);
}

declare global {
  interface Window {
    umami?: { track: (eventName: string) => void };
  }
}
