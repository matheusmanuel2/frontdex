/// <reference types="next/image-types/global" />
/// <reference types="mdx" />

import type { routing } from './lib/i18n/routing';
import type messages from './messages/pt.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
