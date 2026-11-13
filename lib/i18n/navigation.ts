import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/** Link, redirect e hooks que sabem do idioma. Usa estes em vez dos de next/navigation. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
