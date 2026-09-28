// Fast look-development stills: loads index.html in headless Chromium, seeks the DOM
// timeline and the 3D scene to each requested time, and saves a PNG per time. Much quicker
// than a render for checking colour or a single pose (no motion-blur-accurate video).
//
//   NODE_PATH=$(npm root -g) node scripts/look.mjs OUT_DIR 13.0 20.9 ...
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";

// require() honours NODE_PATH, so a global Playwright install works.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = new URL("..", import.meta.url).pathname;
const [out, ...times] = process.argv.slice(2);
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".wav": "audio/wav", ".json": "application/json", ".png": "image/png" };
const server = createServer(async (req, res) => {
  try {
    const p = join(root, decodeURIComponent(req.url.split("?")[0]));
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" });
    res.end(await readFile(p));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.setDefaultTimeout(180000);
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(`http://127.0.0.1:${port}/index.html`);
await page.waitForFunction(() => window.__timelines?.main && window.__renderAt, null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
for (const t of times.map(Number)) {
  await page.evaluate(async (t) => {
    window.__timelines.main.seek(t, false);
    await window.__renderAt(t);
  }, t);
  const f = join(out, `look-${t.toFixed(2)}.png`);
  await page.screenshot({ path: f, timeout: 180000 });
  console.log(f);
}
await browser.close();
server.close();
