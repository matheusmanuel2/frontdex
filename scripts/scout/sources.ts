/** Listas curadas que a recolha lê (spec 011). Todas confirmadas no GitHub em 2026-11-17. */
export type Source = { repo: string; defaultCategory?: string };

export const SOURCES: Source[] = [
  { repo: 'bradtraversy/design-resources-for-developers' },
  { repo: 'dypsilon/frontend-dev-bookmarks' },
  { repo: 'goabstract/Awesome-Design-Tools', defaultCategory: 'design-tools' },
  { repo: 'gztchan/awesome-design' },
  { repo: 'nicolesaidy/awesome-web-design' },
  { repo: 'awesome-css-group/awesome-css' },
  { repo: 'troxler/awesome-css-frameworks', defaultCategory: 'ui-components' },
  { repo: 'aniftyco/awesome-tailwindcss', defaultCategory: 'ui-components' },
  { repo: 'brillout/awesome-react-components', defaultCategory: 'ui-components' },
  { repo: 'hal9ai/awesome-dataviz', defaultCategory: 'charts' },
  { repo: 'alexpate/awesome-design-systems', defaultCategory: 'reference' },
  { repo: 'davidsonfellipe/awesome-wpo', defaultCategory: 'dev-tools' },
  { repo: 'micromata/awesome-javascript-learning', defaultCategory: 'guides' },
  { repo: 'swyxio/spark-joy' },
  { repo: 'Siddharth11/Colorful', defaultCategory: 'colors' },
];

/**
 * Galerias e redes de UI pedidas pelo Matheus (spec 011, "Fontes de UI").
 * Entram como candidatos com fonte "pedido do Matheus"; as que já estão no índice saem sozinhas.
 */
export const MANUAL: { name: string; url: string; category: string }[] = [
  { name: 'Pinterest', url: 'https://www.pinterest.com', category: 'moodboards' },
  { name: 'Behance', url: 'https://www.behance.net', category: 'ui-inspiration' },
  { name: 'Dribbble', url: 'https://dribbble.com', category: 'ui-inspiration' },
  { name: 'Awwwards', url: 'https://www.awwwards.com', category: 'ui-inspiration' },
  { name: 'Mobbin', url: 'https://mobbin.com', category: 'app-research' },
  { name: 'Land-book', url: 'https://land-book.com', category: 'ui-inspiration' },
  { name: 'Godly', url: 'https://godly.website', category: 'ui-inspiration' },
  { name: 'Lapa Ninja', url: 'https://www.lapa.ninja', category: 'ui-inspiration' },
  { name: 'One Page Love', url: 'https://onepagelove.com', category: 'ui-inspiration' },
  { name: 'Httpster', url: 'https://httpster.net', category: 'ui-inspiration' },
  { name: 'Minimal Gallery', url: 'https://minimal.gallery', category: 'ui-inspiration' },
  { name: 'SiteInspire', url: 'https://www.siteinspire.com', category: 'ui-inspiration' },
  { name: 'Page Flows', url: 'https://pageflows.com', category: 'app-research' },
  { name: 'Collect UI', url: 'https://collectui.com', category: 'ui-inspiration' },
  { name: 'Dark Mode Design', url: 'https://www.darkmodedesign.com', category: 'ui-inspiration' },
  { name: 'SaaS Landing Page', url: 'https://saaslandingpage.com', category: 'ui-inspiration' },
  { name: 'Refero', url: 'https://refero.design', category: 'app-research' },
  { name: 'Savee', url: 'https://savee.it', category: 'moodboards' },
  { name: 'Cosmos', url: 'https://www.cosmos.so', category: 'moodboards' },
  { name: 'Are.na', url: 'https://www.are.na', category: 'moodboards' },
  { name: 'CSS Design Awards', url: 'https://www.cssdesignawards.com', category: 'ui-inspiration' },
  { name: 'Footer.design', url: 'https://www.footer.design', category: 'ui-inspiration' },
];
