import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname);
const out = process.argv[2] || dir;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
await page.goto('file://' + path.join(dir, 'sheet.html'), { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const sheets = await page.$$('section.sheet');
const names = ['LS1-ashoks-room.png', 'LS2-washroom.png'];
for (let i = 0; i < sheets.length; i++) {
  await sheets[i].screenshot({ path: path.join(out, names[i]), type: 'png' });
  console.log('wrote', names[i]);
}
await browser.close();
