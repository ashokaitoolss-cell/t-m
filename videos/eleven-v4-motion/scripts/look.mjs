// Fast look-development stills without the full HyperFrames runtime: mounts both
// sub-composition templates into one page, seeks the lockup timeline, draws the gradient at the
// same time, and saves a PNG per time. Use `npx hyperframes snapshot` for the real pipeline.
//
//   NODE_PATH=$(npm root -g) node scripts/look.mjs OUT_DIR 0.3 1.2 ...
//   NODE_PATH=$(npm root -g) node scripts/look.mjs OUT_DIR --frames 0:12      (60 fps frames)
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = new URL("..", import.meta.url).pathname;
const [out, ...rest] = process.argv.slice(2);
const fr = rest[0] === "--frames" ? rest[1].split(":").map(Number) : null;
const times = fr ? Array.from({ length: fr[1] }, (_, i) => (fr[0] + i) / 60) : rest.map(Number);
const names = fr ? times.map((_, i) => `frame-${String(fr[0] + i).padStart(4, "0")}.png`) : times.map((t) => `look-${t.toFixed(2)}.png`);
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".json": "application/json" };

const page0 = `<!doctype html><html><head><meta charset="utf-8"><script src="assets/vendor/gsap.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1920px;height:1080px;overflow:hidden;background:#040907}
.slot{position:absolute;inset:0}</style></head><body><div id="s-gradient" class="slot"></div><div id="s-lockup" class="slot"></div>
<script>window.__timelines = {};
async function mount(name) {
  const html = await (await fetch("compositions/" + name + ".html")).text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const frag = doc.querySelector("template").content;
  const slot = document.getElementById("s-" + name);
  for (const node of [...frag.childNodes]) {
    if (node.nodeName === "SCRIPT") { const s = document.createElement("script"); s.textContent = node.textContent; slot.appendChild(s); }
    else slot.appendChild(document.importNode(node, true));
  }
}
window.__mounted = mount("gradient").then(() => mount("lockup"));
</script></body></html>`;

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/__look.html") return res.writeHead(200, { "content-type": "text/html" }).end(page0);
  try {
    const p = join(root, url);
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" });
    res.end(await readFile(p));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", (e) => console.error("pageerror:", e.message));
page.on("console", (m) => m.type() === "error" && console.error("console:", m.text()));
await page.goto(`http://127.0.0.1:${server.address().port}/__look.html`);
await page.evaluate(() => window.__mounted);
await page.waitForFunction(() => window.__timelines.lockup && window.__renderAt);
for (const [i, t] of times.entries()) {
  await page.evaluate(async (t) => {
    window.__timelines.lockup.seek(t, false);
    await window.__renderAt(t);
  }, t);
  await page.screenshot({ path: join(out, names[i]) });
}
console.log(`${times.length} frame(s) -> ${out}`);
await browser.close();
server.close();
