// Renders design/slides.html into one 1080x1350 PNG per slide, plus a contact sheet.
// Usage: node design/render.mjs [outDir]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
// Resolve playwright locally if installed, else from the global npm root.
const req = createRequire(import.meta.url);
let pw; try { pw = req('playwright'); } catch { pw = req(execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] || path.join(here, '..', 'out'));
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(here, 'slides.html'));
await page.evaluate(() => document.fonts.ready);
const n = await page.evaluate(() => window.SLIDE_COUNT);
await page.setViewportSize({ width: 1080 * n, height: 1350 });
for (let i = 0; i < n; i++) {
  const file = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
  await page.screenshot({ path: file, clip: { x: i * 1080, y: 0, width: 1080, height: 1350 } });
  console.log(file);
}
// Contact sheet: whole strip at 1/3 scale for quick review.
await page.screenshot({ path: path.join(outDir, 'strip.png'), fullPage: true, scale: 'css' });
await browser.close();
