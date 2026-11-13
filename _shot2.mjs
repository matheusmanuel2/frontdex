import { chromium } from '@playwright/test';
const [out, ...paths] = process.argv.slice(2);
const b = await chromium.launch();
for (const path of paths)
  for (const [w, h] of [
    [1440, 900],
    [390, 844],
  ]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('http://localhost:3200' + path, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const name = path.replaceAll('/', '_');
    await p.screenshot({ path: `${out}/p${name}-${w}.png`, fullPage: true });
    console.log(path, w, await p.evaluate(() => document.documentElement.scrollWidth));
  }
await b.close();
